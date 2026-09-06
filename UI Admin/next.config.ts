import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
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
