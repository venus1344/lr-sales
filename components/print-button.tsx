'use client'

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="sk-btn no-print">
      Print / Save as PDF
    </button>
  )
}
