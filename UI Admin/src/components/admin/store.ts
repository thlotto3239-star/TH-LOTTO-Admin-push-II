"use client";

import { create } from "zustand";

export type PageId =
  | "dashboard"
  | "deposits"
  | "withdrawals"
  | "members"
  | "member-detail"
  | "markets"
  | "restricted"
  | "bets"
  | "results"
  | "instant-overview"
  | "instant-rates"
  | "instant-settings"
  | "wheel"
  | "sliders"
  | "popup"
  | "promotions"
  | "articles"
  | "feeds"
  | "settings"
  | "appearance"
  | "banks"
  | "affiliate"
  | "broadcast"
  | "data-management"
  | "admins";

export interface CurrentAdminProfile {
  id: string;
  full_name: string;
  phone: string;
  admin_role: "super_admin" | "admin" | "support" | "staff";
  is_super: boolean;
  avatar_url?: string | null;
  permissions?: string[];
}

export const KNOWN_ADMINS: CurrentAdminProfile[] = [
  {
    id: "8cd9dc58-d2eb-4aed-a5bc-f4cd74cb3ee4",
    full_name: "arm",
    phone: "0622306037",
    admin_role: "super_admin",
    is_super: true,
    avatar_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/avatars/8cd9dc58-d2eb-4aed-a5bc-f4cd74cb3ee4/1780530738154.jpg",
  },
  {
    id: "b439d425-afe0-4353-aefd-2affd053e3c5",
    full_name: "BossMos’X🕊️",
    phone: "0857217124",
    admin_role: "super_admin",
    is_super: true,
    avatar_url: null,
  },
];

interface AdminNavState {
  page: PageId;
  selectedMemberId: string | null;
  currentAdmin: CurrentAdminProfile;
  navigate: (page: PageId) => void;
  openMember: (memberId: string) => void;
  setCurrentAdmin: (admin: CurrentAdminProfile) => void;
}

export const useAdminNav = create<AdminNavState>((set) => ({
  page: "dashboard",
  selectedMemberId: null,
  currentAdmin: KNOWN_ADMINS[0],
  navigate: (page) => set({ page, selectedMemberId: null }),
  openMember: (memberId) =>
    set({ page: "member-detail", selectedMemberId: memberId }),
  setCurrentAdmin: (admin) => set({ currentAdmin: admin }),
}));

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  date: string;
  read: boolean;
  target_page?: string;
  category?: "withdrawals" | "deposits" | "members" | "results" | "general";
  request_id?: string | null;
}

export interface AdminCountsState {
  dep: number;
  wth: number;
  kyc: number;
  res: number;
  unread_notifications: number;
  notifications: AdminNotificationItem[];
  loading: boolean;
  fetchCounts: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markRequestRead: (requestId: string, category?: "withdrawals" | "deposits") => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const useAdminCounts = create<AdminCountsState>((set, get) => ({
  dep: 0,
  wth: 0,
  kyc: 0,
  res: 0,
  unread_notifications: 0,
  notifications: [],
  loading: false,
  fetchCounts: async () => {
    try {
      const res = await fetch("/api/admin/data?resource=counts");
      const json = await res.json();
      if (json.success && json.data) {
        set({
          dep: json.data.dep ?? 0,
          wth: json.data.wth ?? 0,
          kyc: json.data.kyc ?? 0,
          res: json.data.res ?? 0,
          unread_notifications: json.data.unread_notifications ?? 0,
          notifications: json.data.notifications || [],
        });
      }
    } catch (e) {
      console.error("Failed to fetch admin counts:", e);
    }
  },
  markNotificationRead: async (id: string) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.read) return;

    set((state) => {
      const updatedNotifs = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const nextUnread = Math.max(0, state.unread_notifications - 1);

      let nextWth = state.wth;
      let nextDep = state.dep;
      let nextKyc = state.kyc;
      let nextRes = state.res;

      const page = target.target_page || "";
      const cat = target.category || "";

      if (cat === "withdrawals" || page === "withdrawals" || target.title.includes("ถอน")) {
        nextWth = Math.max(0, state.wth - 1);
      } else if (cat === "deposits" || page === "deposits" || target.title.includes("ฝาก")) {
        nextDep = Math.max(0, state.dep - 1);
      } else if (cat === "members" || page === "members" || cat === "kyc" || target.title.includes("สมาชิก")) {
        nextKyc = Math.max(0, state.kyc - 1);
      } else if (cat === "results" || page === "results" || target.title.includes("ผล")) {
        nextRes = Math.max(0, state.res - 1);
      }

      return {
        notifications: updatedNotifs,
        unread_notifications: nextUnread,
        wth: nextWth,
        dep: nextDep,
        kyc: nextKyc,
        res: nextRes,
      };
    });

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_notification_read", payload: { id } }),
      });
    } catch (e) {
      console.error("Failed to mark notification read:", e);
    }
  },
  markRequestRead: async (requestId: string, category: "withdrawals" | "deposits" = "withdrawals") => {
    const notif = get().notifications.find((n) => n.request_id === requestId && !n.read);
    if (notif) {
      await get().markNotificationRead(notif.id);
    } else {
      set((state) => ({
        wth: category === "withdrawals" ? Math.max(0, state.wth - 1) : state.wth,
        dep: category === "deposits" ? Math.max(0, state.dep - 1) : state.dep,
        unread_notifications: Math.max(0, state.unread_notifications - 1),
      }));
      try {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_request_read", payload: { request_id: requestId, category } }),
        });
      } catch (e) {
        console.error("Failed to mark request read:", e);
      }
    }
  },
  markAllNotificationsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unread_notifications: 0,
      wth: 0,
      dep: 0,
      kyc: 0,
      res: 0,
    }));
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_notifications_read", payload: {} }),
      });
    } catch (e) {
      console.error("Failed to mark all notifications read:", e);
    }
  },
}));

export const PAGE_META: Record<PageId, { title: string; group: string }> = {
  dashboard: { title: "แผงควบคุม", group: "ภาพรวม" },
  deposits: { title: "รายการฝากเงิน", group: "การเงิน" },
  withdrawals: { title: "รายการถอนเงิน", group: "การเงิน" },
  members: { title: "จัดการสมาชิก", group: "สมาชิก" },
  "member-detail": { title: "รายละเอียดสมาชิก", group: "สมาชิก" },
  markets: { title: "ตลาดหวย", group: "หวย" },
  restricted: { title: "จัดการเลขอั้น", group: "หวย" },
  bets: { title: "รายการแทงหวย", group: "หวย" },
  results: { title: "ออกผลรางวัล", group: "หวย" },
  "instant-overview": { title: "หวย 1 นาที — ภาพรวม & ออกรางวัล", group: "หวย 1 นาที" },
  "instant-rates": { title: "หวย 1 นาที — อัตราจ่าย 9 รูปแบบ", group: "หวย 1 นาที" },
  "instant-settings": { title: "หวย 1 นาที — ตั้งค่าระบบ", group: "หวย 1 นาที" },
  wheel: { title: "วงล้อโชคดี", group: "เกม" },
  sliders: { title: "สไลเดอร์", group: "คอนเทนต์" },
  popup: { title: "ป๊อปอัปหน้าแรก", group: "คอนเทนต์" },
  promotions: { title: "โปรโมชั่น", group: "คอนเทนต์" },
  articles: { title: "บทความ", group: "คอนเทนต์" },
  feeds: { title: "จัดการฟีด", group: "คอนเทนต์" },
  settings: { title: "ตั้งค่าระบบ", group: "ระบบ" },
  appearance: { title: "รูปลักษณ์", group: "ระบบ" },
  banks: { title: "ธนาคาร & เกณฑ์การเงิน", group: "การเงิน" },
  affiliate: { title: "ระบบแนะนำเพื่อน & คอมมิชชั่น", group: "สมาชิก" },
  broadcast: { title: "ส่งแจ้งเตือน", group: "ระบบ" },
  "data-management": { title: "สำรองและจัดการข้อมูล", group: "ระบบ" },
  admins: { title: "ผู้ดูแลระบบ", group: "ระบบ" },
};
