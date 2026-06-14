"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
}

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(ua)
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua)

  return isIos && isSafari
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    setShowIosHelp(isIosSafari() && !isStandalone())

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setShowIosHelp(false)
    }

    function handleInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
      setShowIosHelp(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    if (choice.outcome === "accepted") {
      setInstalled(true)
    }

    setInstallPrompt(null)
  }

  if (installed) return null
  if (!installPrompt && !showIosHelp) return null

  return (
    <div className="relative z-20 w-full rounded-2xl border border-white/25 bg-white/15 p-3 text-left shadow-lg backdrop-blur">
      {installPrompt ? (
        <button
          type="button"
          onClick={handleInstall}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-blue-700 shadow-sm transition active:scale-[0.98]"
        >
          Installer l'application
        </button>
      ) : (
        <div className="text-sm font-bold leading-5 text-white">
          <p>Installer l'application</p>
          <p className="mt-1 text-xs font-semibold text-blue-50/85">
            Sur iPhone, touchez Partager puis Ajouter a l'ecran d'accueil.
          </p>
        </div>
      )}
    </div>
  )
}
