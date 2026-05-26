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
      <body className="bg-gray-100">
        <div className="min-h-screen flex justify-center">
          <div className="w-full max-w-md min-h-screen bg-white shadow-sm">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}