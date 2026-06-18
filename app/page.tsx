'use client'

import { useEffect } from 'react'
import { useSnippetStore } from '@/store/snippets'
import { DesktopSidebar, MobileBottomSheet } from '@/components/Sidebar/Sidebar'
import EditorPanel from '@/components/Editor/EditorPanel'
import SnippetForm from '@/components/Editor/SnippetForm'
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts'
import { Code2 } from 'lucide-react'

export default function Home() {
  const { init, isAddingNew, isEditing, isLoading } = useSnippetStore()
  useKeyboardShortcuts()

  useEffect(() => {
    init()
  }, [init])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Code2 size={32} className="animate-pulse" />
          <span className="text-[13px]">Loading snippets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      <DesktopSidebar />
      <MobileBottomSheet />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {isAddingNew ? (
          <SnippetForm mode="add" />
        ) : isEditing ? (
          <SnippetForm mode="edit" />
        ) : (
          <EditorPanel />
        )}
      </main>
    </div>
  )
}
