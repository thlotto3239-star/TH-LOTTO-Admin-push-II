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
  | "wheel"
  | "sliders"
  | "promotions"
  | "articles"
  | "feeds"
  | "settings"
  | "appearance"
  | "banks"
  | "broadcast"
  | "data-management"
  | "admins";

export interface CurrentAdminProfile {
  id: string;
  full_name: string;
  phone: string;
  admin_role: "super_admin" | "admin" | "support";
  is_super: boolean;
}

export const KNOWN_ADMINS: CurrentAdminProfile[] = [
  {
    id: "8cd9dc58-d2eb-4aed-a5bc-f4cd74cb3ee4",
    full_name: "arm",
    phone: "0622306037",
    admin_role: "super_admin",
    is_super: true,
  },
  {
    id: "b439d425-afe0-4353-aefd-2affd053e3c5",
    full_name: "BossMos’X🕊️",
    phone: "857217124@thlotto.app",
    admin_role: "super_admin",
    is_super: true,
  },
  {
    id: "98fb9b29-0915-494e-9e43-8844771fc784",
    full_name: "แอดมิน2",
    phone: "0999999993@thlotto.app",
    admin_role: "admin",
    is_super: false,
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
  "instant-overview": { title: "หวยหนึ่งนาที — ภาพรวม", group: "หวยหนึ่งนาที" },
  wheel: { title: "วงล้อโชคดี", group: "เกม" },
  sliders: { title: "สไลเดอร์", group: "คอนเทนต์" },
  promotions: { title: "โปรโมชั่น", group: "คอนเทนต์" },
  articles: { title: "บทความ", group: "คอนเทนต์" },
  feeds: { title: "จัดการฟีด", group: "คอนเทนต์" },
  settings: { title: "ตั้งค่าระบบ", group: "ระบบ" },
  appearance: { title: "รูปลักษณ์", group: "ระบบ" },
  banks: { title: "ธนาคาร", group: "ระบบ" },
  broadcast: { title: "ส่งแจ้งเตือน", group: "ระบบ" },
  "data-management": { title: "สำรองและจัดการข้อมูล", group: "ระบบ" },
  admins: { title: "ผู้ดูแลระบบ", group: "ระบบ" },
};
