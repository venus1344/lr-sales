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
      className={`${danger ? 'sk-link-danger' : 'sk-link'} mr-3 inline-flex items-center gap-1`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  )
}

export function ActionButton({ icon: Icon, label, danger }: ActionProps) {
  return (
    <button
      type="submit"
      className={`${danger ? 'sk-link-danger' : 'sk-link'} inline-flex items-center gap-1`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
