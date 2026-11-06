import { connection } from 'next/server'

import { IncomeChart } from '@/components/income-chart'
import { prisma } from '@/lib/prisma'

export const instant = false

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage() {
  await connection()

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))

  const [
    customers,
    suppliers,
    items,
    invoicesCount,
    proformaCount,
    invoiceItems,
    recentProformas,
    recentProjects,
    recentInvoices,
  ] = await Promise.all([
    prisma.customers.count(),
    prisma.suppliers.count(),
    prisma.items.count(),
    prisma.invoices.count(),
    prisma.proformas.count(),
    prisma.invoice_items.findMany({ select: { price: true, quantity: true } }),
    prisma.proformas.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    prisma.projects.findMany({
      orderBy: { starts_on: 'desc' },
      take: 4,
      include: { customers: true },
    }),
    prisma.invoices.findMany({
      where: { date: { gte: start } },
      select: { date: true, invoice_items: { select: { price: true, quantity: true } } },
    }),
  ])

  const totalInvoiced = invoiceItems.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0,
  )

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1))
    return { key: monthKey(date), label: MONTH_LABELS[date.getUTCMonth()], value: 0 }
  })
  const byMonth = new Map(months.map((month) => [month.key, month]))
  for (const invoice of recentInvoices) {
    const bucket = byMonth.get(monthKey(invoice.date))
    if (!bucket) continue
    for (const line of invoice.invoice_items) {
      bucket.value += Number(line.price) * line.quantity
    }
  }
  const yearTotal = months.reduce((sum, month) => sum + month.value, 0)

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

      <div className="mt-6 sk-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Invoiced per month</h2>
          <p className="text-xs text-gray-500">Last 12 months · {yearTotal.toLocaleString()}</p>
        </div>
        {yearTotal === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No invoiced amounts in the last 12 months.</p>
        ) : (
          <div className="mt-3">
            <IncomeChart points={months.map(({ label, value }) => ({ label, value }))} />
          </div>
        )}
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
                  href={`/documents/proformas/${proforma.id}`}
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
          <h2 className="text-sm font-semibold text-gray-900">Recent projects</h2>
          <div className="mt-3 space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-gray-400">No projects yet.</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={String(project.id)}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="truncate text-xs text-gray-500">{project.customers.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-600">
                      {Number(project.estimated_budget).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {project.starts_on.toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 sk-card p-5">
        <h2 className="text-sm font-semibold text-gray-900">Quick links</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
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
  )
}
