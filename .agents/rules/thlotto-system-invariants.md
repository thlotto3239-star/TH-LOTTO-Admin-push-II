# THLOTTO-II System Invariants

## 1. Authentication & PIN Standards
- **PIN Length:** PIN is strictly **6 digits** across all customer and admin flows (Registration, Profile Edit, Change PIN, Withdrawal Confirmation).
- **Withdrawal PIN Modal:** The modal in `Withdrawal.jsx` MUST display exactly 6 digit boxes (`[0, 1, 2, 3, 4, 5]`), accept `maxLength={6}`, and require 6 digits to submit.

## 2. Bank Information Architecture
- **Primary Member Bank Data:** Stored directly in the `profiles` table (`bank_name`, `bank_account_number`, `bank_account_name`).
- **Profile Fetching:** `fetchProfile()` in `authService.js` MUST select `bank_name, bank_account_number, bank_account_name` directly from `profiles`. Do NOT omit these fields or redirect basic user bank lookups to unpopulated secondary tables.
