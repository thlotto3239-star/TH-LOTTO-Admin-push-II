# Changelog

All notable changes to the **THLOTTO-II** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
