import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
};

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /\/api\/available(\?.*)?$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-available",
        networkTimeoutSeconds: 2,
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 10,
        },
      },
    },
    {
      urlPattern: /\/api\/search\/.+/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-search-detail",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
}) as (config: typeof nextConfig) => typeof nextConfig;

export default pwa(nextConfig);
