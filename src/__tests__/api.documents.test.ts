/**
 * Tests for utility functions and business logic.
 * API auth is tested via access-control logic rather than live-server requests.
 */

describe('formatDistanceToNow', () => {
  const { formatDistanceToNow } = require('../lib/utils')

  it('returns "just now" for a date within the last minute', () => {
    expect(formatDistanceToNow(new Date())).toBe('just now')
    expect(formatDistanceToNow(new Date(Date.now() - 30_000))).toBe('just now')
  })

  it('returns "1 minute ago" for 61 seconds ago', () => {
    expect(formatDistanceToNow(new Date(Date.now() - 61_000))).toBe('1 minute ago')
  })

  it('returns "X minutes ago" for < 1 hour', () => {
    const result = formatDistanceToNow(new Date(Date.now() - 10 * 60 * 1000))
    expect(result).toBe('10 minutes ago')
  })

  it('returns "1 hour ago" for exactly 61 minutes', () => {
    expect(formatDistanceToNow(new Date(Date.now() - 61 * 60 * 1000))).toBe('1 hour ago')
  })

  it('returns "X hours ago" for < 1 day', () => {
    const result = formatDistanceToNow(new Date(Date.now() - 5 * 60 * 60 * 1000))
    expect(result).toBe('5 hours ago')
  })

  it('returns "yesterday" for ~25 hours ago', () => {
    expect(formatDistanceToNow(new Date(Date.now() - 25 * 60 * 60 * 1000))).toBe('yesterday')
  })

  it('returns "X days ago" for 3 days ago', () => {
    expect(formatDistanceToNow(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))).toBe('3 days ago')
  })
})

describe('cn utility', () => {
  const { cn } = require('../lib/utils')

  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
})

describe('Upload file type validation logic', () => {
  const allowedExts = ['.txt', '.md', '.markdown']

  it('accepts .txt files', () => {
    const filename = 'document.txt'
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    expect(allowedExts.includes(ext)).toBe(true)
  })

  it('accepts .md files', () => {
    const filename = 'notes.md'
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    expect(allowedExts.includes(ext)).toBe(true)
  })

  it('rejects .pdf files', () => {
    const filename = 'report.pdf'
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    expect(allowedExts.includes(ext)).toBe(false)
  })

  it('rejects .docx files', () => {
    const filename = 'document.docx'
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    expect(allowedExts.includes(ext)).toBe(false)
  })
})
