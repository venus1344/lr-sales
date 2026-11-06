export function SearchForm({
  placeholder,
  defaultValue,
}: {
  placeholder: string
  defaultValue?: string
}) {
  return (
    <form method="get" className="flex gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="sk-input max-w-xs"
        aria-label="Search"
      />
      <button type="submit" className="sk-btn-ghost">
        Search
      </button>
    </form>
  )
}
