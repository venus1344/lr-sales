export function Pagination({
  page,
  total,
  pageSize,
  query,
}: {
  page: number
  total: number
  pageSize: number
  query?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) {
    return null
  }

  const hrefFor = (target: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (target > 1) params.set('page', String(target))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
      <span className="text-gray-500">
        {total.toLocaleString()} total · page {page} of {totalPages}
      </span>
      <div className="flex gap-3">
        {page > 1 ? (
          <a href={hrefFor(page - 1)} className="sk-link">Previous</a>
        ) : (
          <span className="text-gray-300">Previous</span>
        )}
        {page < totalPages ? (
          <a href={hrefFor(page + 1)} className="sk-link">Next</a>
        ) : (
          <span className="text-gray-300">Next</span>
        )}
      </div>
    </div>
  )
}
