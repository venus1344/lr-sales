import { describe, expect, it } from 'vitest'

import { buildCrumbs } from '../lib/navigation'

describe('buildCrumbs', () => {
  it('returns only the dashboard crumb at the root', () => {
    expect(buildCrumbs('/')).toEqual([{ label: 'Dashboard', href: '/' }])
  })

  it('builds a settings list trail with a non-linking section', () => {
    expect(buildCrumbs('/settings/customers')).toEqual([
      { label: 'Dashboard', href: '/' },
      { label: 'Settings' },
      { label: 'Customers', href: '/settings/customers' },
    ])
  })

  it('builds a nested document action trail and skips numeric ids', () => {
    expect(buildCrumbs('/documents/proformas/123/edit')).toEqual([
      { label: 'Dashboard', href: '/' },
      { label: 'Documents' },
      { label: 'Proformas', href: '/documents/proformas' },
      { label: 'Edit' },
    ])
  })

  it('maps known segments to friendly labels', () => {
    expect(buildCrumbs('/settings/item-categories/new')).toEqual([
      { label: 'Dashboard', href: '/' },
      { label: 'Settings' },
      { label: 'Categories', href: '/settings/item-categories' },
      { label: 'New' },
    ])
  })
})
