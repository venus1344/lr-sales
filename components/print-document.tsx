'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A4 document sheet.
 *
 * Measures the content on mount and only applies the footer-at-bottom (flex)
 * layout when the whole document fits on a single page. Longer documents fall
 * back to normal block flow so the items table paginates instead of being
 * clipped.
 */
export function PrintDocument({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const footer = element.querySelector<HTMLElement>('.print-footer')
    const contentHeight = Array.from(element.children)
      .filter((child) => child !== footer)
      .reduce((sum, child) => sum + (child as HTMLElement).offsetHeight, 0)
    const footerHeight = footer?.offsetHeight ?? 0

    // A4 content height (297mm − 2 × 10mm) in CSS px at 96dpi.
    const pageContentPx = (297 - 20) * 3.7795
    setFit(contentHeight + footerHeight <= pageContentPx)
  }, [])

  return (
    <div ref={ref} className={`print-document text-sm${fit ? ' fit' : ''}`}>
      {children}
    </div>
  )
}
