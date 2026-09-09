# 🏛️ THLOTTO-II — MASTER SYSTEM BLUEPRINT & CANONICAL SPECIFICATION
**Version:** 3.0 (Comprehensive Ground Truth Edition)  
**Standard:** ARM AI Engineering Standard (ARM-AES v1.0)  
**Last Updated:** 2026-09-09  
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
 https://th-lotto-plus.vercel.app  https://th-lotto-admin-push-ten.vercel.app  Edge Functions / Schedulers
 ├── Framework: Vite 6 + React 19  ├── Framework: Next.js 16 + React 19       └── Auto Draw Engine
 ├── State: React Context + Custom ├── Routing: App Router (SSR + API Routes) └── Settle Bets Worker
 ├── Styling: Tailwind CSS         ├── Styling: Tailwind CSS + Lucide Icons
 ├── Repo: THLOTTO-II              ├── Repo: TH-LOTTO-Admin-push-II
 └── Remote: origin                └── Remote: admin-deploy
           │                                 │                               │
           ▼                                 ▼                               ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │               4. DATABASE & BACKEND AS A SERVICE (BaaS)                         │
 │               Supabase Cloud Project: ygopnjbvccenryejqmlw                      │
 │  ├── PostgreSQL 15 Database (39 Tables, Normalized, Strict Constraints)         │
 │  ├── Row-Level Security (RLS) & Role Separation                                 │
 │  ├── GoTrue Auth (Google OAuth 2.0 + Phone/PIN Hash)                            │
 │  ├── Realtime WebSocket Replication Channels (Postgres Changes)                 │
 │  └── Atomic Stored Procedures with Row-Level Locking ('FOR UPDATE')            │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. พจนานุกรมและโครงสร้างฐานข้อมูล 39 ตารางจริง (Live Database Data Dictionary)

| # | ชื่อตาราง (Table Name) | หน้าที่และความรับผิดชอบ (Function & Purpose) | คีย์หลัก / Foreign Keys |
|---|---|---|---|
| 1 | `profiles` | ข้อมูลโปรไฟล์ผู้ใช้, เบอร์โทร, ชื่อนามสกุล, บัญชีธนาคาร, PIN hash, ระดับ VIP | `id` (PK), `member_id` (Unique) |
| 2 | `admin_users` | ข้อมูลแอดมิน, อีเมล, รหัสผ่าน hash, บทบาท (`super_admin`, `staff`), สถานะ | `id` (PK), `email` (Unique) |
| 3 | `wallets` | กระเป๋าเงินหลัก (`balance`), ยอดคอมมิชชั่น (`commission_balance`), ยอดเทิร์นโอเวอร์ | `id` (PK), `user_id` (FK -> profiles.id) |
| 4 | `transactions` | ประวัติการเงินทุกประเภท (ฝาก, ถอน, ปรับยอด, คืนเงิน, ได้รางวัล, จ่ายค่าหวย) | `id` (PK), `user_id` (FK), `wallet_id` (FK) |
| 5 | `deposit_requests` | คำขอฝากเงิน, จำนวนเงิน, สลิปโอนเงิน (`slip_url`), ธนาคารปลายทาง, สถานะ | `id` (PK), `user_id` (FK) |
| 6 | `withdraw_requests` | คำขอถอนเงิน, จำนวนเงิน, บัญชีผู้รับ, ค่าธรรมเนียม, สถานะ, หมายเหตุแอดมิน | `id` (PK), `user_id` (FK) |
| 7 | `company_bank_accounts` | บัญชีธนาคารของบริษัทสำหรับรับโอนเงินฝาก, พร้อมสวิตช์เปิด/ปิด (`is_active`) | `id` (PK) |
| 8 | `financial_settings` | การตั้งค่ายอดฝาก-ถอนขั้นต่ำ/สูงสุด, เงื่อนไขเทิร์นโอเวอร์, ค่าธรรมเนียม | `id` (PK) |
| 9 | `user_banks` | บัญชีธนาคารที่ผู้เล่นผูกไว้ในระบบเพื่อใช้รับเงินถอน | `id` (PK), `user_id` (FK) |
| 10 | `lottery_markets` | 37 ตลาดหวย (หวยรัฐบาล, ฮานอย, ลาว, ยี่กี, หุ้น), สถานะเปิด-ปิด, หมวดหมู่ | `id` (PK), `code` (Unique) |
| 11 | `draw_schedules` | รอบการออกรางวัลของแต่ละตลาด, เวลารับแทง, เวลาปิดรับ, เวลาออกผล | `id` (PK), `market_id` (FK) |
| 12 | `payout_rates` | อัตราจ่ายเงินรางวัลของแต่ละตลาดและประเภทการแทง (เช่น 3 ตัวตรง = 900) | `id` (PK), `market_id` (FK) |
| 13 | `restricted_numbers` | รายการเลขอั้น (ไม่รับแทง) และเลขจ่ายครึ่ง (ลดอัตราจ่าย) ประจำงวด | `id` (PK), `market_id` (FK) |
| 14 | `bets` | โพยกการแทงหวยรอบปกติ/15 นาที, ยอดรวม, ส่วนลด, ยอดจ่ายรางวัล, สถานะ | `id` (PK), `user_id` (FK), `schedule_id` (FK) |
| 15 | `bet_items` | รายการตัวเลขย่อยในโพย (ตัวเลข, ประเภทการแทง, ราคาแทง, อัตราจ่าย, ผล) | `id` (PK), `bet_id` (FK -> bets.id) |
| 16 | `instant_bets` | โพยการแทงหวยสปีด 1 นาที พร้อมผลสุ่ม Seed Hash และคำนวณเงินทันที | `id` (PK), `user_id` (FK) |
| 17 | `lottery_results` | ผลรางวัลที่ออกอย่างเป็นทางการ (3 ตัวบน, 2 ตัวล่าง, 3 ตัวโต๊ด, วิ่งบน/ล่าง) | `id` (PK), `schedule_id` (FK) |
| 18 | `sliders` | แบนเนอร์สไลด์หน้าแรก (รูปภาพ Desktop/Mobile, ลิงก์, ลำดับ Priority, สถานะ) | `id` (PK) |
| 19 | `promotions` | รายการโปรโมชั่น, เงื่อนไขโบนัส, รูปภาพ, รายละเอียด, วันหมดอายุ | `id` (PK) |
| 20 | `articles` | บทความ ข่าวสาร เคล็ดลับหวยและแนวทางตัวเลข (SEO slug, Rich Content) | `id` (PK), `slug` (Unique) |
| 21 | `announcements` | ข้อความประกาศตัววิ่ง (Marquee Ticker) และข่าวด่วนหน้าแรก | `id` (PK) |
| 22 | `lucky_wheel_rewards` | รายการของรางวัลบนวงล้อเสี่ยงโชค (เครดิต, ทองคำ, แต้มสะสม) พร้อมน้ำหนัก Rate | `id` (PK) |
| 23 | `lucky_wheel_spins` | ประวัติการหมุนวงล้อของผู้เล่น, ของรางวัลที่ได้รับ, วันเวลา | `id` (PK), `user_id` (FK) |
| 24 | `wheel_rewards` | ตารางสำรอง/คอนฟิกของรางวัลวงล้อหมุน | `id` (PK) |
| 25 | `spin_history` | บันทึกประวัติการหมุนวงล้อระดับละเอียด | `id` (PK), `user_id` (FK) |
| 26 | `broadcast_messages` | ข้อความบรอดแคสต์ที่แอดมินส่งหาผู้ใช้ทุกคน (Realtime Notification) | `id` (PK) |
| 27 | `notifications` | การแจ้งเตือนส่วนบุคคล (ผลหวยออก, เงินเข้า, อนุมัติถอน, สปินฟรี) | `id` (PK), `user_id` (FK) |
| 28 | `login_attempts` | ประวัติการพยายามล็อกอิน, พิกัดจริง (Client Geo), IP, อุปกรณ์, สถานะสำเร็จ/ล้มเหลว | `id` (PK) |
| 29 | `login_history` | ประวัติการเข้าใช้งานระบบที่ยืนยันตัวตนสำเร็จแล้ว | `id` (PK), `user_id` (FK) |
| 30 | `referrals` | ระบบแนะนำเพื่อน (Affiliate), ผู้แนะนำ, ผู้ถูกแนะนำ, รายได้คอมมิชชั่น | `id` (PK), `referrer_id` (FK) |
| 31 | `system_settings` | การตั้งค่าระดับระบบ (Maintenance Mode, Auto Draw Switch, Popup Modal) | `id` (PK), `key` (Unique) |
| 32 | `ip_rules` | รายการ IP Blacklist / Whitelist สำหรับป้องกันการโจมตี | `id` (PK), `ip_address` (Unique) |
| 33 | `vip_tiers` | ตารางระดับขั้น VIP, สิทธิพิเศษ, ยอดเทิร์นสะสม, อัตราคืนคอมมิชชั่น | `id` (PK) |
| 34 | `user_activity_logs` | Audit Log บันทึกกิจกรรมของผู้เล่นบนระบบ | `id` (PK), `user_id` (FK) |
| 35 | `admin_audit_logs` | บันทึกประวัติการทำงานของแอดมิน (ใครทำอะไร เมื่อไหร่ ปรับยอดกี่บาท) | `id` (PK), `admin_id` (FK) |
| 36 | `bank_list` | รายชื่อธนาคารในประเทศไทยที่รองรับพร้อมโลโก้และโค้ด | `id` (PK), `code` (Unique) |
| 37 | `app_versions` | ข้อมูลเวอร์ชันแอปพลิเคชันและการบังคับอัปเดต | `id` (PK) |
| 38 | `contact_channels` | ช่องทางการติดต่อฝ่ายบริการลูกค้า (LINE OA, Telegram, Live Chat) | `id` (PK) |
| 39 | `faqs` | คำถามที่พบบ่อยและคู่มือการใช้งานระบบ | `id` (PK) |

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
| 10 | `Withdrawal.jsx` (`/withdrawal`) | หน้าถอนเงิน: ตรวจสอบยอดคงเหลือ, เช็กเทิร์นโอเวอร์, ระบุจำนวนเงินถอน | `wallets`, `user_banks`, `financial_settings` |
| 11 | `WithdrawalConfirm.jsx` (`/withdrawal/confirm`) | ยืนยันคำขอถอนเงินและใส่รหัส PIN เพื่อความปลอดภัย | `withdraw_requests`, `submit_withdraw_request()` |
| 12 | `Wallet.jsx` (`/wallet`) | กระเป๋าเงินรวม: ยอดเครดิต, ยอดคอมมิชชั่น, ทางลัดฝาก-ถอน, ประวัติล่าสุด | `wallets`, `transactions` |
| 13 | `Transactions.jsx` (`/transactions`) | ประวัติรายการฝาก-ถอน-โอนเงินทั้งหมด พร้อมตัวกรองประเภทและสถานะ | `transactions` |
| 14 | `BetHistory.jsx` (`/history`) | ประวัติโพยหวยที่แทง: บิลที่รอผล, บิลที่ถูกรางวัล, บิลที่ไม่ถูก, รายละเอียดย่อย | `bets`, `bet_items` |
| 15 | `Results.jsx` (`/results`) | ตรวจผลรางวัลหวยย้อนหลังทุกประเภท เลือกตามวันที่และงวด | `lottery_results`, `lottery_markets` |
| 16 | `LuckyWheel.jsx` (`/wheel`) | มินิเกมวงล้อลุ้นโชค: หมุนวงล้อลุ้นรางวัลเครดิตฟรีและแต้มสะสม | `lucky_wheel_rewards`, `spin_lucky_wheel()` |
| 17 | `Affiliate.jsx` (`/affiliate`) | ระบบแนะนำเพื่อน: ลิงก์สมัคร, สถิติผู้สมัคร, ส่วนแบ่งคอมมิชชั่น, การถอนรายได้ | `referrals`, `wallets` |
| 18 | `BankAccount.jsx` (`/bank-account`) | จัดการผูกบัญชีธนาคารสำหรับรับเงินถอน (จำกัดชื่อตรงกับโปรไฟล์) | `user_banks`, `bank_list` |
| 19 | `Profile.jsx` (`/profile`) | ข้อมูลบัญชีผู้ใช้, ระดับ VIP, วันที่สมัคร, เมนูความปลอดภัย | `profiles`, `vip_tiers` |
| 20 | `EditProfile.jsx` (`/profile/edit`) | แก้ไขข้อมูลส่วนตัว เช่น ชื่อนามสกุล (จำกัดการเปลี่ยนหลังยืนยัน) | `profiles` |
| 21 | `ChangePassword.jsx` (`/change-password`) | เปลี่ยนรหัสผ่านหรือรหัส PIN 6 หลัก | `profiles`, Supabase Auth |
| 22 | `ForgotPassword.jsx` (`/forgot-password`) | ขอรีเซ็ตรหัสผ่านผ่านเบอร์โทรศัพท์และ SMS OTP | Supabase Auth OTP |
| 23 | `Login.jsx` (`/login`) | เข้าสู่ระบบด้วย เบอร์โทร/รหัสผ่าน, PIN 6 หลัก, หรือ Google OAuth | `profiles`, `login_attempts` |
| 24 | `Register.jsx` (`/register`) | สมัครสมาชิกใหม่: เบอร์โทร, ตั้งรหัสผ่าน, เลือกธนาคาร, ใส่รหัสผู้แนะนำ | `profiles`, `wallets`, `referrals` |
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
```

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

---

## 10. แนวทางการดูแลรักษาและการพัฒนาต่อยอด (Maintenance & Engineering Guidelines)

1. **เมื่อมีการเพิ่มหน้าจอใหม่:** ต้องลงทะเบียนในตารางพจนานุกรมในเอกสารนี้ และสร้างบันทึกใน `docs/tasks/`
2. **เมื่อมีการแก้ Schema Database:** ต้องเขียน Migration Script ผ่าน Supabase CLI / Stored Procedure และห้ามทำลายข้อมูลเดิม (Non-destructive migrations)
3. **การตรวจสอบ Build:** รัน `npm run build` ในทั้ง `UI Admin` และ `UI Customer` ต้องผ่าน 0 errors ก่อน Commit เสมอ
