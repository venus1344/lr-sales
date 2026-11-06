'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { DocumentPrefix, documentNumber, nextSequence } from '@/lib/numbering'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validation/invoice'
import { redirectWithToast } from '@/lib/toast'

export type InvoiceFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null
  const proformaId = String(formData.get('proforma_id') ?? '').trim()

  let lines: unknown
  try {
    lines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    lines = []
  }

  return {
    proforma_id: proformaId ? Number(proformaId) : null,
    name: formData.get('name'),
    date: formData.get('date'),
    currency: formData.get('currency'),
    exchange_rate: formData.get('exchange_rate'),
    labor_charge: formData.get('labor_charge'),
    vat: formData.get('vat'),
    withholding_tax: formData.get('withholding_tax'),
    advance: formData.get('advance'),
    discount: formData.get('discount'),
    for: formData.get('for'),
    contact: optional('contact'),
    location: optional('location'),
    postal: optional('postal'),
    tin: optional('tin'),
    vrn: optional('vrn'),
    lines,
  }
}

export async function createInvoice(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const session = await requireAbility('invoice_store')

  const result = invoiceSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  const existing = await prisma.invoices.findMany({ select: { notes: true } })
  const number = documentNumber(DocumentPrefix.invoice, nextSequence(existing.map((i) => i.notes)))

  await prisma.invoices.create({
    data: {
      proforma_id: input.proforma_id ? BigInt(input.proforma_id) : null,
      name: input.name,
      date: input.date,
      notes: number,
      currency: input.currency,
      exchange_rate: input.exchange_rate,
      labor_charge: input.labor_charge,
      vat: input.vat,
      withholding_tax: input.withholding_tax,
      advance: input.advance,
      discount: input.discount,
      for: input.for,
      contact: input.contact,
      location: input.location,
      postal: input.postal,
      tin: input.tin,
      vrn: input.vrn,
      created_by: BigInt(session.user.id),
      invoice_items: {
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

  revalidatePath('/documents/invoices')
  return redirectWithToast('/documents/invoices', 'Invoice created')
}

export async function updateInvoice(
  id: string,
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const session = await requireAbility('invoice_update')

  const result = invoiceSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  await prisma.$transaction([
    prisma.invoice_items.deleteMany({ where: { invoice_id: BigInt(id) } }),
    prisma.invoices.update({
      where: { id: BigInt(id) },
      data: {
        proforma_id: input.proforma_id ? BigInt(input.proforma_id) : null,
        name: input.name,
        date: input.date,
        currency: input.currency,
        exchange_rate: input.exchange_rate,
        labor_charge: input.labor_charge,
        vat: input.vat,
        withholding_tax: input.withholding_tax,
        advance: input.advance,
        discount: input.discount,
        for: input.for,
        contact: input.contact,
        location: input.location,
        postal: input.postal,
        tin: input.tin,
        vrn: input.vrn,
        updated_by: BigInt(session.user.id),
        invoice_items: {
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

  revalidatePath('/documents/invoices')
  return redirectWithToast(`/documents/invoices/${id}`, 'Invoice updated')
}

export async function deleteInvoice(id: string): Promise<void> {
  await requireAbility('invoice_remove')

  const invoiceId = BigInt(id)
  try {
    await prisma.$transaction([
      prisma.invoice_items.deleteMany({ where: { invoice_id: invoiceId } }),
      prisma.delivery_notes.updateMany({
        where: { invoice_id: invoiceId },
        data: { invoice_id: null },
      }),
      prisma.internet_invoice_packages.updateMany({
        where: { invoice_id: invoiceId },
        data: { invoice_id: null },
      }),
      prisma.invoices.delete({ where: { id: invoiceId } }),
    ])
  } catch {
    return redirectWithToast('/documents/invoices', 'Could not delete the invoice', 'error')
  }

  revalidatePath('/documents/invoices')
  return redirectWithToast('/documents/invoices', 'Invoice deleted')
}
