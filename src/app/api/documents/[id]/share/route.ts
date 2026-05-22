import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const shares = await prisma.documentShare.findMany({
    where: { documentId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(shares)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (doc.ownerId !== session.user.id) return NextResponse.json({ error: 'Only the owner can share' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { email, permission = 'edit' } = body

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (targetUser.id === session.user.id) return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })

  const share = await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } },
    update: { permission },
    create: { documentId: id, userId: targetUser.id, permission },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(share, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await req.json().catch(() => ({}))
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await prisma.documentShare.deleteMany({ where: { documentId: id, userId } })
  return NextResponse.json({ success: true })
}
