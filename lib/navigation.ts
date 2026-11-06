export const CRUMB_LABELS: Record<string, string> = {
  settings: 'Settings',
  documents: 'Documents',
  customers: 'Customers',
  suppliers: 'Suppliers',
  items: 'Items',
  'item-categories': 'Categories',
  currencies: 'Currencies',
  packages: 'Packages',
  users: 'Users',
  roles: 'Roles',
  profile: 'Profile',
  more: 'General',
  proformas: 'Proformas',
  invoices: 'Invoices',
  'delivery-notes': 'Delivery notes',
  lpos: 'LPOs',
  new: 'New',
  edit: 'Edit',
  print: 'Print',
}

export type Crumb = { label: string; href?: string }

export function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Dashboard', href: '/' }]

  if (pathname === '/' || pathname === '') {
    return crumbs
  }

  const segments = pathname.split('/').filter(Boolean)
  const section = segments[0]
  const entity = segments[1]

  if (section === 'settings' || section === 'documents') {
    crumbs.push({ label: CRUMB_LABELS[section] })
  } else if (section !== undefined) {
    crumbs.push({ label: CRUMB_LABELS[section] ?? section })
  }

  if (entity) {
    crumbs.push({ label: CRUMB_LABELS[entity] ?? entity, href: `/${section}/${entity}` })
  }

  for (let i = 2; i < segments.length; i++) {
    const segment = segments[i]
    if (/^\d+$/.test(segment)) continue
    crumbs.push({ label: CRUMB_LABELS[segment] ?? segment })
  }

  return crumbs
}
