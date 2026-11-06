import { NextResponse, type NextRequest } from 'next/server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { toSupplierOption } from '@/lib/search-options'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  const where = q ? { name: { contains: q } } : {}

  const suppliers = await prisma.suppliers.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 20,
  })

  return NextResponse.json({ options: suppliers.map(toSupplierOption) })
}
