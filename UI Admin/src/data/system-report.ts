// ─────────────────────────────────────────────────────────────
// TH-LOTTO — System Functions Report Data
// แหล่งข้อมูล: full_system_functions_report v1 + admin_system_summary v1
// ─────────────────────────────────────────────────────────────

export interface RpcFunction {
  name: string;
  params: string;
  desc: string;
  sub?: string; // หมวดย่อย (ใช้ในกลุ่มคอนเทนต์)
  hl?: boolean; // ฟังก์ชั่นเด่นตามเอกสาร
}

export interface FunctionGroup {
  id: string;
  no: string;
  title: string;
  icon: string;
  subtitle?: string;
  functions: RpcFunction[];
}

export const reportMeta = {
  system: "TH-LOTTO",
  docTitle: "รายงานฟังก์ชั่นระบบทั้งหมด",
  docSubtitle: "Live Database · Supabase",
  supabaseProject: "ygopnjbvccenryejqmlw",
  region: "Tokyo",
  status: "ONLINE",
  fetchedAt: "2026-09-01",
  sourceDoc: "full_system_functions_report เวอร์ชั่นที่ 1",
  adminDoc: "admin_system_summary เวอร์ชั่น 1",
  adminVersion: "v1.4.0",
  adminStack: "React + Vite + Supabase + TailwindCSS",
  adminProduction: "https://th-lotto-admin-v2.vercel.app",
};

export const lineNotifyRows = [
  { key: "line_notify_enabled", value: '"true"', note: "เปิดใช้งาน", ok: true },
  { key: "line_notify_win_threshold", value: '"5000"', note: "แจ้งเมื่อถอน/ชนะ ≥ ฿5,000", ok: false },
  { key: "line_channel_access_token", value: "13j3jc0CUfZH...", note: "token จริง (ถูกปกปิดบางส่วน)", ok: false },
  { key: "contact_line_url", value: "https://lin.ee/zQAyRsM", note: "ลิงก์ LINE ติดต่อ", ok: false },
  { key: "contact_line_id", value: "@653ufkvi", note: "LINE ID อย่างเป็นทางการ", ok: false },
];

export const tableGroups: { group: string; tables: string[] }[] = [
  { group: "สมาชิก", tables: ["profiles", "login_attempts", "user_suspensions"] },
  { group: "การเงิน", tables: ["deposit_requests", "withdraw_requests", "transactions", "wallets"] },
  {
    group: "หวยหลัก",
    tables: [
      "lottery_markets",
      "lottery_results",
      "bets",
      "draw_schedules",
      "payout_rates",
      "restricted_numbers",
    ],
  },
  {
    group: "หวยหนึ่งนาที",
    tables: ["instant_draws", "instant_bets", "instant_bet_types", "instant_results"],
  },
  {
    group: "คอนเทนต์",
    tables: [
      "sliders",
      "banners",
      "promotions",
      "articles",
      "announcements",
      "pages",
      "faqs",
      "testimonials",
    ],
  },
  {
    group: "ระบบ",
    tables: ["settings", "banks", "admin_notifications", "notifications", "roles"],
  },
  { group: "Affiliate", tables: ["referrals", "referral_settings"] },
  { group: "เกม", tables: ["wheel_prizes", "wheel_spins"] },
  { group: "Social", tables: ["social_media"] },
  { group: "Trending", tables: ["trending_items"] },
];

export const functionGroups: FunctionGroup[] = [
  {
    id: "auth",
    no: "01",
    title: "สมาชิก / Authentication",
    icon: "user",
    subtitle: "ลงทะเบียน ล็อกอิน และข้อมูลผู้ใช้",
    functions: [
      { name: "check_phone_exists", params: "p_phone", desc: "ตรวจสอบเบอร์ซ้ำ" },
      { name: "check_login_rate_limit", params: "p_phone", desc: "ตรวจ rate limit ล็อกอิน" },
      { name: "record_login_attempt", params: "p_phone, p_success", desc: "บันทึกประวัติ login" },
      { name: "set_user_pin", params: "p_pin, p_user_id", desc: "ตั้ง PIN" },
      { name: "reset_user_password", params: "p_phone, p_bank_account_number, p_new_pin", desc: "รีเซ็ต PIN ผู้ใช้" },
      { name: "create_profile_for_existing_user", params: "p_full_name, p_phone, p_pin, p_bank_*", desc: "สร้าง profile" },
      { name: "generate_member_id", params: "—", desc: "Generate รหัสสมาชิก" },
      { name: "get_user_stats", params: "—", desc: "สถิติผู้ใช้ตัวเอง" },
    ],
  },
  {
    id: "admin",
    no: "02",
    title: "Admin Management",
    icon: "shield",
    subtitle: "จัดการผู้ดูแลระบบ สิทธิ์ และการระงับบัญชี",
    functions: [
      { name: "create_admin", params: "p_full_name, p_phone, p_pin, p_role, p_permissions, p_bank_*", desc: "สร้าง admin ใหม่" },
      { name: "create_super_admin", params: "p_full_name, p_phone, p_pin, p_bank_*", desc: "สร้าง super admin" },
      { name: "create_agent", params: "p_full_name, p_phone, p_pin, p_permissions, p_bank_*", desc: "สร้าง agent" },
      { name: "is_admin", params: "uid", desc: "เช็คว่าเป็น admin ไหม" },
      { name: "assert_admin", params: "—", desc: "Throw ถ้าไม่ใช่ admin" },
      { name: "admin_revoke_admin", params: "p_target_id", desc: "ถอดสิทธิ์ admin" },
      { name: "revoke_agent", params: "p_target_id", desc: "ถอดสิทธิ์ agent" },
      { name: "admin_search_non_admins", params: "p_query", desc: "ค้นหาผู้ใช้ทั่วไป" },
      { name: "admin_set_admin_permissions", params: "p_target_id, p_role, p_permissions", desc: "ตั้งสิทธิ์ admin" },
      { name: "admin_get_admin_permissions", params: "admin_id", desc: "ดูสิทธิ์ admin" },
      { name: "admin_assign_role", params: "admin_id, role_id", desc: "กำหนด role" },
      { name: "admin_remove_role", params: "admin_id", desc: "ลบ role" },
      { name: "admin_suspend_user", params: "user_id, reason, expires_at", desc: "ระงับสมาชิก" },
      { name: "admin_unsuspend_user", params: "user_id", desc: "ปลดระงับสมาชิก" },
      { name: "admin_get_user_suspensions", params: "p_limit, p_offset", desc: "รายการสมาชิกถูกระงับ" },
      { name: "admin_reset_user_password", params: "p_user_id, p_new_pin", desc: "รีเซ็ต PIN สมาชิก" },
      { name: "admin_adjust_wallet", params: "p_user_id, p_delta, p_note", desc: "ปรับเครดิต wallet" },
      { name: "admin_update_member", params: "p_user_id, p_patch", desc: "แก้ไขข้อมูลสมาชิก" },
      { name: "set_agent_permissions", params: "p_target_id, p_permissions", desc: "ตั้งสิทธิ์ agent" },
    ],
  },
  {
    id: "roles",
    no: "03",
    title: "Role Management",
    icon: "users",
    subtitle: "บทบาทและสิทธิ์แบบกลุ่ม",
    functions: [
      { name: "admin_get_roles", params: "—", desc: "รายการ roles ทั้งหมด" },
      { name: "admin_create_role", params: "name, description, permissions", desc: "สร้าง role ใหม่" },
      { name: "admin_update_role", params: "id, name, description, permissions", desc: "แก้ไข role" },
      { name: "admin_delete_role", params: "id", desc: "ลบ role" },
    ],
  },
  {
    id: "finance",
    no: "04",
    title: "การเงิน (Deposit / Withdraw)",
    icon: "wallet",
    subtitle: "ฝาก ถอน และโปรโมชั่น",
    functions: [
      { name: "submit_deposit_slip", params: "p_amount, p_slip_url, p_promo_code", desc: "ส่งสลิปฝากเงิน (user)" },
      { name: "admin_approve_deposit", params: "p_request_id, p_note", desc: "อนุมัติฝากเงิน" },
      { name: "admin_reject_deposit", params: "p_request_id, p_note", desc: "ปฏิเสธฝากเงิน" },
      { name: "request_withdrawal_securely", params: "p_amount, p_pin_hash", desc: "ขอถอนเงิน (user, secure)" },
      { name: "admin_approve_withdraw", params: "p_request_id, p_note", desc: "อนุมัติถอนเงิน" },
      { name: "admin_reject_withdraw", params: "p_request_id, p_note", desc: "ปฏิเสธถอนเงิน" },
      { name: "apply_promotion", params: "p_user_id, p_promo_code, p_deposit_amount", desc: "ใช้โปรโมชั่น" },
    ],
  },
  {
    id: "lottery",
    no: "05",
    title: "หวยหลัก",
    icon: "dices",
    subtitle: "ตลาดหวย โพย อัตราจ่าย และเลขอั้น",
    functions: [
      { name: "admin_update_market", params: "p_id, p_name, p_is_active, p_draw_time, p_draw_days, p_logo_url, p_stream_url, p_close_minutes_before, p_draw_day_of_month", desc: "แก้ไขตลาดหวย" },
      { name: "admin_toggle_market", params: "p_id, p_is_active", desc: "เปิด/ปิดตลาด" },
      { name: "admin_rebuild_draw_schedules", params: "p_market_id, p_days", desc: "สร้างตารางออกรางวัล" },
      { name: "admin_update_payout_rates", params: "p_market, p_rates", desc: "แก้ไขอัตราจ่าย" },
      { name: "admin_upsert_restricted_number", params: "p", desc: "จัดการเลขอั้น" },
      { name: "admin_delete_restricted_number", params: "p_id", desc: "ลบเลขอั้น" },
      { name: "place_bet_securely", params: "p_market_id, p_bets", desc: "แทงหวย (user, secure)" },
      { name: "admin_list_bets", params: "p_limit, p_offset, p_status", desc: "รายการโพยทั้งหมด" },
      { name: "update_bet_slip_and_credit", params: "p_bet_id, p_win_amount", desc: "อัปเดตผลและเครดิต" },
      { name: "check_bet_winner", params: "p_bet_type, p_bet_numbers, p_result_*", desc: "ตรวจผลแพ้ชนะ" },
      { name: "fn_check_win", params: "p_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front, p_bet_type, p_numbers", desc: "Logic ตรวจชนะ" },
      { name: "fn_is_market_open", params: "p_market_id", desc: "ตลาดเปิดอยู่ไหม" },
      { name: "fn_next_draw_date", params: "p_market_id", desc: "วันออกรางวัลถัดไป" },
      { name: "fn_close_at", params: "p_market_id, p_draw_date", desc: "เวลาปิดรับ" },
      { name: "fn_auto_cancel_pending_bets", params: "p_hours_threshold", desc: "Auto cancel โพยค้าง" },
      { name: "get_markets_with_countdown", params: "—", desc: "ตลาดพร้อม countdown" },
    ],
  },
  {
    id: "settlement",
    no: "06",
    title: "ออกผลรางวัล / Settlement",
    icon: "trophy",
    subtitle: "ประกาศผล จ่ายรางวัล และ Cleanup",
    functions: [
      { name: "admin_set_result_and_settle", params: "p_market_id, p_draw_date, p_result_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front", desc: "ออกผล + settle ทันที", hl: true },
      { name: "fn_stage_result", params: "p_market_id, p_draw_date, p_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front", desc: "Stage ผล (รอ publish)" },
      { name: "fn_publish_staged_results", params: "—", desc: "Publish ผลที่ stage ไว้" },
      { name: "fn_settle_result", params: "p_result_id", desc: "Settle โพยตามผล" },
      { name: "fn_import_csv_result", params: "p_market_code, p_draw_date, p_result_main, p_front3, p_top3, p_bot2, p_col6", desc: "Import ผลจาก CSV" },
      { name: "fn_log_csv_backup", params: "p_backup_type, p_backup_date", desc: "Log backup" },
      { name: "fn_cleanup_main_results_with_backup_check", params: "—", desc: "Cleanup ผลเก่า" },
      { name: "fn_cleanup_bets_with_backup_check", params: "—", desc: "Cleanup โพยเก่า" },
      { name: "process_draw_results", params: "p_draw_schedule_id, p_result_*", desc: "Process ผลออก" },
      { name: "settle_draw", params: "p_draw_schedule_id", desc: "Settle งวดออก" },
      { name: "fetch_and_settle_cron", params: "—", desc: "Cron: ดึง + settle" },
      { name: "get_today_results", params: "—", desc: "ผลวันนี้" },
      { name: "fn_auto_generate_schedules", params: "—", desc: "Auto สร้าง schedule" },
      { name: "fn_update_draw_status", params: "—", desc: "อัปเดตสถานะงวด" },
      { name: "fn_close_stale_schedules", params: "—", desc: "ปิด schedule ค้าง" },
    ],
  },
  {
    id: "instant",
    no: "07",
    title: "หวยหนึ่งนาที (Instant Lottery)",
    icon: "zap",
    subtitle: "หวยออกรางวัลทุก 1 นาที แบบ real-time",
    functions: [
      { name: "fn_instant_draw", params: "—", desc: "สุ่มผลหวยหนึ่งนาที" },
      { name: "fn_place_instant_bet", params: "p_draw_id, p_bet_type, p_numbers, p_amount", desc: "แทงหวยหนึ่งนาที" },
      { name: "fn_settle_instant_draw", params: "p_draw_id", desc: "Settle งวดหนึ่งนาที" },
      { name: "settle_instant_draw", params: "p_draw_id", desc: "Settle (legacy)" },
      { name: "fn_get_instant_result", params: "p_draw_id", desc: "ผลงวดหนึ่งนาที" },
      { name: "fn_get_instant_bets", params: "—", desc: "โพยหนึ่งนาทีของตัวเอง" },
      { name: "fn_get_instant_popup", params: "p_draw_id", desc: "Popup แสดงผล" },
      { name: "fn_check_instant_win", params: "p_bet_type, p_numbers, p_result_6d", desc: "ตรวจชนะหวยหนึ่งนาที" },
      { name: "admin_get_instant_draws", params: "p_limit, p_offset", desc: "รายการงวดหนึ่งนาที" },
      { name: "admin_get_instant_bets", params: "p_draw_id, p_limit, p_offset", desc: "โพยหนึ่งนาที" },
      { name: "admin_get_instant_bet_types", params: "—", desc: "ประเภทเดิมพัน" },
      { name: "admin_update_instant_bet_type", params: "p_id, p_name, p_rate, p_min_digits, p_max_digits, p_is_positioned", desc: "แก้ไขประเภทเดิมพัน" },
      { name: "admin_toggle_instant_bet_type", params: "p_id", desc: "เปิด/ปิดประเภท" },
      { name: "admin_get_instant_stats", params: "—", desc: "สถิติหวยหนึ่งนาที" },
      { name: "process_1min_lottery", params: "—", desc: "Process หวยหนึ่งนาที" },
      { name: "fn_cleanup_instant_lottery_at_midnight", params: "—", desc: "Cleanup ตีสี่" },
      { name: "get_spin_status", params: "—", desc: "สถานะการ spin" },
    ],
  },
  {
    id: "dashboard",
    no: "08",
    title: "Dashboard & Analytics",
    icon: "chart",
    subtitle: "สถิติภาพรวมและข้อมูลสมาชิก",
    functions: [
      { name: "admin_dashboard_stats", params: "—", desc: "สถิติ dashboard หลัก", hl: true },
      { name: "admin_get_dashboard_stats", params: "—", desc: "สถิติ dashboard (v2)" },
      { name: "admin_dashboard_advanced_stats", params: "—", desc: "สถิติขั้นสูง" },
      { name: "admin_get_members", params: "p_page, p_limit, p_search", desc: "รายการสมาชิก" },
      { name: "admin_list_members", params: "p_limit, p_offset, p_search", desc: "รายการสมาชิก (v2)" },
    ],
  },
  {
    id: "notification",
    no: "09",
    title: "Notification System",
    icon: "bell",
    subtitle: "แจ้งเตือนผู้ใช้และ LINE",
    functions: [
      { name: "admin_broadcast_notification", params: "p_title, p_body, p_type", desc: "Broadcast ไปทุก user", hl: true },
      { name: "admin_delete_notification", params: "p_notification_id", desc: "ลบ notification (null = ลบทั้งหมด)" },
      { name: "fn_daily_summary_line", params: "—", desc: "ส่งสรุปประจำวันทาง LINE", hl: true },
    ],
  },
  {
    id: "wheel",
    no: "10",
    title: "วงล้อโชคดี (Lucky Wheel)",
    icon: "lifebuoy",
    subtitle: "เกมหมุนวงล้อรับรางวัล",
    functions: [
      { name: "spin_lucky_wheel", params: "—", desc: "หมุนวงล้อ" },
      { name: "admin_get_wheel_config", params: "—", desc: "ดูการตั้งค่าวงล้อ" },
      { name: "admin_update_wheel_prize", params: "p_slot_index, p_name, p_amount, p_probability, p_color, p_hi_color, p_is_active", desc: "แก้ไขรางวัล" },
    ],
  },
  {
    id: "affiliate",
    no: "11",
    title: "Affiliate / Referral",
    icon: "handshake",
    subtitle: "ระบบแนะนำเพื่อนและค่าคอมมิชชั่น",
    functions: [
      { name: "generate_referral_link", params: "p_user_id", desc: "สร้าง referral link" },
      { name: "user_get_referral_link", params: "user_id", desc: "ดู referral link" },
      { name: "get_my_referrals", params: "—", desc: "referral ของฉัน" },
      { name: "user_get_my_referrals", params: "user_id", desc: "referral ของ user" },
      { name: "user_get_referral_stats", params: "user_id", desc: "สถิติ referral" },
      { name: "admin_get_referrals", params: "p_limit, p_offset, status_param", desc: "รายการ referral ทั้งหมด" },
      { name: "admin_get_referral_stats", params: "start_date, end_date", desc: "สถิติ referral ช่วงเวลา" },
      { name: "admin_get_top_referrers", params: "p_limit", desc: "top referrer" },
      { name: "admin_get_referral_settings", params: "—", desc: "การตั้งค่า referral" },
      { name: "admin_update_referral_settings", params: "is_active, min_deposit_amount, referrer_reward_amount, referred_reward_amount", desc: "แก้การตั้งค่า" },
      { name: "admin_toggle_referral_system", params: "is_active", desc: "เปิด/ปิด referral" },
      { name: "admin_approve_referral_reward", params: "referral_id", desc: "อนุมัติรางวัล" },
      { name: "admin_cancel_referral", params: "referral_id, reason", desc: "ยกเลิก referral" },
      { name: "check_referral_completions", params: "—", desc: "ตรวจ completion" },
      { name: "transfer_referral_income", params: "—", desc: "โอนรายได้ referral" },
    ],
  },
  {
    id: "content",
    no: "12",
    title: "คอนเทนต์ (Content Management)",
    icon: "megaphone",
    subtitle: "Slider · Banner · Promotion · Article · Announcement · FAQ · Page · Testimonial",
    functions: [
      { name: "admin_get_sliders", params: "—", desc: "รายการ slider", sub: "Slider" },
      { name: "admin_create_slider", params: "title, image_url, link_url", desc: "สร้าง slider", sub: "Slider" },
      { name: "admin_update_slider", params: "id, title, image_url, link_url", desc: "แก้ไข slider", sub: "Slider" },
      { name: "admin_delete_slider", params: "id", desc: "ลบ slider", sub: "Slider" },
      { name: "admin_toggle_slider", params: "id, is_active", desc: "เปิด/ปิด slider", sub: "Slider" },
      { name: "admin_reorder_sliders", params: "items", desc: "เรียงลำดับ slider", sub: "Slider" },
      { name: "admin_get_banners", params: "—", desc: "รายการ banner", sub: "Banner" },
      { name: "admin_create_banner", params: "title, image_url, link_url", desc: "สร้าง banner", sub: "Banner" },
      { name: "admin_update_banner", params: "id, title, image_url, link_url", desc: "แก้ไข banner", sub: "Banner" },
      { name: "admin_delete_banner", params: "id", desc: "ลบ banner", sub: "Banner" },
      { name: "admin_toggle_banner", params: "id, is_active", desc: "เปิด/ปิด banner", sub: "Banner" },
      { name: "admin_reorder_banners", params: "items", desc: "เรียงลำดับ banner", sub: "Banner" },
      { name: "admin_get_promotions", params: "—", desc: "รายการโปรโมชั่น", sub: "Promotion" },
      { name: "admin_create_promotion", params: "title, description, image_url, link_url, start_date, end_date", desc: "สร้างโปรโมชั่น", sub: "Promotion" },
      { name: "admin_update_promotion", params: "id, title, description, ...", desc: "แก้ไขโปรโมชั่น", sub: "Promotion" },
      { name: "admin_delete_promotion", params: "id", desc: "ลบโปรโมชั่น", sub: "Promotion" },
      { name: "admin_toggle_promotion", params: "id, is_active", desc: "เปิด/ปิดโปรโมชั่น", sub: "Promotion" },
      { name: "admin_get_articles", params: "p_limit, p_offset", desc: "รายการบทความ", sub: "Article" },
      { name: "admin_create_article", params: "title, content, image_url", desc: "สร้างบทความ", sub: "Article" },
      { name: "admin_update_article", params: "id, title, content, image_url", desc: "แก้ไขบทความ", sub: "Article" },
      { name: "admin_delete_article", params: "id", desc: "ลบบทความ", sub: "Article" },
      { name: "admin_toggle_article", params: "id, is_active", desc: "เปิด/ปิดบทความ", sub: "Article" },
      { name: "admin_get_announcements", params: "—", desc: "รายการประกาศ", sub: "Announcement" },
      { name: "admin_create_announcement", params: "title, content, expiry_date", desc: "สร้างประกาศ", sub: "Announcement" },
      { name: "admin_update_announcement", params: "id, title, content, expiry_date", desc: "แก้ไขประกาศ", sub: "Announcement" },
      { name: "admin_delete_announcement", params: "id", desc: "ลบประกาศ", sub: "Announcement" },
      { name: "admin_toggle_announcement", params: "id, is_active", desc: "เปิด/ปิดประกาศ", sub: "Announcement" },
      { name: "admin_get_faqs", params: "category_param", desc: "รายการ FAQ", sub: "FAQ" },
      { name: "admin_create_faq", params: "question, answer, category", desc: "สร้าง FAQ", sub: "FAQ" },
      { name: "admin_update_faq", params: "id, question, answer, category", desc: "แก้ไข FAQ", sub: "FAQ" },
      { name: "admin_delete_faq", params: "id", desc: "ลบ FAQ", sub: "FAQ" },
      { name: "admin_toggle_faq", params: "id, is_active", desc: "เปิด/ปิด FAQ", sub: "FAQ" },
      { name: "admin_reorder_faqs", params: "items", desc: "เรียงลำดับ FAQ", sub: "FAQ" },
      { name: "admin_get_pages", params: "—", desc: "รายการหน้า", sub: "Page" },
      { name: "admin_create_page", params: "slug, title, content", desc: "สร้างหน้า", sub: "Page" },
      { name: "admin_update_page", params: "id, slug, title, content", desc: "แก้ไขหน้า", sub: "Page" },
      { name: "admin_delete_page", params: "id", desc: "ลบหน้า", sub: "Page" },
      { name: "admin_toggle_page", params: "id, is_active", desc: "เปิด/ปิดหน้า", sub: "Page" },
      { name: "admin_reorder_pages", params: "items", desc: "เรียงลำดับหน้า", sub: "Page" },
      { name: "admin_get_testimonials", params: "—", desc: "รายการ testimonial", sub: "Testimonial" },
      { name: "admin_approve_testimonial", params: "id", desc: "อนุมัติ testimonial", sub: "Testimonial" },
      { name: "admin_reject_testimonial", params: "id", desc: "ปฏิเสธ testimonial", sub: "Testimonial" },
      { name: "admin_delete_testimonial", params: "id", desc: "ลบ testimonial", sub: "Testimonial" },
      { name: "admin_toggle_testimonial", params: "id, is_active", desc: "เปิด/ปิด testimonial", sub: "Testimonial" },
    ],
  },
  {
    id: "trending",
    no: "13",
    title: "Trending Items & Market Display",
    icon: "trending",
    subtitle: "เลขดัง เลขแนะนำ และการจัดแสดงผลตลาด",
    functions: [
      { name: "admin_get_trending_items_by_display", params: "p_display_type", desc: "Trending items ตาม display type" },
      { name: "admin_upsert_trending_item", params: "p_id, p_title, p_code, p_image_url, p_link, p_category, p_display_order, p_is_active, p_show_in_trending, p_show_in_popular", desc: "Create/Update trending item" },
      { name: "admin_toggle_trending_item", params: "p_id, p_is_active", desc: "เปิด/ปิด trending" },
      { name: "admin_delete_trending_item", params: "p_id", desc: "ลบ trending item" },
      { name: "admin_swap_trending_items_order", params: "p_id1, p_id2", desc: "สลับลำดับ" },
      { name: "admin_set_trending_item_display", params: "p_id, p_category, p_show_in_trending, p_show_in_popular", desc: "ตั้งค่าการแสดง" },
      { name: "admin_get_markets_by_display", params: "p_display_type", desc: "ตลาดตาม display" },
      { name: "admin_set_market_display", params: "p_id, p_show_in_trending, p_show_in_popular", desc: "ตั้งค่า display ตลาด" },
    ],
  },
  {
    id: "settings",
    no: "14",
    title: "Settings & Configuration",
    icon: "settings",
    subtitle: "ตั้งค่าระบบ ธนาคาร และ Social",
    functions: [
      { name: "admin_upsert_setting", params: "p_key, p_value", desc: "บันทึก/แก้ไข setting" },
      { name: "admin_cleanup_storage", params: "—", desc: "เคลียร์ข้อมูลเก่า" },
      { name: "fn_cleanup_old_data", params: "p_notifications_keep_days, p_results_keep_days, p_schedules_keep_days, p_spins_keep_days", desc: "Cleanup ละเอียด" },
      { name: "rls_auto_enable", params: "—", desc: "Auto enable RLS" },
      { name: "admin_get_social_media", params: "—", desc: "Social media links" },
      { name: "admin_update_social_media", params: "platform, url", desc: "แก้ไข social link" },
      { name: "admin_toggle_social_media", params: "platform, is_active", desc: "เปิด/ปิด social" },
      { name: "admin_get_banks", params: "—", desc: "รายการธนาคาร" },
      { name: "admin_create_bank", params: "name, account_name, account_number, branch, qr_code_url", desc: "เพิ่มธนาคาร" },
      { name: "admin_update_bank", params: "id, name, account_name, account_number, branch, qr_code_url", desc: "แก้ไขธนาคาร" },
      { name: "admin_delete_bank", params: "id", desc: "ลบธนาคาร" },
      { name: "admin_toggle_bank", params: "id, is_active", desc: "เปิด/ปิดธนาคาร" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Live Data
// ─────────────────────────────────────────────────────────────

export interface Market {
  name: string;
  code: string;
  category: "GOV" | "FOREIGN" | "STOCK";
  active: boolean;
}

export const markets: Market[] = [
  { name: "หวยรัฐบาลไทย", code: "TH_GOV", category: "GOV", active: true },
  { name: "ฮานอยปกติ", code: "HANOI", category: "FOREIGN", active: true },
  { name: "ลาวพัฒนา", code: "LAO", category: "FOREIGN", active: true },
  { name: "หวยมาเลย์", code: "MALAY", category: "FOREIGN", active: true },
  { name: "หุ้นนิเคอิเช้า", code: "NIKKEI_MORNING", category: "STOCK", active: true },
  { name: "หุ้นฮั่งเส็งบ่าย", code: "HANGSENG_AFTERNOON", category: "STOCK", active: true },
  { name: "หุ้นอินเดีย", code: "STOCK_INDIA", category: "STOCK", active: true },
  { name: "หุ้นเยอรมัน", code: "STOCK_GERMANY", category: "STOCK", active: true },
  { name: "หุ้นดาวน์โจนส์", code: "STOCK_DOWJONES", category: "STOCK", active: true },
];

export const banks = ["KBANK", "SCB", "BBL", "KTB", "GSB", "BAY", "TTB"];

export const promotions = [
  { name: "สมัครใหม่", type: "deposit" },
  { name: "แนะนำเพื่อน", type: "referral" },
  { name: "โปรวันเกิด", type: "special" },
  { name: "แทงผิด 10 งวด", type: "special" },
];

export const settingsRows = [
  { key: "site_name", value: "TH-LOTTO", ok: false },
  { key: "system_status", value: "ONLINE", ok: true },
  { key: "deposit_enabled", value: "TRUE", ok: true },
  { key: "withdraw_enabled", value: "TRUE", ok: true },
  { key: "min_deposit", value: "100", ok: false },
  { key: "min_withdraw", value: "100", ok: false },
  { key: "lucky_wheel_enabled", value: "TRUE", ok: true },
  { key: "line_notify_enabled", value: "true", ok: true },
  { key: "line_notify_win_threshold", value: "5000", ok: false },
  { key: "contact_line_url", value: "https://lin.ee/zQAyRsM", ok: false },
  { key: "contact_line_id", value: "@653ufkvi", ok: false },
];

// ─────────────────────────────────────────────────────────────
// Admin Panel (จาก admin_system_summary v1)
// ─────────────────────────────────────────────────────────────

export interface AdminPage {
  name: string;
  route: string;
  file: string;
  features: string[];
}

export interface AdminSection {
  id: string;
  title: string;
  icon: string;
  pages: AdminPage[];
}

export const adminSections: AdminSection[] = [
  {
    id: "a-dashboard",
    title: "แผงควบคุม (Dashboard)",
    icon: "chart",
    pages: [
      {
        name: "ภาพรวมสถิติ",
        route: "/",
        file: "Dashboard.jsx (37 KB — ใหญ่มาก)",
        features: [
          "ยอดฝาก/ถอน จำนวนสมาชิก ยอดเดิมพัน",
          "กราฟ/แผนภูมิ แสดง trend ข้อมูลแบบ real-time",
          "Notification Panel แจ้งเตือน admin แบบ Realtime (Supabase Realtime)",
        ],
      },
    ],
  },
  {
    id: "a-finance",
    title: "การเงิน",
    icon: "wallet",
    pages: [
      {
        name: "ฝากเงิน (Deposits)",
        route: "/deposits",
        file: "Deposits.jsx (18 KB)",
        features: [
          "รายการฝากเงินทั้งหมด + filter สถานะ",
          "อนุมัติ/ปฏิเสธรายการฝาก",
          "ค้นหา/กรองตามชื่อ ธนาคาร วันที่ สถานะ",
          "ดูภาพสลิปการโอนเงิน",
        ],
      },
      {
        name: "ถอนเงิน (Withdrawals)",
        route: "/withdrawals",
        file: "Withdrawals.jsx (18 KB)",
        features: [
          "รายการถอนพร้อม status",
          "อนุมัติ/ปฏิเสธรายการถอน",
          "Filter ตามธนาคาร สถานะ วันที่",
          "แสดงเลขบัญชี + ชื่อผู้รับ",
        ],
      },
    ],
  },
  {
    id: "a-members",
    title: "สมาชิก",
    icon: "user",
    pages: [
      {
        name: "จัดการสมาชิก (Members)",
        route: "/members",
        file: "Members.jsx (17 KB)",
        features: [
          "ตารางสมาชิกทั้งหมด + pagination",
          "ค้นหาด้วยชื่อ เบอร์โทร ID",
          "กรองสถานะ active / inactive / suspended",
          "คลิกดูรายละเอียด → /members/:id",
        ],
      },
      {
        name: "รายละเอียดสมาชิก (MemberDetail)",
        route: "/members/:id",
        file: "MemberDetail.jsx (21 KB)",
        features: [
          "ข้อมูลส่วนตัว ชื่อ เบอร์ วันที่สมัคร สถานะ",
          "ประวัติธุรกรรมฝาก/ถอนของสมาชิก",
          "ประวัติการแทงทั้งหมด",
          "แก้ไขสถานะ ยอด credit",
          "ระงับ/ปลดระงับสมาชิก",
        ],
      },
      {
        name: "ระบบแนะนำเพื่อน (Affiliates)",
        route: "/affiliates",
        file: "Affiliates.jsx (4.9 KB)",
        features: ["ดูว่าใครแนะนำใคร", "ยอดค่าแนะนำ (commission) ที่ได้รับ"],
      },
      {
        name: "ผู้ดูแลระบบ (Admins)",
        route: "/admins",
        file: "Admins.jsx (24 KB)",
        features: [
          "ดูและจัดการทีม admin ทั้งหมด",
          "สร้าง account admin พร้อม permission",
          "ปรับสิทธิ์แต่ละ permission key",
          "ปิดใช้งานหรือลบ admin",
          "รีเซ็ตรหัสผ่าน admin",
        ],
      },
    ],
  },
  {
    id: "a-lottery",
    title: "หวย",
    icon: "dices",
    pages: [
      {
        name: "ตลาดหวย (LotteryMarkets)",
        route: "/markets",
        file: "LotteryMarkets.jsx (34 KB — ใหญ่มาก)",
        features: [
          "รายการตลาด หวยไทย หุ้น ต่างประเทศ ฯลฯ",
          "เพิ่ม/แก้ไขตลาด ตั้งค่าวัน/เวลาออกรางวัล",
          "เปิด/ปิดรับแทงแต่ละตลาด",
          "กำหนดอัตราจ่ายแต่ละประเภท",
          "ตั้งช่วงเวลาเปิด-ปิดรับแทง",
        ],
      },
      {
        name: "ออกผลรางวัล (Results)",
        route: "/results",
        file: "Results.jsx (21 KB)",
        features: [
          "กรอกตัวเลขผลรางวัลแต่ละตลาด",
          "ยืนยันผลก่อนบันทึก",
          "ดูประวัติผลรางวัลย้อนหลัง",
          "Trigger จ่ายรางวัลอัตโนมัติ",
        ],
      },
      {
        name: "รายการโพย (BetsList)",
        route: "/bets",
        file: "BetsList.jsx (8.4 KB)",
        features: ["ดูโพยทุกรายการ", "ค้นหาตามตลาด/งวด (period)", "สถานะโพย pending / won / lost"],
      },
      {
        name: "เลขอั้น (RestrictedNumbers)",
        route: "/restricted",
        file: "RestrictedNumbers.jsx (6.9 KB)",
        features: [
          "กำหนดเลขที่ไม่รับแทง หรือลดอัตราจ่าย",
          "ยกเลิกการอั้นเลข",
          "ตั้งค่าแยกต่อแต่ละตลาด",
        ],
      },
    ],
  },
  {
    id: "a-instant",
    title: "หวยหนึ่งนาที (Instant Lottery)",
    icon: "zap",
    pages: [
      {
        name: "ภาพรวม",
        route: "/instant-overview",
        file: "InstantOverview",
        features: ["สถิติ ยอด และกราฟ instant lottery"],
      },
      {
        name: "ประเภทเดิมพัน",
        route: "/instant-bet-types",
        file: "InstantBetTypes",
        features: ["จัดการ bet types และอัตราจ่าย"],
      },
      {
        name: "งวดออกรางวัล",
        route: "/instant-draws",
        file: "InstantDraws",
        features: ["ดู draws ทั้งหมดพร้อม status"],
      },
      {
        name: "รายการแทง",
        route: "/instant-bets",
        file: "InstantBets",
        features: ["ดูรายการแทงของแต่ละ draw"],
      },
      {
        name: "ผลรางวัล",
        route: "/instant-results",
        file: "InstantResults",
        features: ["ดูและกรอกผลรางวัล"],
      },
      {
        name: "ตั้งค่า Instant (InstantSettings.jsx — 20.5 KB)",
        route: "/instant-settings",
        file: "InstantSettings.jsx (20.5 KB)",
        features: [
          "กำหนดระยะเวลา draw interval",
          "วงเงินแทงสูงสุด/ต่ำสุด",
          "เปิด/ปิดระบบ instant",
        ],
      },
    ],
  },
  {
    id: "a-game",
    title: "เกม",
    icon: "lifebuoy",
    pages: [
      {
        name: "วงล้อโชคดี (WheelAdmin)",
        route: "/wheel",
        file: "WheelAdmin.jsx (26.5 KB)",
        features: [
          "กำหนดรางวัลในวงล้อ ชื่อรางวัล โอกาสชนะ จำนวน",
          "เปิด/ปิดวงล้อ",
          "ดูประวัติการหมุนและผลรางวัลที่ได้",
          "กำหนดจำนวนครั้งที่หมุนได้ (quota ต่อ user)",
        ],
      },
    ],
  },
  {
    id: "a-content",
    title: "คอนเทนต์",
    icon: "megaphone",
    pages: [
      {
        name: "สไลเดอร์ (Sliders)",
        route: "/sliders",
        file: "Sliders.jsx (10.5 KB)",
        features: ["เพิ่ม/แก้ไขสไลด์ อัปโหลดรูป + ลิงก์", "ลากเรียงลำดับสไลด์", "เปิด/ปิดแต่ละรูป"],
      },
      {
        name: "โปรโมชั่น (Promotions)",
        route: "/promotions",
        file: "Promotions.jsx (15.3 KB)",
        features: ["เพิ่ม/แก้ไขชื่อ เงื่อนไข มูลค่า รูป", "กำหนดวันเริ่ม-วันสิ้นสุด", "เปิด/ปิดโปรโมชั่น"],
      },
      {
        name: "บทความ (Articles)",
        route: "/articles",
        file: "Articles.jsx (8 KB)",
        features: ["เขียน/แก้ไขด้วย rich text editor", "กำหนดหมวดหมู่", "เผยแพร่/ซ่อนบทความ"],
      },
      {
        name: "จัดการฟีด (FeedManagement)",
        route: "/feeds",
        file: "FeedManagement.jsx (7.3 KB)",
        features: ["เพิ่ม/ลบ/แก้ไขรายการ feed ข่าว"],
      },
      {
        name: "Trending Items",
        route: "/trending",
        file: "TrendingItems.jsx (12 KB)",
        features: ["จัดการเลขดัง/เลขแนะนำ", "เพิ่ม/ลบ trending list"],
      },
    ],
  },
  {
    id: "a-system",
    title: "ระบบ / การตั้งค่า",
    icon: "settings",
    pages: [
      {
        name: "ตั้งค่าระบบ (Settings — 55 KB ใหญ่ที่สุด! แบ่งเป็น 8 Modal)",
        route: "/settings",
        file: "Settings.jsx (55 KB)",
        features: [
          "การเงิน — ขั้นต่ำ-สูงสุดฝาก/ถอน ค่าธรรมเนียม โบนัสต้อนรับ",
          "บัญชีธนาคาร — บัญชีรับเงิน admin เพิ่ม/ลบบัญชี",
          "วงล้อ — อัตราชนะ จำนวนโอกาสหมุน รางวัล",
          "Social / Line — LINE Official URL, Facebook, เบอร์ติดต่อ",
          "ประกาศ — จัดการ Marquee announcements (CRUD)",
          "ระบบ — ชื่อเว็บ โลโก้ รหัสผ่าน API",
          "ควบคุมเว็บ — เปิด/ปิดเว็บ (site_enabled toggle)",
          "Cleanup — ลบ instant_draws SETTLED > 7 วัน, notifications อ่านแล้ว > 7 วัน, login_attempts > 30 วัน (RPC: admin_cleanup_storage)",
        ],
      },
      {
        name: "รูปลักษณ์ (Appearance)",
        route: "/appearance",
        file: "Appearance.jsx (11.3 KB)",
        features: [
          "เปลี่ยนสีหลักของเว็บ (Primary Color)",
          "อัปโหลดโลโก้/Favicon",
          "เปลี่ยน font family",
          "ตั้งค่า default Dark/Light Mode",
        ],
      },
      {
        name: "ธนาคาร (Banks)",
        route: "/banks",
        file: "Banks.jsx (7.5 KB)",
        features: [
          "รายการธนาคาร SCB, KBANK, BBL ฯลฯ",
          "เพิ่ม/ลบบัญชีธนาคารรับเงิน",
          "เปิด/ปิดการใช้งาน",
          "จัดเรียงลำดับการแสดงผล",
        ],
      },
      {
        name: "แจ้งเตือน Broadcast (Notifications)",
        route: "/notifications",
        file: "Notifications.jsx (3.6 KB)",
        features: ["ส่งแจ้งเตือนหาสมาชิกทั้งหมดหรือรายบุคคล", "เลือกประเภท info / warning / success"],
      },
      {
        name: "Backup & จัดการข้อมูล (DataManagement)",
        route: "/data-management",
        file: "DataManagement.jsx (9.6 KB)",
        features: ["Export ข้อมูล CSV/JSON", "Trigger backup Supabase", "ดูจำนวน rows แต่ละ table"],
      },
    ],
  },
];

export const adminPermissions = [
  "deposits",
  "withdrawals",
  "members",
  "markets",
  "bets",
  "restricted",
  "wheel",
  "instant",
  "settings",
  "appearance",
  "sliders",
  "promotions",
  "articles",
  "feeds",
  "banks",
];

export const adminComponents = [
  { name: "Layout.jsx", desc: "Sidebar + Navbar + Notification bell + Toast" },
  { name: "Modal.jsx", desc: "Reusable modal dialog (native <dialog>)" },
  { name: "BankBadge.jsx", desc: "แสดงโลโก้ธนาคาร + ชื่อ" },
  { name: "BankSelector.jsx", desc: "Dropdown เลือกธนาคาร" },
  { name: "StatusBadge.jsx", desc: "Badge สถานะสี (pending/approved/rejected)" },
  { name: "ProfessionalTable.jsx", desc: "ตารางข้อมูลแบบ professional" },
  { name: "Toast.jsx", desc: "Toast notification system" },
  { name: "SearchInput.jsx", desc: "Search bar" },
  { name: "CategoryNav.jsx", desc: "Tab navigation" },
];

export const techStack = [
  { part: "Frontend Framework", tech: "React 18 + Vite" },
  { part: "Routing", tech: "React Router v6 (lazy loading)" },
  { part: "Styling", tech: "TailwindCSS" },
  { part: "Database", tech: "Supabase (PostgreSQL)" },
  { part: "Auth", tech: "Supabase Auth" },
  { part: "Realtime", tech: "Supabase Realtime" },
  { part: "Deployment", tech: "Vercel" },
  { part: "Icons", tech: "Lucide React + Google Material Icons" },
];

export const projectStructure = `src/
├── pages/          ← หน้าหลักทั้งหมด (30+ หน้า)
├── components/     ← UI Components ใช้ซ้ำ
├── services/       ← authService, logger
├── contexts/       ← ModalContext
├── utils/          ← notifications, alert helpers
├── App.jsx         ← Router + PermGuard
├── AuthContext.jsx ← Auth + Permission state
└── AdminGuard.jsx  ← Route protection`;

export const totalFunctions = functionGroups.reduce((sum, g) => sum + g.functions.length, 0);
export const totalTables = tableGroups.reduce((sum, g) => sum + g.tables.length, 0);
export const totalAdminPages = adminSections.reduce((sum, s) => sum + s.pages.length, 0);
