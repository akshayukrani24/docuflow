import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true, ownerId: true },
    }),
    prisma.document.findMany({
      where: {
        shares: { some: { userId: session.user.id } },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        owner: { select: { name: true, email: true } },
      },
    }),
  ])

  return NextResponse.json({ owned, shared })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const title = (body.title as string)?.trim() || 'Untitled Document'

  const doc = await prisma.document.create({
    data: {
      title,
      content: body.content || '',
      contentType: body.contentType || 'json',
      ownerId: session.user.id,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
