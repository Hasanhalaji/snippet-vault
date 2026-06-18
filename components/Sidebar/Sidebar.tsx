'use client'

import { useSnippetStore } from '@/store/snippets'
import { LANGUAGE_COLORS } from '@/types/snippet'
import { formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Download, Upload, Pin, Code2, X } from 'lucide-react'
import { useRef } from 'react'
import { exportToJSON, importFromJSON } from '@/lib/storage'

function isTauri() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const {
    searchQuery, setSearch,
    activeTag, setActiveTag,
    selectedId, selectSnippet,
    setIsAddingNew,
    filteredSnippets, allTags,
    snippets, importSnippets,
  } = useSnippetStore()

  const fileRef = useRef<HTMLInputElement>(null)
  const filtered = filteredSnippets()
  const tags = allTags()

  async function handleExport() {
    await exportToJSON(snippets)
  }

  async function handleImport(e?: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (isTauri()) {
        // Native file dialog — no file input needed
        const data = await importFromJSON()
        await importSnippets(data)
      } else if (e?.target.files?.[0]) {
        const data = await importFromJSON(e.target.files[0])
        await importSnippets(data)
        e.target.value = ''
      }
    } catch {
      alert('Invalid file format')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-zinc-500" />
            <span className="font-medium text-[15px] text-zinc-900 dark:text-zinc-100">SnippetVault</span>
          </div>
          <div className="flex gap-1 items-center">
            <button
              onClick={handleExport}
              className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Export JSON"
            >
              <Upload size={15} />
            </button>

            {isTauri() ? (
              // Tauri: native dialog, no file input
              <button
                onClick={() => handleImport()}
                className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                title="Import JSON"
              >
                <Download size={15} />
              </button>
            ) : (
              // Browser: file input
              <>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title="Import JSON"
                >
                  <Upload size={15} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="ml-1 p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            id="snippet-search"
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-14 py-2 text-[13px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg placeholder-zinc-400 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                !activeTag
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            {tags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                  activeTag === tag
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Snippet list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <AnimatePresence>
          {filtered.map((snippet) => (
            <motion.button
              key={snippet.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => { selectSnippet(snippet.id); onClose?.() }}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                selectedId === snippet.id
                  ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate flex-1">
                  {snippet.title}
                </span>
                {snippet.pinned && (
                  <Pin size={11} className="text-zinc-400 flex-shrink-0 mt-0.5 rotate-45" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: LANGUAGE_COLORS[snippet.language] }}
                />
                <span className="text-[11px] text-zinc-400 truncate">
                  {formatDate(snippet.updatedAt)}
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-zinc-400">
            No snippets found
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <button
          onClick={() => { setIsAddingNew(true); onClose?.() }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          <Plus size={15} />
          New snippet
          <kbd className="text-[10px] font-mono opacity-60 bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded">⌘N</kbd>
        </button>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex flex-col h-full w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
      <SidebarContent />
    </aside>
  )
}

export function MobileBottomSheet() {
  const { isSidebarOpen, setIsSidebarOpen } = useSnippetStore()

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
            style={{ height: '78vh' }}
          >
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <div className="h-full pb-6">
              <SidebarContent onClose={() => setIsSidebarOpen(false)} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DesktopSidebar
