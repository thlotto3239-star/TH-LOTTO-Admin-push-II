# Changelog

All notable changes to the **THLOTTO-II** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.5] - 2026-09-24

### Added
- **Admin Google OAuth Automatic Sign-in & Profile Synchronization (`UI Admin/src/app/page.tsx` & `/api/admin/data/route.ts`):**
  - Implemented `oauth_admin_sync` server-side action to automatically authenticate and register any admin signing in via Gmail / Google OAuth on the Admin Portal.
  - Automatically provisions admin credentials (`is_admin: true`, `admin_role: "admin"`) with **Default Non-Financial Permissions** (`members`, `markets`, `bets`, `restricted`, `results`, `instant`, `wheel`, `sliders`, `popup`, `promotions`, `articles`, `feeds`, `appearance`, `broadcast`, `settings`, `affiliate`), strictly excluding financial modules (`deposits`, `withdrawals`, `banks`).
  - Preserves existing custom permissions and `super_admin` statuses without overwrite.
- **Admin List Query Support (`/api/admin/data?resource=admins`):**
  - Added support for loading all active administrators across roles (`super_admin`, `admin`, `staff`) with `.or("is_admin.eq.true,admin_role.in.(super_admin,admin,staff)")`.

### Changed
- **Strict Role & Navigation Permission Enforcer (`UI Admin/src/components/admin/admin-app.tsx` & `admins.tsx`):**
  - Updated `isPagePermitted` to strictly require explicit permission for financial pages (`deposits`, `withdrawals`, `banks`), preventing unauthorized staff/admin access.
  - Removed `deposits` and `withdrawals` from `DEFAULT_STAFF_PAGES` and fallback lists.
  - Updated `admins.tsx` to default newly created admins to non-financial permissions with full customizability for Super Admins.

## [3.1.4] - 2026-09-23

### Added
- **Unified 6-Digit PIN Standard Across Customer & Admin UI:**
  - Standardized customer PIN to strictly 6 numerical digits across all authentication and profile flows (`Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ChangePassword.jsx`, `EditProfile.jsx`, `Support.jsx`, `Withdrawal.jsx`).
  - Added direct admin PIN view, randomizer, and password update within `EditModal` on Admin UI (`members.tsx`, `member-detail.tsx`, `admins.tsx`, `login.tsx`), updating both Supabase Auth and `profiles.pin_hash`.
  - Stored Procedure `reset_user_password` verified on Supabase to strictly enforce 6-digit regex validation (`^\d{6}$`).
- **Authorized Test Accounts Registration (`docs/conversation_notes.md`):**
  - Documented Admin Test Account (`0622306037` / PIN: `020257`) with `super_admin` permissions.
  - Documented Customer Member Test Account (`0622306699` / PIN: `020257`), synchronized with Supabase Auth, bcrypt encrypted password, and email identity provider.

### Changed
- **Withdrawal & Deposit Action Buttons Normalization (`UI Admin/src/components/admin/pages/withdrawals.tsx` & `deposits.tsx`):**
  - Updated action buttons for PENDING transactions to `[✓ อนุมัติ]` (emerald) and `[✕ ปฏิเสธ]` (rose).
  - Normalized transaction status checks using `.toUpperCase()` to seamlessly support both `PENDING` and `pending` DB states.
  - Enhanced detail modal to show promotion terms and approver identity directly.

## [3.1.3] - 2026-09-23

### Added
- **Notification Badge & Bell Synchronized Counter (`UI Admin` & `UI Customer`):**
  - Synchronized the menu badge counters (e.g. รายการถอนเงิน, รายการฝากเงิน) with the top Bell icon (`NotificationBell`), grounded in unread notifications (`is_read: false`).
  - Implemented real-time decrementation (e.g. 3 -> 2 -> 1): clicking any unread notification in the Bell dropdown marks it as read, reduces both Bell and category menu badges in real-time, and navigates immediately to the target page.
  - Added `markRequestRead` action to auto-mark notifications as read when an admin opens the request detail modal or processes a transaction directly from the table.
  - Linked Supabase Realtime channel on `admin_notifications` and `notifications` across both Admin and Customer applications.

### Changed
- **Customer Notification Indicator (`UI Customer/src/components/AppHeader.jsx` & `DesktopSidebar.jsx`):**
  - Updated AppHeader bell and DesktopSidebar navigation to display numerical unread badges with realtime updates.
  - Enhanced `Notifications.jsx` to navigate to `action_url` and decrement unread counter upon clicking.

## [3.1.2] - 2026-09-23

### Changed
- **Deposit & Withdrawal Promotion Terms & Approver Flow (`UI Admin/src/components/admin/pages/withdrawals.tsx` & `deposits.tsx`):**
  - Fixed `DetailModal` to clearly show `ยอดโปรที่ยังค้าง: ไม่มี (ไม่ได้รับโปร)` when members have no active promo, and explicit turnover progress with full terms toggle when active.
  - Replaced all action button labels and tab text from "โอนแล้ว" to "อนุมัติ".
  - Passed `admin_id` to PostgreSQL stored procedures (`admin_service_approve_withdraw` / `admin_service_approve_deposit`) and recorded `approved_by` and approver identity.

## [3.1.1] - 2026-09-22

### Added
- **Production Withdrawal API (`UI Admin/src/app/api/admin/data/route.ts` & `UI Customer/src/pages/Withdrawal.jsx`):**
  - Implemented `create_withdrawal_request` action handling wallet deduction, bank account verification, turnover checking, `withdraw_requests` insertion, and `transactions` logging.
  - Inserted admin notifications using type `'WITHDRAW'`, resolving the PostgreSQL `admin_notifications_type_check` constraint violation.
- **Admin Direct Password / PIN Editing in Edit Modal (`UI Admin/src/components/admin/pages/members.tsx`):**
  - Integrated 6-digit password / PIN editing directly within `EditModal` for each member, allowing admins to view, randomize, and change passwords for customers on the fly.
  - Synchronized updated passwords directly to Supabase Auth (`supabaseAdmin.auth.admin.updateUserById`) and `profiles.pin_hash`.

### Changed
- **PIN Change UX Fix (`UI Customer/src/pages/ChangePassword.jsx`):**
  - Removed strict blocking validation preventing users from re-confirming their existing PIN.
  - Handled GoTrue Auth duplicate password responses smoothly to prevent deadlock.

## [3.1.0] - 2026-09-22

### Added
- **Admin PIN 6-Digit Reset System (`members.tsx` & `member-detail.tsx`):**
  - Added "PIN" button with `KeyRound` icon in members table and "รีเซ็ต PIN 6 หลัก" button in member profile detail header.
  - Added `ResetPinModal` with 6-digit randomizer generator, copy to clipboard, and confirmation.
  - Implemented `/api/admin/data` action `reset_member_pin` with SHA-256 (`pin + phone`) hashing, GoTrue Auth sync via `supabaseAdmin.auth.admin.updateUserById`, and automatic in-app notification dispatch.
- **Standards & Version Tracking:**
  - Added `VERSION.md` and `CHANGELOG.md` at root adhering to GitHub & Web Development Standards.
  - Updated `docs/SYSTEM_BLUEPRINT.md` with Section 5.2 Admin PIN Reset Governance.

### Changed
- **Deposit & Banking Reference Alignment (`UI Customer/src/pages/Deposit.jsx`):**
  - Directed company bank and deposit configuration fetching straight to `settings` (SSOT) instead of querying non-existent tables.
  - Realtime subscription updated to listen to `settings` changes.
- **Lucky Wheel Realtime Sync (`UI Customer/src/pages/LuckyWheel.jsx`):**
  - Updated realtime channel subscription to listen to the verified live table `lucky_wheel_prizes`.
- **Withdrawal & Turnover Governance (`UI Customer/src/pages/Withdrawal.jsx`):**
  - Enforced withdrawal rules: users without active promotions deposit normally without turnover restriction (`turnover_required = 0`), permitting immediate withdrawal.
  - Mapped user bank account information from `userProfile.bank_name` and `userProfile.bank_account_number` into `BankBadge`.
- **Admin Company Bank Synchronization (`UI Admin/src/app/api/admin/data/route.ts`):**
  - Hardened `upsert_company_bank` to safely keep `settings` synchronized as the canonical store.

### Verified
- Full audit of Supabase Live Database (`ygopnjbvccenryejqmlw`): 41 tables/views, 186 RPCs.
- `UI Customer` Vitest test suite: 37/37 tests passed.
- `UI Customer` Vite build: Exit code 0.
- `UI Admin` Next.js 16 Turbopack build: Exit code 0.
