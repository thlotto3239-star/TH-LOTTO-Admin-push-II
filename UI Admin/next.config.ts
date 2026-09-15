import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ygopnjbvccenryejqmlw.supabase.co" },
      { protocol: "https", hostname: "thailottoapi.com" },
      { protocol: "https", hostname: "play-lh.googleusercontent.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "www.ttbbank.com" },
      { protocol: "https", hostname: "www.truemoney.com" },
    ],
  },
};

export default nextConfig;
