'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { DocumentPrefix, documentNumber, nextSequence } from '@/lib/numbering'
import { prisma } from '@/lib/prisma'
import { proformaSchema } from '@/lib/validation/proforma'

export type ProformaFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  let lines: unknown
  try {
    lines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    lines = []
  }

  return {
    name: formData.get('name'),
    date: formData.get('date'),
    currency: formData.get('currency'),
    exchange_rate: formData.get('exchange_rate'),
    labor_charge: formData.get('labor_charge'),
    vat: formData.get('vat'),
    withholding_tax: formData.get('withholding_tax'),
    advance: formData.get('advance'),
    for: formData.get('for'),
    contact: optional('contact'),
    location: optional('location'),
    postal: optional('postal'),
    tin: optional('tin'),
    vrn: optional('vrn'),
    lines,
  }
}

export async function createProforma(
  _prev: ProformaFormState,
  formData: FormData,
): Promise<ProformaFormState> {
  const session = await requireAbility('proforma_store')

  const result = proformaSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  const existing = await prisma.proformas.findMany({ select: { notes: true } })
  const number = documentNumber(DocumentPrefix.proforma, nextSequence(existing.map((p) => p.notes)))

  await prisma.proformas.create({
    data: {
      name: input.name,
      date: input.date,
      notes: number,
      currency: input.currency,
      exchange_rate: input.exchange_rate,
      labor_charge: input.labor_charge,
      vat: String(input.vat),
      withholding_tax: input.withholding_tax,
      advance: input.advance,
      for: input.for,
      contact: input.contact,
      location: input.location,
      postal: input.postal,
      tin: input.tin,
      vrn: input.vrn,
      created_by: BigInt(session.user.id),
      proforma_items: {
        create: input.lines.map((line) => ({
          item_id: BigInt(line.item_id),
          specification: line.specification,
          unit_measure: line.unit_measure,
          quantity: line.quantity,
          price: line.price,
          created_by: BigInt(session.user.id),
        })),
      },
    },
  })

  revalidatePath('/documents/proformas')
  redirect('/documents/proformas')
}

export async function updateProforma(
  id: string,
  _prev: ProformaFormState,
  formData: FormData,
): Promise<ProformaFormState> {
  const session = await requireAbility('proforma_update')

  const result = proformaSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  await prisma.$transaction([
    prisma.proforma_items.deleteMany({ where: { proforma_id: BigInt(id) } }),
    prisma.proformas.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name,
        date: input.date,
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        labor_charge: input.labor_charge,
        vat: String(input.vat),
        withholding_tax: input.withholding_tax,
        advance: input.advance,
        for: input.for,
        contact: input.contact,
        location: input.location,
        postal: input.postal,
        tin: input.tin,
        vrn: input.vrn,
        updated_by: BigInt(session.user.id),
        proforma_items: {
          create: input.lines.map((line) => ({
            item_id: BigInt(line.item_id),
            specification: line.specification,
            unit_measure: line.unit_measure,
            quantity: line.quantity,
            price: line.price,
            created_by: BigInt(session.user.id),
          })),
        },
      },
    }),
  ])

  revalidatePath('/documents/proformas')
  redirect(`/documents/proformas/${id}`)
}

export async function deleteProforma(id: string): Promise<void> {
  await requireAbility('proforma_remove')

  const proformaId = BigInt(id)
  await prisma.$transaction([
    prisma.proforma_items.deleteMany({ where: { proforma_id: proformaId } }),
    prisma.invoices.updateMany({
      where: { proforma_id: proformaId },
      data: { proforma_id: null },
    }),
    prisma.proformas.delete({ where: { id: proformaId } }),
  ])

  revalidatePath('/documents/proformas')
  redirect('/documents/proformas')
}
