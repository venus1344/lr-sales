import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { CustomerForm } from '../../form'

export const instant = false

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('customer_update')

  const customer = await prisma.customers.findUnique({ where: { id: BigInt(id) } })
  if (!customer) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit customer</h1>
      <CustomerForm
        customer={{
          id: String(customer.id),
          name: customer.name,
          postal_code: customer.postal_code,
          postal_address: customer.postal_address,
          location: customer.location,
          contact: customer.contact,
          tin: customer.tin,
          vrn: customer.vrn,
          status: customer.status,
        }}
      />
    </main>
  )
}
