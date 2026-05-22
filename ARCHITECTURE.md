# Architecture Note

## Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 16 (App Router) | Single codebase for frontend + API; Vercel deployment is trivial |
| Editor | Tiptap 3 | Most battle-tested structured rich-text library for React; JSON serialization preserves formatting perfectly |
| Database | SQLite via Prisma 6 | Zero infrastructure cost for reviewers; trivially swappable to Postgres in production |
| Auth | NextAuth v5 (credentials) | Seeded users without real email/signup flow; JWT sessions keep it stateless |
| Styling | Tailwind CSS v4 | Utility classes; fast to iterate; no runtime overhead |

## Key Decisions

### Tiptap over Lexical or raw contenteditable
Tiptap's `getJSON()` / `setContent()` API makes it trivial to round-trip structured editor state through the database. The JSON schema is stable and self-describing. Lexical would have worked too, but Tiptap's extension model is simpler for the scope needed here.

### SQLite over Postgres / Supabase
The assignment explicitly says "do not require reviewers to pay for a dependency." SQLite embedded in the process satisfies all persistence requirements with zero setup. The Prisma abstraction means switching to Postgres is a one-line change in `.env` and a migration.

### NextAuth v5 credentials over full OAuth
OAuth flows require real callback URLs and registered apps. Credentials with bcrypt-hashed passwords and seeded users lets reviewers test the sharing workflow instantly without any configuration.

### Autosave with 1.5s debounce
Immediate save on every keystroke would create too many API calls. A 1.5s debounce after the last keystroke is the same pattern used by Notion and Linear. The save state indicator (Saved / Saving… / Unsaved) gives the user clear feedback.

### Server-side rendering for dashboard and editor initial load
The dashboard and editor pages are server components that fetch data before rendering. This means no loading spinners on initial page load, and no client-side data leaks.

## What I Intentionally Left Out

| Feature | Why cut |
|---------|---------|
| Real-time collaboration cursors | Would require WebSockets or a CRDT library (Yjs/HocusPocus) — adds 2–3 hours of complexity for demo value |
| Version history | Useful but not core to the 3-hour scope |
| Role-based permissions (view vs edit) | The share modal shows the "edit" permission already; fine-grained roles would add complexity to every access check |
| .docx import | `mammoth` was installed but the conversion quality varies; shipping .txt/.md with clean output is better than .docx with degraded formatting |
| Folder hierarchy | Out of scope; doc list is flat |

## Data Flow

```
Browser → Next.js Route Handler → Prisma → SQLite
                    ↑
                NextAuth JWT (validated in every route)
```

All API routes validate the JWT session first, then check document-level access (owner or shared).

## Schema

```
User (id, name, email, password)
  └── Document (id, title, content [Tiptap JSON], contentType, ownerId, timestamps)
        └── DocumentShare (documentId, userId, permission)
```
