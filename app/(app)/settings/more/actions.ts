'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { toSnakeCase } from '@/lib/strings'
import { settingSchema, settingValueSchema } from '@/lib/validation/setting'

export type SettingFormState = { error?: string }

export async function createSetting(
  _prev: SettingFormState,
  formData: FormData,
): Promise<SettingFormState> {
  await requireAbility('set_settings')

  const result = settingSchema.safeParse({
    name: formData.get('name'),
    value: formData.get('value'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const name = toSnakeCase(result.data.name)
  const existing = await prisma.settings.findFirst({ where: { name } })
  if (existing) {
    return { error: 'A setting with that name already exists' }
  }

  await prisma.settings.create({ data: { name, value: String(result.data.value) } })

  revalidatePath('/settings/more')
  redirect('/settings/more')
}

export async function updateSetting(
  id: string,
  _prev: SettingFormState,
  formData: FormData,
): Promise<SettingFormState> {
  const session = await requireAbility('set_settings')

  const result = settingValueSchema.safeParse({ value: formData.get('value') })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const settingId = BigInt(id)
  const existing = await prisma.settings.findUnique({ where: { id: settingId } })
  if (!existing) {
    return { error: 'Setting not found' }
  }

  const nextValue = String(result.data.value)

  await prisma.$transaction([
    prisma.setting_changelog.create({
      data: {
        updated_by: BigInt(session.user.id),
        setting_id: settingId,
        from: existing.value,
        to: nextValue,
      },
    }),
    prisma.settings.update({ where: { id: settingId }, data: { value: nextValue } }),
  ])

  revalidatePath('/settings/more')
  redirect('/settings/more')
}
