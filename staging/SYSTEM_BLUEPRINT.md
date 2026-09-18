# THLOTTO-II — MASTER SYSTEM BLUEPRINT & CANONICAL SPECIFICATION
**Version:** 4.0 (Ground Truth Engine Edition)  
**Standard:** ARM AI Engineering Standard (ARM-AES v1.0)  
**Last Updated:** 2026-09-17  
**Database:** Supabase Cloud PostgreSQL 15 (`ygopnjbvccenryejqmlw`)  
**Status:** CANONICAL SINGLE SOURCE OF TRUTH (SSOT)

---

## 1. บทนำและคำประกาศมาตรฐาน (Canonical Governance Rule)
เอกสารฉบับนี้คือ **"พิมพ์เขียวระบบแม่บทฉบับสมบูรณ์ (Master Blueprint)"** ที่สะท้อนความเป็นจริงของระบบ **THLOTTO-II** ทั้งหมด
ข้อมูลทั้งหมดในเอกสารนี้อ้างอิงตรงจาก Live Database Supabase (`ygopnjbvccenryejqmlw`), Next.js 16 Admin Backend, และ Vite 6 React 19 Customer Application

> **กฎเหล็กสำหรับ AI Agents, Developers และ QA Engineers ทุกคน:**
> 1. **ห้ามเดาหรือสมมุติโครงสร้าง:** ห้ามอ้างอิงโค้ดเก่าในอดีต หรือเอกสารใน `docs/legacy/` ห้ามประดิษฐ์ชื่อตารางหรือคอลัมน์ที่ไม่มีจริง
> 2. **การแยกโมดูลหวย 3 ระบบ:** หวย 37 ตลาดภายนอก, หวยล็อตโต้ 15 นาที, และหวย 1 นาที เป็นระบบที่แยกขาดจากกันทั้งตารางข้อมูลและ Engine การคิดผล โดยมีจุดเชื่อมเดียวคือ Shared Core Wallet
> 3. **คำศัพท์ที่ใช้:** ห้ามใช้คำว่า "หวยสปีด" ให้ใช้คำว่า **"หวย 1 นาที"** เท่านั้น
> 4. **Zero Emoji Mandate:** ห้ามใช้อีโมจิในหน้าจอผู้ใช้งานและ UI Components

---

## 2. แผนผังสถาปัตยกรรมระบบ (Architectural Topology)

```
+-----------------------------------------------------------------------------------+
|                            THLOTTO-II SYSTEM TOPOLOGY                             |
+-----------------------------------------------------------------------------------+

 [ 1. FRONTEND CUSTOMER APP ]        [ 2. ADMIN PORTAL ]           [ 3. ENGINE WORKERS ]
 Path: UI Customer/                  Path: UI Admin/               PostgreSQL Triggers & RPCs
 Framework: Vite 6 + React 19        Framework: Next.js 16 + React 19 Sync API: /api/admin/sync-results
 Repo: origin (THLOTTO-II)           Repo: admin-deploy (Admin-push) Settle Engines & Live WebSockets
          │                                   │                               │
          ▼                                   ▼                               ▼
+───────────────────────────────────────────────────────────────────────────────────+
|               4. DATABASE & BACKEND AS A SERVICE (Supabase ygopnjbvccenryejqmlw)   |
|                                                                                   |
|  [ SHARED CORE LEDGER ]                                                           |
|  profiles | wallets | wallet_transactions (source_system tagged)                  |
|  deposit_requests | withdraw_requests | bank_providers | user_banks                  |
|                                                                                   |
|  [ ENGINE 1: 37 MARKETS ]       [ ENGINE 2: LOTTO 15M ]    [ ENGINE 3: LOTTO 1M ] |
|  lottery_categories             lottery_15m_rounds (96/d)  instant_draws (1440/d) |
|  lottery_markets                lottery_15m_bets           instant_bets           |
|  lottery_bet_types              lottery_15m_bet_items      instant_bet_types      |
|  payout_rates                   lottery_15m_results        fn_draw_and_settle     |
|  lottery_locked_numbers         submit_bet_15m()           submit_bet_1m()        |
|  lottery_bets                   trg_settle_15m_result      fn_place_instant_bet   |
|  lottery_bet_items                                                                |
|  lottery_results & trigger                                                         |
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 3. พจนานุกรมและโครงสร้างฐานข้อมูล 35 ตารางจริง (Live Database Data Dictionary)

### หมวดหมู่ที่ 1: Shared Core & Platform (20 ตาราง)
| # | ชื่อตาราง | หน้าที่ความรับผิดชอบ | คีย์หลัก / ความสัมพันธ์ |
|---|---|---|---|
| 1 | `profiles` | ข้อมูลสมาชิก, เบอร์โทรศัพท์, ชื่อนามสกุล, PIN hash, ระดับ VIP | `id` (UUID PK), `member_id` |
| 2 | `wallets` | ยอดเงินคงเหลือ (`balance`), ยอดเทิร์นโอเวอร์ (`turnover_total`) | `id` (PK), `user_id` (Unique FK -> profiles.id) |
| 3 | `wallet_transactions` | บันทึกธุรกรรมการเงินทุกรายการ พร้อมแท็ก `source_system` | `id` (PK), `user_id` (FK), `source_system` |
| 4 | `deposit_requests` | คำขอฝากเงิน, จำนวนเงิน, สลิปโอน, ธนาคารปลายทาง, สถานะ | `id` (BigInt PK), `user_id` (FK) |
| 5 | `withdraw_requests` | คำขอถอนเงิน, จำนวนเงิน, ธนาคารผู้รับ, สถานะ, หมายเหตุแอดมิน | `id` (BigInt PK), `user_id` (FK), `user_bank_id` (FK) |
| 6 | `bank_providers` | รายชื่อ 10 ธนาคารในประเทศไทยที่รองรับ พร้อมโค้ดและสีประจำธนาคาร | `id` (PK), `code` (Unique) |
| 7 | `user_banks` | บัญชีธนาคารที่ผู้เล่นผูกไว้เพื่อใช้รับเงินถอน (ชื่อบัญชีตรงกับโปรไฟล์) | `id` (BigInt PK), `user_id` (FK), `bank_provider_id` (FK) |
| 8 | `company_bank_accounts` | บัญชีธนาคารบริษัทสำหรับรับโอนเงินฝาก พร้อมสวิตช์เปิด/ปิด | `id` (PK) |
| 9 | `system_settings` | การตั้งค่าระดับระบบ (Maintenance Mode, ยอดฝากถอนต่ำสุด/สูงสุด) | `id` (PK) |
| 10 | `promotions` | รายการโปรโมชั่น, เงื่อนไขโบนัส, รูปภาพ, สถานะการใช้งาน | `id` (PK) |
| 11 | `user_promotions` | ประวัติการกดรับโปรโมชั่นของผู้ใช้งาน | `id` (PK), `user_id` (FK), `promotion_id` (FK) |
| 12 | `referrals` | ระบบแนะนำเพื่อน (Affiliate), ผู้แนะนำ, สถิติและค่าคอมมิชชั่น | `id` (PK), `referrer_id` (FK), `referred_id` (FK) |
| 13 | `vip_tiers` | ตารางระดับขั้น VIP, ยอดสะสมที่ต้องการ, สิทธิพิเศษ | `id` (PK), `tier_level` |
| 14 | `notifications` | การแจ้งเตือนส่วนบุคคล (ผลหวย, เงินเข้า, อนุมัติถอน) | `id` (PK), `user_id` (FK) |
| 15 | `announcements` | ข่าวประกาศตัววิ่ง Marquee บน Header | `id` (PK) |
| 16 | `articles` | บทความ ข่าวสาร เคล็ดลับหวย (SEO slug, Content) | `id` (PK), `slug` (Unique) |
| 17 | `sliders` | แบนเนอร์สไลด์หน้าแรก (รูปภาพ Desktop/Mobile, ลิงก์) | `id` (PK) |
| 18 | `contact_channels` | ช่องทางการติดต่อบริการลูกค้า (LINE OA, Telegram) | `id` (PK) |
| 19 | `user_devices_log` | ประวัติการเข้าสู่ระบบ, อุปกรณ์, เบราว์เซอร์, IP | `id` (PK), `user_id` (FK) |
| 20 | `user_presence` | สถานะออนไลน์เรียลไทม์ของผู้ใช้งาน | `id` (PK), `user_id` (FK) |

### หมวดหมู่ที่ 2: Engine 1 — External 37 Markets (8 ตาราง)
| # | ชื่อตาราง | หน้าที่ความรับผิดชอบ | คีย์หลัก / ความสัมพันธ์ |
|---|---|---|---|
| 21 | `lottery_categories` | หมวดหมู่หวย (หวยไทย, หวยฮานอย, หวยลาว, หวยหุ้น) | `id` (PK), `slug` (Unique) |
| 22 | `lottery_markets` | ข้อมูล 37 ตลาดหวย, เวลาออกผล, เวลาปิดรับ, ลิมิตการแทง | `id` (PK), `category_id` (FK), `api_key` |
| 23 | `lottery_bet_types` | ประเภทการแทง 13 รูปแบบ (3top, 3toad, 2top, 2bottom, run_top, ฯลฯ) | `id` (PK), `name` |
| 24 | `payout_rates` | อัตราจ่ายเงินรางวัลของแต่ละตลาดและประเภทการแทง | `id` (PK), `market` (FK), `bet_type` |
| 25 | `lottery_locked_numbers` | เลขอั้น (CLOSED) และเลขจ่ายครึ่ง (HALF_PAY) ประจำงวด | `id` (PK), `market_id` (FK) |
| 26 | `lottery_bets` | โพยการแทงหวยตลาด 37 รายการ (บิลหลัก, ยอดรวม, สถานะ) | `id` (BigInt PK), `user_id` (FK), `market_id` (FK) |
| 27 | `lottery_bet_items` | รายการตัวเลขย่อยในโพย 37 ตลาด พร้อมอัตราจ่ายและผล | `id` (BigInt PK), `bet_id` (FK -> lottery_bets.id) |
| 28 | `lottery_results` | ผลรางวัลเป็นทางการ (top3, bottom2, ฯลฯ) พร้อม Trigger คำนวณเงิน | `id` (BigInt PK), `market_id` (FK), UNIQUE(`market_id`, `draw_date`, `round_number`) |

### หมวดหมู่ที่ 3: Engine 2 — Lotto 15-Minute Engine (4 ตาราง)
| # | ชื่อตาราง | หน้าที่ความรับผิดชอบ | คีย์หลัก / ความสัมพันธ์ |
|---|---|---|---|
| 29 | `lottery_15m_rounds` | 96 รอบต่อวัน (เปิดทุก 15 นาที ตลอด 24 ชม.), เวลาปิด, สถานะ | `id` (BigInt PK), `round_code` (Unique), `round_index` |
| 30 | `lottery_15m_bets` | โพยการแทงล็อตโต้ 15 นาที (บิลหลัก, ยอดรวม, สถานะ) | `id` (BigInt PK), `user_id` (FK), `round_id` (FK) |
| 31 | `lottery_15m_bet_items` | รายการตัวเลขย่อยของโพย 15 นาที พร้อมอัตราจ่ายและผลรางวัล | `id` (BigInt PK), `bet_id` (FK -> lottery_15m_bets.id) |
| 32 | `lottery_15m_results` | ผลรางวัลรอบ 15 นาที (top3, bottom2, ฯลฯ) พร้อม Trigger จ่ายเงิน | `id` (BigInt PK), `round_id` (Unique FK -> lottery_15m_rounds.id) |

### หมวดหมู่ที่ 4: Engine 3 — 1-Minute Lottery Engine (3 ตาราง)
| # | ชื่อตาราง | หน้าที่ความรับผิดชอบ | คีย์หลัก / ความสัมพันธ์ |
|---|---|---|---|
| 33 | `instant_draws` | งวดหวย 1 นาที (1,440 รอบต่อวัน), ผล 6 ตัว, 2 ตัวล่าง | `id` (BigInt PK), `draw_number` (Unique) |
| 34 | `instant_bets` | โพยการแทงหวย 1 นาที (รอบ, ประเภท, ตัวเลข, ยอดแทง, ผลชนะ) | `id` (BigInt PK), `user_id` (FK), `draw_number` |
| 35 | `instant_bet_types` | ตารางพจนานุกรม 11 รูปแบบแทงหวย 1 นาที (2top, 3top, pin, ฯลฯ) | `id` (BigInt PK), `code` (Unique) |

---

## 4. สัญญาณและสโตนโพรซีเยอร์มาตรฐาน (PostgreSQL Atomic RPCs)

### 4.1 การเงินและการจัดการแอดมิน (Shared Core Financial)
1. **`admin_service_approve_deposit(p_request_id bigint, p_admin_note text)`**
   - ล็อก `deposit_requests` และ `wallets` ด้วย `FOR UPDATE`
   - เพิ่มเงินเข้า `wallets.balance`
   - บันทึก `wallet_transactions` ด้วย `tx_type = 'DEPOSIT'` และ `source_system = 'BANKING'`
   - ส่งการแจ้งเตือนเข้า `notifications`
2. **`admin_service_approve_withdraw(p_request_id bigint, p_admin_note text)`**
   - ล็อก `withdraw_requests` ตรวจสอบสถานะ `PENDING`
   - ปรับสถานะเป็น `APPROVED`
   - ส่งการแจ้งเตือนเข้า `notifications`
3. **`admin_service_reject_withdraw(p_request_id bigint, p_admin_note text)`**
   - ล็อก `withdraw_requests` และ `wallets` ด้วย `FOR UPDATE`
   - คืนเงินเข้า `wallets.balance` อัตโนมัติ
   - บันทึก `wallet_transactions` ด้วย `tx_type = 'REFUND'` และ `source_system = 'BANKING'`
   - ปรับสถานะเป็น `REJECTED`
4. **`rpc_create_withdraw_request(p_amount numeric, p_user_bank_id bigint)`**
   - ตรวจสอบ IDOR (`WHERE id = p_user_bank_id AND user_id = auth.uid()`)
   - ล็อก `wallets` ด้วย `FOR UPDATE`, ตรวจสอบยอดเงินคงเหลือ และยอดถอนขั้นต่ำ/สูงสุด
   - หักเงินออกจาก `wallets.balance`
   - บันทึก `wallet_transactions` ด้วย `tx_type = 'WITHDRAW'` และ `source_system = 'BANKING'`
   - สร้างเรคคอร์ดใน `withdraw_requests`

### 4.2 ตลาดหวยภายนอก 37 รายการ (Engine 1: External 37 Markets)
1. **`submit_bet(p_user_id uuid, p_market_id varchar, p_draw_date date, p_round_number varchar, p_items jsonb)`**
   - ตรวจสอบตลาดเปิด และเวลาปิดรับแทง
   - ตรวจสอบความยาวตัวเลขตามประเภท (3 หลัก, 2 หลัก, 1 หลัก, 4 หลัก, 6 หลัก)
   - ตรวจสอบเลขอั้น (CLOSED) และเลขจ่ายครึ่ง (HALF_PAY) ใน `lottery_locked_numbers`
   - ล็อกกระเป๋า `wallets` ด้วย `FOR UPDATE`, หักยอดเงินรวม
   - บันทึก `wallet_transactions` ด้วย `source_system = 'EXTERNAL_37'`
   - บันทึก `lottery_bets` และ `lottery_bet_items`
2. **`place_bet_securely(p_market_id varchar, p_bets jsonb)`**
   - Wrapper ปลอดภัยสำหรับ Frontend ที่ดึง `auth.uid()` และแปลงประเภทรหัสตัวพิมพ์เล็ก/ใหญ่ อัตโนมัติ
3. **`fn_settle_lottery_result()`**
   - Trigger Function บน `lottery_results` (เมื่อ `status IN ('success', 'ANNOUNCED', 'SETTLED')`)
   - ตรวจสอบรางวัลทุกรูปแบบ (6straight, 4top, 4toad, 3top, 3toad, 3front, 3back, 2top, 2bottom, run_top, run_bottom, pin_top, pin_bottom)
   - อัปเดตสถานะบิลและปรับยอดเงินเข้ากระเป๋าพร้อมบันทึก Ledger `source_system = 'EXTERNAL_37'`

### 4.3 ล็อตโต้ 15 นาที (Engine 2: Lotto 15-Minute Engine)
1. **`submit_bet_15m(p_user_id uuid, p_round_id bigint, p_items jsonb)`**
   - ตรวจสอบสถานะรอบหวย 15 นาที จาก `lottery_15m_rounds`
   - ตรวจสอบเวลา `NOW() <= close_time`
   - ตรวจสอบความยาวตัวเลข (3 หลัก, 2 หลัก, 1 หลัก)
   - ล็อกกระเป๋า `wallets` ด้วย `FOR UPDATE`, หักยอดเงิน
   - บันทึก `wallet_transactions` ด้วย `source_system = 'LOTTERY_15M'`
   - บันทึก `lottery_15m_bets` และ `lottery_15m_bet_items`
2. **`fn_settle_15m_result()` & Trigger `trg_settle_15m_result`**
   - Trigger ทำงานทันทีเมื่อมีข้อมูลลงใน `lottery_15m_results`
   - ตรวจสอบบิลที่รอผลในรอบนั้น จ่ายเงินเข้ากระเป๋าผู้ชนะพร้อมบันทึก `source_system = 'LOTTERY_15M'`
   - อัปเดตสถานะรอบใน `lottery_15m_rounds` เป็น `SETTLED`

### 4.4 หวย 1 นาที (Engine 3: 1-Minute Lottery Engine)
1. **`submit_bet_1m(p_user_id uuid, p_draw_number bigint, p_items jsonb)`**
   - ล็อกกระเป๋า `wallets` ด้วย `FOR UPDATE`, หักยอดเงินรวม
   - บันทึก `wallet_transactions` ด้วย `source_system = 'LOTTERY_1M'`
   - บันทึกโพยลงใน `instant_bets`
2. **`fn_place_instant_bet(p_draw_id bigint, p_bet_type varchar, p_numbers text, p_amount numeric)`**
   - Wrapper คำนวณกระจายยอดแทงปักหลัก (Pin Bets) อัตโนมัติและส่งต่อให้ `submit_bet_1m`
3. **`fn_draw_and_settle_instant(p_draw_number bigint, p_result_six varchar, p_bottom2 varchar)`**
   - บันทึกผลออกรางวัลลงใน `instant_draws`
   - ตรวจผลทุกโพยในรอบนั้น ปรับยอดเงินผู้ชนะพร้อมบันทึก `source_system = 'LOTTERY_1M'`
4. **`fn_get_instant_result(p_draw_id bigint)` / `fn_get_instant_popup(p_draw_id bigint)` / `fn_get_instant_bets()`**
   - ดึงผลรางวัลย้อนหลัง, ข้อมูลป๊อปอัปแจ้งผลชนะแพ้, และประวัติการแทงของผู้ใช้

---

## 5. ตารางตรวจสอบความพร้อมและการเชื่อมโยงของระบบ (Integration Matrix)

| โมดูล | Frontend Page / Component | ตารางที่เกี่ยวข้อง | Stored Procedure / API | สถานะการตรวจสอบ |
|---|---|---|---|---|
| หวย 37 ตลาด | `Betting.jsx` | `lottery_markets`, `lottery_bets`, `lottery_results` | `place_bet_securely()`, `fn_settle_lottery_result()` | ผ่านการเชื่อมต่อและทดสอบสมบูรณ์ |
| ล็อตโต้ 15 นาที | `Lotto15M.jsx`, `Lotto15MLiveStudio.jsx` | `lottery_15m_rounds`, `lottery_15m_bets`, `lottery_15m_results` | `submit_bet_15m()`, `trg_settle_15m_result` | รองรับการแทงในตัว, ดึงผลเรียลไทม์สมบูรณ์ |
| หวย 1 นาที | `InstantLottery.jsx` | `instant_draws`, `instant_bets`, `instant_bet_types` | `fn_place_instant_bet()`, `fn_draw_and_settle_instant()` | ตารางครบ, RPCs รองรับปักหลักสมบูรณ์ |
| การเงินฝากถอน | `Deposit.jsx`, `Withdrawal.jsx` | `deposit_requests`, `withdraw_requests`, `wallets` | `rpc_create_withdraw_request()`, `admin_service_approve_*` | มีการล็อก Concurrency และ Ledger ครบถ้วน |
| แอดมิน Sync | `UI Admin/.../sync-results/route.ts` | `lottery_markets`, `lottery_results`, `lottery_15m_results` | ThaiLottoAPI -> แยก 37 ตลาด และ 15 นาที | แก้ไข Schema และแยก Engine สองระบบชัดเจน |
