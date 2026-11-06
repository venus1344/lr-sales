'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { packageSchema } from '@/lib/validation/package'

export type PackageFormState = { error?: string }

function readInput(formData: FormData) {
  return {
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    status: formData.get('status') === 'on',
  }
}

export async function createPackage(
  _prev: PackageFormState,
  formData: FormData,
): Promise<PackageFormState> {
  const session = await requireAbility('package_store')

  const result = packageSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.packages.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/packages')
  redirect('/settings/packages')
}

export async function updatePackage(
  id: string,
  _prev: PackageFormState,
  formData: FormData,
): Promise<PackageFormState> {
  const session = await requireAbility('package_update')

  const result = packageSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.packages.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/packages')
  redirect('/settings/packages')
}

export async function deletePackage(id: string): Promise<void> {
  await requireAbility('package_remove')

  await prisma.packages.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/packages')
}
