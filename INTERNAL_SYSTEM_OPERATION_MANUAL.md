# 🏛️ TH-LOTTO II — คู่มือสถาปัตยกรรมและกลไกฐานข้อมูลระบบภายในฉบับสมบูรณ์
## (Complete Production Database Schema & Internal Operations Manual)

> [!IMPORTANT]
> 📌 **เอกสารอ้างอิงเกี่ยวกับการทำงานของระบบปัจจุบัน (Current System Operational Reference Manual)**
> เอกสารฉบับนี้เป็นข้อมูลอ้างอิงหลักที่สรุปการทำงานจริงบนฐานข้อมูล Supabase Production (Live Database) ครอบคลุมระบบหวย 21 ตลาด, ระบบหวย 1 นาที, ตารางควบคุมจริง และการจัดการระบบภายในระหว่างหน้าแอดมิน (Admin Portal) และหน้าลูกค้า (Customer Portal)


**ชื่อระบบ:** TH-LOTTO II Enterprise Platform  
**สภาพแวดล้อมฐานข้อมูล:** Supabase PostgreSQL Production (Live Instance)  
**ที่อยู่ฐานข้อมูลจริง:** `https://ygopnjbvccenryejqmlw.supabase.co`  
**สถานะ RLS:** เปิดใช้งาน (Row-Level Security Enabled 100% ครบทั้ง 39 ตาราง)  
**ขอบเขตระบบ:** ระบบจัดการภายในระหว่าง **หน้าแอดมิน (Admin Management Portal)** และ **หน้าลูกค้า/สมาชิก (Customer Portal)** เท่านั้น  
*(ไม่ใช่ระบบข่าวสารภายนอก หรือ Third-Party Integration ใดๆ ทุกตารางและข้อมูลทำหน้าที่เป็นสื่อกลางควบคุมการปฏิบัติการภายในเว็บ)*  
**วันที่ตรวจสอบและจัดทำเอกสาร:** กันยายน 2026  

---

## 📑 สารบัญการทำงานของระบบ (Table of Contents)

1. **สถาปัตยกรรมการจัดการภายในระหว่างหน้าแอดมินและหน้าลูกค้า (Admin-to-Customer Architecture)**
2. **ระบบหวยหลัก 21 ตลาดบนฐานข้อมูลจริง (Main Lottery Engine & Real Schema)**
   - 2.1 โครงสร้างตารางฐานข้อมูลจริงที่เกี่ยวข้อง (6 ตารางหลัก)
   - 2.2 รายชื่อและพารามิเตอร์ 21 ตลาดจริงในฐานข้อมูล (`public.lottery_markets`)
   - 2.3 ขั้นตอนการทำงานอัตโนมัติ (Automated Schedule Generation & Auto-Cutoff)
   - 2.4 การควบคุมความเสี่ยงและเลขอั้นภายใน (`public.restricted_numbers`)
   - 2.5 วงจรการออกผลและจ่ายรางวัลแบบ 3 ขั้นตอน (3-Step Settlement Engine)
3. **ระบบหวยเร็ว 1 นาที บนฐานข้อมูลจริง (Instant 1-Minute Lottery Engine)**
   - 3.1 โครงสร้างตารางฐานข้อมูลจริงที่เกี่ยวข้อง (3 ตารางหลัก)
   - 3.2 รายละเอียดหน้าตั้งค่าหวย 1 นาที และอัตราจ่าย 9 รูปแบบจริง (`public.instant_bet_types`)
   - 3.3 กลไกการสุ่มผลรางวัลและการออกรอบอัตโนมัติ (60s Epoch Loop & RNG Draw)
   - 3.4 การตัดรอบบิลจ่ายเงินรางวัลทันที และระบบล้างข้อมูลรอบดึก (Micro-Settlement & Auto-Cleanup)
4. **ตารางจำแนกการเชื่อมโยงระบบภายใน 8 หมวดหมู่ (Admin Action $\leftrightarrow$ DB $\leftrightarrow$ Customer Experience)**
   - หมวดที่ 1: ภาพรวมและเรดาร์สด (Dashboard)
   - หมวดที่ 2: ระบบการเงินสองทาง (Deposits & Withdrawals)
   - หมวดที่ 3: ระบบสมาชิกและกระเป๋าเงิน (Profiles & Wallets)
   - หมวดที่ 4: ตลาดหวยและผลรางวัล (Main Lottery Markets & Results)
   - หมวดที่ 5: หวยหนึ่งนาที (Instant 1-Min Dashboard)
   - หมวดที่ 6: เกมและกิจกรรมภายใน (Lucky Wheel Gamification)
   - หมวดที่ 7: คอนเทนต์ภายในเพื่อลูกค้า (In-House CMS & Banners)
   - หมวดที่ 8: การตั้งค่าระบบ การสื่อสารภายใน และความปลอดภัย (In-App Broadcast & Admin RBAC)
5. **ดัชนีฟังก์ชันและ Stored Procedures สำคัญบนฐานข้อมูลจริง (Production RPC Registry)**

---

## 1. 🌐 สถาปัตยกรรมการจัดการภายในระหว่างหน้าแอดมินและหน้าลูกค้า (Admin-to-Customer Architecture)

ข้อมูลทั้งหมดในฐานข้อมูล Supabase ถูกออกแบบมาเพื่อให้เป็น **ตัวกลางการควบคุมระหว่างเจ้าหน้าที่แอดมิน (Admin) และ ผู้ใช้งานสมาชิก (Customer)** โดยไม่มีการดึงฟีดข่าวภายนอก ไม่มีการส่งไลน์ออกนอกระบบ และไม่มีการเชื่อมต่อภายนอกที่ไม่ปลอดภัย:

```
+─────────────────────────────────────────────────────────────────────────────────────────────+
|                         TH-LOTTO II : INTERNAL OPERATIONS LOOP                              |
+─────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                             |
|   ┌───────────────────────────┐                      ┌───────────────────────────┐          |
|   │   หน้าแอดมิน (Admin UI)   │                      │  หน้าลูกค้า (Customer UI)  │          |
|   │                           │                      │                           │          |
|   │ - ควบคุมตลาด / ออกผลหวย   │                      │ - เลือกตลาดหวย / ส่งโพย   │          |
|   │ - อนุมัติ ฝาก-ถอน เงิน    │                      │ - แจ้งฝาก / ขอถอนเงิน     │          |
|   │ - ตั้งเลขอั้น / อัตราจ่าย │                      │ - หมุนวงล้อ / รับโปรโมชั่น│          |
|   │ - ส่งประกาศภายใน In-App   │                      │ - รับข้อความในกระดิ่ง/ป๊อป│          |
|   └─────────────┬─────────────┘                      └─────────────▲─────────────┘          |
|                 │                                                  │                        |
|                 ▼                                                  │                        |
|   +────────────────────────────────────────────────────────────────┴─────────────────────+  |
|   │                     SUPABASE POSTGRESQL (LIVE DATABASE INSTANCE)                     │  |
|   │                                                                                      │  |
|   │  [ตารางควบคุมระบบ]          [ตารางธุรกรรม]               [ตารางการแจ้งเตือน]          │  |
|   │  - lottery_markets (21)    - wallets (52)               - notifications (54)         │  |
|   │  - instant_bet_types (9)   - bets (417)                 - admin_notifications (153)  │  |
|   │  - payout_rates (135)      - instant_bets               - announcements (7)          │  |
|   │  - restricted_numbers (1)  - transactions (258)         - sliders (5)                │  |
|   │  - lucky_wheel_prizes (8)  - deposit_requests (4)       - promotions (4)             │  |
|   │  - settings (74)           - withdraw_requests (0)      - cms_pages (3)              │  |
|   │                                                                                      │  |
|   │  [กลไกคำนวณอัตโนมัติ & ความปลอดภัย]                                                  │  |
|   │  - 130+ Stored Procedures (place_bet_securely, fn_instant_draw, admin_settle)       │  |
|   │  - RLS Policies (แยกสิทธิ์การอ่าน/เขียนของลูกค้าและแอดมิน 100%)                       │  |
|   +──────────────────────────────────────────────────────────────────────────────────────+  |
|                                                                                             |
+─────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. 🎯 ระบบหวยหลัก 21 ตลาดบนฐานข้อมูลจริง (Main Lottery Engine)

### 2.1 โครงสร้างตารางฐานข้อมูลจริงที่เกี่ยวข้อง

1. **`public.lottery_markets` (21 ตาราง):** เก็บโครงสร้างตลาดหวย เวลาเปิด-ปิด และการตั้งค่า
   - คอลัมน์สำคัญ: `id` (UUID), `code` (TEXT), `name` (TEXT), `type` (TEXT), `category` (TEXT), `draw_days` (ARRAY), `draw_day_of_month` (ARRAY), `draw_time` (TIME), `close_minutes_before` (INT), `has_3top`, `has_2bottom`, `is_open` (BOOL), `is_active` (BOOL)
2. **`public.draw_schedules` (1,211 แถว):** เก็บรอบงวดของแต่ละตลาดที่ระบบคำนวณไว้ล่วงหน้า
   - คอลัมน์สำคัญ: `id`, `market_id`, `draw_date` (DATE), `open_time`, `close_time`, `result_time`, `status` (`OPEN`, `WAITING`, `SETTLED`)
3. **`public.bets` (417 แถว):** เก็บโพยที่ลูกค้าส่งเข้ามาแทง
   - คอลัมน์สำคัญ: `id`, `user_id`, `market_id`, `lottery_code`, `draw_date`, `bet_type`, `numbers`, `amount`, `payout_rate`, `status` (`PENDING`, `WON`, `LOST`, `CANCELLED`), `payout_amount`, `is_paid`
4. **`public.lottery_results` (134 แถว):** เก็บผลรางวัลที่แอดมินป้อนเข้าระบบ
   - คอลัมน์สำคัญ: `id`, `market_id`, `draw_date`, `result_main`, `result_3top`, `result_2bottom`, `result_3bottom`, `status` (`STAGED`, `ANNOUNCED`, `SETTLED`)
5. **`public.payout_rates` (135 แถว):** เก็บอัตราจ่ายแยกตามตลาดและประเภทการแทง (3 ตัวบน, 2 ตัวล่าง ฯลฯ)
6. **`public.restricted_numbers` (1 แถว):** ตารางควบคุมเลขอั้นและเลขจ่ายครึ่งราคาที่แอดมินกำหนด
   - คอลัมน์สำคัญ: `id`, `market_id`, `bet_type`, `number`, `max_amount` (เพดานรับแทง), `payout_rate` (อัตราจ่ายกรณีลดราคา), `draw_date`

---

### 2.2 รายชื่อและพารามิเตอร์ 21 ตลาดจริงในฐานข้อมูล (`public.lottery_markets`)

| รหัสตลาด (`code`) | ชื่อตลาด (`name`) | หมวดหมู่ | วันออกรางวัล (`draw_days`) | เวลาออก (`draw_time`) | ปิดรับก่อน (`close_minutes_before`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`TH_GOV`** | หวยรัฐบาลไทย | GOV | วันที่ 1 และ 16 ของเดือน | 15:30:00 | 20 นาที |
| **`LAO`** | ลาวพัฒนา | FOREIGN | จันทร์, พุธ, ศุกร์ (1,2,3,4,5) | 20:30:00 | 10 นาที |
| **`HANOI_SPECIAL`**| ฮานอยพิเศษ | FOREIGN | ทุกวัน (0,1,2,3,4,5,6) | 17:30:00 | 20 นาที |
| **`HANOI`** | ฮานอยปกติ | FOREIGN | ทุกวัน (0,1,2,3,4,5,6) | 18:30:00 | 20 นาที |
| **`HANOI_VIP`** | ฮานอย VIP | FOREIGN | ทุกวัน (0,1,2,3,4,5,6) | 19:30:00 | 20 นาที |
| **`MALAY`** | หวยมาเลย์ | FOREIGN | พุธ, เสาร์, อาทิตย์ (0,3,6) | 18:30:00 | 20 นาที |
| **`NIKKEI_MORNING`**| หุ้นนิเคอิเช้า | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 09:30:00 | 20 นาที |
| **`CHINA_MORNING`** | หุ้นจีนเช้า | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 11:00:00 | 20 นาที |
| **`HANGSENG_MORNING`**| หุ้นฮั่งเส็งเช้า | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 11:30:00 | 20 นาที |
| **`STOCK_TAIWAN`** | หุ้นไต้หวัน | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 13:30:00 | 20 นาที |
| **`STOCK_KOREA`** | หุ้นเกาหลี | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 13:30:00 | 20 นาที |
| **`NIKKEI_AFTERNOON`**| หุ้นนิเคอิบ่าย | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 14:30:00 | 20 นาที |
| **`CHINA_AFTERNOON`** | หุ้นจีนบ่าย | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 14:30:00 | 20 นาที |
| **`HANGSENG_AFTERNOON`**| หุ้นฮั่งเส็งบ่าย| STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 15:00:00 | 20 นาที |
| **`STOCK_SG`** | หุ้นสิงคโปร์ | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 17:00:00 | 20 นาที |
| **`STOCK_INDIA`** | หุ้นอินเดีย | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 17:00:00 | 20 นาที |
| **`STOCK_EGYPT`** | หุ้นอียิปต์ | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 21:00:00 | 20 นาที |
| **`STOCK_RUSSIA`** | หุ้นรัสเซีย | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 21:30:00 | 20 นาที |
| **`STOCK_GERMANY`** | หุ้นเยอรมัน | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 22:00:00 | 20 นาที |
| **`STOCK_ENGLAND`** | หุ้นอังกฤษ | STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 22:30:00 | 20 นาที |
| **`STOCK_DOWJONES`**| หวยหุ้นดาวน์โจนส์| STOCK | จันทร์–ศุกร์ (1,2,3,4,5) | 02:30:00 | 20 นาที |

---

### 2.3 ขั้นตอนการทำงานอัตโนมัติ (Automated Schedule Generation & Auto-Cutoff)

1. **การสร้างงวดอัตโนมัติ (`fn_auto_generate_schedules`):**
   - รันประมวลผลบนเซิร์ฟเวอร์ฐานข้อมูล ตรวจสอบวันปัจจุบันและวันออกรางวัลของแต่ละตลาด
   - สร้างเรคอร์ดงวดลงในตาราง `draw_schedules` ล่วงหน้า พร้อมคำนวณ `open_time`, `close_time = draw_time - close_minutes_before`, และ `result_time = draw_time`
   - มี Database Trigger `trg_fn_rebuild_schedules_on_market_update` คอยดักจับ เมื่อแอดมินมีการแก้ไขเวลาหรือวันออกผลของตลาด ระบบจะคำนวณรอบงวดใหม่อัตโนมัติทันที
2. **การปิดรับแทงอัตโนมัติ (Auto-Cutoff):**
   - ระบบตรวจสอบฟังก์ชัน `fn_is_market_open(market_id)` แบบเรียลไทม์
   - เมื่อเวลาเดินถึง `close_time` สถานะของงวดจะเปลี่ยนเป็น `WAITING` ทันที และฟังก์ชัน `place_bet_securely` จะปฏิเสธการแทงทันที เพื่อป้องกันปัญหาลูกค้าแทงโพยหลังตลาดปิด

---

### 2.4 การควบคุมความเสี่ยงและเลขอั้นภายใน (`public.restricted_numbers`)
* แอดมินตั้งค่าเลขอั้นผ่าน RPC `admin_upsert_restricted_number`:
  - หาก `payout_rate = 0` $\rightarrow$ เป็น **เลขอั้น (Closed Number)** ระบบไม่รับแทงเด็ดขาด
  - หาก `payout_rate > 0` $\rightarrow$ เป็น **เลขจ่ายครึ่งราคา** ระบบอนุญาตให้แทงได้ แต่ตั๋วใน `bets` จะถูกบันทึกอัตราจ่ายลดลงตามที่แอดมินกำหนด
* ในขณะที่ลูกค้าส่งโพย ฟังก์ชัน `place_bet_securely` จะตรวจสอบยอดแทงสะสมของตัวเลขนั้น หากยอดรวมเกิน `max_amount` ระบบจะตัดยอดและแจ้งเตือนกลับไปยังลูกค้าทันที

---

### 2.5 วงจรการออกผลและจ่ายรางวัลแบบ 3 ขั้นตอน (3-Step Settlement Engine)

```
[ขั้นที่ 1: Staged Result]           [ขั้นที่ 2: Preview & Verify]         [ขั้นที่ 3: Settlement & Credit]
 แอดมินกรอกผลลง lottery_results ──>  ระบบคำนวณยอดจ่าย & โพยที่ชนะ  ──>  เรียก admin_set_result_and_settle
 (สถานะ STAGED)                      (ตรวจสอบก่อนตัดยอดจริง)             - ปรับสถานะบิล WON / LOST
                                                                         - อัปเดตยอดเงินใน wallets
                                                                         - สร้างธุรกรรม WIN ใน transactions
```

* **ขั้นตอนทางฐานข้อมูล:**
  1. แอดมินเรียก `fn_stage_result` หรือกรอกผลผ่านหน้าเว็บ บันทึกลง `lottery_results` (สถานะ `STAGED`)
  2. แอดมินตรวจสอบผลลัพธ์ผ่านหน้าต่างแสดงตัวอย่าง (Preview)
  3. แอดมินกดยืนยัน ระบบเรียก RPC `admin_set_result_and_settle`
  4. ฐานข้อมูลรัน `fn_settle_result` ตรวจสอบโพยทั้งหมดในงวดนั้น เทียบตัวเลขผ่าน `check_bet_winner`
  5. สำหรับโพยที่ชนะ:
     - ปรับสถานะใน `bets.status = 'WON'` และ `bets.is_paid = true`
     - นำยอดเงินรางวัลไปบวกเข้า `wallets.balance` ของลูกค้าโดยอัตโนมัติ
     - สร้างเรคอร์ดใน `transactions` (ประเภท `WIN`, บันทึก `balance_before` และ `balance_after`)

---

## 3. ⚡ ระบบหวยเร็ว 1 นาที บนฐานข้อมูลจริง (Instant 1-Minute Lottery Engine)

### 3.1 โครงสร้างตารางฐานข้อมูลจริงที่เกี่ยวข้อง

1. **`public.instant_bet_types` (9 แถว):** กฎและอัตราจ่ายของรูปแบบการแทงทั้ง 9 ชนิด
2. **`public.instant_draws` (517 แถวในระบบ):** ประวัติงวดหวย 1 นาทีที่ระบบรันออกผลอัตโนมัติ
   - คอลัมน์สำคัญ: `id` (UUID), `draw_id` (BIGINT เช่น 202609040520), `result_6d` (TEXT เลข 6 หลัก), `result_2bottom` (TEXT เลข 2 ตัวล่าง), `status` (`SETTLED`), `created_at`, `settled_at`
3. **`public.instant_bets`:** โพยการแทงหวย 1 นาทีของลูกค้า
   - คอลัมน์สำคัญ: `id`, `user_id`, `draw_id`, `bet_type`, `numbers`, `amount`, `payout_rate`, `status` (`PENDING`, `WON`, `LOST`), `winnings`, `is_win`, `settled_at`

---

### 3.2 รายละเอียดหน้าตั้งค่าหวย 1 นาที และอัตราจ่าย 9 รูปแบบจริง (`public.instant_bet_types`)

ข้อมูลแถวจริงจากตาราง `public.instant_bet_types` ในฐานข้อมูล Supabase:

| รหัสประเภท (`code`) | ชื่อภาษาไทย (`name`) | อัตราจ่ายจริง (`rate`) | จำนวนหลัก (`min-max`) | ปักหลัก (`is_positioned`) | ลำดับแสดงผล (`display_order`) | สถานะ (`is_active`) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`2top`** | 2 ตัวบน | **90 เท่า** | 2 - 2 หลัก | `false` | 1 | `true` |
| **`2bottom`** | 2 ตัวล่าง | **90 เท่า** | 2 - 2 หลัก | `false` | 2 | `true` |
| **`3top`** | 3 ตัวบน | **900 เท่า** | 3 - 3 หลัก | `false` | 3 | `true` |
| **`3toad`** | 3 ตัวโต๊ด | **180 เท่า** | 3 - 3 หลัก | `false` | 4 | `true` |
| **`3front`** | 3 ตัวหน้า | **900 เท่า** | 3 - 3 หลัก | `false` | 5 | `true` |
| **`3back`** | 3 ตัวท้าย | **900 เท่า** | 3 - 3 หลัก | `false` | 6 | `true` |
| **`6straight`** | 6 ตัวตรง | **15,000 เท่า**| 6 - 6 หลัก | `false` | 7 | `true` |
| **`pin_top`** | ปักหลักบน | **9.9 เท่า** | 0 - 0 หลัก | `true` | 8 | `true` |
| **`pin_bottom`** | ปักหลักล่าง | **9.9 เท่า** | 0 - 0 หลัก | `true` | 9 | `true` |

* **พารามิเตอร์การตั้งค่าที่แอดมินควบคุมได้ผ่าน RPC:**
  - `admin_update_instant_bet_type(p_code, p_rate, p_is_active)`: ปรับอัตราจ่ายหรือเปิด/ปิดรับแทงแต่ละประเภท
  - `admin_toggle_instant_bet_type(p_code)`: สลับสถานะเปิด/ปิดการแทงชนิดนั้นๆ ชั่วคราว

---

### 3.3 กลไกการสุ่มผลรางวัลและการออกรอบอัตโนมัติ (60s Loop & RNG)

* **ความถี่รอบงวด:** ออกรางวัลทุกๆ 1 นาที ตลอด 24 ชั่วโมง รวม **1,440 รอบต่อวัน**
* **ฟังก์ชันประมวลผล (`fn_instant_draw` / `process_1min_lottery`):**
  1. ทุกวินาทีที่ 00 ฐานข้อมูลจะสุ่มตัวเลข 6 หลัก (`result_6d` เช่น `591842`) และเลข 2 ตัวล่าง (`result_2bottom` เช่น `37`)
  2. สกัดผลรางวัลแต่ละประเภทอัตโนมัติ:
     - 3 ตัวบน = 3 ตัวท้ายของ `result_6d` (`842`)
     - 3 ตัวหน้า = 3 ตัวแรกของ `result_6d` (`591`)
     - 3 ตัวท้าย = 3 ตัวท้ายของ `result_6d` (`842`)
     - 2 ตัวบน = 2 ตัวท้ายของ `result_6d` (`42`)
     - 2 ตัวล่าง = ค่าจาก `result_2bottom` (`37`)
     - 6 ตัวตรง = ตรงกับ `result_6d` ทุกหลัก (`591842`)
     - 3 ตัวโต๊ด = เลข 3 ตัวบนสลับหลักกันได้
  3. บันทึกผลลงในตาราง `public.instant_draws`

---

### 3.4 การตัดรอบบิลจ่ายเงินรางวัลทันที และระบบล้างข้อมูลรอบดึก (Micro-Settlement & Auto-Cleanup)

1. **Micro-Settlement (`fn_settle_instant_draw` / `settle_instant_draw`):**
   - ทันทีที่ผลลงตาราง ฟังก์ชันจะดึงโพยใน `instant_bets` ที่มี `draw_id` เดียวกัน
   - รันการตรวจสอบ `fn_check_instant_win`
   - บิลที่ชนะ: อัปเดต `is_win = true`, `status = 'WON'`, คำนวณ `winnings = amount * payout_rate` และโอนเข้า `wallets.balance` ของลูกค้าทันที โดยกระบวนการทั้งหมดใช้เวลาเพียง 1-2 วินาที
2. **ระบบล้างข้อมูลรอบดึกอัตโนมัติ (`fn_cleanup_instant_lottery_at_midnight`):**
   - เนื่องจากมีถึง 1,440 รอบต่อวัน หากเก็บสะสมไว้จะทำให้ฐานข้อมูลชะลอตัวลง
   - เวลา 00:00 น. ของทุกคืน ระบบอัตโนมัติจะสรุปยอดแทงรวม ยอดจ่ายรวม และกำไร-ขาดทุนประจำวัน บันทึกลงในสถิติสรุป แล้วทำการ Archive / ล้างข้อมูลโพยชั่วคราว เพื่อให้ฐานข้อมูลพร้อมรับวันใหม่ด้วยความเร็วสูงสุด

---

## 4. 🔗 ตารางจำแนกการเชื่อมโยงระบบภายใน 8 หมวดหมู่ (Admin $\leftrightarrow$ Database $\leftrightarrow$ Customer)

ตารางนี้แจกแจงอย่างละเอียดว่า **หน้าแอดมินสั่งการอะไร $\rightarrow$ ส่งผลต่อตาราง/RPC ใดในฐานข้อมูล $\rightarrow$ ลูกค้าเห็นหรือมีประสบการณ์อย่างไรบนหน้าเว็บ**:

| หมวดหมู่ระบบ | หน้าแอดมิน (Admin UI) | ตาราง & RPC ในฐานข้อมูลจริง | ประสบการณ์ของลูกค้า (Customer Experience) |
| :--- | :--- | :--- | :--- |
| **1. ภาพรวม** | `dashboard.tsx`<br>เรดาร์ติดตามสถิติสด | `admin_get_dashboard_stats`<br>`transactions`<br>`lottery_markets` | ลูกค้าได้รับการบริการที่รวดเร็ว แอดมินมอนิเตอร์และแก้ไขปัญหาหน้างานได้ทันที |
| **2. การเงิน (ฝาก)** | `deposits.tsx`<br>ตรวจสลิป และกดอนุมัติ | `deposit_requests`<br>`admin_approve_deposit`<br>`admin_reject_deposit` | ลูกค้าแจ้งฝากเงินผ่านหน้าเว็บ เมื่อแอดมินอนุมัติ ยอดเงินในกระเป๋าหลักจะปรับขึ้นทันที |
| **3. การเงิน (ถอน)** | `withdrawals.tsx`<br>ตรวจคำขอถอน และกดโอน | `withdraw_requests`<br>`admin_approve_withdraw`<br>`admin_reject_withdraw` | ลูกค้าแจ้งถอนเงิน (ระบบกันยอดทันที) หากแอดมินปฏิเสธ ยอดเงินจะคืนเข้ากระเป๋าลูกค้าทันที |
| **4. สมาชิก** | `members.tsx`<br>ปรับเครดิต, ระงับ, ส่งออก CSV | `profiles`<br>`wallets`<br>`admin_adjust_wallet`<br>`admin_suspend_user` | ลูกค้าได้รับยอดปรับปรุงเครดิต หรือเห็นสถานะการใช้งานบัญชีตามที่แอดมินตั้งค่า |
| **5. หวยหลัก** | `markets.tsx`<br>`results.tsx`<br>คุม 21 ตลาด & ออกผล | `lottery_markets`<br>`draw_schedules`<br>`bets`<br>`admin_set_result_and_settle` | ลูกค้าเห็นเวลาเปิด-ปิดรับแทงที่นับถอยหลัง เมื่อผลออกระบบโอนเงินรางวัลเข้ากระเป๋าทันที |
| **6. หวย 1 นาที** | `instant.tsx`<br>มอนิเตอร์รอบและดูสถิติ | `instant_draws`<br>`instant_bets`<br>`instant_bet_types`<br>`fn_instant_draw` | ลูกค้าเล่นหวยเร็ว 60 วินาทีได้ต่อเนื่อง 24 ชั่วโมง ผลออกปุ๊บ ได้รับเงินรางวัลปั๊บ |
| **7. เกมวงล้อ** | `wheel.tsx`<br>ตั้งค่า 8 สล็อต & % รางวัล | `lucky_wheel_prizes`<br>`lucky_wheel_spins`<br>`spin_lucky_wheel` | ลูกค้าเข้าเล่นเกมวงล้อเสี่ยงโชค ได้รับของรางวัลหรือเครดิตตามค่าความน่าจะเป็นที่แอดมินกำหนด |
| **8. แจ้งเตือนภายใน**| `broadcast.tsx`<br>ส่งประกาศ In-App | `notifications`<br>`admin_broadcast_notification` | ลูกค้าเห็นการแจ้งเตือนบน **กระดิ่งหน้าเว็บ**, **ป๊อปอัปแจ้งเตือน**, หรือ **แถบวิ่งข่าว** โดยตรง |
| **9. โปรโมชั่น** | `promotions.tsx`<br>สร้างโปรโมชั่น & เทิร์น | `promotions`<br>`apply_promotion`<br>`admin_create_promotion` | ลูกค้าเลือกรับโปรโมชั่นฝากเงิน และระบบคำนวณยอดเทิร์นโอเวอร์ที่ต้องทำให้อัตโนมัติ |
| **10. สไลเดอร์** | `sliders.tsx`<br>จัดเรียงแบนเนอร์หน้าแรก | `sliders`<br>`admin_reorder_sliders`<br>`admin_toggle_slider` | ลูกค้าเห็นแบนเนอร์กิจกรรมและโปรโมชั่นเรียงตามลำดับที่สวยงามบนหน้าแรกของเว็บ |
| **11. การตั้งค่า** | `settings.tsx`<br>ตั้งขั้นต่ำฝากถอน / ปิดปรับปรุง | `settings`<br>`admin_upsert_setting` | ลูกค้าจะถูกจำกัดยอดฝาก-ถอนตามเกณฑ์ หรือเห็นหน้าปิดปรับปรุงระบบหากเปิดโหมด Maintenance |

---

## 5. 🛠️ ดัชนีฟังก์ชันและ Stored Procedures สำคัญบนฐานข้อมูลจริง (Production RPC Registry)

ฐานข้อมูล Supabase มี Stored Procedures ที่พัฒนาขึ้นเพื่อรองรับตรรกะระบบภายในมากกว่า 130 รายการ โดยมีฟังก์ชันหลักในการขับเคลื่อนระบบดังนี้:

### กลุ่มการเงินและกระเป๋าเงิน (Financial & Wallets)
* `submit_deposit_slip(p_user_id, p_bank_id, p_amount, p_slip_url)` $\rightarrow$ สมาชิกส่งคำขอฝากเงินพร้อมสลิป
* `admin_approve_deposit(p_request_id, p_admin_id)` $\rightarrow$ แอดมินอนุมัติฝาก เติมเครดิตเข้า Wallet และบันทึก Ledger
* `admin_reject_deposit(p_request_id, p_reason)` $\rightarrow$ แอดมินปฏิเสธคำขอฝาก
* `request_withdrawal_securely(p_user_id, p_amount, p_bank_account)` $\rightarrow$ สมาชิกแจ้งถอน หักเงินใน Wallet ทันทีเพื่อกันยอด
* `admin_approve_withdraw(p_request_id, p_admin_id)` $\rightarrow$ แอดมินอนุมัติถอน บันทึกการโอนเงินสำเร็จ
* `admin_reject_withdraw(p_request_id, p_reason)` $\rightarrow$ แอดมินปฏิเสธถอน คืนเครดิตเข้ากระเป๋าลูกค้าทันที
* `admin_adjust_wallet(p_user_id, p_amount, p_type, p_reason)` $\rightarrow$ แอดมินปรับยอดเงินลูกค้าแบบกำหนดเองพร้อมบันทึก Audit

### กลุ่มหวย 21 ตลาด (Main Lottery Operations)
* `fn_auto_generate_schedules()` $\rightarrow$ บอทสร้างงวดล่วงหน้าตามวันเวลาของ 21 ตลาด
* `trg_fn_rebuild_schedules_on_market_update()` $\rightarrow$ ทริกเกอร์สร้างงวดใหม่อัตโนมัติเมื่อมีการแก้ข้อมูลตลาด
* `fn_is_market_open(p_market_id)` $\rightarrow$ เช็คสถานะตลาดว่าเปิดรับแทงอยู่หรือไม่
* `place_bet_securely(p_user_id, p_market_id, p_bet_type, p_numbers, p_amount)` $\rightarrow$ ตรวจยอดเงิน หักเงิน และสร้างตั๋วแทง
* `admin_upsert_restricted_number(p_market_id, p_bet_type, p_number, p_max, p_rate)` $\rightarrow$ แอดมินตั้งเลขอั้น/เลขจ่ายครึ่ง
* `fn_stage_result(p_market_id, p_draw_date, p_results)` $\rightarrow$ แอดมินป้อนผลรางวัลเข้ารอการยืนยัน
* `admin_set_result_and_settle(p_market_id, p_draw_date, ...)` $\rightarrow$ ยืนยันผล ตรวจตั๋วผู้ชนะ และโอนเงินรางวัลอัตโนมัติ

### กลุ่มหวย 1 นาที (Instant Draw Engine)
* `fn_instant_draw()` / `process_1min_lottery()` $\rightarrow$ สุ่มเลข 6 หลัก และ 2 ตัวล่าง ทุก 1 นาที
* `fn_place_instant_bet(p_user_id, p_draw_id, p_bet_type, p_numbers, p_amount)` $\rightarrow$ ลูกค้าแทงหวย 1 นาที
* `fn_settle_instant_draw(p_draw_id)` $\rightarrow$ ตรวจผลตั๋วแทง 9 รูปแบบ และโอนเงินเข้า Wallet ผู้ชนะทันที
* `admin_update_instant_bet_type(p_code, p_rate, p_is_active)` $\rightarrow$ แอดมินปรับอัตราจ่ายหรือเปิด/ปิดชนิดการแทง
* `fn_cleanup_instant_lottery_at_midnight()` $\rightarrow$ สรุปยอดบัญชีประจำวันและล้างข้อมูลเก่าตอนเที่ยงคืน

### กลุ่มการสื่อสารภายในระบบ (Internal In-App Broadcast)
* `admin_broadcast_notification(p_audience, p_user_id, p_type, p_title, p_body)` $\rightarrow$ แอดมินส่งประกาศตรงเข้าตาราง `notifications` ของลูกค้า โดยลูกค้าจะได้รับการแจ้งเตือนผ่านกระดิ่ง, ป๊อปอัปหน้าแรก หรือแถบวิ่ง โดยไม่ต้องพึ่งพาบริการภายนอกใดๆ

---

## 6. 🛡️ สรุปภาพรวมและมาตรฐานความถูกต้อง (Invariants Summary)

1. **ระบบภายในเป็นเอกเทศ (100% In-House Operations):** ข้อมูลทุกแถวและการกระทำทุกอย่างเป็นการโต้ตอบระหว่าง **หน้าแอดมิน $\leftrightarrow$ ฐานข้อมูล Supabase $\leftrightarrow$ หน้าเว็บสมาชิก** ปราศจากการพึ่งพาผู้ให้บริการหรือเนื้อหาภายนอก
2. **ความสมบูรณ์ของยอดเงิน (Double-Entry Atomic Ledger):** การเคลื่อนไหวของเงินทุกบาททุกสตางค์ บันทึกลงในตาราง `transactions` พร้อมยอดคงเหลือก่อนและหลังทำรายการ ตรวจสอบได้โปร่งใส 100%
3. **การรักษาความปลอดภัย (Granular RBAC & RLS):** นโยบาย Row-Level Security ป้องกันไม่ให้สมาชิกล่วงรู้ข้อมูลของผู้อื่น และแยกบทบาทเจ้าหน้าที่แอดมินตามหน้าที่ความรับผิดชอบอย่างเคร่งครัด


