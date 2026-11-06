import Link from 'next/link'
import type { ReactNode, SVGProps } from 'react'

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactNode

type ActionProps = {
  icon: IconComponent
  label: string
  danger?: boolean
}

export function ActionLink({
  href,
  icon: Icon,
  label,
  danger,
}: ActionProps & { href: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`${danger ? 'sk-link-danger' : 'sk-link'} mr-3 inline-flex items-center`}
    >
      <Icon className="h-4 w-4" />
    </Link>
  )
}

export function ActionButton({ icon: Icon, label, danger }: ActionProps) {
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      className={`${danger ? 'sk-link-danger' : 'sk-link'} inline-flex items-center`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
