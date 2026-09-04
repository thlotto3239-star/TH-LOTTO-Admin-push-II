"use client";

import * as React from "react";
import { AdminApp } from "@/components/admin/admin-app";
import { AdminLogin } from "@/components/admin/login";

const SESSION_KEY = "thlotto_admin_session";

export default function Page() {
  // Guard กัน hydration mismatch ของ Radix ids (aria-controls) ระหว่าง SSR/client
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setCurrentUser(saved);
      }
    } catch {
      // ignore localStorage errors in private browsing/sandboxes
    }
  }, []);

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

  if (!currentUser) {
    return (
      <AdminLogin
        onLogin={(name) => {
          setCurrentUser(name);
          try {
            localStorage.setItem(SESSION_KEY, name);
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <AdminApp
      onLogout={() => {
        setCurrentUser(null);
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
      }}
    />
  );
}
