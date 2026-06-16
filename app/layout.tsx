import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"

const bodyFont = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-body",
})

const headingFont = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-heading",
})

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
    <html lang="fr" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
