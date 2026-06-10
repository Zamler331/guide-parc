import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Guide Parc",
  description: "Application guide du parc",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#111827",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}