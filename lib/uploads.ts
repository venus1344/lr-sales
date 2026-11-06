import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Allowed receipt MIME types mapped to the safe file extension to store. */
export const RECEIPT_MIME_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
}

/** Stored extension -> content type used when the file is served again. */
const RECEIPT_EXTENSION_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
}

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024

/** Receipts are stored outside the web root; only the authenticated route serves them. */
export const RECEIPT_STORAGE_DIR = join(process.cwd(), 'storage', 'receipts')

export type ReceiptMeta = { type: string; size: number }

/**
 * Validate a receipt file by its MIME type and size. Returns an error message
 * or null when the file is acceptable.
 */
export function validateReceipt(meta: ReceiptMeta): string | null {
  if (!RECEIPT_MIME_TYPES[meta.type]) {
    return 'Unsupported file type. Allowed: PDF, JPG, PNG, GIF, WEBP, BMP, SVG.'
  }
  if (meta.size <= 0) {
    return 'The receipt file is empty.'
  }
  if (meta.size > RECEIPT_MAX_BYTES) {
    return 'The receipt file is too large (max 5MB).'
  }
  return null
}

/** URL the app links to; the authenticated route enforces access. */
export function receiptUrl(name: string): string {
  return `/api/receipts/${name}`
}

/** A stored receipt name is a UUID plus one of the allowed extensions. */
export function isSafeReceiptName(name: string): boolean {
  const match =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.([a-z0-9]+)$/.exec(name)
  return match !== null && RECEIPT_EXTENSION_TYPES[match[1]] !== undefined
}

/** Content type for a stored receipt name, or null when it is not recognised. */
export function receiptContentType(name: string): string | null {
  const match = /\.([a-z0-9]+)$/.exec(name)
  return match ? (RECEIPT_EXTENSION_TYPES[match[1]] ?? null) : null
}

/** Persist an already-validated receipt under the private storage directory. */
export async function saveReceipt(file: File): Promise<string> {
  const problem = validateReceipt(file)
  if (problem) {
    throw new Error(problem)
  }

  const extension = RECEIPT_MIME_TYPES[file.type]
  await mkdir(RECEIPT_STORAGE_DIR, { recursive: true })

  const name = `${randomUUID()}.${extension}`
  await writeFile(join(RECEIPT_STORAGE_DIR, name), Buffer.from(await file.arrayBuffer()))

  return receiptUrl(name)
}
