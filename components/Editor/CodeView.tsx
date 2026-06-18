'use client'

import { useEffect, useRef, useState } from 'react'
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
  code: string
  language: Language
}

export default function CodeView({ code, language }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    if (viewRef.current) viewRef.current.destroy()

    const extensions = [
      basicSetup,
      getLangExtension(language),
      EditorView.editable.of(false),
      EditorView.theme({
        '&': {
          fontSize: '13px',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          backgroundColor: 'transparent',
          height: '100%',
        },
        '.cm-scroller': { overflow: 'auto', height: '100%' },
        '.cm-content': { padding: '16px' },
        '.cm-gutters': { backgroundColor: 'transparent', border: 'none', paddingRight: '8px' },
        '.cm-lineNumbers .cm-gutterElement': { fontSize: '12px', minWidth: '28px' },
      }),
    ]

    if (isDark) extensions.push(oneDark)

    const state = EditorState.create({ doc: code, extensions })
    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view

    return () => { view.destroy(); viewRef.current = null }
  }, [code, language, isDark])

  return (
    <div
      ref={editorRef}
      className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900"
    />
  )
}
