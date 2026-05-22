# DocuFlow

A lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer Assignment.

## Live Demo

> Deployment link: *(see SUBMISSION.md)*

**Demo accounts** (password: `password123` for both):

| Name | Email |
|------|-------|
| Akshay Kumar | akshay@docuflow.app |
| Alex Reviewer | reviewer@docuflow.app |

## Features

- **Rich-text editor** â€” Bold, italic, underline, strikethrough, H1/H2/H3, bullet lists, numbered lists, blockquote, undo/redo
- **Document management** â€” Create, rename (inline), delete, reopen
- **Autosave** â€” Saves 1.5s after you stop typing with a visible Saved/Saving/Unsaved indicator
- **File import** â€” Upload `.txt` or `.md` files to create a new editable document (`.docx` not supported in this version)
- **Sharing** â€” Share any owned document with another user; Owned vs Shared docs shown with distinct UI badges
- **Persistence** â€” SQLite database; all documents and sharing state survive refresh

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone and install dependencies
npm install

# 2. Create the database
npx prisma migrate dev

# 3. Seed demo users and sample document
npx prisma db seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with one of the demo accounts above.

### Environment Variables

A `.env` file is included with safe defaults for local dev:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="docuflow-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

For production, replace `NEXTAUTH_SECRET` with a strong random string.

### Running Tests

```bash
npm test
```

## Supported Import File Types

| Extension | Supported |
|-----------|-----------|
| `.txt` | Yes |
| `.md` / `.markdown` | Yes â€” headings and bullet lists are parsed |
| `.docx` | Not supported in this version |

Unsupported types are rejected with a clear error message in the UI and API.

## Project Structure

```
src/
  app/
    api/            â† Route handlers (documents CRUD, share, upload, users)
    dashboard/      â† Document list page (owned + shared sections)
    documents/[id]/ â† Tiptap editor page
    login/          â† Auth page with demo account shortcuts
  components/
    ShareModal.tsx  â† Share modal with user picker + collaborator list
    ui/Toaster.tsx  â† Toast notification system
  lib/
    auth.ts         â† NextAuth v5 config (credentials provider)
    prisma.ts       â† Prisma client singleton
    utils.ts        â† formatDistanceToNow, cn helper
  __tests__/
    api.documents.test.ts
prisma/
  schema.prisma     â† User, Document, DocumentShare models
  seed.ts           â† Seeds 2 demo users + 1 sample doc
```

