'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useToast } from '@/components/ui/Toaster'
import { formatDistanceToNow } from '@/lib/utils'

type Doc = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  ownerId: string
  owner?: { name: string }
}

interface Props {
  user: { id: string; name: string; email: string }
  initialOwned: Doc[]
  initialShared: Doc[]
}

export function DashboardClient({ user, initialOwned, initialShared }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [owned, setOwned] = useState(initialOwned)
  const [shared, setShared] = useState(initialShared)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Refresh document list whenever the user comes back to this tab/page
  useEffect(() => {
    function handleFocus() {
      fetch('/api/documents')
        .then((r) => r.json())
        .then((data) => {
          if (data.owned) setOwned(data.owned)
          if (data.shared) setShared(data.shared)
        })
        .catch(() => {})
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function createDocument() {
    setCreating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' }),
      })
      const doc = await res.json()
      if (!res.ok) throw new Error(doc.error)
      router.push(`/documents/${doc.id}`)
    } catch {
      toast.error('Failed to create document')
      setCreating(false)
    }
  }

  async function deleteDocument(id: string) {
    const confirmed = window.confirm('Delete this document? This cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOwned((prev) => prev.filter((d) => d.id !== id))
      toast.success('Document deleted')
    } else {
      toast.error('Failed to delete document')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type before sending — show clear error immediately
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const allowed = ['.txt', '.md', '.markdown']
    if (!allowed.includes(ext)) {
      toast.error(`"${file.name}" is not supported. Please upload a .txt or .md file.`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const doc = await res.json()
      if (!res.ok) throw new Error(doc.error)
      toast.success(`"${doc.title}" imported successfully`)
      router.push(`/documents/${doc.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const totalDocs = owned.length + shared.length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">DocuFlow</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Avatar + name */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{user.email}</p>
            </div>
          </div>
          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 select-none">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            {totalDocs > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{totalDocs} document{totalDocs !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <input
                ref={fileRef}
                type="file"
                accept="*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                Import .txt / .md
              </button>
            </label>
            <button
              onClick={createDocument}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {creating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              New Document
            </button>
          </div>
        </div>

        {/* Owned documents */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Owned by you</h2>
          {owned.length === 0 ? (
            <button
              onClick={createDocument}
              disabled={creating}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all group cursor-pointer disabled:opacity-60"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mx-auto mb-2.5 transition-colors">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-700 text-sm font-semibold group-hover:text-indigo-700 transition-colors">
                {creating ? 'Creating…' : 'Create your first document'}
              </p>
              <p className="text-gray-400 text-xs mt-1">Click here or use the buttons above to get started</p>
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {owned.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  badge="owned"
                  onOpen={() => router.push(`/documents/${doc.id}`)}
                  onDelete={() => deleteDocument(doc.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Shared documents */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Shared with you</h2>
          {shared.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm select-none">No documents have been shared with you yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shared.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  badge="shared"
                  onOpen={() => router.push(`/documents/${doc.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function DocCard({
  doc,
  badge,
  onOpen,
  onDelete,
}: {
  doc: Doc
  badge: 'owned' | 'shared'
  onOpen: () => void
  onDelete?: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            badge === 'owned'
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {badge === 'owned' ? 'Mine' : `By ${doc.owner?.name ?? 'Unknown'}`}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
        {doc.title}
      </h3>
      <p className="text-xs text-gray-400 mt-1">
        Updated {formatDistanceToNow(new Date(doc.updatedAt))}
      </p>

      {onDelete && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
