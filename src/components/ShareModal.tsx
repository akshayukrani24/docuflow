'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toaster'

type ShareEntry = {
  id: string
  userId: string
  permission: string
  user: { id: string; name: string; email: string }
}

type User = { id: string; name: string; email: string }

interface Props {
  docId: string
  shares: ShareEntry[]
  onClose: () => void
  onSharesChange: (shares: ShareEntry[]) => void
}

export function ShareModal({ docId, shares, onClose, onSharesChange }: Props) {
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [selectedEmail, setSelectedEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        const sharedIds = new Set(shares.map((s) => s.userId))
        setUsers(data.filter((u: User) => !sharedIds.has(u.id)))
      })
      .catch(() => toast.error('Failed to load users'))
  }, [shares])

  async function handleShare() {
    if (!selectedEmail) return
    setSharing(true)
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail, permission: 'edit' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSharesChange([...shares, data])
      setSelectedEmail('')
      toast.success(`Shared with ${data.user.name}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to share')
    } finally {
      setSharing(false)
    }
  }

  async function handleRemove(userId: string, userName: string) {
    setRemoving(userId)
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error('Failed to remove')
      onSharesChange(shares.filter((s) => s.userId !== userId))
      toast.success(`Removed ${userName}`)
    } catch {
      toast.error('Failed to remove access')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Share document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share with user */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add people</label>
          <div className="flex gap-2">
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleShare}
              disabled={!selectedEmail || sharing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {sharing ? '…' : 'Share'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Shared users can view and edit this document.</p>
        </div>

        {/* Current collaborators */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {shares.length > 0 ? `Shared with ${shares.length} person${shares.length > 1 ? 's' : ''}` : 'No one else has access'}
          </h3>
          {shares.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Only you can access this document.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shares.map((share) => (
                <li key={share.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm flex items-center justify-center">
                      {share.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{share.user.name}</p>
                      <p className="text-xs text-gray-500">{share.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                      {share.permission}
                    </span>
                    <button
                      onClick={() => handleRemove(share.userId, share.user.name)}
                      disabled={removing === share.userId}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
