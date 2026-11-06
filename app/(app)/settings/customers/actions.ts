'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { customerSchema } from '@/lib/validation/customer'

export type CustomerFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  return {
    name: formData.get('name'),
    postal_code: optional('postal_code'),
    postal_address: optional('postal_address'),
    location: optional('location'),
    contact: optional('contact'),
    tin: optional('tin'),
    vrn: optional('vrn'),
    status: formData.get('status') === 'on',
  }
}

export async function createCustomer(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const session = await requireAbility('customer_store')

  const result = customerSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.customers.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/customers')
  redirect('/settings/customers')
}

export async function updateCustomer(
  id: string,
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const session = await requireAbility('customer_update')

  const result = customerSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.customers.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/customers')
  redirect('/settings/customers')
}

export async function deleteCustomer(id: string): Promise<void> {
  await requireAbility('customer_remove')

  await prisma.customers.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/customers')
}
