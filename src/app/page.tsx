"use client";

import * as React from "react";
import { AdminApp } from "@/components/admin/admin-app";

export default function Page() {
  // Guard กัน hydration mismatch ของ Radix ids (aria-controls) ระหว่าง SSR/client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="flex size-14 animate-pulse items-center justify-center rounded-full bg-brand-600 text-xl font-black text-white">
          TL
        </div>
        <p className="text-sm font-medium text-neutral-400">กำลังโหลด TH-LOTTO Admin Panel…</p>
      </div>
    );
  }

  return <AdminApp />;
}
