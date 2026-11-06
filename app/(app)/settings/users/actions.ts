'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'
import { userCreateSchema, userPasswordResetSchema, userUpdateSchema } from '@/lib/validation/user'
import { redirectWithToast } from '@/lib/toast'

export type UserFormState = { error?: string }

function readRoleIds(formData: FormData): string[] {
  return formData.getAll('roles').map(String)
}

export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireAbility('user_store')

  const result = userCreateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    password_confirmation: formData.get('password_confirmation'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data
  const existing = await prisma.users.findUnique({ where: { email: input.email } })
  if (existing) {
    return { error: 'A user with that email already exists' }
  }

  const [password, createdBy] = [await hashPassword(input.password), BigInt(session.user.id)]
  const roleIds = readRoleIds(formData)

  const user = await prisma.users.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      email_verified_at: new Date(),
      created_by: createdBy,
    },
  })

  if (roleIds.length > 0) {
    await prisma.role_user.createMany({
      data: roleIds.map((roleId) => ({
        user_id: user.id,
        role_id: BigInt(roleId),
        created_by: createdBy,
      })),
    })
  }

  revalidatePath('/settings/users')
  return redirectWithToast('/settings/users', 'User created')
}

export async function updateUser(
  id: string,
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireAbility('user_update')

  const result = userUpdateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data
  const userId = BigInt(id)
  const actor = BigInt(session.user.id)

  const clash = await prisma.users.findUnique({ where: { email: input.email } })
  if (clash && clash.id !== userId) {
    return { error: 'A user with that email already exists' }
  }

  const password = String(formData.get('password') ?? '')
  const passwordConfirmation = String(formData.get('password_confirmation') ?? '')
  let passwordHash: string | null = null
  if (password || passwordConfirmation) {
    const pwResult = userPasswordResetSchema.safeParse({
      password,
      password_confirmation: passwordConfirmation,
    })
    if (!pwResult.success) {
      return { error: pwResult.error.issues[0]?.message ?? 'Invalid password' }
    }
    passwordHash = await hashPassword(pwResult.data.password)
  }

  const roleIds = readRoleIds(formData)

  await prisma.$transaction([
    prisma.role_user.deleteMany({ where: { user_id: userId } }),
    prisma.users.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
        updated_by: actor,
        ...(passwordHash ? { password: passwordHash } : {}),
      },
    }),
    ...roleIds.map((roleId) =>
      prisma.role_user.create({
        data: { user_id: userId, role_id: BigInt(roleId), created_by: actor },
      }),
    ),
  ])

  revalidatePath('/settings/users')
  return redirectWithToast('/settings/users', 'User updated')
}

async function setActive(id: string, active: boolean): Promise<void> {
  const session = await requireAbility('user_remove')

  await prisma.users.update({
    where: { id: BigInt(id) },
    data: { active, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/users')
}

export async function blockUser(id: string): Promise<void> {
  await setActive(id, false)
}

export async function unblockUser(id: string): Promise<void> {
  await setActive(id, true)
}
