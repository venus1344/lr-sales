import { connection } from 'next/server'

import { prisma } from '@/lib/prisma'

export const instant = false

export default async function DashboardPage() {
  await connection()

  const [customers, suppliers, items, invoicesCount, proformaCount, invoiceItems, recentProformas] =
    await Promise.all([
      prisma.customers.count(),
      prisma.suppliers.count(),
      prisma.items.count(),
      prisma.invoices.count(),
      prisma.proformas.count(),
      prisma.invoice_items.findMany({ select: { price: true, quantity: true } }),
      prisma.proformas.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    ])

  const totalInvoiced = invoiceItems.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0,
  )

  const kpis = [
    { label: 'Total invoiced', value: totalInvoiced.toLocaleString(), accent: 'text-green-700' },
    { label: 'Customers', value: customers.toLocaleString(), accent: 'text-gray-900' },
    { label: 'Suppliers', value: suppliers.toLocaleString(), accent: 'text-gray-900' },
    { label: 'Items', value: items.toLocaleString(), accent: 'text-gray-900' },
    { label: 'Invoices', value: invoicesCount.toLocaleString(), accent: 'text-gray-900' },
    { label: 'Proformas', value: proformaCount.toLocaleString(), accent: 'text-gray-900' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500">Overview of your sales activity.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="sk-card p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {kpi.label}
            </p>
            <p className={`mt-1 text-xl font-bold ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="sk-card p-5">
          <h2 className="text-sm font-semibold text-gray-900">Recent proformas</h2>
          <div className="mt-3 space-y-3">
            {recentProformas.length === 0 ? (
              <p className="text-sm text-gray-400">No proformas yet.</p>
            ) : (
              recentProformas.map((proforma) => (
                <a
                  key={String(proforma.id)}
                  href={`/documents/proformas/${proforma.id}/edit`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{proforma.name}</p>
                    <p className="text-xs text-gray-500">{proforma.notes}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {proforma.date.toISOString().slice(0, 10)}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="sk-card p-5">
          <h2 className="text-sm font-semibold text-gray-900">Quick links</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { href: '/documents/proformas/new', label: 'New proforma' },
              { href: '/documents/invoices/new', label: 'New invoice' },
              { href: '/settings/customers/new', label: 'New customer' },
              { href: '/settings/items/new', label: 'New item' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
