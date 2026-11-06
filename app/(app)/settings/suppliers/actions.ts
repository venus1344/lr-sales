'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { supplierSchema } from '@/lib/validation/supplier'
import { redirectWithToast } from '@/lib/toast'

export type SupplierFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  return {
    name: formData.get('name'),
    location: formData.get('location'),
    contacts: formData.get('contacts'),
    postal_code: optional('postal_code'),
    postal_address: optional('postal_address'),
    tin: optional('tin'),
    vrn: optional('vrn'),
    status: formData.get('status') === 'on',
  }
}

export async function createSupplier(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await requireAbility('supplier_store')

  const result = supplierSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.suppliers.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/suppliers')
  return redirectWithToast('/settings/suppliers', 'Supplier created')
}

export async function updateSupplier(
  id: string,
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await requireAbility('supplier_update')

  const result = supplierSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.suppliers.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/suppliers')
  return redirectWithToast('/settings/suppliers', 'Supplier updated')
}

export async function deleteSupplier(id: string): Promise<void> {
  await requireAbility('supplier_remove')

  await prisma.suppliers.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/suppliers')
}
