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

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024

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

/** Persist an already-validated receipt under public/uploads/receipts. */
export async function saveReceipt(file: File): Promise<string> {
  const problem = validateReceipt(file)
  if (problem) {
    throw new Error(problem)
  }

  const extension = RECEIPT_MIME_TYPES[file.type]
  const directory = join(process.cwd(), 'public', 'uploads', 'receipts')
  await mkdir(directory, { recursive: true })

  const name = `${randomUUID()}.${extension}`
  await writeFile(join(directory, name), Buffer.from(await file.arrayBuffer()))

  return `/uploads/receipts/${name}`
}
