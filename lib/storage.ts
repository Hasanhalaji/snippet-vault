import { Snippet } from '@/types/snippet'

// ─── Tauri detection ────────────────────────────────────────────────────────
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// ─── Tauri invoke helper ────────────────────────────────────────────────────
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  // Dynamically import so Next.js static build doesn't break
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(cmd, args)
}

// ─── Load ───────────────────────────────────────────────────────────────────
export async function loadSnippets(): Promise<Snippet[]> {
  try {
    if (isTauri()) {
      const raw = await invoke<string>('load_snippets')
      return JSON.parse(raw)
    }
    // Browser fallback
    const raw = localStorage.getItem('snippetvault_snippets')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ─── Save ───────────────────────────────────────────────────────────────────
export async function saveSnippets(snippets: Snippet[]): Promise<void> {
  const data = JSON.stringify(snippets, null, 2)
  try {
    if (isTauri()) {
      await invoke('save_snippets', { data })
    } else {
      localStorage.setItem('snippetvault_snippets', data)
    }
  } catch (e) {
    console.error('SnippetVault: failed to save', e)
  }
}

// ─── Get path (Tauri only) ──────────────────────────────────────────────────
export async function getSnippetsFilePath(): Promise<string | null> {
  if (!isTauri()) return null
  try {
    return await invoke<string>('get_snippets_path')
  } catch {
    return null
  }
}

// ─── Export JSON ────────────────────────────────────────────────────────────
export async function exportToJSON(snippets: Snippet[]): Promise<void> {
  const data = JSON.stringify(snippets, null, 2)

  if (isTauri()) {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog')
      const path = await save({
        defaultPath: `snippetvault-backup-${Date.now()}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (path) {
        await invoke('export_snippets', { path, data })
      }
    } catch (e) {
      console.error('Export failed', e)
    }
  } else {
    // Browser download
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snippetvault-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// ─── Import JSON ────────────────────────────────────────────────────────────
export async function importFromJSON(file?: File): Promise<Snippet[]> {
  if (isTauri()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const path = await open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (!path) return []
      const raw = await invoke<string>('import_snippets', { path })
      const data = JSON.parse(raw)
      if (!Array.isArray(data)) throw new Error('Invalid format')
      return data as Snippet[]
    } catch {
      throw new Error('Invalid file')
    }
  }

  // Browser fallback
  if (!file) throw new Error('No file provided')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!Array.isArray(data)) throw new Error('Invalid format')
        resolve(data as Snippet[])
      } catch {
        reject(new Error('Invalid file format'))
      }
    }
    reader.readAsText(file)
  })
}
