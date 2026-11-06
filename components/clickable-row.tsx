'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export function ClickableRow({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter()

  return (
    <tr
      className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
      onClick={() => router.push(href)}
    >
      {children}
    </tr>
  )
}
