# บันทึกการตรวจสอบระบบและสถานะการทำงาน (Inspection & Audit Log)
**วันที่:** 23 กันยายน 2026  
**โครงการ:** THLOTTO-II (Admin UI & Customer UI)  
**มาตรฐานอ้างอิง:** ARM-AES v1.0 & กฎข้อบังคับมาตรฐานการทำงานสำหรับเว็บแอปพลิเคชั่น

---

## 1. วัตถุประสงค์
บันทึกผลการตรวจสอบระบบจริง (Ground Truth Audit) ตามคำสั่งของผู้ใช้ โดยมุ่งเน้นการตรวจเช็คจากฐานข้อมูลและโค้ดที่มีอยู่จริง ไม่มีการคาดเดาหรือคิดไปเอง:
1. การเชื่อมต่อฐานข้อมูล Supabase Cloud
2. ฟังก์ชันการแจ้งถอนเงินของสมาชิก (Withdrawal Flow)
3. ฟังก์ชันการรีเซ็ตและเปลี่ยนรหัสผ่านของสมาชิก (Password/PIN Reset Flow)
4. การเปิดเซิร์ฟเวอร์พรีวิวสำหรับผู้ใช้เข้าตรวจสอบทั้งสองฝั่ง

---

## 2. ผลการตรวจสอบการเชื่อมต่อฐานข้อมูลจริง (Supabase Cloud)
- **Supabase Project:** `ygopnjbvccenryejqmlw` (`https://ygopnjbvccenryejqmlw.supabase.co`)
- **การทดสอบ:** ทดสอบ Query ข้อมูลจริงผ่าน Service Role Key และ REST API สำเร็จ 100%
- **จำนวนตาราง:** 39 ตารางใน schema `public` (เปิดใช้งาน RLS ครบทุกตาราง)
- **ข้อมูลสดที่สำคัญ:**
  - `profiles`: 145 แถว
  - `wallets`: 145 แถว
  - `draw_schedules`: 1,443 แถว
  - `login_attempts`: 1,030 แถว
  - `admin_notifications`: 597 แถว
  - `payout_rates`: 334 แถว
  - `transactions`: 169 แถว
  - `lottery_results`: 112 แถว
  - `settings`: 111 แถว
  - `deposit_requests`: 31 แถว
  - `withdraw_requests`: 4 แถว
  - `bets`: 5 แถว

---

## 3. ผลการตรวจสอบฟังก์ชันการแจ้งถอนเงิน (Withdrawal System)

### 3.1 ฝั่งสมาชิก (UI Customer)
- **ไฟล์:** `UI Customer/src/pages/Withdrawal.jsx`
- **ขั้นตอน:**
  1. ดึงค่ายอดถอนขั้นต่ำจาก `settings.min_withdraw` (เริ่มต้น 100 บาท)
  2. ตรวจสอบเทิร์นโอเวอร์ (`turnover_required` vs `turnover_completed`) หากยังไม่ครบจะล็อก (`TURNOVER_LOCKED`)
  3. ยืนยันรหัส PIN 6 หลัก (`pinToHash(pin)` = SHA-256)
  4. เรียก Backend Endpoint `/api/admin/data` (Action: `create_withdrawal_request` ใน `route.ts`)
  5. ตรวจสอบ PIN, ยอดคงเหลือ, และตัดยอดเงินจาก `wallets` ทันทีแบบ Atomic
  6. บันทึกคำขอลงตาราง `withdraw_requests` (สถานะ `pending`)
  7. บันทึกประวัติลง `transactions` (ประเภท `WITHDRAW`, สถานะ `PENDING`)
  8. แจ้งเตือนแอดมินลง `admin_notifications` (ประเภท `WITHDRAW`, ลิงก์ `/withdrawals`)

### 3.2 ฝั่งแอดมิน (UI Admin)
- **ไฟล์:** `UI Admin/src/app/api/admin/data/route.ts` (Action: `update_withdrawal`)
- **ขั้นตอน:**
  - **กรณีอนุมัติ (APPROVED):** เรียก Stored Procedure `admin_service_approve_withdraw(p_request_id, p_admin_note)` เปลี่ยนสถานะเป็น `APPROVED` และส่งแจ้งเตือนกลับหาลูกค้าลงตาราง `notifications`
  - **กรณีปฏิเสธ (REJECTED):** เรียก Stored Procedure `admin_service_reject_withdraw(p_request_id, p_admin_note)` คืนยอดเงินเข้ากระเป๋าของสมาชิกอัตโนมัติ และส่งแจ้งเตือนลงตาราง `notifications`

---

## 4. ผลการตรวจสอบฟังก์ชันการรีเซ็ตและเปลี่ยนรหัสผ่าน (Password / PIN)

### 4.1 กรณีสมาชิกเปลี่ยนรหัสผ่านด้วยตนเองขณะล็อกอิน
- **ไฟล์:** `UI Customer/src/pages/ChangePassword.jsx`
- **ขั้นตอน:**
  - กรอก PIN เดิม + PIN ใหม่ 6 หลัก + ยืนยัน PIN ใหม่
  - ตรวจสอบความถูกต้องและแปลงเป็น SHA-256 (`pinToPassword(phone, newPin)`)
  - อัปเดต `supabase.auth.updateUser` และ `profiles.pin_hash`
  - ส่งแจ้งเตือนแอดมินผ่าน `/api/admin/data` (Action: `notify_admin_password_change`)
- **รูปแบบการแจ้งเตือนแอดมิน:**
  - บันทึกลงตาราง `admin_notifications`:
    - `type`: `"MEMBER"`
    - `message`: `"สมาชิก {full_name/phone} ({member_id}) ได้เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว"`
    - `link_url`: `"/members"`
    - `is_read`: `false`
  - **การทำงานของแอดมิน:** เป็นการแจ้งเพื่อ **"รับทราบ (Informational Only)"** แอดมินไม่ต้องกดอนุมัติหรือยืนยันใดๆ เนื่องจากรหัสผ่านมีผลบังคับใช้ทันที

### 4.2 กรณีสมาชิกลืมรหัสผ่าน (หน้า Login)
- **ไฟล์:** `UI Customer/src/pages/ForgotPassword.jsx`
- **ขั้นตอน:**
  - กรอกเบอร์โทรศัพท์ -> ยืนยันเลขบัญชีธนาคาร -> ตั้งรหัสใหม่
  - เรียก Stored Procedure `reset_user_password(p_phone, p_new_pin, p_bank_account_number)`
- **สถานะจากฐานข้อมูลจริง:**
  - ฟังก์ชัน `reset_user_password` ใน Supabase ตรวจสอบ PIN 6 หลักสมบูรณ์แล้ว (`IF LENGTH(p_new_pin) <> 6 OR p_new_pin !~ '^\d{6}$' ...`)
  - โค้ดฝั่งหน้าเว็บ `ForgotPassword.jsx` และ `Login.jsx` ซิงค์เป็น 6 หลักครบถ้วนแล้ว

---

## 5. สถานะเซิร์ฟเวอร์พรีวิว (Active & Listening)
- **UI Admin:** `http://localhost:62991` (Next.js 16 App Router) — สถานะ: 200 OK (388 ms)
- **UI Customer:** `http://localhost:62992` (Vite 8 React) — สถานะ: 200 OK (293 ms)
- **สถานะ:** เปิดพรีวิวทิ้งไว้ตามคำสั่ง พร้อมให้ผู้ใช้เข้าตรวจสอบและทดสอบระบบได้ทันที

### 5.1 การแก้ไขปัญหาเว็บแอดมินโหลดหมุนค้าง
- **ปัญหาที่พบ:** การร้องขอ HTTP ไปที่ `http://localhost:62991/` เกิด Timeout (0 bytes received)
- **สาเหตุจริง:** Process เดิมของ Next.js (PID `21420`) เปิดค้างไว้นานกว่า 6 ชั่วโมงจนเกิด Socket Deadlock ภายใน
- **การแก้ไข:** ได้สั่ง Kill Process เดิม, ล้าง `.next/cache` และรีสตาร์ท Dev Server ใหม่ ผลการทดสอบโหลดหน้าจอสำเร็จสมบูรณ์ภายใน 388 ms

### 5.2 การปรับปรุงปุ่มจัดการในหน้ารายการถอนเงิน (Withdrawals Action Buttons)
- **สถานะปัจจุบันในโค้ดและหน้า Preview จริง:**
  - แถบสถานะแท็บ: `รออนุมัติ ({counts.PENDING})`, `อนุมัติแล้ว ({counts.APPROVED})`, `ปฏิเสธ ({counts.REJECTED})`
  - ปุ่มจัดการในคอลัมน์จัดการรายการ (สำหรับรายการสถานะ PENDING):
    - ปุ่มสีเขียว: `<Check /> อนุมัติ` (`[✓ อนุมัติ]`)
    - ปุ่มสีแดง: `<X /> ปฏิเสธ` (`[✕ ปฏิเสธ]`)
    - ปุ่มดูข้อมูล: `<Copy /> บัญชี`
  - ปรับปรุงการตรวจสอบสถานะให้ Normalize ด้วย `.toUpperCase()` เพื่อรองรับทั้ง `PENDING` และ `pending` ได้อย่างสมบูรณ์
