import Link from 'next/link'
import type { ReactNode } from 'react'

/** Top-right actions for a single document. */
export function DocumentActions({
  editHref,
  printHref,
  convertHref,
  convertLabel = 'Convert',
  deleteAction,
}: {
  editHref: string
  printHref: string
  convertHref?: string
  convertLabel?: string
  deleteAction: () => Promise<void>
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {convertHref ? (
        <Link href={convertHref} className="sk-btn-ghost">
          {convertLabel}
        </Link>
      ) : null}
      <Link href={editHref} className="sk-btn-ghost">
        Edit
      </Link>
      <Link href={printHref} className="sk-btn-ghost">
        Print
      </Link>
      <form action={deleteAction}>
        <button type="submit" className="sk-btn-ghost" style={{ color: '#dc2626' }}>
          Delete
        </button>
      </form>
    </div>
  )
}

export type DocumentColumn = { label: string; align?: 'left' | 'right' }

export function DocumentView({
  title,
  number,
  actions,
  summary,
  columns,
  rows,
  totals,
}: {
  title: string
  number: string
  actions: ReactNode
  summary: Array<{ label: string; value: string }>
  columns: DocumentColumn[]
  rows: string[][]
  totals?: Array<{ label: string; value: string; bold?: boolean }>
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700">
            {number}
          </p>
        </div>
        {actions}
      </div>

      <div className="sk-card mt-6 p-4">
        <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-1.5 text-sm">
          {summary.map((item) => (
            <div key={item.label} className="contents">
              <dt className="text-gray-500">{item.label}</dt>
              <dd className="font-medium text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              {columns.map((column) => (
                <th
                  key={column.label}
                  className={`px-4 py-2 ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  No items.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2 ${columns[cellIndex]?.align === 'right' ? 'text-right' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totals && totals.length > 0 ? (
        <div className="sk-card mt-4 p-4">
          <dl className="ml-auto w-64 space-y-1 text-sm">
            {totals.map((total) => (
              <div
                key={total.label}
                className={`flex justify-between ${total.bold ? 'border-t border-gray-200 pt-1 font-bold' : ''}`}
              >
                <dt>{total.label}</dt>
                <dd>{total.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </main>
  )
}
