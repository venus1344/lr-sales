import { prisma } from '@/lib/prisma'

/**
 * Whether a user holds the given ability through any of their roles.
 *
 * This is the source of truth for RBAC checks. Super admins are handled by the
 * caller (`userHasAbility`) — this function performs the raw DB lookup only.
 */
export async function hasAbility(userId: string, ability: string): Promise<boolean> {
  const count = await prisma.ability_role.count({
    where: {
      abilities: { name: ability },
      roles: {
        role_user: {
          some: { user_id: BigInt(userId) },
        },
      },
    },
  })

  return count > 0
}
