'use client'

import { usePathname } from 'next/navigation'

import { buildCrumbs } from '@/lib/navigation'

export function Breadcrumbs() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 ? <span className="text-gray-300" aria-hidden>/</span> : null}
            {!isLast && crumb.href ? (
              <a href={crumb.href} className="sk-link truncate">
                {crumb.label}
              </a>
            ) : (
              <span className={`truncate ${isLast ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                {crumb.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
