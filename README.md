<div align="center">

# ⚡ SnippetVault

**Save, organize, and instantly search your personal code snippets.**
Runs as a native Windows desktop app or a web app — your choice. Data stays local, stored as plain JSON.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Tauri](https://img.shields.io/badge/Tauri-2-24c8db?style=flat-square&logo=tauri)](https://tauri.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Why SnippetVault

Every developer has a personal stash of code they reuse — a debounce function, a Docker cleanup script, a regex they always forget. SnippetVault gives that stash a home: instant search, syntax highlighting, tags, and zero setup. No account, no server, no internet required.

## Features

- **Instant search** — filter by title, code content, or tags as you type
- **Syntax highlighting** — powered by CodeMirror 6, supports 8+ languages
- **Tagging & filtering** — organize snippets your way
- **One-click copy** — no text selection needed
- **Pin important snippets** — keep frequently used code at the top
- **Export / Import** — back up or transfer your snippets as JSON
- **Fully offline** — works with no internet connection
- **Dark mode** — follows your system theme
- **Keyboard shortcuts** — `Ctrl+K` to search, `Ctrl+N` for a new snippet
- **Responsive** — desktop sidebar, mobile bottom sheet

## Where is my data stored?

| Mode | Storage location |
|---|---|
| **Native app** (Tauri) | `C:\Users\<You>\AppData\Local\SnippetVault\snippets.json` |
| **Web app** (browser) | Browser's `localStorage` |

It's a plain, human-readable JSON file — back it up, sync it with Dropbox, or edit it directly.

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| State | Zustand |
| Code editor | CodeMirror 6 |
| Icons | Lucide React |
| Native shell | Tauri 2 (Rust) |

## Getting started

### Run as a web app (fastest, no extra tools)

```bash
git clone https://github.com/<your-username>/snippetvault
cd snippetvault
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data is saved to your browser's `localStorage`.

### Build as a native Windows app

<details>
<summary>Click to expand build instructions</summary>

**Prerequisites**

1. **Rust** — install via [rustup.rs](https://rustup.rs) or:
   ```powershell
   winget install Rustlang.Rustup
   ```
   Restart your terminal, then verify: `rustc --version`

2. **Visual Studio C++ Build Tools** — [download here](https://visualstudio.microsoft.com/visual-cpp-build-tools/), select **Desktop development with C++** during install.

3. **WebView2** — usually preinstalled on Windows 10/11. If missing, [get it here](https://developer.microsoft.com/microsoft-edge/webview2/).

**Build commands**

```bash
npm install

# Development mode (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build
```

Output: `src-tauri/target/release/snippetvault.exe`

</details>

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Focus search |
| `Ctrl + N` | New snippet |
| `Esc` | Clear search |

## Project structure

```
snippetvault/
├── app/                    Next.js App Router pages
├── components/
│   ├── Sidebar/             Snippet list, search, mobile sheet
│   └── Editor/               Code viewer, live editor, form
├── store/snippets.ts        Zustand store (async file I/O)
├── lib/
│   ├── storage.ts            Tauri ↔ localStorage adapter
│   └── useKeyboardShortcuts.ts
├── types/snippet.ts         TypeScript types
└── src-tauri/                Rust/Tauri native backend
    ├── src/lib.rs             File read/write commands
    ├── capabilities/          Permission definitions
    └── tauri.conf.json        App window & bundle config
```

## Roadmap

- [ ] In-app editor for CodeMirror syntax themes
- [ ] Cloud sync (optional, opt-in)
- [ ] macOS / Linux builds
- [ ] Snippet sharing via shareable link

## Contributing

Issues and pull requests are welcome. If you spot a bug or have an idea, open an issue first to discuss it.

## License

[MIT](LICENSE) — free to use, fork, and modify.
