'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { DocumentPrefix, documentNumber, nextSequence } from '@/lib/numbering'
import { prisma } from '@/lib/prisma'
import { lpoSchema } from '@/lib/validation/lpo'

export type LpoFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  let lines: unknown
  try {
    lines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    lines = []
  }

  return {
    supplier_id: formData.get('supplier_id'),
    date: formData.get('date'),
    currency: formData.get('currency'),
    for: optional('for'),
    proforma_referenced: optional('proforma_referenced'),
    extra_notes: optional('extra_notes'),
    vat: formData.get('vat'),
    withholding_tax: formData.get('withholding_tax'),
    lines,
  }
}

export async function createLpo(
  _prev: LpoFormState,
  formData: FormData,
): Promise<LpoFormState> {
  const session = await requireAbility('lpo_store')

  const result = lpoSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  const existing = await prisma.local_purchase_orders.findMany({ select: { reference_no: true } })
  const number = documentNumber(DocumentPrefix.lpo, nextSequence(existing.map((l) => l.reference_no)))

  await prisma.local_purchase_orders.create({
    data: {
      supplier_id: BigInt(input.supplier_id),
      date: input.date,
      reference_no: number,
      currency: input.currency,
      for: input.for,
      proforma_referenced: input.proforma_referenced,
      extra_notes: input.extra_notes,
      vat: String(input.vat),
      withholding_tax: String(input.withholding_tax),
      created_by: BigInt(session.user.id),
      local_purchase_order_items: {
        create: input.lines.map((line) => ({
          item_id: BigInt(line.item_id),
          specification: line.specification,
          quantity: line.quantity,
          price: line.price,
          created_by: BigInt(session.user.id),
        })),
      },
    },
  })

  revalidatePath('/documents/lpos')
  redirect('/documents/lpos')
}

export async function updateLpo(
  id: string,
  _prev: LpoFormState,
  formData: FormData,
): Promise<LpoFormState> {
  const session = await requireAbility('lpo_update')

  const result = lpoSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  await prisma.$transaction([
    prisma.local_purchase_order_items.deleteMany({ where: { lpo_id: BigInt(id) } }),
    prisma.local_purchase_orders.update({
      where: { id: BigInt(id) },
      data: {
        supplier_id: BigInt(input.supplier_id),
        date: input.date,
        currency: input.currency,
        for: input.for,
        proforma_referenced: input.proforma_referenced,
        extra_notes: input.extra_notes,
        vat: String(input.vat),
        withholding_tax: String(input.withholding_tax),
        updated_by: BigInt(session.user.id),
        local_purchase_order_items: {
          create: input.lines.map((line) => ({
            item_id: BigInt(line.item_id),
            specification: line.specification,
            quantity: line.quantity,
            price: line.price,
            created_by: BigInt(session.user.id),
          })),
        },
      },
    }),
  ])

  revalidatePath('/documents/lpos')
  redirect('/documents/lpos')
}

export async function deleteLpo(id: string): Promise<void> {
  await requireAbility('lpo_remove')

  await prisma.local_purchase_orders.delete({ where: { id: BigInt(id) } })

  revalidatePath('/documents/lpos')
}
