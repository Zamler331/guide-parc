const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === "development",

  fallbacks: {
    document: "/offline",
  },

  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === "image" ||
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "font",
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
})

module.exports = withPWA({
  reactStrictMode: true,
})