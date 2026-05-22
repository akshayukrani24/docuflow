# Submission

**Candidate:** Akshay Kumar  
**Email:** akshaymaheshwari306@gmail.com  
**Assignment:** Ajaia LLC — AI-Native Full Stack Developer

---

## What Is Included

| File / Folder | Description |
|--------------|-------------|
| `src/` | Full application source code |
| `prisma/` | Database schema and seed |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | Architecture decisions and tradeoffs |
| `AI_WORKFLOW.md` | AI tool usage and verification approach |
| `SUBMISSION.md` | This file |
| `VIDEO.txt` | Walkthrough video link |

## Live Deployment

> URL: *(to be filled after Vercel deploy)*

## Test Credentials

| User | Email | Password |
|------|-------|----------|
| Akshay Kumar (owner) | akshay@docuflow.app | password123 |
| Alex Reviewer (shared user) | reviewer@docuflow.app | password123 |

## Sharing Flow Demo

1. Sign in as **Akshay Kumar**
2. Create a new document or open "Welcome to DocuFlow"
3. Click **Share** → select Alex Reviewer → click Share
4. Sign out and sign in as **Alex Reviewer**
5. The shared document appears in "Shared with you" on the dashboard
6. Alex can open and edit the document

## What Is Working

- [x] Document creation, rename, delete
- [x] Rich-text editor with full toolbar (bold, italic, underline, strike, H1/H2/H3, bullet list, numbered list, blockquote, undo/redo)
- [x] Autosave with Saved/Saving/Unsaved indicator
- [x] Formatting preserved on refresh and reopen
- [x] File import (.txt and .md → new document with parsed structure)
- [x] Sharing with owned/shared distinction in dashboard
- [x] Share modal with user picker and collaborator list
- [x] Revoking access
- [x] Persistence (SQLite)
- [x] Authentication (seeded users, NextAuth v5)
- [x] Tests (utility functions + auth guards)
- [x] Error handling (empty title validation, unsupported file types, share conflicts)
- [x] Toast notifications

## What Is Incomplete / Would Build Next

- [ ] `.docx` import — mammoth is installed but was cut due to formatting reliability; would add in another 1–2 hours
- [ ] Real-time collaboration cursors — would use Yjs + HocusPocus; requires ~3 extra hours
- [ ] Export to Markdown — straightforward with Tiptap's Markdown extension; ~30 minutes
- [ ] Version history — would store content snapshots; ~2 hours
- [ ] Vercel deployment with persistent DB (PlanetScale or Turso) — ~30 minutes once connection string is configured

## Video

See `VIDEO.txt` for the walkthrough link.
