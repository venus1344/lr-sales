import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteDeliveryNote } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function DeliveryNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('dnote_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [notes, total] = await Promise.all([
    prisma.delivery_notes.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { delivery_note_items: true },
    }),
    prisma.delivery_notes.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Delivery notes</h1>
        <Link href="/documents/delivery-notes/new" className="sk-btn">
          New delivery note
        </Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search by customer…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2 text-right">Items</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No delivery notes found.</td>
              </tr>
            ) : (
              notes.map((note) => (
                <tr key={String(note.id)} className="border-b last:border-0">
                  <td className="px-4 py-2">{note.date.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-2 font-medium">{note.name}</td>
                  <td className="px-4 py-2">{note.location}</td>
                  <td className="px-4 py-2 text-right">{note.delivery_note_items.length}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/documents/delivery-notes/${note.id}/print`} className="sk-link mr-3">
                      Print
                    </Link>
                    <Link href={`/documents/delivery-notes/${note.id}/edit`} className="sk-link mr-3">
                      Edit
                    </Link>
                    <form action={deleteDeliveryNote.bind(null, String(note.id))} className="inline">
                      <button type="submit" className="sk-link-danger">Delete</button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
