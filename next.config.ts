import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  // Add empty turbopack config to silence the warning
  turbopack: {},
  /* config options here */
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/dashboard\/public\?tenant=.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "public-pages",
          expiration: { maxEntries: 50, maxAgeSeconds: 7200 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|png|gif|webp|svg|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
        },
      },
      {
        urlPattern: /^https?:\/\/.*\/api\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
    ],
  },
})(nextConfig);
