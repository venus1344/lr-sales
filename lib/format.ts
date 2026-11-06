export function formatTin(tin: string | null | undefined): string | null {
  const value = (tin ?? '').trim()

  if (value === '') {
    return null
  }

  return value.length === 9
    ? `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 9)}`
    : value
}

export function formatVrn(vrn: string | null | undefined): string | null {
  const value = (vrn ?? '').trim()

  if (value === '') {
    return null
  }

  return value.length === 9
    ? `${value.slice(0, 2)}-${value.slice(2, 8)}-${value.slice(8, 9).toUpperCase()}`
    : value
}
