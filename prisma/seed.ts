import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const akshay = await prisma.user.upsert({
    where: { email: 'akshay@docuflow.app' },
    update: {},
    create: {
      name: 'Akshay Kumar',
      email: 'akshay@docuflow.app',
      password: hashedPassword,
    },
  })

  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@docuflow.app' },
    update: {},
    create: {
      name: 'Alex Reviewer',
      email: 'reviewer@docuflow.app',
      password: hashedPassword,
    },
  })

  // Seed a sample document for Akshay
  await prisma.document.upsert({
    where: { id: 'sample-doc-1' },
    update: {},
    create: {
      id: 'sample-doc-1',
      title: 'Welcome to DocuFlow',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to DocuFlow' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'collaborative document editor' },
              { type: 'text', text: '. You can:' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create and edit rich-text documents' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Import .txt and .md files' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Share documents with other users' }] }],
              },
            ],
          },
        ],
      }),
      contentType: 'json',
      ownerId: akshay.id,
    },
  })

  console.log('Seeded users:')
  console.log('  akshay@docuflow.app / password123')
  console.log('  reviewer@docuflow.app / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
