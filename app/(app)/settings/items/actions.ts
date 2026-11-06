'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { itemSchema } from '@/lib/validation/item'
import { redirectWithToast } from '@/lib/toast'

export type ItemFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  return {
    category_id: formData.get('category_id'),
    name: formData.get('name'),
    unit_measure: optional('unit_measure'),
    specification: optional('specification'),
    price: formData.get('price'),
    active: formData.get('active') === 'on',
    vat: formData.get('vat') === 'on',
  }
}

export async function createItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await requireAbility('item_store')

  const result = itemSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.items.create({
    data: {
      ...result.data,
      category_id: BigInt(result.data.category_id),
      created_by: BigInt(session.user.id),
    },
  })

  revalidatePath('/settings/items')
  return redirectWithToast('/settings/items', 'Item created')
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await requireAbility('item_update')

  const result = itemSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.items.update({
    where: { id: BigInt(id) },
    data: {
      ...result.data,
      category_id: BigInt(result.data.category_id),
      updated_by: BigInt(session.user.id),
    },
  })

  revalidatePath('/settings/items')
  return redirectWithToast(`/settings/items/${id}`, 'Item updated')
}

export async function deleteItem(id: string): Promise<void> {
  await requireAbility('item_remove')

  await prisma.items.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/items')
}

export async function deleteItemFromView(id: string): Promise<void> {
  try {
    await deleteItem(id)
  } catch {
    return redirectWithToast('/settings/items', 'Could not delete the item', 'error')
  }
  return redirectWithToast('/settings/items', 'Item deleted')
}
