"use client";

import * as React from "react";
import { AdminApp } from "@/components/admin/admin-app";
import { AdminLogin } from "@/components/admin/login";
import { useAdminNav } from "@/components/admin/store";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "thlotto_admin_session";

function syncAdminProfile(profile: any, fallbackName: string) {
  const isSuper = profile?.admin_role === "super_admin" || profile?.phone === "0622306037" || profile?.is_super === true;
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
    setMounted(true);

    // 1. ตรวจสอบ Local Storage session ก่อน
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setCurrentUser(saved);
      }
    } catch {
      // ignore localStorage errors in private browsing/sandboxes
    }

    // 2. ตรวจสอบ Supabase Session สำหรับกรณี Google OAuth Redirect หรือ Existing Session
    const handleAuthUser = async (sessionUser: any) => {
      try {
        let { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, is_admin, admin_role, admin_permissions, phone, avatar_url")
          .eq("id", sessionUser.id)
          .maybeSingle();

        // หากเป็นเจ้าหน้าที่ที่กดเข้าผ่าน Google แล้วยังไม่มีข้อมูลใน profiles
        if (!profile) {
          const newStaff = {
            id: sessionUser.id,
            full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0] || "เจ้าหน้าที่ใหม่",
            phone: sessionUser.phone || sessionUser.email || "-",
            is_admin: true,
            admin_role: "staff",
            admin_permissions: [],
            status: "active",
          };
          const { data: created } = await supabase.from("profiles").insert(newStaff).select().maybeSingle();
          profile = created || newStaff;
        } else if (profile.is_admin !== true && !["admin", "super_admin"].includes(profile.admin_role || "")) {
          // หากเป็นโปรไฟล์เดิมที่ยังไม่ได้เปิดสิทธิ์แอดมิน ให้เปิดสถานะเป็น staff แบบจำกัดสิทธิ์ (รอ Super Admin มอบหมาย)
          await supabase.from("profiles").update({ is_admin: true, admin_role: "staff", admin_permissions: [] }).eq("id", profile.id);
          profile.is_admin = true;
          profile.admin_role = "staff";
          profile.admin_permissions = [];
        }

        const adminName = profile?.full_name || sessionUser.email?.split("@")[0] || "ผู้ดูแลระบบ";
        setCurrentUser(adminName);
        syncAdminProfile(profile, adminName);
        setUnauthorizedError(null);
        try {
          localStorage.setItem(SESSION_KEY, adminName);
        } catch {
          // ignore
        }
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
        } catch {
          // ignore
        }
      }}
    />
  );
}
