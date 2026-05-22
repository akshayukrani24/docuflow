import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['text/plain', 'text/markdown', 'text/x-markdown', 'application/octet-stream']
  const allowedExts = ['.txt', '.md', '.markdown']
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!allowedExts.includes(ext) && !allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Only .txt and .md files are supported.' },
      { status: 400 }
    )
  }

  const text = await file.text()

  // Convert plain text/markdown to Tiptap JSON
  const paragraphs = text.split('\n\n').filter(Boolean)
  const content = {
    type: 'doc',
    content: paragraphs.map((para) => {
      const trimmed = para.trim()
      if (trimmed.startsWith('# ')) {
        return { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: trimmed.slice(2) }] }
      }
      if (trimmed.startsWith('## ')) {
        return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: trimmed.slice(3) }] }
      }
      if (trimmed.startsWith('### ')) {
        return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: trimmed.slice(4) }] }
      }
      // Handle bullet lines
      const lines = trimmed.split('\n')
      const isList = lines.every((l) => l.startsWith('- ') || l.startsWith('* '))
      if (isList) {
        return {
          type: 'bulletList',
          content: lines.map((l) => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: l.slice(2) }] }],
          })),
        }
      }
      return {
        type: 'paragraph',
        content: trimmed ? [{ type: 'text', text: trimmed.replace(/\n/g, ' ') }] : [],
      }
    }),
  }

  const title = file.name.replace(/\.(txt|md|markdown)$/i, '') || 'Imported Document'

  const doc = await prisma.document.create({
    data: {
      title,
      content: JSON.stringify(content),
      contentType: 'json',
      ownerId: session.user.id,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
