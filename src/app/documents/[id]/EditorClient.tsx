'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { ShareModal } from '@/components/ShareModal'
import { useToast } from '@/components/ui/Toaster'

type ShareEntry = {
  id: string
  userId: string
  permission: string
  user: { id: string; name: string; email: string }
}

type DocData = {
  id: string
  title: string
  content: string
  contentType: string
  owner: { id: string; name: string; email: string }
  shares: ShareEntry[]
}

interface Props {
  doc: DocData
  currentUser: { id: string; name: string; email: string }
  isOwner: boolean
}

type SaveState = 'saved' | 'saving' | 'unsaved'

export function EditorClient({ doc, isOwner }: Props) {
  const router = useRouter()
  const toast = useToast()

  const [title, setTitle] = useState(doc.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shares, setShares] = useState<ShareEntry[]>(doc.shares)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: (() => {
      try {
        return doc.content ? JSON.parse(doc.content) : ''
      } catch {
        return doc.content || ''
      }
    })(),
    editorProps: {
      attributes: { class: 'focus:outline-none' },
    },
    onUpdate: () => {
      setSaveState('unsaved')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => autoSave(), 1500)
    },
  })

  const autoSave = useCallback(async () => {
    if (!editor) return
    setSaveState('saving')
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(editor.getJSON()),
          contentType: 'json',
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveState('saved')
    } catch {
      setSaveState('unsaved')
    }
  }, [editor, doc.id])

  async function saveTitle(newTitle: string) {
    const trimmed = newTitle.trim()
    if (!trimmed) {
      setTitle(doc.title)
      toast.error('Title cannot be empty')
      return
    }
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setTitle(trimmed)
      toast.success('Title updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update title')
      setTitle(doc.title)
    }
  }

  function startEditTitle() {
    setEditingTitle(true)
    setTimeout(() => titleRef.current?.select(), 10)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setTitle(doc.title)
      setEditingTitle(false)
    }
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  if (!editor) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-20 select-none">
        <button
          onClick={() => { router.push('/dashboard'); router.refresh() }}
          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
          aria-label="Back to dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => { setEditingTitle(false); saveTitle(e.target.value) }}
              onKeyDown={handleTitleKeyDown}
              className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-indigo-400 outline-none w-full max-w-sm"
            />
          ) : (
            <button
              onClick={startEditTitle}
              className="text-sm font-semibold text-gray-900 hover:text-indigo-700 truncate max-w-xs transition-colors text-left cursor-pointer select-none"
              title="Click to rename"
            >
              {title}
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Save indicator */}
          <span className={`text-xs font-medium flex items-center gap-1.5 select-none cursor-default ${
            saveState === 'saved' ? 'text-emerald-600' :
            saveState === 'saving' ? 'text-indigo-500' :
            'text-amber-500'
          }`}>
            {saveState === 'saving' && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saveState === 'saved' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Unsaved'}
          </span>

          {/* Owner badge */}
          <span className={`text-xs font-medium px-2 py-1 rounded-full select-none cursor-default ${
            isOwner ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {isOwner ? 'Owner' : `Shared by ${doc.owner.name}`}
          </span>

          {/* Share button (owner only) */}
          {isOwner && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
              {shares.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {shares.length}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Formatting toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center gap-0.5 sticky top-[53px] z-10 select-none">
        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            H1
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5H6a2 2 0 010-4h2m4 0h2a2 2 0 010 4h-2m-4 4h8" />
            </svg>
          </ToolbarBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </ToolbarBtn>
        </ToolbarGroup>
      </div>

      {/* Editor canvas */}
      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl bg-white shadow-sm border border-gray-200 rounded-xl min-h-[700px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Share modal */}
      {showShareModal && (
        <ShareModal
          docId={doc.id}
          shares={shares}
          onClose={() => setShowShareModal(false)}
          onSharesChange={setShares}
        />
      )}
    </div>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1.5" />
}

function ToolbarBtn({
  children,
  active,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick?.() }}
      disabled={disabled}
      title={title}
      className={`px-2 py-1.5 rounded text-sm transition-colors min-w-[32px] flex items-center justify-center
        ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}
