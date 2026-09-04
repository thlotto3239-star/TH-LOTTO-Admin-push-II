# 🗄️ TH-LOTTO — รายงานฟังก์ชั่นระบบทั้งหมด (Live Database)
> เชื่อมต่อจริงกับ Supabase `ygopnjbvccenryejqmlw` · Region: Tokyo · สถานะ: **ONLINE**  
> ดึงข้อมูล: 2026-09-01 · RPC Functions: **164 ฟังก์ชั่น**

---

## 📣 ข้อค้นพบสำคัญ — LINE Notify มีอยู่จริง!

จาก settings table บน database จริง พบค่าเหล่านี้:

| Key | ค่า |
|---|---|
| `line_notify_enabled` | `"true"` ✅ |
| `line_notify_win_threshold` | `"5000"` (แจ้งเมื่อถอน/ชนะ ≥ ฿5,000) |
| `line_channel_access_token` | `13j3jc0CUfZH...` (token จริง) |
| `contact_line_url` | `https://lin.ee/zQAyRsM` |
| `contact_line_id` | `@653ufkvi` |

> ⚠️ LINE Notify ถูก implement ที่ฝั่ง **Supabase Backend** (ไม่ได้อยู่ใน Admin frontend code) และพบ RPC `fn_daily_summary_line` ที่ส่ง daily summary ทาง LINE

---

## 🏗️ ตารางข้อมูลหลัก (Tables) — 41 ตาราง

| กลุ่ม | ตาราง |
|---|---|
| **สมาชิก** | `profiles`, `login_attempts`, `user_suspensions` |
| **การเงิน** | `deposit_requests`, `withdraw_requests`, `transactions`, `wallets` |
| **หวยหลัก** | `lottery_markets`, `lottery_results`, `bets`, `draw_schedules`, `payout_rates`, `restricted_numbers` |
| **หวยหนึ่งนาที** | `instant_draws`, `instant_bets`, `instant_bet_types`, `instant_results` |
| **คอนเทนต์** | `sliders`, `banners`, `promotions`, `articles`, `announcements`, `pages`, `faqs`, `testimonials` |
| **ระบบ** | `settings`, `banks`, `admin_notifications`, `notifications`, `roles` |
| **Affiliate** | `referrals`, `referral_settings` |
| **เกม** | `wheel_prizes`, `wheel_spins` |
| **Social** | `social_media` |
| **Trending** | `trending_items` |

---

## 🔧 RPC Functions ทั้งหมด 164 ฟังก์ชั่น — จัดกลุ่ม

---

### 👤 กลุ่ม: สมาชิก / Authentication

| Function | Parameters | หน้าที่ |
|---|---|---|
| `check_phone_exists` | `p_phone` | ตรวจสอบเบอร์ซ้ำ |
| `check_login_rate_limit` | `p_phone` | ตรวจ rate limit ล็อกอิน |
| `record_login_attempt` | `p_phone, p_success` | บันทึกประวัติ login |
| `set_user_pin` | `p_pin, p_user_id` | ตั้ง PIN |
| `reset_user_password` | `p_phone, p_bank_account_number, p_new_pin` | รีเซ็ต PIN ผู้ใช้ |
| `create_profile_for_existing_user` | `p_full_name, p_phone, p_pin, p_bank_*` | สร้าง profile |
| `generate_member_id` | — | Generate รหัสสมาชิก |
| `get_user_stats` | — | สถิติผู้ใช้ตัวเอง |

---

### 🛡️ กลุ่ม: Admin Management

| Function | Parameters | หน้าที่ |
|---|---|---|
| `create_admin` | `p_full_name, p_phone, p_pin, p_role, p_permissions, p_bank_*` | สร้าง admin ใหม่ |
| `create_super_admin` | `p_full_name, p_phone, p_pin, p_bank_*` | สร้าง super admin |
| `create_agent` | `p_full_name, p_phone, p_pin, p_permissions, p_bank_*` | สร้าง agent |
| `is_admin` | `uid` | เช็คว่าเป็น admin ไหม |
| `assert_admin` | — | Throw ถ้าไม่ใช่ admin |
| `admin_revoke_admin` | `p_target_id` | ถอดสิทธิ์ admin |
| `revoke_agent` | `p_target_id` | ถอดสิทธิ์ agent |
| `admin_search_non_admins` | `p_query` | ค้นหาผู้ใช้ทั่วไป |
| `admin_set_admin_permissions` | `p_target_id, p_role, p_permissions` | ตั้งสิทธิ์ admin |
| `admin_get_admin_permissions` | `admin_id` | ดูสิทธิ์ admin |
| `admin_assign_role` | `admin_id, role_id` | กำหนด role |
| `admin_remove_role` | `admin_id` | ลบ role |
| `admin_suspend_user` | `user_id, reason, expires_at` | ระงับสมาชิก |
| `admin_unsuspend_user` | `user_id` | ปลดระงับสมาชิก |
| `admin_get_user_suspensions` | `p_limit, p_offset` | รายการสมาชิกถูกระงับ |
| `admin_reset_user_password` | `p_user_id, p_new_pin` | รีเซ็ต PIN สมาชิก |
| `admin_adjust_wallet` | `p_user_id, p_delta, p_note` | ปรับเครดิต wallet |
| `admin_update_member` | `p_user_id, p_patch` | แก้ไขข้อมูลสมาชิก |
| `set_agent_permissions` | `p_target_id, p_permissions` | ตั้งสิทธิ์ agent |

---

### 👥 กลุ่ม: Role Management

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_get_roles` | — | รายการ roles ทั้งหมด |
| `admin_create_role` | `name, description, permissions` | สร้าง role ใหม่ |
| `admin_update_role` | `id, name, description, permissions` | แก้ไข role |
| `admin_delete_role` | `id` | ลบ role |

---

### 💰 กลุ่ม: การเงิน (Deposit/Withdraw)

| Function | Parameters | หน้าที่ |
|---|---|---|
| `submit_deposit_slip` | `p_amount, p_slip_url, p_promo_code` | ส่งสลิปฝากเงิน (user) |
| `admin_approve_deposit` | `p_request_id, p_note` | อนุมัติฝากเงิน |
| `admin_reject_deposit` | `p_request_id, p_note` | ปฏิเสธฝากเงิน |
| `request_withdrawal_securely` | `p_amount, p_pin_hash` | ขอถอนเงิน (user, secure) |
| `admin_approve_withdraw` | `p_request_id, p_note` | อนุมัติถอนเงิน |
| `admin_reject_withdraw` | `p_request_id, p_note` | ปฏิเสธถอนเงิน |
| `apply_promotion` | `p_user_id, p_promo_code, p_deposit_amount` | ใช้โปรโมชั่น |

---

### 🎰 กลุ่ม: หวยหลัก

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_update_market` | `p_id, p_name, p_is_active, p_draw_time, p_draw_days, p_logo_url, p_stream_url, p_close_minutes_before, p_draw_day_of_month` | แก้ไขตลาดหวย |
| `admin_toggle_market` | `p_id, p_is_active` | เปิด/ปิดตลาด |
| `admin_rebuild_draw_schedules` | `p_market_id, p_days` | สร้างตารางออกรางวัล |
| `admin_update_payout_rates` | `p_market, p_rates` | แก้ไขอัตราจ่าย |
| `admin_upsert_restricted_number` | `p` | จัดการเลขอั้น |
| `admin_delete_restricted_number` | `p_id` | ลบเลขอั้น |
| `place_bet_securely` | `p_market_id, p_bets` | แทงหวย (user, secure) |
| `admin_list_bets` | `p_limit, p_offset, p_status` | รายการโพยทั้งหมด |
| `update_bet_slip_and_credit` | `p_bet_id, p_win_amount` | อัปเดตผลและเครดิต |
| `check_bet_winner` | `p_bet_type, p_bet_numbers, p_result_*` | ตรวจผลแพ้ชนะ |
| `fn_check_win` | `p_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front, p_bet_type, p_numbers` | Logic ตรวจชนะ |
| `fn_is_market_open` | `p_market_id` | ตลาดเปิดอยู่ไหม |
| `fn_next_draw_date` | `p_market_id` | วันออกรางวัลถัดไป |
| `fn_close_at` | `p_market_id, p_draw_date` | เวลาปิดรับ |
| `fn_auto_cancel_pending_bets` | `p_hours_threshold` | Auto cancel โพยค้าง |
| `get_markets_with_countdown` | — | ตลาดพร้อม countdown |

---

### 🏆 กลุ่ม: ออกผลรางวัล / Settlement

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_set_result_and_settle` | `p_market_id, p_draw_date, p_result_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front` | **ออกผล + settle ทันที** |
| `fn_stage_result` | `p_market_id, p_draw_date, p_main, p_2top, p_2bottom, p_3top, p_3bottom, p_3front` | Stage ผล (รอ publish) |
| `fn_publish_staged_results` | — | Publish ผลที่ stage ไว้ |
| `fn_settle_result` | `p_result_id` | Settle โพยตามผล |
| `fn_import_csv_result` | `p_market_code, p_draw_date, p_result_main, p_front3, p_top3, p_bot2, p_col6` | Import ผลจาก CSV |
| `fn_log_csv_backup` | `p_backup_type, p_backup_date` | Log backup |
| `fn_cleanup_main_results_with_backup_check` | — | Cleanup ผลเก่า |
| `fn_cleanup_bets_with_backup_check` | — | Cleanup โพยเก่า |
| `process_draw_results` | `p_draw_schedule_id, p_result_*` | Process ผลออก |
| `settle_draw` | `p_draw_schedule_id` | Settle งวดออก |
| `fetch_and_settle_cron` | — | Cron: ดึง+settle |
| `get_today_results` | — | ผลวันนี้ |
| `fn_auto_generate_schedules` | — | Auto สร้าง schedule |
| `fn_update_draw_status` | — | อัปเดตสถานะงวด |
| `fn_close_stale_schedules` | — | ปิด schedule ค้าง |

---

### ⚡ กลุ่ม: หวยหนึ่งนาที (Instant Lottery)

| Function | Parameters | หน้าที่ |
|---|---|---|
| `fn_instant_draw` | — | สุ่มผลหวยหนึ่งนาที |
| `fn_place_instant_bet` | `p_draw_id, p_bet_type, p_numbers, p_amount` | แทงหวยหนึ่งนาที |
| `fn_settle_instant_draw` | `p_draw_id` | Settle งวดหนึ่งนาที |
| `settle_instant_draw` | `p_draw_id` | Settle (legacy) |
| `fn_get_instant_result` | `p_draw_id` | ผลงวดหนึ่งนาที |
| `fn_get_instant_bets` | — | โพยหนึ่งนาทีของตัวเอง |
| `fn_get_instant_popup` | `p_draw_id` | Popup แสดงผล |
| `fn_check_instant_win` | `p_bet_type, p_numbers, p_result_6d` | ตรวจชนะหวยหนึ่งนาที |
| `admin_get_instant_draws` | `p_limit, p_offset` | รายการงวดหนึ่งนาที |
| `admin_get_instant_bets` | `p_draw_id, p_limit, p_offset` | โพยหนึ่งนาที |
| `admin_get_instant_bet_types` | — | ประเภทเดิมพัน |
| `admin_update_instant_bet_type` | `p_id, p_name, p_rate, p_min_digits, p_max_digits, p_is_positioned` | แก้ไขประเภทเดิมพัน |
| `admin_toggle_instant_bet_type` | `p_id` | เปิด/ปิดประเภท |
| `admin_get_instant_stats` | — | สถิติหวยหนึ่งนาที |
| `process_1min_lottery` | — | Process หวยหนึ่งนาที |
| `fn_cleanup_instant_lottery_at_midnight` | — | Cleanup ตีสี่ |
| `get_spin_status` | — | สถานะการ spin |

---

### 📊 กลุ่ม: Dashboard & Analytics

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_dashboard_stats` | — | **สถิติ dashboard หลัก** |
| `admin_get_dashboard_stats` | — | สถิติ dashboard (v2) |
| `admin_dashboard_advanced_stats` | — | สถิติขั้นสูง |
| `admin_get_members` | `p_page, p_limit, p_search` | รายการสมาชิก |
| `admin_list_members` | `p_limit, p_offset, p_search` | รายการสมาชิก (v2) |

---

### 🔔 กลุ่ม: Notification System

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_broadcast_notification` | `p_title, p_body, p_type` | **Broadcast ไปทุก user** |
| `admin_delete_notification` | `p_notification_id` | ลบ notification (null = ลบทั้งหมด) |
| `fn_daily_summary_line` | — | **ส่งสรุปประจำวันทาง LINE** 🟢 |

---

### 🎡 กลุ่ม: วงล้อโชคดี (Lucky Wheel)

| Function | Parameters | หน้าที่ |
|---|---|---|
| `spin_lucky_wheel` | — | หมุนวงล้อ |
| `admin_get_wheel_config` | — | ดูการตั้งค่าวงล้อ |
| `admin_update_wheel_prize` | `p_slot_index, p_name, p_amount, p_probability, p_color, p_hi_color, p_is_active` | แก้ไขรางวัล |

---

### 🤝 กลุ่ม: Affiliate / Referral

| Function | Parameters | หน้าที่ |
|---|---|---|
| `generate_referral_link` | `p_user_id` | สร้าง referral link |
| `user_get_referral_link` | `user_id` | ดู referral link |
| `get_my_referrals` | — | referral ของฉัน |
| `user_get_my_referrals` | `user_id` | referral ของ user |
| `user_get_referral_stats` | `user_id` | สถิติ referral |
| `admin_get_referrals` | `p_limit, p_offset, status_param` | รายการ referral ทั้งหมด |
| `admin_get_referral_stats` | `start_date, end_date` | สถิติ referral ช่วงเวลา |
| `admin_get_top_referrers` | `p_limit` | top referrer |
| `admin_get_referral_settings` | — | การตั้งค่า referral |
| `admin_update_referral_settings` | `is_active, min_deposit_amount, referrer_reward_amount, referred_reward_amount` | แก้การตั้งค่า |
| `admin_toggle_referral_system` | `is_active` | เปิด/ปิด referral |
| `admin_approve_referral_reward` | `referral_id` | อนุมัติรางวัล |
| `admin_cancel_referral` | `referral_id, reason` | ยกเลิก referral |
| `check_referral_completions` | — | ตรวจ completion |
| `transfer_referral_income` | — | โอนรายได้ referral |

---

### 📢 กลุ่ม: คอนเทนต์

| Function | Parameters | หน้าที่ |
|---|---|---|
| **Slider** | | |
| `admin_get_sliders` | — | รายการ slider |
| `admin_create_slider` | `title, image_url, link_url` | สร้าง slider |
| `admin_update_slider` | `id, title, image_url, link_url` | แก้ไข slider |
| `admin_delete_slider` | `id` | ลบ slider |
| `admin_toggle_slider` | `id, is_active` | เปิด/ปิด slider |
| `admin_reorder_sliders` | `items` | เรียงลำดับ slider |
| **Banner** | | |
| `admin_get_banners` | — | รายการ banner |
| `admin_create_banner` | `title, image_url, link_url` | สร้าง banner |
| `admin_update_banner` | `id, title, image_url, link_url` | แก้ไข banner |
| `admin_delete_banner` | `id` | ลบ banner |
| `admin_toggle_banner` | `id, is_active` | เปิด/ปิด banner |
| `admin_reorder_banners` | `items` | เรียงลำดับ banner |
| **Promotion** | | |
| `admin_get_promotions` | — | รายการโปรโมชั่น |
| `admin_create_promotion` | `title, description, image_url, link_url, start_date, end_date` | สร้างโปรโมชั่น |
| `admin_update_promotion` | `id, title, description, ...` | แก้ไขโปรโมชั่น |
| `admin_delete_promotion` | `id` | ลบโปรโมชั่น |
| `admin_toggle_promotion` | `id, is_active` | เปิด/ปิดโปรโมชั่น |
| **Article** | | |
| `admin_get_articles` | `p_limit, p_offset` | รายการบทความ |
| `admin_create_article` | `title, content, image_url` | สร้างบทความ |
| `admin_update_article` | `id, title, content, image_url` | แก้ไขบทความ |
| `admin_delete_article` | `id` | ลบบทความ |
| `admin_toggle_article` | `id, is_active` | เปิด/ปิดบทความ |
| **Announcement** | | |
| `admin_get_announcements` | — | รายการประกาศ |
| `admin_create_announcement` | `title, content, expiry_date` | สร้างประกาศ |
| `admin_update_announcement` | `id, title, content, expiry_date` | แก้ไขประกาศ |
| `admin_delete_announcement` | `id` | ลบประกาศ |
| `admin_toggle_announcement` | `id, is_active` | เปิด/ปิดประกาศ |
| **FAQ** | | |
| `admin_get_faqs` | `category_param` | รายการ FAQ |
| `admin_create_faq` | `question, answer, category` | สร้าง FAQ |
| `admin_update_faq` | `id, question, answer, category` | แก้ไข FAQ |
| `admin_delete_faq` | `id` | ลบ FAQ |
| `admin_toggle_faq` | `id, is_active` | เปิด/ปิด FAQ |
| `admin_reorder_faqs` | `items` | เรียงลำดับ FAQ |
| **Page** | | |
| `admin_get_pages` | — | รายการหน้า |
| `admin_create_page` | `slug, title, content` | สร้างหน้า |
| `admin_update_page` | `id, slug, title, content` | แก้ไขหน้า |
| `admin_delete_page` | `id` | ลบหน้า |
| `admin_toggle_page` | `id, is_active` | เปิด/ปิดหน้า |
| `admin_reorder_pages` | `items` | เรียงลำดับหน้า |
| **Testimonial** | | |
| `admin_get_testimonials` | — | รายการ testimonial |
| `admin_approve_testimonial` | `id` | อนุมัติ testimonial |
| `admin_reject_testimonial` | `id` | ปฏิเสธ testimonial |
| `admin_delete_testimonial` | `id` | ลบ testimonial |
| `admin_toggle_testimonial` | `id, is_active` | เปิด/ปิด testimonial |

---

### 📈 กลุ่ม: Trending Items & Market Display

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_get_trending_items_by_display` | `p_display_type` | Trending items ตาม display type |
| `admin_upsert_trending_item` | `p_id, p_title, p_code, p_image_url, p_link, p_category, p_display_order, p_is_active, p_show_in_trending, p_show_in_popular` | Create/Update trending item |
| `admin_toggle_trending_item` | `p_id, p_is_active` | เปิด/ปิด trending |
| `admin_delete_trending_item` | `p_id` | ลบ trending item |
| `admin_swap_trending_items_order` | `p_id1, p_id2` | สลับลำดับ |
| `admin_set_trending_item_display` | `p_id, p_category, p_show_in_trending, p_show_in_popular` | ตั้งค่าการแสดง |
| `admin_get_markets_by_display` | `p_display_type` | ตลาดตาม display |
| `admin_set_market_display` | `p_id, p_show_in_trending, p_show_in_popular` | ตั้งค่า display ตลาด |

---

### ⚙️ กลุ่ม: Settings & Configuration

| Function | Parameters | หน้าที่ |
|---|---|---|
| `admin_upsert_setting` | `p_key, p_value` | บันทึก/แก้ไข setting |
| `admin_cleanup_storage` | — | เคลียร์ข้อมูลเก่า |
| `fn_cleanup_old_data` | `p_notifications_keep_days, p_results_keep_days, p_schedules_keep_days, p_spins_keep_days` | Cleanup ละเอียด |
| `rls_auto_enable` | — | Auto enable RLS |
| `admin_get_social_media` | — | Social media links |
| `admin_update_social_media` | `platform, url` | แก้ไข social link |
| `admin_toggle_social_media` | `platform, is_active` | เปิด/ปิด social |
| `admin_get_banks` | — | รายการธนาคาร |
| `admin_create_bank` | `name, account_name, account_number, branch, qr_code_url` | เพิ่มธนาคาร |
| `admin_update_bank` | `id, name, account_name, account_number, branch, qr_code_url` | แก้ไขธนาคาร |
| `admin_delete_bank` | `id` | ลบธนาคาร |
| `admin_toggle_bank` | `id, is_active` | เปิด/ปิดธนาคาร |

---

## 🌍 ข้อมูลตลาดหวย (Live Data)

| ตลาด | Code | หมวด | สถานะ |
|---|---|---|---|
| หวยรัฐบาลไทย | `TH_GOV` | GOV | ✅ |
| ฮานอยปกติ | `HANOI` | FOREIGN | ✅ |
| ลาวพัฒนา | `LAO` | FOREIGN | ✅ |
| หวยมาเลย์ | `MALAY` | FOREIGN | ✅ |
| หุ้นนิเคอิเช้า | `NIKKEI_MORNING` | STOCK | ✅ |
| หุ้นฮั่งเส็งบ่าย | `HANGSENG_AFTERNOON` | STOCK | ✅ |
| หุ้นอินเดีย | `STOCK_INDIA` | STOCK | ✅ |
| หุ้นเยอรมัน | `STOCK_GERMANY` | STOCK | ✅ |
| หุ้นดาวน์โจนส์ | `STOCK_DOWJONES` | STOCK | ✅ |

---

## 🏦 ธนาคารที่รองรับ (Live Data)

KBANK · SCB · BBL · KTB · GSB · BAY · TTB

---

## 🎁 โปรโมชั่นที่ Active (Live Data)

| ชื่อ | ประเภท |
|---|---|
| สมัครใหม่ | `deposit` |
| แนะนำเพื่อน | `referral` |
| โปรวันเกิด | `special` |
| แทงผิด 10 งวด | `special` |

---

## 🔑 สรุปการตั้งค่า System (Live Settings)

| Key | ค่า |
|---|---|
| `site_name` | TH-LOTTO |
| `system_status` | ONLINE |
| `deposit_enabled` | TRUE |
| `withdraw_enabled` | TRUE |
| `min_deposit` | 100 |
| `min_withdraw` | 100 |
| `lucky_wheel_enabled` | TRUE |
| `line_notify_enabled` | **true** ✅ |
| `line_notify_win_threshold` | 5000 |
| `contact_line_url` | https://lin.ee/zQAyRsM |
| `contact_line_id` | @653ufkvi |
