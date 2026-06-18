'use client'

import { useState, useEffect } from 'react'
import { useSnippetStore } from '@/store/snippets'
import { Language, LANGUAGE_LABELS, SnippetFormData } from '@/types/snippet'
import { X, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false })

interface Props {
  mode: 'add' | 'edit'
}

const LANGS: Language[] = ['typescript', 'javascript', 'python', 'bash', 'css', 'html', 'json', 'markdown', 'other']

export default function SnippetForm({ mode }: Props) {
  const { addSnippet, updateSnippet, selectedSnippet, setIsAddingNew, setIsEditing } = useSnippetStore()
  const existing = selectedSnippet()

  const [form, setForm] = useState<SnippetFormData>({
    title: '',
    code: '',
    language: 'typescript',
    tags: [],
    description: '',
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (mode === 'edit' && existing) {
      setForm({
        title: existing.title,
        code: existing.code,
        language: existing.language,
        tags: existing.tags,
        description: existing.description ?? '',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, existing?.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.code.trim()) return
    if (mode === 'add') {
      addSnippet(form)
    } else if (existing) {
      updateSnippet(existing.id, form)
    }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleCancel() {
    if (mode === 'add') setIsAddingNew(false)
    else setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <h2 className="font-medium text-[15px] text-zinc-900 dark:text-zinc-100">
          {mode === 'add' ? 'New snippet' : 'Edit snippet'}
        </h2>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          aria-label="Cancel"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Title + Language row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. debounce hook"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder-zinc-400 transition-colors"
              />
            </div>
            <div className="w-36">
              <label className="block text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as Language }))}
                className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5">Description <span className="text-zinc-400">(optional)</span></label>
            <input
              type="text"
              placeholder="Short description..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder-zinc-400 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="flex-1 px-3 py-2 text-[13px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder-zinc-400 transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[11px] text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Code — CodeMirror editable */}
          <div>
            <label className="block text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5">Code *</label>
            <CodeEditor
              value={form.code}
              language={form.language}
              onChange={(code) => setForm((f) => ({ ...f, code }))}
              minHeight={300}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex-shrink-0">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13px] font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            {mode === 'add' ? 'Save snippet' : 'Update snippet'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[13px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}
