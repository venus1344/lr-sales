export type SearchOption = {
  value: string
  label: string
  hint?: string
  data?: Record<string, unknown>
}

function idOf(id: bigint | number | string): string {
  return String(id)
}

function optionalHint(...parts: Array<string | null | undefined>): string | undefined {
  const value = parts.filter((part) => part && part.trim()).join(' · ')
  return value || undefined
}

export function toItemOption(item: {
  id: bigint | number | string
  name: string
  specification?: string | null
  unit_measure?: string | null
  price?: unknown
}): SearchOption {
  return {
    value: idOf(item.id),
    label: item.name,
    ...(optionalHint(item.specification, item.unit_measure)
      ? { hint: optionalHint(item.specification, item.unit_measure) }
      : {}),
    data: {
      specification: item.specification ?? null,
      unit_measure: item.unit_measure ?? null,
      price: item.price == null ? 0 : Number(item.price),
    },
  }
}

export function toCustomerOption(customer: {
  id: bigint | number | string
  name: string
  location?: string | null
  contact?: string | null
  postal?: string | null
  tin?: string | null
  vrn?: string | null
}): SearchOption {
  return {
    value: idOf(customer.id),
    label: customer.name,
    ...(optionalHint(customer.location) ? { hint: optionalHint(customer.location) } : {}),
    data: {
      location: customer.location ?? null,
      contact: customer.contact ?? null,
      postal: customer.postal ?? null,
      tin: customer.tin ?? null,
      vrn: customer.vrn ?? null,
    },
  }
}

export function toSupplierOption(supplier: {
  id: bigint | number | string
  name: string
  location?: string | null
  contacts?: string | null
  tin?: string | null
}): SearchOption {
  return {
    value: idOf(supplier.id),
    label: supplier.name,
    ...(optionalHint(supplier.location) ? { hint: optionalHint(supplier.location) } : {}),
    data: {
      location: supplier.location ?? null,
      contacts: supplier.contacts ?? null,
      tin: supplier.tin ?? null,
    },
  }
}
