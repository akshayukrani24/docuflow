import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">DocuFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 select-none">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          Collaborative document editing
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight max-w-2xl select-none">
          Write, edit, and share<br />documents together
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl select-none">
          DocuFlow is a lightweight rich-text editor with real sharing, autosave, and file import — built for teams that want simplicity without compromise.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/signup" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            Create free account
          </Link>
          <Link href="/login" className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 transition-colors">
            Sign in to your account
          </Link>
        </div>

        {/* Demo hint */}
        <p className="text-xs text-gray-400 mt-4 select-none">
          Try demo: <span className="font-medium text-gray-500">akshay@docuflow.app</span> · password123
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-20 max-w-3xl w-full text-left">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              ),
              title: 'Rich-text editor',
              desc: 'Bold, italic, headings, lists, blockquote — full formatting toolbar out of the box.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              ),
              title: 'Easy sharing',
              desc: 'Share any document with another user. Owned and shared docs stay clearly separate.',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              ),
              title: 'File import',
              desc: 'Upload .txt or .md files and they become editable documents instantly.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {icon}
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm select-none">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed select-none">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200 select-none">
        © 2026 DocuFlow · Built for Ajaia LLC assignment
      </footer>
    </div>
  )
}
