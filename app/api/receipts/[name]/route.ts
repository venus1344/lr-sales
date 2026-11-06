import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { auth } from '@/auth'
import { isSafeReceiptName, receiptContentType, RECEIPT_STORAGE_DIR } from '@/lib/uploads'

/**
 * Serve a stored expense receipt to signed-in users only. Receipts live outside
 * the web root, so this route is the only way to reach them.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { name } = await params
  if (!isSafeReceiptName(name)) {
    return new Response('Not found', { status: 404 })
  }

  let file: Buffer
  try {
    file = await readFile(join(RECEIPT_STORAGE_DIR, name))
  } catch {
    return new Response('Not found', { status: 404 })
  }

  const contentType = receiptContentType(name) ?? 'application/octet-stream'
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Disposition': `inline; filename="${name}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }
  // An SVG opened directly could run script in this origin; sandbox it.
  if (contentType === 'image/svg+xml') {
    headers['Content-Security-Policy'] = "sandbox; default-src 'none'; img-src 'self'"
  }

  return new Response(new Uint8Array(file), { headers })
}
