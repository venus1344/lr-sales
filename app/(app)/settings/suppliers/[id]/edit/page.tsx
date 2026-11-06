import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { SupplierForm } from '../../form'

export const instant = false

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('supplier_update')

  const supplier = await prisma.suppliers.findUnique({ where: { id: BigInt(id) } })
  if (!supplier) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit supplier</h1>
      <SupplierForm
        supplier={{
          id: String(supplier.id),
          name: supplier.name,
          location: supplier.location,
          contacts: supplier.contacts,
          postal_code: supplier.postal_code,
          postal_address: supplier.postal_address,
          tin: supplier.tin,
          vrn: supplier.vrn,
          status: supplier.status,
        }}
      />
    </main>
  )
}
