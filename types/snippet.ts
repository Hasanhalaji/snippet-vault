export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'bash'
  | 'css'
  | 'html'
  | 'json'
  | 'markdown'
  | 'other'

export interface Snippet {
  id: string
  title: string
  code: string
  language: Language
  tags: string[]
  description?: string
  createdAt: number
  updatedAt: number
  pinned: boolean
}

export interface SnippetFormData {
  title: string
  code: string
  language: Language
  tags: string[]
  description?: string
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  bash: 'Bash',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  markdown: 'Markdown',
  other: 'Other',
}

export const LANGUAGE_COLORS: Record<Language, string> = {
  typescript: '#3178c6',
  javascript: '#f7df1e',
  python: '#3572A5',
  bash: '#89e051',
  css: '#563d7c',
  html: '#e34c26',
  json: '#292929',
  markdown: '#083fa1',
  other: '#888',
}
