import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatTin } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { deleteSupplierFromView } from '../actions'

export const instant = false

export default async function SupplierViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('supplier_list')

  const supplier = await prisma.suppliers.findUnique({ where: { id: BigInt(id) } })
  if (!supplier) {
    notFound()
  }

  return (
    <RecordView
      title={supplier.name}
      subtitle="Supplier"
      actions={
        <RecordActions
          editHref={`/settings/suppliers/${supplier.id}/edit`}
          deleteAction={deleteSupplierFromView.bind(null, String(supplier.id))}
        />
      }
      fields={[
        { label: 'Location', value: supplier.location },
        { label: 'Contacts', value: supplier.contacts },
        { label: 'Postal code', value: supplier.postal_code },
        { label: 'Postal address', value: supplier.postal_address },
        { label: 'TIN', value: formatTin(supplier.tin) },
        { label: 'VRN', value: supplier.vrn },
        { label: 'Status', value: supplier.status ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
