import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function IconDashboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function IconCustomers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  )
}

export function IconSuppliers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 6.5h10.5v9H2.5z" />
      <path d="M13 9.5h3.8l2.7 3v3h-6.5" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </svg>
  )
}

export function IconItems(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  )
}

export function IconCategories(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12.2 11.8 3.9a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v5.8a2 2 0 0 1-.6 1.4l-8.3 8.3a2 2 0 0 1-2.8 0l-5.8-5.8a2 2 0 0 1 0-2.8z" />
      <circle cx="16" cy="8" r="1.25" />
    </svg>
  )
}

export function IconCurrencies(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10" />
      <path d="M14.75 9.25c0-1.1-1.2-1.9-2.75-1.9s-2.75.85-2.75 1.9 1.2 1.65 2.75 2.1 2.75 1 2.75 2.1-1.2 1.9-2.75 1.9-2.75-.8-2.75-1.9" />
    </svg>
  )
}

export function IconPackages(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 16.5l9 5 9-5" />
    </svg>
  )
}

export function IconProformas(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M8.75 12h6.5" />
      <path d="M8.75 15.5h4" />
    </svg>
  )
}

export function IconInvoices(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 13.5l2 2 3.5-3.5" />
    </svg>
  )
}

export function IconDeliveryNotes(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v10" />
      <path d="M8.5 9.5 12 13l3.5-3.5" />
      <path d="M4 15v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15" />
    </svg>
  )
}

export function IconLpos(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20 7H6" />
    </svg>
  )
}

export function IconDots(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

export function IconConvert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h12" />
      <path d="M13 5l3 3-3 3" />
      <path d="M20 16H8" />
      <path d="M11 13l-3 3 3 3" />
    </svg>
  )
}

export function IconPrint(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 8V4h10v4" />
      <rect x="3.5" y="8" width="17" height="8" rx="1.5" />
      <path d="M7 16v4h10v-4" />
    </svg>
  )
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}
