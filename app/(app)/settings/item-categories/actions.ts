'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { itemCategorySchema } from '@/lib/validation/item-category'

export type ItemCategoryFormState = { error?: string }

function readInput(formData: FormData) {
  const description = String(formData.get('description') ?? '').trim()

  return {
    name: formData.get('name'),
    description: description === '' ? null : description,
    active: formData.get('active') === 'on',
  }
}

export async function createItemCategory(
  _prev: ItemCategoryFormState,
  formData: FormData,
): Promise<ItemCategoryFormState> {
  const session = await requireAbility('item_category_store')

  const result = itemCategorySchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.item_categories.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/item-categories')
  redirect('/settings/item-categories')
}

export async function updateItemCategory(
  id: string,
  _prev: ItemCategoryFormState,
  formData: FormData,
): Promise<ItemCategoryFormState> {
  const session = await requireAbility('item_category_update')

  const result = itemCategorySchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.item_categories.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/item-categories')
  redirect('/settings/item-categories')
}

export async function deleteItemCategory(id: string): Promise<void> {
  await requireAbility('item_category_remove')

  await prisma.item_categories.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/item-categories')
}
