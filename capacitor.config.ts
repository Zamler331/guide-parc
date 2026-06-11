import type { CapacitorConfig } from "@capacitor/cli"

const serverUrl = process.env.GUIDE_PARC_APP_URL

const config: CapacitorConfig = {
  appId: "fr.guideparc.app",
  appName: "Guide Parc",
  webDir: "native/www",
  android: {
    buildOptions: {
      releaseType: "AAB",
    },
  },
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: false,
        androidScheme: "https",
      }
    : undefined,
}

export default config
