'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'

export type ComboboxOption = {
  value: string
  label: string
  hint?: string
  data?: Record<string, unknown>
}

export type ComboboxProps = {
  value: string
  label: string
  onChange: (option: ComboboxOption) => void
  searchUrl: string
  placeholder?: string
  createHref?: string
  createLabel?: string
  name?: string
  id?: string
  className?: string
}

export function Combobox({
  value,
  label,
  onChange,
  searchUrl,
  placeholder = 'Search…',
  createHref,
  createLabel = 'Create new',
  name,
  id,
  className,
}: ComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listboxId = useId()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  function buildUrl(q: string) {
    const url = new URL(searchUrl, window.location.origin)
    url.searchParams.set('q', q)
    return url.toString()
  }

  async function fetchOptions(q: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const res = await fetch(buildUrl(q), { signal: controller.signal })
      if (!res.ok) throw new Error(`search failed: ${res.status}`)
      const json = (await res.json()) as { options?: ComboboxOption[] }
      setOptions(json.options ?? [])
      setActiveIndex(0)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setOptions([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  function openPanel() {
    setOpen(true)
    setQuery('')
    setActiveIndex(0)
    void fetchOptions('')
  }

  function onQueryChange(e: ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void fetchOptions(q), 200)
  }

  function select(option: ComboboxOption) {
    onChange(option)
    setOpen(false)
    setQuery('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        openPanel()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = options[activeIndex]
      if (option) select(option)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <input
        id={id}
        type="text"
        className="sk-input pr-8"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={open ? query : label}
        onFocus={openPanel}
        onChange={onQueryChange}
        onKeyDown={onKeyDown}
      />
      <span
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400"
        aria-hidden
      >
        ▾
      </span>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      {open ? (
        <div className="sk-menu">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No results</div>
          ) : (
            <ul id={listboxId} role="listbox" className="m-0 list-none p-0">
              {options.map((option, i) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`sk-menu-option ${i === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => select(option)}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {createHref ? (
            <a className="sk-menu-create" href={createHref} target="_blank" rel="noopener">
              <span aria-hidden>＋</span>
              {createLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
