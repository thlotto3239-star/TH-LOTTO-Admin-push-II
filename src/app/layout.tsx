import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TH-LOTTO-II — แผงควบคุมแอดมิน",
  description:
    "แผงควบคุมแอดมิน TH-LOTTO-II ครบทั้ง 19 หน้าจอ: การเงิน สมาชิก ตลาดหวย หวยหนึ่งนาที วงล้อ คอนเทนต์ และระบบหลังบ้าน — ดีไซน์ทันสมัย พื้นหลังขาว ปุ่มขอบมน",
  keywords: ["TH-LOTTO-II", "TH-LOTTO", "แผงควบคุม", "ระบบหลังบ้าน", "หวย"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-neutral-950">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
