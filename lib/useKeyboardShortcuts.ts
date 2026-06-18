'use client'

import { useEffect, useRef } from 'react'
import { useSnippetStore } from '@/store/snippets'

export function useKeyboardShortcuts() {
  const { setIsAddingNew, setSearch, isAddingNew, isEditing } = useSnippetStore()
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable

      // Ctrl+N — new snippet (never when already in a form)
      if (ctrl && e.key === 'n' && !isAddingNew && !isEditing) {
        e.preventDefault()
        setIsAddingNew(true)
        return
      }

      // Ctrl+K — focus search (works from anywhere, clears if already focused)
      if (ctrl && e.key === 'k') {
        e.preventDefault()
        const el = document.getElementById('snippet-search') as HTMLInputElement | null
        if (el) {
          el.focus()
          el.select()
        }
        return
      }

      // Escape — clear search or close form
      if (e.key === 'Escape') {
        if (isInput) return
        setSearch('')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isAddingNew, isEditing, setIsAddingNew, setSearch])

  return { searchRef }
}
