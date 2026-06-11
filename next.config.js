const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === "development",

  fallbacks: {
    document: "/offline",
  },
  cacheOnFrontEndNav: true,
})

module.exports = withPWA({
  reactStrictMode: true,
})
