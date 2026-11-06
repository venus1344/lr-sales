import Link from 'next/link'
import type { ReactNode } from 'react'

/** Top-right actions for a read-only record page. */
export function RecordActions({
  editHref,
  deleteAction,
}: {
  editHref: string
  deleteAction: () => Promise<void>
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href={editHref} className="sk-btn-ghost">
        Edit
      </Link>
      <form action={deleteAction}>
        <button type="submit" className="sk-btn-ghost" style={{ color: '#dc2626' }}>
          Delete
        </button>
      </form>
    </div>
  )
}

export type RecordField = { label: string; value: string | null | undefined }

export function RecordView({
  title,
  subtitle,
  actions,
  fields,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  fields: RecordField[]
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {subtitle ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {subtitle}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        {actions}
      </div>

      <div className="sk-card p-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {field.label}
              </dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {field.value && String(field.value).trim() !== '' ? field.value : '—'}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  )
}
