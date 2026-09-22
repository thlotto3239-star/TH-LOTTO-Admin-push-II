# 🏛️ THLOTTO-II — MASTER SYSTEM BLUEPRINT & CANONICAL SPECIFICATION
**Version:** 3.1 (Latest Canonical Production Release)  
**Standard:** ARM AI Engineering Standard (ARM-AES v1.0)  
**Last Updated:** 2026-09-20  
**Status:** 🔒 CANONICAL SINGLE SOURCE OF TRUTH (SSOT) — ห้ามแก้ไขโดยไม่ผ่านการอนุมัติ

---

## 📌 บทนำและคำประกาศมาตรฐาน (Canonical Governance Rule)
เอกสารฉบับนี้คือ **"พิมพ์เขียวระบบแม่บทฉบับสมบูรณ์ (Master Blueprint)"** ที่ครอบคลุมทุกโมดูล ทุกหน้าจอ ทุกปุ่ม ทุกตารางฐานข้อมูล ทุกฟังก์ชัน และทุกเงื่อนไขความปลอดภัยของระบบ **THLOTTO-II**

> ⚠️ **กฎเหล็กสำหรับ AI Agents, Developers และ QA Engineers ทุกคน:**
> 1. **ห้ามเดาหรือสมมุติโครงสร้าง:** ห้ามอ้างอิงโค้ดเก่าในอดีต หรือเอกสารใน `docs/legacy/` ทุกการพัฒนา แก้ไข หรือทดสอบ ต้องยึดถือข้อมูลในเอกสารนี้เป็นหลักความจริงหนึ่งเดียว (Single Source of Truth)
> 2. **ความสมบูรณ์ระดับ 100%:** เอกสารนี้ถูกตรวจสอบเทียบกับ Live Supabase Database (`ygopnjbvccenryejqmlw`), Next.js Admin Backend และ Vite Customer Application จริง

---

## สารบัญโครงสร้างพิมพ์เขียว (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมและโครงสร้างพื้นฐาน (System Topology & Tech Stack)](#1-ภาพรวมสถาปัตยกรรมและโครงสร้างพื้นฐาน-system-topology--tech-stack)
2. [พจนานุกรมและโครงสร้างฐานข้อมูล 39 ตารางจริง (Live Database Data Dictionary)](#2-พจนานุกรมและโครงสร้างฐานข้อมูล-39-ตารางจริง-live-database-data-dictionary)
3. [สารบัญและข้อกำหนดหน้าจอฝั่งผู้เล่น 35 หน้า (Customer Application 35 Pages Spec)](#3-สารบัญและข้อกำหนดหน้าจอฝั่งผู้เล่น-35-หน้า-customer-application-35-pages-spec)
4. [สารบัญและข้อกำหนดหน้าจอฝั่งแอดมิน 22 โมดูล (Admin Application 22 Modules Spec)](#4-สารบัญและข้อกำหนดหน้าจอฝั่งแอดมิน-22-โมดูล-admin-application-22-modules-spec)
5. [สารบัญสัญญาสโตนโพรซีเยอร์และตรรกะการเงิน (PostgreSQL RPC & Atomic Engines)](#5-สารบัญสัญญาสโตนโพรซีเยอร์และตรรกะการเงิน-postgresql-rpc--atomic-engines)
6. [เมทริกซ์ 37 ตลาดหวยและ 24 รูปแบบการแทง (37 Lottery Markets & Bet Matrix)](#6-เมทริกซ์-37-ตลาดหวยและ-24-รูปแบบการแทง-37-lottery-markets--bet-matrix)
7. [ระบบสื่อสารเรียลไทม์ (Supabase Realtime Channel Architecture)](#7-ระบบสื่อสารเรียลไทม์-supabase-realtime-channel-architecture)
8. [เมทริกซ์สิทธิ์และความปลอดภัย (Role & Security Access Control Matrix)](#8-เมทริกซ์สิทธิ์และความปลอดภัย-role--security-access-control-matrix)
9. [กรอบการทดสอบและประกันคุณภาพทั้งระบบ (Full System QA Test Suite)](#9-กรอบการทดสอบและประกันคุณภาพทั้งระบบ-full-system-qa-test-suite)
10. [แนวทางการดูแลรักษาและการพัฒนาต่อยอด (Maintenance & Engineering Guidelines)](#10-แนวทางการดูแลรักษาและการพัฒนาต่อยอด-maintenance--engineering-guidelines)

---

## 1. ภาพรวมสถาปัตยกรรมและโครงสร้างพื้นฐาน (System Topology & Tech Stack)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             THLOTTO-II SYSTEM TOPOLOGY                           │
└──────────────────────────────────────────────────────────────────────────────────┘

 [ 1. FRONTEND USER APP ]         [ 2. ADMIN PORTAL ]            [ 3. CRON & BOT ]
 https://lotto-th-customer.vercel.app  https://th-lotto-admin-push-ii.vercel.app  Edge Functions / Schedulers
 ├── Framework: Vite 8 + React 19  ├── Framework: Next.js 16 + React 19       └── Auto Draw Engine
 ├── State: React Context + Custom ├── Routing: App Router (SSR + API Routes) └── Settle Bets Worker
 ├── Styling: Tailwind CSS 4       ├── Styling: Tailwind CSS + Lucide Icons
 ├── Repo: thlotto-premium         ├── Repo: TH-LOTTO-Admin-push-II
 └── Remote: origin                └── Remote: admin-deploy
           │                                 │                               │
           ▼                                 ▼                               ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │               4. DATABASE & BACKEND AS A SERVICE (BaaS)                         │
 │               Supabase Cloud Project: ygopnjbvccenryejqmlw                      │
 │  ├── PostgreSQL 15 Database (39 Tables, Normalized, Strict Constraints)         │
 │  ├── Row-Level Security (RLS) & Role Separation                                 │
 │  ├── GoTrue Auth (Google OAuth 2.0 + Phone/6-Digit PIN Hash SHA-256)            │
 │  ├── Realtime WebSocket Replication Channels (Postgres Changes)                 │
 │  └── Atomic Stored Procedures with Row-Level Locking ('FOR UPDATE')            │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. พจนานุกรมและโครงสร้างฐานข้อมูล 41 ตารางและวิวจากระบบจริง (Live Database Data Dictionary)

| # | ชื่อตาราง/วิว (Table/View Name) | หน้าที่และความรับผิดชอบ (Function & Purpose) | คีย์หลัก / Foreign Keys |
|---|---|---|---|
| 1 | `profiles` | **Single Source of Truth (SSOT)** ข้อมูลสมาชิก, เบอร์โทร, ชื่อนามสกุล, บัญชีธนาคารหลัก (`bank_name`, `bank_account_number`, `bank_account_name`), PIN hash SHA-256 (6 หลัก), สิทธิ์แอดมิน (`is_admin`, `admin_role`, `admin_permissions`), ระดับ VIP, สถานะ | `id` (PK), `member_id` (Unique) |
| 2 | `wallets` | กระเป๋าเงินหลัก (`balance`), ยอดคอมมิชชั่น (`commission_balance`), ยอดเทิร์นโอเวอร์ (`turnover_required`, `turnover_completed`), โปรโมชั่นที่ใช้งาน (`active_promo_id`) | `id` (PK), `user_id` (FK -> profiles.id) |
| 3 | `transactions` | ประวัติการเงินทุกประเภท (ฝาก, ถอน, ปรับยอด, คืนเงิน, ได้รางวัล, จ่ายค่าหวย) | `id` (PK), `user_id` (FK), `reference_id` |
| 4 | `deposit_requests` | คำขอฝากเงิน, จำนวนเงิน, สลิปโอนเงิน (`slip_url`), สถานะ, หมายเหตุแอดมิน, โปรโมชั่น | `id` (PK), `user_id` (FK -> profiles.id) |
| 5 | `withdraw_requests` | คำขอถอนเงิน, จำนวนเงิน, ข้อมูลบัญชีผู้รับ (`bank_name`, `bank_account_number`, `bank_account_name`), สถานะ, หมายเหตุแอดมิน | `id` (PK), `user_id` (FK -> profiles.id) |
| 6 | `settings` | **SSOT ตั้งค่าระบบทั้งหมด:** บัญชีธนาคารบริษัท (`company_bank_code`, `company_bank_account_number`, `company_bank_account_name`, `bank_qr_url`), เกณฑ์การเงิน (`min_deposit`, `min_withdraw`, `default_turnover_multiplier`), ป๊อปอัป, LINE Notify, ธีม | `key` (PK) |
| 7 | `banks` | รายชื่อธนาคารหลักในประเทศไทยที่รองรับ (8 แห่ง) พร้อมโค้ด รูปภาพ และสวิตช์เปิด/ปิด | `id` (PK), `code` (Unique) |
| 8 | `lottery_markets` | 37 ตลาดหวย (หวยรัฐบาล, ฮานอย, ลาว, ยี่กี, หุ้น), สถานะเปิด-ปิด, หมวดหมู่, กติกา | `id` (PK), `code` (Unique) |
| 9 | `draw_schedules` | รอบการออกรางวัลของแต่ละตลาด, เวลารับแทง, เวลาปิดรับ, เวลาออกผล, สถานะ | `id` (PK), `market_id` (FK) |
| 10 | `payout_rates` | อัตราจ่ายเงินรางวัล 334 รายการ สำหรับแต่ละตลาดและประเภทการแทง | `id` (PK), `market` |
| 11 | `restricted_numbers` | รายการเลขอั้น (ไม่รับแทง) และเลขจ่ายครึ่ง ประจำงวด | `id` (PK), `market_id` (FK) |
| 12 | `bets` | โพยแทงหวยรอบปกติ/15 นาที, ตัวเลข (`numbers`), ประเภทการแทง, ยอดเงิน, อัตราจ่าย, ยอดรางวัล, สถานะ | `id` (PK), `user_id` (FK), `market_id` (FK) |
| 13 | `instant_bet_types` | 9 รูปแบบประเภทการแทงหวยสปีด 1 นาที พร้อมอัตราจ่ายและเงื่อนไข | `id` (PK), `code` (Unique) |
| 14 | `instant_bets` | โพยการแทงหวยสปีด 1 นาที คำนวณผลและจ่ายเงินรางวัลทันที | `id` (PK), `user_id` (FK), `draw_id` (FK) |
| 15 | `instant_draws` | รอบการออกรางวัลหวยสปีด 1 นาที พร้อมผลสุ่ม 6D และ 2 ตัวล่าง | `id` (PK), `draw_id` (Unique) |
| 16 | `lottery_results` | ผลรางวัลหวยรอบปกติที่ออกอย่างเป็นทางการ (3 ตัวบน, 2 ตัวล่าง, 3 ตัวหน้า, 3 ตัวล่าง) | `id` (PK), `market_id` (FK) |
| 17 | `promotions` | รายการโปรโมชั่นหลัก พร้อมโบนัส, ตัวคูณเทิร์นโอเวอร์ (`turnover_multiplier`), เงื่อนไข และรูปภาพ | `id` (PK), `promo_code` |
| 18 | `sliders` | แบนเนอร์สไลด์หน้าแรก (รูปภาพ Desktop/Mobile, ลิงก์, ลำดับ Priority, สถานะ) | `id` (PK) |
| 19 | `articles` | บทความ ข่าวสาร เคล็ดลับหวยและแนวทางตัวเลข (SEO slug, Rich Content, หมวดหมู่) | `id` (PK) |
| 20 | `announcements` | ข้อความประกาศตัววิ่ง (Marquee Ticker) และข่าวด่วนหน้าแรก | `id` (PK) |
| 21 | `lucky_wheel_prizes` | 8 ช่องของรางวัลบนวงล้อเสี่ยงโชค พร้อมน้ำหนัก Probability %, สี, และจำนวนเงิน | `id` (PK), `slot_index` |
| 22 | `lucky_wheel_spins` | ประวัติการหมุนวงล้อของผู้เล่นและรางวัลที่ได้รับ | `id` (PK), `user_id` (FK) |
| 23 | `referrals` | ประวัติการแนะนำเพื่อน, ผู้แนะนำ, ผู้ถูกแนะนำ, โค้ด, สถานะการจ่ายรางวัล | `id` (PK), `referrer_id` (FK) |
| 24 | `referral_settings` | การตั้งค่าระบบแนะนำเพื่อน อัตราส่วนแบ่ง และยอดฝากขั้นต่ำ | `id` (PK) |
| 25 | `user_referral_codes` | โค้ดแนะนำเพื่อนของสมาชิกแต่ละคน พร้อมสถิติยอดผู้สมัครและยอดรับรางวัลรวม | `id` (PK), `user_id` (FK) |
| 26 | `notifications` | การแจ้งเตือนส่วนบุคคล (ผลหวย, เงินเข้า, ถอนสำเร็จ, รีเซ็ต PIN, บรอดแคสต์) | `id` (PK), `user_id` (FK) |
| 27 | `login_attempts` | ประวัติการเข้าสู่ระบบ บันทึก IP, User Agent, อุปกรณ์, เมือง, ละติจูด, ลองจิจูด สำหรับระบบแผนที่ Geo & Device | `id` (PK), `phone` |
| 28 | `admin_roles` | บทบาทและกลุ่มสิทธิ์การใช้งานของผู้ดูแลระบบ | `id` (PK), `name` (Unique) |
| 29 | `admin_permissions` | รายละเอียดสิทธิ์เฉพาะของแอดมินแต่ละคน | `id` (PK), `admin_id` (FK) |
| 30 | `admin_notifications` | การแจ้งเตือนสำหรับผู้ดูแลระบบ (คำขอฝากใหม่, คำขอถอนใหม่) | `id` (PK) |
| 31 | `user_suspensions` | บันทึกการระงับการใช้งานบัญชีสมาชิกและสาเหตุ | `id` (PK), `user_id` (FK) |
| 32 | `trending_items` | รายการตลาดหรือสินค้าที่แสดงในหมวดหมู่นิยมและมาแรง | `id` (PK), `code` |
| 33 | `backup_logs` | ประวัติการสำรองข้อมูลฐานข้อมูล | `id` (PK) |
| 34 | `cms_banners` | แบนเนอร์ระบบ CMS | `id` (PK) |
| 35 | `cms_pages` | หน้าเพจระบบ CMS | `id` (PK), `slug` (Unique) |
| 36 | `cms_promotions` | โปรโมชั่นระบบ CMS | `id` (PK) |
| 37 | `cms_faq` | คำถามที่พบบ่อย (FAQs) ในระบบ CMS | `id` (PK) |
| 38 | `cms_social_media` | ลิงก์โซเชียลมีเดียในระบบ CMS | `id` (PK) |
| 39 | `cms_testimonials` | รีวิวและความคิดเห็นของผู้ใช้งาน | `id` (PK) |
| 40 | `v_open_markets` | วิว (Database View) สำหรับดึงตลาดที่กำลังเปิดรับแทงแบบเรียลไทม์ | View |
| 41 | `v_latest_results` | วิว (Database View) สำหรับดึงผลรางวัลล่าสุดของทุกตลาด | View |

---

## 3. สารบัญและข้อกำหนดหน้าจอฝั่งผู้เล่น 35 หน้า (Customer Application 35 Pages Spec)

| # | หน้าจอ / ไฟล์ (Page Path) | ฟังก์ชันและความรับผิดชอบหลัก (Core Functionality) | Data Sources & RPCs |
|---|---|---|---|
| 1 | `Home.jsx` (`/`) | หน้าแรก: แบนเนอร์สไลด์, ตัววิ่ง Marquee, ตลาดหวยยอดนิยม, ทางลัดเมนู, ข่าวสาร | `sliders`, `announcements`, `lottery_markets` |
| 2 | `LotteryList.jsx` (`/lottery`) | รายการตลาดหวยทั้งหมด 37 ตลาด จัดกลุ่มหมวดหมู่ พร้อมตัวจับเวลานับถอยหลัง | `lottery_markets`, `draw_schedules` |
| 3 | `Betting.jsx` (`/betting/:marketId`) | หน้าแทงหวยมาตรฐาน: แผงตัวเลข 2 ตัว, 3 ตัว, วิ่ง, ปรับราคา, ส่งโพย, ตรวจเลขอั้น | `lottery_markets`, `payout_rates`, `restricted_numbers`, `submit_bet()` |
| 4 | `Lotto15M.jsx` (`/lotto-15m`) | หน้าหวยรอบพิเศษ 15 นาที พร้อม Live Studio Stream, นับถอยหลัง และประวัติ | `draw_schedules`, `lottery_results`, `bets` |
| 5 | `InstantLottery.jsx` (`/instant`) | หวยสปีด 1 นาที: สุ่มผลแบบ Provably Fair คิดเงินทันที มีเสียงเอฟเฟกต์ | `instant_bets`, `wallets`, `place_instant_bet()` |
| 6 | `Deposit.jsx` (`/deposit`) | หน้าฝากเงิน: เลือกบัญชีธนาคารบริษัท, ระบุจำนวนเงิน, เลือกโปรโมชั่น | `company_bank_accounts`, `financial_settings`, `promotions` |
| 7 | `QRPayment.jsx` (`/deposit/qr`) | หน้าสร้าง PromptPay QR Code อัตโนมัติพร้อมเวลานับถอยหลัง 10 นาที | `deposit_requests` |
| 8 | `UploadSlip.jsx` (`/deposit/upload`) | อัปโหลดสลิปการโอนเงินเพื่อส่งคำขอฝากให้แอดมินอนุมัติ | `deposit_requests`, Supabase Storage (`slips`) |
| 9 | `DepositSuccess.jsx` (`/deposit/success`) | หน้าจอแจ้งผลการส่งคำขอฝากเงินสำเร็จ | `deposit_requests` |
| 10 | `Withdrawal.jsx` (`/withdrawal`) | หน้าถอนเงิน: ตรวจสอบยอดคงเหลือ, เช็กเทิร์นโอเวอร์, ระบุจำนวนเงินถอน, แสดงบัญชีธนาคารผู้รับจาก `profiles` ผ่าน `BankBadge`, ยืนยันด้วยรหัส PIN 6 หลัก | `wallets`, `profiles`, `financial_settings`, `request_withdrawal_securely()` |
| 11 | `WithdrawalConfirm.jsx` (`/withdrawal/confirm`) | หน้ายืนยันและแสดงสลิปคำขอถอนเงินสำเร็จพร้อมรายละเอียดธนาคาร | `withdraw_requests` |
| 12 | `Wallet.jsx` (`/wallet`) | กระเป๋าเงินรวม: ยอดเครดิต, ยอดคอมมิชชั่น, ทางลัดฝาก-ถอน, ประวัติล่าสุด | `wallets`, `transactions` |
| 13 | `Transactions.jsx` (`/transactions`) | ประวัติรายการฝาก-ถอน-โอนเงินทั้งหมด พร้อมตัวกรองประเภทและสถานะ | `transactions` |
| 14 | `BetHistory.jsx` (`/history`) | ประวัติโพยหวยที่แทง: บิลที่รอผล, บิลที่ถูกรางวัล, บิลที่ไม่ถูก, รายละเอียดย่อย | `bets`, `bet_items` |
| 15 | `Results.jsx` (`/results`) | ตรวจผลรางวัลหวยย้อนหลังทุกประเภท เลือกตามวันที่และงวด | `lottery_results`, `lottery_markets` |
| 16 | `LuckyWheel.jsx` (`/wheel`) | มินิเกมวงล้อลุ้นโชค: หมุนวงล้อลุ้นรางวัลเครดิตฟรีและแต้มสะสม | `lucky_wheel_rewards`, `spin_lucky_wheel()` |
| 17 | `Affiliate.jsx` (`/affiliate`) | ระบบแนะนำเพื่อน: ลิงก์สมัคร, สถิติผู้สมัคร, ส่วนแบ่งคอมมิชชั่น, การถอนรายได้ | `referrals`, `wallets` |
| 18 | `BankAccount.jsx` (`/bank-account`) | จัดการผูกบัญชีธนาคารสำหรับรับเงินถอน (ดึงและซิงก์จาก `profiles` โดยตรง) | `profiles`, `banks` |
| 19 | `Profile.jsx` (`/profile`) | ข้อมูลบัญชีผู้ใช้, ระดับ VIP, แสดงข้อมูลธนาคารและสถานะรหัส PIN 6 หลัก | `profiles`, `wallets` |
| 20 | `EditProfile.jsx` (`/profile/edit`) | แก้ไขข้อมูลส่วนตัว เช่น ชื่อนามสกุล และรหัส PIN 6 หลัก (`/^[0-9]{6}$/`) | `profiles`, `BankSelector` |
| 21 | `ChangePassword.jsx` (`/change-password`) | เปลี่ยนรหัส PIN 6 หลักเพื่อความปลอดภัยในการเข้าสู่ระบบและการถอนเงิน | `profiles`, Supabase Auth |
| 22 | `ForgotPassword.jsx` (`/forgot-password`) | กู้คืนรหัสผ่าน 3 ขั้นตอน: ระบุเบอร์โทร ➔ ยืนยันเลขบัญชีธนาคาร ➔ ตั้งรหัส PIN 6 หลักใหม่ | `profiles`, `authService` |
| 23 | `Login.jsx` (`/login`) | เข้าสู่ระบบด้วย เบอร์โทร/PIN 6 หลัก, หรือ Google OAuth | `profiles`, `login_attempts` |
| 24 | `Register.jsx` (`/register`) | สมัครสมาชิกใหม่: ข้อมูลส่วนตัว + PIN 6 หลัก ➔ ผูกบัญชีธนาคาร (รหัสตัวพิมพ์ใหญ่ `KBANK`, auto-fill ชื่อบัญชี) บันทึกลง `profiles` | `profiles`, `wallets`, `referrals`, `banks` |
| 25 | `RegistrationSuccess.jsx` (`/register/success`) | หน้าต้อนรับสมาชิกใหม่พร้อมรับโบนัสเริ่มต้น | `profiles`, `promotions` |
| 26 | `Notifications.jsx` (`/notifications`) | กล่องข้อความแจ้งเตือนส่วนบุคคลและประกาศจากระบบ | `notifications`, `broadcast_messages` |
| 27 | `Promotions.jsx` (`/promotions`) | หน้ารวมโปรโมชั่นทั้งหมด พร้อมปุ่มกดรับสิทธิ์ | `promotions` |
| 28 | `Articles.jsx` (`/articles`) | หน้ารวมบทความ ข่าวสาร เลขเด็ด และแนวทางหวย | `articles` |
| 29 | `ArticleDetail.jsx` (`/articles/:slug`) | หน้าอ่านเนื้อหาบทความแบบละเอียด พร้อมปุ่มแชร์ | `articles` |
| 30 | `Support.jsx` (`/support`) | ติดต่อฝ่ายบริการลูกค้า (LINE Official, Telegram, Call Center) | `contact_channels` |
| 31 | `Terms.jsx` (`/terms`) | ข้อกำหนดและเงื่อนไขการใช้งานระบบ และนโยบายความเป็นส่วนตัว | `system_settings` |
| 32 | `Maintenance.jsx` (`/maintenance`) | หน้าแจ้งปิดปรับปรุงระบบชั่วคราว (แสดงเมื่อ Maintenance Mode = on) | `system_settings` |
| 33 | `Processing.jsx` (`/processing`) | หน้าจอ Loading สถานะการประมวลผลธุรกรรม | Client State |
| 34 | `Preview.jsx` (`/preview`) | หน้าตัวอย่างพรีวิวโพยก่อนส่งคำสั่งแทง | Client State |
| 35 | `DialogShowcase.jsx` (`/dialogs`) | หน้ารวม Component Modal & Dialogs มาตรฐานของระบบ | Design System |

---

## 4. สารบัญและข้อกำหนดหน้าจอฝั่งแอดมิน 22 โมดูล (Admin Application 22 Modules Spec)

| # | โมดูลแอดมิน / ไฟล์ (Admin Module) | สิทธิ์การเข้าถึง | ความรับผิดชอบและฟังก์ชันหลัก |
|---|---|---|---|
| 1 | `dashboard.tsx` | Super Admin, Staff | แดชบอร์ดสรุปยอดรวม: ยอดแทงวันนี้, ยอดฝาก-ถอนสุทธิ, กำไร/ขาดทุน, ผู้ใช้ออนไลน์ |
| 2 | `members.tsx` | Super Admin, Staff | รายชื่อสมาชิกทั้งหมด, สถานะบัญชี, ยอดเงินคงเหลือ, ระดับ VIP, ค้นหา/กรอง |
| 3 | `member-detail.tsx` | Super Admin, Staff | เจาะลึกข้อมูลสมาชิก: ประวัติแทง, บันทึกการเงิน, การปรับยอด, ประวัติ Login & Geo |
| 4 | `deposits.tsx` | **Super Admin เท่านั้น** | จัดการรายการแจ้งฝากเงิน: ตรวจสลิป, กดอนุมัติ/ปฏิเสธด้วย Atomic Stored Procedure |
| 5 | `withdrawals.tsx` | **Super Admin เท่านั้น** | จัดการคำขอถอนเงิน: ตรวจสอบประวัติแทง, กดอนุมัติโอน/ปฏิเสธและคืนเครดิตอัตโนมัติ |
| 6 | `banks.tsx` | **Super Admin เท่านั้น** | จัดการบัญชีธนาคารบริษัท, เปิด-ปิดการรับโอน, ตั้งค่ายอดฝาก-ถอนต่ำสุด/สูงสุด |
| 7 | `markets.tsx` | Super Admin, Staff | จัดการตลาดหวยทั้ง 37 ตลาด: เปิด-ปิดตลาด, ตั้งเวลาเปิด-ปิดงวด, ปรับอัตราจ่าย |
| 8 | `restricted.tsx` | Super Admin, Staff | จัดการเลขอั้น (ไม่รับแทง) และเลขจ่ายครึ่ง (ลดเปอร์เซ็นต์จ่าย) ประจำแต่ละงวด |
| 9 | `bets.tsx` | Super Admin, Staff | ตรวจสอบโพยแทงหวยทั้งหมดในระบบ, ค้นหาตามบิล/ผู้เล่น/ตลาด, ยกเลิกโพยผิดปกติ |
| 10 | `results.tsx` | Super Admin, Staff | คีย์ผลรางวัลหวยแต่ละงวด, ระบบคำนวณเงินและจ่ายผลอัตโนมัติ (Settle Draw) |
| 11 | `instant.tsx` | Super Admin, Staff | ดูประวัติและสถิติหวย 1 นาที, ตรวจสอบ Win/Loss Ratio, คอนฟิก RNG Algorithm |
| 12 | `feeds.tsx` | Super Admin, Staff | จัดการเนื้อหาตัววิ่ง (Marquee Ticker), จัดหมวดตลาด Popular / Trending |
| 13 | `sliders.tsx` | Super Admin, Staff | จัดการแบนเนอร์สไลด์หน้าแรก (อัปโหลดรูป, ลิงก์เป้าหมาย, จัดลำดับ) |
| 14 | `promotions.tsx` | Super Admin, Staff | สร้างและแก้ไขโปรโมชั่น, ตั้งเงื่อนไขโบนัส, รูปภาพ และระยะเวลาโปรโมชั่น |
| 15 | `articles.tsx` | Super Admin, Staff | เขียน/แก้ไขบทความข่าวสารและแนวทางหวย (Rich Text Editor, SEO metadata) |
| 16 | `wheel.tsx` | Super Admin, Staff | ตั้งค่าของรางวัลวงล้อเสี่ยงโชค, กำหนด Probability % การออกรางวัล, รายงานการหมุน |
| 17 | `broadcast.tsx` | Super Admin, Staff | ส่งข้อความบรอดแคสต์แบบพุช Realtime ไปยังผู้ใช้ทุกคนบนเว็บไซต์ |
| 18 | `settings.tsx` | **Super Admin เท่านั้น** | ควบคุมสวิตช์ระบบ: ปิดปรับปรุง (Maintenance Mode), บอทออกผล, ป๊อปอัปหน้าแรก |
| 19 | `appearance.tsx` | Super Admin, Staff | ปรับแต่งธีม, โลโก้, สีสัน, ฟอนต์ และการแสดงผลของหน้าเว็บ |
| 20 | `data-management.tsx` | **Super Admin เท่านั้น** | สำรองข้อมูล, ส่งออกรายงานการเงิน/บัญชี Excel, ล้างแคชระบบ |
| 21 | `admins.tsx` | **Super Admin เท่านั้น** | จัดการบัญชีแอดมิน, กำหนดบทบาท Super Admin หรือ Staff, ระงับการใช้งาน |
| 22 | `affiliate.tsx` | Super Admin, Staff | จัดการระบบพันธมิตร (แนะนำเพื่อน), ตรวจสอบค่าคอมมิชชั่น, ประวัติการจ่ายเงิน |

---

## 5. สารบัญสัญญาสโตนโพรซีเยอร์และตรรกะการเงิน (PostgreSQL RPC & Atomic Engines)

เพื่อความถูกต้อง ปลอดภัย และป้องกันปัญหา Race Condition การเงินทุกรายการจะประมวลผลผ่าน PostgreSQL Stored Procedures ด้วยการล็อกแถว (`FOR UPDATE`):

```sql
-- 1. อนุมัติการฝากเงิน (Atomic Deposit Approval)
CREATE OR REPLACE FUNCTION admin_service_approve_deposit(
    p_request_id uuid,
    p_admin_note text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_req RECORD;
    v_new_balance NUMERIC;
BEGIN
    -- ล็อกแถว deposit_requests เพื่อป้องกันการกดซ้ำ (Concurrency Lock)
    SELECT * INTO v_req FROM deposit_requests WHERE id = p_request_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'ไม่พบรายการฝากเงิน');
    END IF;
    
    IF v_req.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'รายการนี้ถูกดำเนินการไปแล้ว: ' || v_req.status);
    END IF;

    -- ล็อกและอัปเดตยอดเงินในกระเป๋า
    UPDATE wallets 
    SET balance = balance + v_req.amount, updated_at = NOW() 
    WHERE user_id = v_req.user_id 
    RETURNING balance INTO v_new_balance;

    -- อัปเดตสถานะคำขอฝาก
    UPDATE deposit_requests 
    SET status = 'approved', admin_note = p_admin_note, updated_at = NOW() 
    WHERE id = p_request_id;

    -- บันทึกประวัติ Ledger Transaction
    INSERT INTO transactions (user_id, type, amount, status, note, created_at)
    VALUES (v_req.user_id, 'deposit', v_req.amount, 'completed', COALESCE(p_admin_note, 'ฝากเงินสำเร็จ'), NOW());

    RETURN jsonb_build_object('success', true, 'message', 'อนุมัติฝากเงินสำเร็จ', 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ปฏิเสธการถอนเงินและคืนเครดิตอัตโนมัติ (Atomic Withdrawal Rejection & Refund)
CREATE OR REPLACE FUNCTION admin_service_reject_withdraw(
    p_request_id uuid,
    p_admin_note text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_req RECORD;
    v_new_balance NUMERIC;
BEGIN
    SELECT * INTO v_req FROM withdraw_requests WHERE id = p_request_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'ไม่พบรายการถอนเงิน');
    END IF;
    
    IF v_req.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'รายการนี้ถูกดำเนินการไปแล้ว: ' || v_req.status);
    END IF;

    -- คืนเงินเข้ากระเป๋าผู้ใช้
    UPDATE wallets 
    SET balance = balance + v_req.amount, updated_at = NOW() 
    WHERE user_id = v_req.user_id 
    RETURNING balance INTO v_new_balance;

    -- เปลี่ยนสถานะเป็น rejected
    UPDATE withdraw_requests 
    SET status = 'rejected', admin_note = p_admin_note, updated_at = NOW() 
    WHERE id = p_request_id;

    -- บันทึก Ledger Transaction การคืนเงิน
    INSERT INTO transactions (user_id, type, amount, status, note, created_at)
    VALUES (v_req.user_id, 'adjustment', v_req.amount, 'completed', 'คืนเครดิต: ปฏิเสธการถอนเงิน (' || COALESCE(p_admin_note, 'ไม่ระบุสาเหตุ') || ')', NOW());

    RETURN jsonb_build_object('success', true, 'message', 'ปฏิเสธการถอนและคืนเครดิตเรียบร้อย', 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ขอถอนเงินอย่างปลอดภัยด้วย PIN 6 หลักและหักเงินทันที (Atomic Secure Withdrawal with 6-Digit PIN)
CREATE OR REPLACE FUNCTION request_withdrawal_securely(
    p_amount numeric,
    p_pin_hash text
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_profile RECORD;
    v_wallet RECORD;
    v_new_balance numeric;
    v_req_id uuid;
BEGIN
    -- ตรวจสอบการยืนยันตัวตน
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'กรุณาเข้าสู่ระบบ');
    END IF;

    -- ล็อกแถวและตรวจสอบ PIN 6 หลักจาก profiles (SSOT)
    SELECT * INTO v_profile FROM profiles WHERE id = v_user_id FOR UPDATE;
    IF v_profile.pin_hash IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'NO_PIN', 'message', 'ยังไม่ได้ตั้งรหัส PIN');
    END IF;
    IF v_profile.pin_hash != p_pin_hash THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'WRONG_PIN', 'message', 'รหัสผ่าน / PIN 6 หลักไม่ถูกต้อง');
    END IF;

    -- ตรวจสอบข้อมูลบัญชีธนาคารใน profiles
    IF v_profile.bank_name IS NULL OR v_profile.bank_account_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'NO_BANK', 'message', 'กรุณาผูกบัญชีธนาคารก่อนทำรายการ');
    END IF;

    -- ตรวจสอบยอดเงินคงเหลือในกระเป๋า (Concurrency Lock)
    SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
    IF v_wallet.balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'INSUFFICIENT_BALANCE', 'message', 'ยอดเงินคงเหลือไม่เพียงพอ');
    END IF;

    -- ตัดยอดเงินคงเหลือในกระเป๋า
    UPDATE wallets
    SET balance = balance - p_amount, updated_at = NOW()
    WHERE user_id = v_user_id
    RETURNING balance INTO v_new_balance;

    -- สร้างคำขอถอนเงิน (withdraw_requests)
    INSERT INTO withdraw_requests (user_id, amount, status, created_at, updated_at)
    VALUES (v_user_id, p_amount, 'pending', NOW(), NOW())
    RETURNING id INTO v_req_id;

    -- บันทึก Ledger Transaction
    INSERT INTO transactions (user_id, type, amount, status, note, created_at)
    VALUES (v_user_id, 'withdrawal', p_amount, 'pending', 'แจ้งถอนเงิน รอดำเนินการ', NOW());

    RETURN jsonb_build_object('success', true, 'message', 'ส่งคำขอถอนเงินสำเร็จ', 'new_balance', v_new_balance, 'request_id', v_req_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.1 กฎเกณฑ์เทิร์นโอเวอร์และการถอนเงิน (Turnover & Withdrawal Governance)
1. **การฝากเงินปกติ (ไม่มีโปรโมชั่น):**
   - ค่าเริ่มต้น `default_turnover_multiplier = 0` (ไม่คิดเทิร์นโอเวอร์)
   - สมาชิกที่ฝากเงินปกติ สามารถทำรายการถอนเงินได้ทันทีโดยไม่ติดเงื่อนไขเทิร์นโอเวอร์ (`turnover_required = 0`)
2. **การฝากเงินพร้อมรับโปรโมชั่น:**
   - คิดเทิร์นโอเวอร์เฉพาะกรณีที่เลือกรับโปรโมชั่นตาม `turnover_multiplier` ของโปรโมชั่นนั้นๆ
   - เมื่อทำยอดเดิมพันสะสมครบตามกำหนด (`turnover_completed >= turnover_required`) จึงจะสามารถทำรายการถอนเงินได้
3. **การจัดการโดยผู้ดูแลระบบ (Admin Governance):**
   - แอดมินสามารถตรวจสอบสถานะเทิร์นโอเวอร์ของสมาชิกรายบุคคลได้ในหน้า `member-detail`
   - แอดมินสามารถกดปุ่ม **"ปลดล็อกเทิร์นโอเวอร์"** (`clear_turnover`) เพื่อรีเซ็ตเงื่อนไขเทิร์นโอเวอร์เป็น 0 ให้กับสมาชิกได้ทันที
   - แอดมินสามารถปรับเปลี่ยนเกณฑ์การเงินและตัวคูณเทิร์นฝากปกติได้ผ่านหน้า `banks`

### 5.2 การจัดการรหัสผ่านและ PIN 6 หลักของสมาชิกโดยแอดมิน (Admin Member PIN Reset Governance)
1. **ข้อกำหนดรหัส PIN:**
   - รหัสผ่าน/PIN ต้องเป็นตัวเลข 6 หลักถ้วน (`/^[0-9]{6}$/`)
   - ใช้งานทั้งสำหรับการเข้าสู่ระบบ (Login) และการยืนยันธุรกรรมถอนเงิน (Withdrawal Authentication)
   - การคำนวณ Hash เพื่อความปลอดภัย: ทำการเข้ารหัสด้วย SHA-256 จากค่า `pin + phone` บันทึกลงในคอลัมน์ `profiles.pin_hash`
2. **กลไกการรีเซ็ตโดยแอดมิน (Admin PIN Reset Flow):**
   - แอดมินสามารถกดปุ่ม **"PIN"** ในตารางสมาชิก (`members.tsx`) หรือกดปุ่ม **"รีเซ็ต PIN 6 หลัก"** ในหน้ารายละเอียดสมาชิก (`member-detail.tsx`)
   - ระบบแสดงโมดัลพร้อมฟังก์ชัน **สุ่มตัวเลข 6 หลัก (Random Generator)** และปุ่ม **คัดลอกรหัส (Copy to Clipboard)** เพื่อให้แอดมินส่งต่อให้สมาชิก
   - เมื่อกดยืนยัน แอดมินส่งคำขอไปที่ Next.js API Handler `/api/admin/data` ด้วย Action `reset_member_pin`
   - API ดำเนินการผ่าน Supabase Service Role Key:
     1. ตรวจสอบหมายเลขโทรศัพท์และโปรไฟล์ของสมาชิก
     2. คำนวณ SHA-256 Hash จาก `new_pin + phone`
     3. บันทึกค่า Hash ใหม่ลงใน `profiles.pin_hash`
     4. ซิงก์รหัสผ่านใหม่เข้ากับ GoTrue Auth `auth.users` ผ่าน `supabaseAdmin.auth.admin.updateUserById` เพื่อให้ผู้ใช้ล็อกอินด้วยรหัสใหม่ได้ทันที
     5. สร้างข้อความแจ้งเตือนอัตโนมัติลงในตาราง `notifications` เพื่อแจ้งเตือนสมาชิกในแอปพลิเคชัน (In-App Push Notification)

---

## 6. เมทริกซ์ 37 ตลาดหวยและ 24 รูปแบบการแทง (37 Lottery Markets & Bet Matrix)

### 6.1 รายชื่อ 37 ตลาดหวยที่รองรับ (Supported Lottery Markets)
1. **หวยไทย & สถาบันการเงิน (3):** หวยรัฐบาลไทย (`th_gov`), หวยออมสิน (`gsb`), หวย ธ.ก.ส. (`baac`)
2. **หวยเวียดนาม/ฮานอย (7):** ฮานอยปกติ (`hn_normal`), ฮานอยพิเศษ (`hn_special`), ฮานอย VIP (`hn_vip`), ฮานอยพัฒนา (`hn_dev`), ฮานอย 4D (`hn_4d`), ฮานอยกาชาด (`hn_redcross`), ฮานอยสตาร์ (`hn_star`)
3. **หวยลาว (6):** ลาวพัฒนา (`lao_dev`), ลาว VIP (`lao_vip`), ลาวสตาร์ (`lao_star`), ลาวสามัคคี (`lao_samakki`), ลาวกาชาด (`lao_redcross`), ลาว 4D (`lao_4d`)
4. **หวยรอบพิเศษ & สปีด (2):** ล็อตโต้ 15 นาที (`lotto_15m`), หวยสปีด 1 นาที (`instant_1m`)
5. **หวยหุ้นต่างประเทศ (19):** หุ้นไทยเย็น, หุ้นนิเคอิเช้า-บ่าย, หุ้นฮั่งเส็งเช้า-บ่าย, หุ้นจีนเช้า-บ่าย, หุ้นไต้หวัน, หุ้นเกาหลี, หุ้นสิงคโปร์, หุ้นอินเดีย, หุ้นอียิปต์, หุ้นรัสเซีย, หุ้นเยอรมัน, หุ้นอังกฤษ, หุ้นดาวโจนส์

### 6.2 24 รูปแบบการแทงและอัตราจ่ายมาตรฐาน (24 Bet Types & Standard Rates)
| รูปแบบการแทง (Bet Type) | คำอธิบาย (Description) | อัตราจ่ายมาตรฐาน (บาทละ) |
|---|---|---|
| `3_top` | 3 ตัวบนตรง (เลขท้าย 3 ตัวของรางวัลที่ 1 ตรงตำแหน่ง) | **900** |
| `3_tod` | 3 ตัวโต๊ด (เลข 3 ตัวสลับตำแหน่งได้) | **150** |
| `3_front` | 3 ตัวหน้าตรง (รางวัล 3 ตัวหน้า) | **450** |
| `3_bottom` | 3 ตัวล่างตรง (รางวัล 3 ตัวล่าง) | **450** |
| `2_top` | 2 ตัวบนตรง (เลขท้าย 2 ตัวของรางวัลที่ 1) | **95** |
| `2_bottom` | 2 ตัวล่างตรง (รางวัลเลขท้าย 2 ตัว) | **95** |
| `2_tod` | 2 ตัวโต๊ด (สลับตำแหน่งบน) | **14** |
| `run_top` | วิ่งบน (มีตัวเลข 1 ตัวปรากฏใน 3 ตัวบน) | **3.2** |
| `run_bottom` | วิ่งล่าง (มีตัวเลข 1 ตัวปรากฏใน 2 ตัวล่าง) | **4.2** |
| `4_direct` | 4 ตัวตรง (สำหรับหวยชุด/หวยต่างประเทศ) | **7,000** |
| `4_tod` | 4 ตัวโต๊ด (สลับตำแหน่งได้) | **250** |

---

## 7. ระบบสื่อสารเรียลไทม์ (Supabase Realtime Channel Architecture)

| Channel Name | ตารางที่จับความเปลี่ยนแปลง (Table) | เหตุการณ์ (Events) | การทำงานที่ฝั่ง Client UI |
|---|---|---|---|
| `realtime:announcements` | `announcements` | `INSERT`, `UPDATE`, `DELETE` | อัปเดตข้อความตัววิ่ง Marquee บน `AppHeader.jsx` ทันทีโดยไม่ต้องโหลดหน้าใหม่ |
| `realtime:broadcast` | `broadcast_messages` | `INSERT` | แสดง Pop-up แจ้งเตือนด่วนบนหน้าจอผู้ใช้ทุกคนพร้อมเสียงเตือน |
| `realtime:wallet:{userId}` | `wallets` | `UPDATE` | อัปเดตยอดเงินคงเหลือบน Header และ Wallet ทันทีเมื่อเงินเข้า/ออก |
| `realtime:results` | `lottery_results` | `INSERT`, `UPDATE` | แสดงผลรางวัลใหม่บนหน้า Results และอัปเดตสถานะบิลหวยทันที |
| `realtime:draw:{marketId}` | `draw_schedules` | `UPDATE` | ปรับสถานะเปิด-ปิดรับแทง และรีเซ็ตตัวนับถอยหลังงวดใหม่ |

---

## 8. เมทริกซ์สิทธิ์และความปลอดภัย (Role & Security Access Control Matrix)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE SECURITY MATRIX                            │
└────────────────────────────────────────────────────────────────────────┘
                    [SUPER ADMIN]     [STAFF]     [CUSTOMER]
 Financial Actions       ✅              ❌            ❌
 System Settings         ✅              ❌            ❌
 Admin Management        ✅              ❌            ❌
 Content & Banners       ✅              ✅            ❌
 Lottery Settle          ✅              ✅            ❌
 Place Bets              ❌              ❌            ✅
 Deposit / Withdraw      ❌              ❌            ✅
```

- **UI Guard:** Staff จะถูกซ่อนเมนู `deposits`, `withdrawals`, `banks`, `admins`, `settings`, `data-management` ออกจาก Sidebar
- **Server API Guard (`/api/admin/data`):** เมื่อมีการส่ง Action ทางการเงินหรือตั้งค่าระบบ Server จะตรวจสอบ Role จาก Admin Token หากไม่ใช่ `super_admin` จะตอบกลับ `403 Forbidden` ทันที

---

## 9. กรอบการทดสอบและประกันคุณภาพทั้งระบบ (Full System QA Test Suite)

ทีมพัฒนาและ QA ต้องดำเนินการตรวจสอบตามขั้นตอนดังนี้ก่อนการ Deploy:

1. **Auth & Forensics:**
   - [ ] Google OAuth เข้าสู่ระบบได้ทั้ง Admin / User
   - [ ] ข้อมูลใน `login_attempts` บันทึกพิกัด Client จริง (จังหวัด + GPS)
2. **Financial Concurrency:**
   - [ ] อนุมัติฝากเงินปรับยอดเงินทันที
   - [ ] ปฏิเสธถอนเงินคืนเครดิตเข้ากระเป๋าถูกต้อง
   - [ ] ยิง Request ซ้ำพร้อมกัน 10 ครั้ง รายการต้องสำเร็จเพียง 1 ครั้ง
3. **Lottery Realtime:**
   - [ ] ตัวนับถอยหลัง 37 ตลาดเดินตรงเวลา
   - [ ] หวยสปีด 1 นาที ออกผลและจ่ายเงินทันที
   - [ ] คีย์ผลรางวัลแล้วระบบคำนวณบิลจ่ายเงินอัตโนมัติ
4. **Content Sync:**
   - [ ] แก้ไขตัววิ่งในแอดมิน ➔ หน้าผู้ใช้อัปเดตทันที
   - [ ] บรอดแคสต์ข้อความเด้งเตือนผู้ใช้ Realtime
5. **Security & System Invariants (ARM-AES v1.0):**
   - [ ] รหัส PIN บังคับตัวเลข **6 หลัก** ตรงกันทุกหน้าจอ (Register, Login, Profile, EditProfile, ChangePassword, ForgotPassword, Withdrawal)
   - [ ] ข้อมูลธนาคารหลักต้องอ่านและบันทึกที่ตาราง `profiles` (`bank_name`, `bank_account_number`, `bank_account_name`) เป็น Single Source of Truth
   - [ ] Stored Procedure `request_withdrawal_securely` ตรวจสอบ PIN hash และตัดยอดเครดิตทันที
   - [ ] ปฏิบัติตาม Rule 8 (สรุปและขออนุมัติก่อนทำ) และ Rule 9 (ห้ามสมมติชื่อคอลัมน์ในฐานข้อมูล) อย่างเคร่งครัด

---

## 10. แนวทางการดูแลรักษาและการพัฒนาต่อยอด (Maintenance & Engineering Guidelines)

1. **เมื่อมีการเพิ่มหน้าจอใหม่:** ต้องลงทะเบียนในตารางพจนานุกรมในเอกสารนี้ และสร้างบันทึกใน `docs/tasks/`
2. **เมื่อมีการแก้ Schema Database:** ต้องเขียน Migration Script ผ่าน Supabase CLI / Stored Procedure และห้ามทำลายข้อมูลเดิม (Non-destructive migrations)
3. **การตรวจสอบ Build & Test:** รัน `npm run test` และ `npm run build` ในทั้ง `UI Admin` และ `UI Customer` ต้องผ่าน 0 errors ก่อน Commit & Push ทุกครั้ง
4. **การรักษาสถาปัตยกรรมหลัก (Invariants):** ห้ามเปลี่ยนระบบ PIN กลับเป็น 4 หลัก หรือย้ายการบันทึกข้อมูลธนาคารหลักออกจาก `profiles` โดยเด็ดขาด
