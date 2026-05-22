import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true, ownerId: true },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: session.user.id } } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        owner: { select: { name: true } },
      },
    }),
  ])

  const serializeDate = (d: Date) => d.toISOString()

  return (
    <DashboardClient
      user={{ id: session.user.id!, name: session.user.name!, email: session.user.email! }}
      initialOwned={owned.map((d) => ({ ...d, createdAt: serializeDate(d.createdAt), updatedAt: serializeDate(d.updatedAt) }))}
      initialShared={shared.map((d) => ({ ...d, createdAt: serializeDate(d.createdAt), updatedAt: serializeDate(d.updatedAt) })) as any}
    />
  )
}
