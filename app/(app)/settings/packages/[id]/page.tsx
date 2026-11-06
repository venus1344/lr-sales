import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deletePackageFromView } from '../actions'

export const instant = false

export default async function PackageViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('package_list')

  const pkg = await prisma.packages.findUnique({ where: { id: BigInt(id) } })
  if (!pkg) {
    notFound()
  }

  return (
    <RecordView
      title={pkg.name}
      subtitle="Package"
      actions={
        <RecordActions
          editHref={`/settings/packages/${pkg.id}/edit`}
          deleteAction={deletePackageFromView.bind(null, String(pkg.id))}
        />
      }
      fields={[
        { label: 'Name', value: pkg.name },
        { label: 'Description', value: pkg.description },
        { label: 'Price', value: String(pkg.price) },
        { label: 'Status', value: pkg.status ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
