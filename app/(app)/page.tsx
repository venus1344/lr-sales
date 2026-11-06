const links = [
  { href: '/documents/proformas', label: 'Proformas', description: 'Create and manage quotations' },
  { href: '/settings/customers', label: 'Customers', description: 'Manage your customers' },
  { href: '/settings/items', label: 'Items', description: 'Products and services' },
  { href: '/settings/suppliers', label: 'Suppliers', description: 'Manage your suppliers' },
  { href: '/settings/currencies', label: 'Currencies', description: 'Exchange rates' },
  { href: '/settings/packages', label: 'Packages', description: 'Internet packages' },
]

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">Welcome back. Choose a section to get started.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="sk-card p-4 transition hover:brightness-105">
            <h2 className="font-semibold">{link.label}</h2>
            <p className="mt-1 text-sm text-gray-600">{link.description}</p>
          </a>
        ))}
      </div>
    </main>
  )
}
