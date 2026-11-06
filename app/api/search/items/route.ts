import { NextResponse, type NextRequest } from 'next/server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { toItemOption } from '@/lib/search-options'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  const where = q ? { active: true, name: { contains: q } } : { active: true }

  const items = await prisma.items.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 20,
  })

  return NextResponse.json({ options: items.map(toItemOption) })
}
