'use client'

import { useState, useCallback } from 'react'
import { useSnippetStore } from '@/store/snippets'
import { LANGUAGE_LABELS, LANGUAGE_COLORS } from '@/types/snippet'
import { formatDate, countLines } from '@/lib/utils'
import { Copy, Check, Edit2, Trash2, Pin, FileCode2, Clock, Hash, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const CodeView = dynamic(() => import('./CodeView'), { ssr: false })

export default function EditorPanel() {
  const { selectedSnippet, deleteSnippet, togglePin, setIsEditing, setIsSidebarOpen } = useSnippetStore()
  const snippet = selectedSnippet()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!snippet) return
    await navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [snippet])

  function handleDelete() {
    if (!snippet) return
    if (confirm(`Delete "${snippet.title}"?`)) deleteSnippet(snippet.id)
  }

  if (!snippet) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="text-[14px] font-medium text-zinc-700 dark:text-zinc-300">SnippetVault</span>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
          <div className="text-center">
            <FileCode2 size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-[14px]">Select a snippet</p>
            <p className="text-[12px] mt-1 opacity-60">or press ⌘N to create one</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={snippet.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-start gap-3 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors mt-0.5 flex-shrink-0"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              {snippet.pinned && (
                <Pin size={13} className="text-zinc-400 rotate-45 flex-shrink-0" />
              )}
              <h1 className="font-medium text-[15px] md:text-[16px] text-zinc-900 dark:text-zinc-100 truncate">
                {snippet.title}
              </h1>
            </div>
            {snippet.description && (
              <p className="text-[12px] md:text-[13px] text-zinc-500 dark:text-zinc-400">
                {snippet.description}
              </p>
            )}
            {snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[11px] text-zinc-500 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => togglePin(snippet.id)}
              className={`p-2 rounded-lg transition-colors ${
                snippet.pinned
                  ? 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={snippet.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={15} className={snippet.pinned ? 'rotate-45' : ''} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code area */}
        <CodeView code={snippet.code} language={snippet.language} />

        {/* Footer */}
        <div className="px-4 md:px-6 py-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4 text-[12px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: LANGUAGE_COLORS[snippet.language] }}
            />
            {LANGUAGE_LABELS[snippet.language]}
          </span>
          <span className="flex items-center gap-1">
            <Hash size={12} />
            {countLines(snippet.code)} lines
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(snippet.updatedAt)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
