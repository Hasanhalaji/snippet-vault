import type { Metadata } from 'next'
import './globals.css'
import {ReactNode} from "react";

export const metadata: Metadata = {
  title: 'SnippetVault',
  description: 'Quickly store, organize, and search your personal snippets code',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
