import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditorClient } from './EditorClient'

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })

  if (!doc) notFound()

  const hasAccess =
    doc.ownerId === session.user.id ||
    doc.shares.some((s) => s.userId === session.user.id)

  if (!hasAccess) redirect('/dashboard')

  const isOwner = doc.ownerId === session.user.id

  return (
    <EditorClient
      doc={{
        id: doc.id,
        title: doc.title,
        content: doc.content,
        contentType: doc.contentType,
        owner: doc.owner,
        shares: doc.shares,
      }}
      currentUser={{ id: session.user.id!, name: session.user.name!, email: session.user.email! }}
      isOwner={isOwner}
    />
  )
}
