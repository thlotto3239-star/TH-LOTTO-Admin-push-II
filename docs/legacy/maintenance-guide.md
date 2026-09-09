# คู่มือการดูแลรักษาและแนวทางการพัฒนาระบบ (System Maintenance & Developer Guide)
**โครงการ:** THLOTTO-II (Next-Gen Lottery & Gaming Platform)  
**มาตรฐานกำกับ:** ARM AI Engineering Standard (ARM-AES v1.0)  
**เวอร์ชันเอกสาร:** 1.0.0 (Production Maintenance Standard)  
**สถานะ:** สมบูรณ์และพร้อมเป็นแนวทางปฏิบัติงานจริง  

---

## 1. วัตถุประสงค์และหลักการดูแลรักษา (Core Philosophy)

เอกสารฉบับนี้จัดทำขึ้นเพื่อให้ทีมวิศวกรซอฟต์แวร์ ผู้ดูแลระบบ (SysAdmin) และผู้พัฒนาในอนาคต สามารถดูแลรักษาและต่อยอดระบบ THLOTTO-II ได้อย่างถูกต้อง รวดเร็ว ปลอดภัย และไม่เกิดความซับซ้อนหรือสับสน โดยครอบคลุมตั้งแต่การปฏิบัติการประจำวัน การขยายตลาดหวย การแก้ปัญหาฉุกเฉิน และการจัดการ Source Code บน GitHub

---

## 2. ขั้นตอนการปฏิบัติการประจำวัน (Daily Operational Runbook)

### 2.1 การซิงก์ผลรางวัลหวย (Daily Result Verification)
1. เข้าสู่ระบบแอดมิน: `http://localhost:3000` (หรือ Production URL)
2. ไปที่เมนู **"ผลรางวัล" (Results)**
3. ระบบจะแสดงรายการผลรางวัลล่าสุดที่ซิงก์มาจาก **ThaiLottoAPI** และงวดที่เปิดรับแทง
4. **หากต้องการซิงก์ผลทันที:** ให้กดปุ่ม **"🔄 ซิงก์ผล ThaiLottoAPI ทันที"**
   - ระบบจะยิงคำขอไปที่ `/api/admin/sync-results`
   - ระบบจะบันทึกผลรางวัลลง `lottery_results`
   - ฐานข้อมูลจะกระตุ้น **Trigger `trg_on_result_announced`** เพื่อตรวจโพย คิดเงินรางวัล และอัปเดตยอดเข้ากระเป๋าสมาชิก (`wallets.balance`) แบบอัตโนมัติภายในเสี้ยววินาที

### 2.2 การตรวจสอบและอนุมัติธุรกรรมการเงิน (Deposits & Withdrawals)
1. เมนู **"รายการฝากเงิน" (Deposits)**:
   - ตรวจสอบยอดเงิน และคลิกดูหลักฐานสลิปโอนเงิน (Slip Preview)
   - กดปุ่ม **"อนุมัติ"** ➔ ระบบจะเติมเครดิตเข้ากระเป๋าลูกค้าทันทีพร้อมบันทึก Ledger
   - หากยอดเงินไม่ตรง หรือสลิปซ้ำ ให้กด **"ปฏิเสธ"** พร้อมระบุหมายเหตุ
2. เมนู **"รายการถอนเงิน" (Withdrawals)**:
   - ตรวจสอบยอดเงินคงเหลือ และเลขบัญชีธนาคารปลายทางของสมาชิก
   - เมื่อโอนเงินผ่านระบบธนาคารเรียบร้อยแล้ว ให้กด **"อนุมัติ"**
   - หากปฏิเสธคำขอถอน ระบบจะ **คืนเงินเข้ากระเป๋าสมาชิกให้อัตโนมัติ (Refund)** ป้องกันยอดเงินสูญหาย

---

## 3. ขั้นตอนการเพิ่มตลาดหวยใหม่ (Adding a New Lottery Market)

หากต้องการเพิ่มตลาดหวยใหม่เข้ามาในระบบ (เช่น เพิ่มหวยหุ้นตัวใหม่ หรือหวยต่างประเทศชนิดใหม่) ให้ทำตาม 2 ขั้นตอนนี้:

### ขั้นตอนที่ 1: เพิ่มข้อมูลตลาดใน Supabase SQL Editor
รันคำสั่ง SQL เพื่อเพิ่มตลาดลงในตาราง `lottery_markets`:
```sql
INSERT INTO public.lottery_markets (
    code,
    name,
    category,
    draw_time,
    close_minutes_before,
    is_active,
    is_open,
    api_key,
    logo_url,
    display_order
) VALUES (
    'NEW_MARKET_CODE',           -- เช่น 'TAIWAN_STOCK'
    'หวยหุ้นไต้หวัน',             -- ชื่อภาษาไทย
    'stock',                     -- หมวดหมู่: government, lao, hanoi, foreign, stock, speed
    '12:30:00',                  -- เวลาออกผล (HH:MM:SS)
    15,                          -- ปิดรับแทงก่อนหวยออก 15 นาที
    true,                        -- เปิดใช้งาน
    true,                        -- เปิดรับแทง
    'taiwan',                    -- api_key ที่ตรงกับผลจาก ThaiLottoAPI
    'https://...',               -- ลิงก์รูปโลโก้หวย
    25                           -- ลำดับการแสดงผล
);
```

### ขั้นตอนที่ 2: สร้างตารางงวดออกรางวัล (Generate Draw Schedule)
รันคำสั่ง Procedure ในฐานข้อมูลเพื่อสร้างตารางงวดสำหรับตลาดใหม่:
```sql
SELECT public.admin_rebuild_draw_schedules();
```
*หมายเหตุ:* หากเป็นหวยความถี่สูง 15 นาที ให้เรียกใช้ `SELECT public.generate_15m_schedules(7);` เพื่อสร้างรอบล่วงหน้า 7 วัน

---

## 4. การจัดการเลขอั้นและอัตราจ่าย (Restricted Numbers & Payouts)

### 4.1 การกำหนดเลขอั้น (Restricted Numbers)
1. ไปที่เมนู **"จัดการเลขอั้น" (Restricted Numbers)**
2. คลิกปุ่ม **"เพิ่มเลขอั้น"**
3. เลือกตลาดหวย, ประเภทการแทง (เช่น 3 ตัวบน, 2 ตัวล่าง), ระบุตัวเลข
4. เลือกรูปแบบ:
   - **ปิดรับแทงสมบูรณ์:** กำหนดยอดรับสูงสุด (`max_amount`) เป็น `0`
   - **จ่ายครึ่งราคา:** กำหนดอัตราจ่ายใหม่ (`payout_rate`) เช่น 450 บาท (จากปกติ 900)

---

## 5. การแก้ไขปัญหาเชิงเทคนิค (Troubleshooting Runbook)

| อาการที่พบ (Issue) | สาเหตุที่เป็นไปได้ (Root Cause) | วิธีแก้ไข (Resolution) |
| :--- | :--- | :--- |
| **ผลรางวัลไม่ออก / โพยยังค้าง PENDING** | ตลาดหวยยังไม่ได้ถูกตั้งสถานะผลเป็น `ANNOUNCED` | ไปที่หน้า "ผลรางวัล" แล้วกดปุ่ม "ซิงก์ผล ThaiLottoAPI ทันที" หรือกรอกผลรางวัลด้วยตนเอง |
| **ซิงก์ผลแล้วไม่คิดเงินให้สมาชิก** | Trigger ฐานข้อมูลหยุดทำงาน หรือ `round_key` ไม่ตรงกัน | รัน SQL: `SELECT fn_settle_result('result_id_here');` เพื่อบังคับคิดเงินย้อนหลัง |
| **สมาชิกล็อกอินด้วย Google แต่ไม่ขึ้นชื่อ/รูป** | ข้อมูล MetaData ของ Google OAuth ยังไม่ได้ Map ลง `profiles` | ฟังก์ชัน `handle_new_user()` และ `authService.js` ได้รับการ Patch ให้ดึง `avatar_url` และ `full_name` เรียบร้อยแล้ว สมาชิกเพียงล็อกอินใหม่ 1 ครั้ง ระบบจะ Sync ให้อัตโนมัติ |
| **หน้าแอดมินแจ้งเตือน Network Error** | เซิร์ฟเวอร์ Next.js ขาดการเชื่อมต่อกับ Supabase | ตรวจสอบไฟล์ `.env.local` ในโฟลเดอร์ `UI Admin` ว่าค่า `NEXT_PUBLIC_SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ถูกต้อง |

---

## 6. โครงสร้างและการผลักดัน Source Code ขึ้น GitHub (Clean Git Strategy)

### 6.1 โครงสร้างโฟลเดอร์ Repository
```
THLOTTO-II/ (Root Monorepo)
├── docs/                        # เอกสารพิมพ์เขียวและคู่มือมาตรฐาน ARM-AES
│   ├── architecture.md          # สถาปัตยกรรม C4 Blueprint
│   ├── technical-spec.md        # ข้อกำหนดทางเทคนิค สคีมาฐานข้อมูล API Contracts
│   └── maintenance-guide.md     # คู่มือการดูแลรักษาและการแก้ปัญหา (เอกสารนี้)
├── UI Admin/                    # แผงควบคุมผู้ดูแลระบบ (Next.js 15 App Router)
│   ├── src/app/api/admin/       # Server Endpoints (Data Hub & ThaiLotto Sync)
│   ├── src/components/admin/    # UI 21 หน้างาน
│   └── package.json
├── UI Customer/                 # ระบบหน้าบ้านลูกค้า (React 19 + Vite 6 SPA)
│   ├── src/pages/               # หน้าเว็บลูกค้า 35 หน้า (หวย 22 ชนิด, วงล้อ, บัญชี)
│   ├── src/services/            # Supabase Integration Services
│   └── package.json
├── ARM-AI-ENGINEERING-STANDARD.md # มาตรฐานวิศวกรรมสากล
└── AGENTS.md                    # Project Adapter Rules
```

### 6.2 คำสั่งคลีนและผลักดันขึ้น GitHub แบบไร้ปัญหา Submodule
หากต้องการรวมทุกโปรเจกต์ให้เป็น Repository สะอาด 100% โดยไม่ติด Submodule ซ้อน:
1. นำโฟลเดอร์ `.git` ย่อยออกจาก `UI Customer` (หากต้องการเก็บเป็น Monorepo เดียว)
2. ถอน Submodule cache:
   ```bash
   git rm --cached "UI Customer"
   git add "UI Customer"
   ```
3. Commit และ Push ขึ้น Repository หลัก:
   ```bash
   git add .
   git commit -m "feat: complete THLOTTO-II architecture blueprint, UI Admin 100% verified, ThaiLottoAPI live sync"
   git push origin main
   ```
