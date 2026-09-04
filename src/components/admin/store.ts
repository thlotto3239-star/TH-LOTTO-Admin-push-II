"use client";

import { create } from "zustand";

export type PageId =
  | "dashboard"
  | "deposits"
  | "withdrawals"
  | "members"
  | "member-detail"
  | "markets"
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

interface AdminNavState {
  page: PageId;
  selectedMemberId: string | null;
  navigate: (page: PageId) => void;
  openMember: (memberId: string) => void;
}

export const useAdminNav = create<AdminNavState>((set) => ({
  page: "dashboard",
  selectedMemberId: null,
  navigate: (page) => set({ page, selectedMemberId: null }),
  openMember: (memberId) =>
    set({ page: "member-detail", selectedMemberId: memberId }),
}));

export const PAGE_META: Record<PageId, { title: string; group: string }> = {
  dashboard: { title: "แผงควบคุม", group: "ภาพรวม" },
  deposits: { title: "รายการฝากเงิน", group: "การเงิน" },
  withdrawals: { title: "รายการถอนเงิน", group: "การเงิน" },
  members: { title: "จัดการสมาชิก", group: "สมาชิก" },
  "member-detail": { title: "รายละเอียดสมาชิก", group: "สมาชิก" },
  markets: { title: "ตลาดหวย", group: "หวย" },
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
