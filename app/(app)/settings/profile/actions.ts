'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { signOut } from '@/auth'
import { requireUser } from '@/lib/auth/guard'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'
import { passwordChangeSchema, profileSchema } from '@/lib/validation/user'

export type ProfileFormState = { error?: string; success?: string }

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireUser()

  const result = profileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    location: formData.get('location'),
    skills: formData.get('skills'),
    notes: formData.get('notes'),
    education: formData.get('education'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data
  const userId = BigInt(session.user.id)

  const clash = await prisma.users.findUnique({ where: { email: input.email } })
  if (clash && clash.id !== userId) {
    return { error: 'A user with that email already exists' }
  }

  await prisma.users.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      location: input.location?.trim() || null,
      skills: input.skills?.trim() || null,
      notes: input.notes?.trim() || null,
      education: input.education?.trim() || null,
      updated_by: userId,
    },
  })

  revalidatePath('/settings/profile')
  return { success: 'Profile updated' }
}

export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireUser()

  const result = passwordChangeSchema.safeParse({
    old_password: formData.get('old_password'),
    password: formData.get('password'),
    password_confirmation: formData.get('password_confirmation'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const user = await prisma.users.findUnique({ where: { id: BigInt(session.user.id) } })
  if (!user) {
    return { error: 'User not found' }
  }

  const valid = await verifyPassword(result.data.old_password, user.password)
  if (!valid) {
    return { error: 'Current password is incorrect' }
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password: await hashPassword(result.data.password), updated_by: user.id },
  })

  await signOut({ redirect: false })
  redirect('/signin')
}
