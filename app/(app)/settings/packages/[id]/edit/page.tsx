import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { PackageForm } from '../../form'

export const instant = false

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('package_update')

  const pkg = await prisma.packages.findUnique({ where: { id: BigInt(id) } })
  if (!pkg) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit package</h1>
      <PackageForm
        pkg={{
          id: String(pkg.id),
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          status: pkg.status,
        }}
      />
    </main>
  )
}
