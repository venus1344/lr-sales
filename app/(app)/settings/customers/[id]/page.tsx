import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatTin } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { deleteCustomerFromView } from '../actions'

export const instant = false

export default async function CustomerViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('customer_list')

  const customer = await prisma.customers.findUnique({ where: { id: BigInt(id) } })
  if (!customer) {
    notFound()
  }

  return (
    <RecordView
      title={customer.name}
      subtitle="Customer"
      actions={
        <RecordActions
          editHref={`/settings/customers/${customer.id}/edit`}
          deleteAction={deleteCustomerFromView.bind(null, String(customer.id))}
        />
      }
      fields={[
        { label: 'Contact', value: customer.contact },
        { label: 'Location', value: customer.location },
        { label: 'Postal code', value: customer.postal_code },
        { label: 'Postal address', value: customer.postal_address },
        { label: 'TIN', value: formatTin(customer.tin) },
        { label: 'VRN', value: customer.vrn },
        { label: 'Status', value: customer.status ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
