"use client";

import * as React from "react";
import { AdminApp } from "@/components/admin/admin-app";
import { AdminLogin } from "@/components/admin/login";
import { useAdminNav } from "@/components/admin/store";
import { supabase } from "@/lib/supabase";
import { getAdminClientGeo } from "@/lib/client-geo";

const SESSION_KEY = "thlotto_admin_session";

function syncAdminProfile(profile: any, fallbackName: string) {
  const isSuper = profile?.admin_role === "super_admin" || profile?.is_super === true;
  useAdminNav.getState().setCurrentAdmin({
    id: profile?.id || "admin-session",
    full_name: profile?.full_name || fallbackName,
    phone: profile?.phone || "-",
    admin_role: isSuper ? "super_admin" : (profile?.admin_role || "staff"),
    is_super: isSuper,
    avatar_url: profile?.avatar_url || null,
    permissions: isSuper ? undefined : (profile?.admin_permissions || []),
  });
}

export default function Page() {
  // Guard กัน hydration mismatch ของ Radix ids (aria-controls) ระหว่าง SSR/client
  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const [unauthorizedError, setUnauthorizedError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // 1. ตรวจสอบ Local Storage session ก่อน
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      const savedProf = localStorage.getItem("thlotto_admin_profile");
      if (saved) {
        setCurrentUser(saved);
        if (savedProf) {
          try {
            const parsed = JSON.parse(savedProf);
            syncAdminProfile(parsed, saved);
          } catch {}
        }
      }
    } catch {
      // ignore localStorage errors in private browsing/sandboxes
    }

    // 2. ตรวจสอบ Supabase Session สำหรับกรณี Google OAuth Redirect หรือ Existing Session
    const handleAuthUser = async (sessionUser: any) => {
      try {
        // ซิงก์ผู้ใช้ที่เข้าสู่ระบบผ่าน Google OAuth หน้าแอดมิน ให้ได้รับสิทธิ์ผู้ดูแลระบบ (ยกเว้นการเงิน) อัตโนมัติ
        const res = await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "oauth_admin_sync",
            payload: {
              user_id: sessionUser.id,
              email: sessionUser.email,
              full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "ผู้ดูแลระบบ",
              avatar_url: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || null,
            },
          }),
        });

        const syncJson = await res.json();
        if (!res.ok || !syncJson.success || !syncJson.profile) {
          console.warn("OAuth admin sync error:", syncJson?.error);
          setUnauthorizedError(syncJson?.error || "บัญชีนี้ไม่มีสิทธิ์เข้าถึงแผงควบคุม");
          await supabase.auth.signOut();
          return;
        }

        const profile = syncJson.profile;
        const adminName = profile.full_name || sessionUser.email?.split("@")[0] || "ผู้ดูแลระบบ";

        setCurrentUser(adminName);
        syncAdminProfile(profile, adminName);
        setUnauthorizedError(null);
        try {
          localStorage.setItem(SESSION_KEY, adminName);
          localStorage.setItem("thlotto_admin_profile", JSON.stringify(profile));
        } catch {
          // ignore
        }

        // บันทึกประวัติและพิกัดการเข้าสู่ระบบสำหรับ Google OAuth session
        getAdminClientGeo().then((clientGeo) => {
          fetch("/api/admin/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "record_login_attempt",
              payload: {
                phone: profile?.phone || sessionUser.email || "Google OAuth",
                user_id: sessionUser.id,
                success: true,
                client_ip: clientGeo?.ip,
                client_geo: clientGeo,
              },
            }),
          }).catch((e) => console.warn("Failed to record OAuth login forensic session:", e));
        }).catch(() => {});
      } catch (err) {
        console.error("Auth verification error:", err);
      }
    };

    const verifySupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleAuthUser(session.user);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
      }
    };

    verifySupabaseAuth();

    // ฟัง Auth State Change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleAuthUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      <div className="relative">
        {unauthorizedError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-red-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-sm font-medium">
            <span>{unauthorizedError}</span>
            <button onClick={() => setUnauthorizedError(null)} className="ml-3 font-bold">✕</button>
          </div>
        )}
        <AdminLogin
          onLogin={(name, profile) => {
            setCurrentUser(name);
            syncAdminProfile(profile, name);
            setUnauthorizedError(null);
            try {
              localStorage.setItem(SESSION_KEY, name);
            } catch {
              // ignore
            }
          }}
        />
      </div>
    );
  }

  return (
    <AdminApp
      onLogout={async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        setCurrentUser(null);
        try {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem("thlotto_admin_profile");
        } catch {
          // ignore
        }
      }}
    />
  );
}
