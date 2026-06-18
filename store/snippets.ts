import { create } from 'zustand'
import { Snippet, SnippetFormData, Language } from '@/types/snippet'
import { loadSnippets, saveSnippets } from '@/lib/storage'

function generateId() {
  return `sv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

interface SnippetStore {
  snippets: Snippet[]
  selectedId: string | null
  searchQuery: string
  activeTag: string | null
  activeLanguage: Language | null
  isAddingNew: boolean
  isEditing: boolean
  isSidebarOpen: boolean
  isLoading: boolean

  init: () => Promise<void>
  selectSnippet: (id: string | null) => void
  addSnippet: (data: SnippetFormData) => Promise<void>
  updateSnippet: (id: string, data: SnippetFormData) => Promise<void>
  deleteSnippet: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  setSearch: (q: string) => void
  setActiveTag: (tag: string | null) => void
  setActiveLanguage: (lang: Language | null) => void
  setIsAddingNew: (v: boolean) => void
  setIsEditing: (v: boolean) => void
  setIsSidebarOpen: (v: boolean) => void
  importSnippets: (snippets: Snippet[]) => Promise<void>

  filteredSnippets: () => Snippet[]
  allTags: () => string[]
  selectedSnippet: () => Snippet | undefined
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: [],
  selectedId: null,
  searchQuery: '',
  activeTag: null,
  activeLanguage: null,
  isAddingNew: false,
  isEditing: false,
  isSidebarOpen: false,
  isLoading: true,

  init: async () => {
    set({ isLoading: true })
    const snippets = await loadSnippets()
    const withSamples = snippets.length > 0 ? snippets : getSampleSnippets()
    // Save samples on first run
    if (snippets.length === 0) await saveSnippets(withSamples)
    set({ snippets: withSamples, selectedId: withSamples[0]?.id ?? null, isLoading: false })
  },

  selectSnippet: (id) =>
    set({ selectedId: id, isEditing: false, isAddingNew: false, isSidebarOpen: false }),

  addSnippet: async (data) => {
    const now = Date.now()
    const snippet: Snippet = { id: generateId(), ...data, createdAt: now, updatedAt: now, pinned: false }
    const snippets = [snippet, ...get().snippets]
    await saveSnippets(snippets)
    set({ snippets, selectedId: snippet.id, isAddingNew: false, isSidebarOpen: false })
  },

  updateSnippet: async (id, data) => {
    const snippets = get().snippets.map((s) =>
      s.id === id ? { ...s, ...data, updatedAt: Date.now() } : s
    )
    await saveSnippets(snippets)
    set({ snippets, isEditing: false })
  },

  deleteSnippet: async (id) => {
    const snippets = get().snippets.filter((s) => s.id !== id)
    await saveSnippets(snippets)
    set({ snippets, selectedId: snippets[0]?.id ?? null, isEditing: false })
  },

  togglePin: async (id) => {
    const snippets = get().snippets.map((s) =>
      s.id === id ? { ...s, pinned: !s.pinned, updatedAt: Date.now() } : s
    )
    await saveSnippets(snippets)
    set({ snippets })
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setActiveTag: (activeTag) => set({ activeTag }),
  setActiveLanguage: (activeLanguage) => set({ activeLanguage }),
  setIsAddingNew: (isAddingNew) => set({ isAddingNew, isEditing: false }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  importSnippets: async (incoming) => {
    const merged = [...incoming, ...get().snippets].filter(
      (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
    )
    await saveSnippets(merged)
    set({ snippets: merged })
  },

  filteredSnippets: () => {
    const { snippets, searchQuery, activeTag, activeLanguage } = get()
    const q = searchQuery.toLowerCase()
    return snippets
      .filter((s) => {
        const matchQ =
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.description?.toLowerCase().includes(q)
        const matchTag = !activeTag || s.tags.includes(activeTag)
        const matchLang = !activeLanguage || s.language === activeLanguage
        return matchQ && matchTag && matchLang
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.updatedAt - a.updatedAt
      })
  },

  allTags: () => {
    const tags = new Set<string>()
    get().snippets.forEach((s) => s.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  },

  selectedSnippet: () => get().snippets.find((s) => s.id === get().selectedId),
}))

function getSampleSnippets(): Snippet[] {
  const now = Date.now()
  return [
    {
      id: 'sample_1',
      title: 'useLocalStorage hook',
      code: `import { useState } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
    }
  }

  return [storedValue, setValue] as const
}

export default useLocalStorage`,
      language: 'typescript',
      tags: ['react', 'hooks', 'storage'],
      description: 'Sync state with localStorage',
      createdAt: now - 86400000,
      updatedAt: now - 86400000,
      pinned: true,
    },
    {
      id: 'sample_2',
      title: 'Debounce function',
      code: `function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default debounce`,
      language: 'typescript',
      tags: ['utils', 'performance'],
      description: 'Limit function call frequency',
      createdAt: now - 172800000,
      updatedAt: now - 172800000,
      pinned: false,
    },
    {
      id: 'sample_3',
      title: 'Docker cleanup script',
      code: `#!/bin/bash
echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
docker image prune -af
docker volume prune -f
docker network prune -f
echo "Done!"
docker system df`,
      language: 'bash',
      tags: ['docker', 'devops'],
      description: 'Remove all unused Docker resources',
      createdAt: now - 259200000,
      updatedAt: now - 259200000,
      pinned: false,
    },
    {
      id: 'sample_4',
      title: 'CSS glassmorphism card',
      code: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}`,
      language: 'css',
      tags: ['css', 'design'],
      description: 'Modern glass morphism effect',
      createdAt: now - 345600000,
      updatedAt: now - 345600000,
      pinned: false,
    },
  ]
}
