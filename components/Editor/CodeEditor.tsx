'use client'

import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { Language } from '@/types/snippet'

function getLangExtension(lang: Language) {
  switch (lang) {
    case 'typescript': return javascript({ typescript: true })
    case 'javascript': return javascript()
    case 'python': return python()
    case 'css': return css()
    case 'html': return html()
    case 'json': return json()
    case 'markdown': return markdown()
    default: return []
  }
}

interface Props {
  value: string
  language: Language
  onChange: (code: string) => void
  minHeight?: number
}

export default function CodeEditor({ value, language, onChange, minHeight = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Detect dark mode once
  const isDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false

  useEffect(() => {
    if (!containerRef.current) return
    if (viewRef.current) viewRef.current.destroy()

    const extensions = [
      basicSetup,
      getLangExtension(language),
      EditorView.theme({
        '&': {
          fontSize: '13px',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          backgroundColor: 'transparent',
          minHeight: `${minHeight}px`,
        },
        '.cm-content': { padding: '12px 16px', minHeight: `${minHeight}px` },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          border: 'none',
          paddingRight: '4px',
        },
        '.cm-lineNumbers .cm-gutterElement': {
          fontSize: '12px',
          minWidth: '28px',
          color: isDark ? '#52525b' : '#a1a1aa',
        },
        '.cm-focused': { outline: 'none' },
        '.cm-editor.cm-focused': { outline: 'none' },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString())
        }
      }),
    ]

    if (isDark) extensions.push(oneDark)

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Only re-mount when language or dark mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isDark, minHeight])

  // Sync external value changes (e.g. switching edit mode)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors"
    />
  )
}
