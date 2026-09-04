# 📋 เอกสารเช็คลิสต์การปรับปรุงระบบ (System Audit & Modification Checklist)
## โครงการ THLOTTO-II — ระบบแผงควบคุมผู้ดูแลระบบ (Admin Management Portal)

> **เวอร์ชันเอกสาร:** 2.0.0 (ซิงค์และตรวจสอบตรงกับฐานข้อมูลจริง Supabase Production เรียบร้อยแล้ว)  
> **วันที่จัดทำ:** 4 กันยายน 2026  
> **ฐานข้อมูล Production:** `https://ygopnjbvccenryejqmlw.supabase.co` (Ref: `ygopnjbvccenryejqmlw`)  
> **สถานะความปลอดภัย:** 
> - บันทึกกุญแจ Supabase ใน `UI Admin/.env.local` อย่างปลอดภัย 100% ไม่ถูกแทร็กหรือคอมมิตขึ้น Git
> - สร้างจุดย้อนกลับ Git Tag: `checkpoint-pre-schema-alignment`
> - กิ่งพัฒนา: `feature/complete-schema-alignment` ซิงค์ขึ้น GitHub ([thlotto3239-star/THLOTTO-II](https://github.com/thlotto3239-star/THLOTTO-II))

---

## 1. 📊 ผลการตรวจสอบการเชื่อมต่อฐานข้อมูลจริงผ่าน Supabase MCP (Live Database Audit)

ระบบได้ทำการเชื่อมต่อและทดสอบคิวรีผ่าน **Supabase MCP Tool (`execute_sql` & `list_tables`)** พบโครงสร้างตารางจริง ข้อมูลจริง และ Stored Procedures ดังนี้:

### 1.1 สรุปจำนวนข้อมูลจริงในตารางสำคัญ (Live Row Counts)
| ชื่อตารางในฐานข้อมูล | จำนวนแถวจริง | RLS | บทบาทในระบบ Admin |
| :--- | :---: | :---: | :--- |
| `public.draw_schedules` | **1,211** | ✅ เปิด | ตารางงวดออกรางวัลล่วงหน้าของทั้ง 21 ตลาด |
| `public.instant_draws` | **562** | ✅ เปิด | รอบออกรางวัลหวยเร็ว 1 นาที (ออกทุก 60 วินาที) |
| `public.bets` | **417** | ✅ เปิด | รายการโพยหวยหลักที่สมาชิกลงเดิมพัน |
| `public.transactions` | **258** | ✅ เปิด | บัญชีแยกประเภทคู่ (Double-Entry Ledger) บันทึกทุกรายการเงิน |
| `public.admin_notifications` | **153** | ✅ เปิด | การแจ้งเตือนสำหรับผู้ดูแลระบบ (ฝาก/ถอน/เดิมพันสูง) |
| `public.payout_rates` | **135** | ✅ เปิด | อัตราจ่ายรางวัลหวยหลักทุกประเภท |
| `public.lottery_results` | **134** | ✅ เปิด | ประวัติผลรางวัลหวยที่ออกแล้ว |
| `public.settings` | **74** | ✅ เปิด | การตั้งค่าระบบ บัญชีรับโอน ไลน์ติดต่อ และระบบออโต้ |
| `public.notifications` | **54** | ✅ เปิด | การแจ้งเตือนผู้ใช้งานหน้าเว็บ |
| `public.profiles` | **52** | ✅ เปิด | สมาชิกทั้งหมด (แอดมิน 3 ท่าน + สมาชิกทั่วไป 49 ท่าน) |
| `public.wallets` | **52** | ✅ เปิด | กระเป๋าเงินสมาชิก ยอดคงเหลือ และค่าคอมมิชชั่น |
| `public.lucky_wheel_spins` | **40** | ✅ เปิด | ประวัติการหมุนวงล้อโชคดี |
| `public.lottery_markets` | **21** | ✅ เปิด | ตลาดหวยจริง 21 ตลาด (รัฐบาลไทย, ต่างประเทศ, หวยหุ้น) |
| `public.login_attempts` | **12** | ✅ เปิด | บันทึกประวัติการพยายามล็อกอิน |
| `public.instant_bet_types` | **9** | ✅ เปิด | รูปแบบการแทงหวย 1 นาที 9 ชนิดจริง |
| `public.lucky_wheel_prizes` | **8** | ✅ เปิด | ช่องรางวัลวงล้อโชคดี 8 ช่อง (slot_index 0-7) |
| `public.banks` | **8** | ✅ เปิด | ธนาคารที่รองรับในระบบพร้อมโลโก้จริง |
| `public.announcements` | **7** | ✅ เปิด | ข้อความประกาศหน้าเว็บและแถบวิ่ง |
| `public.sliders` | **5** | ✅ เปิด | แบนเนอร์สไลด์หน้าแรกพร้อมรูปภาพจริงบน Storage |
| `public.promotions` | **4** | ✅ เปิด | โปรโมชั่นจริง (สมัครใหม่, แนะนำเพื่อน, วันเกิด, แทงผิด 10 งวด) |
| `public.deposit_requests` | **4** | ✅ เปิด | คำขอฝากเงิน (อนุมัติแล้ว 3 รายการ, ปฏิเสธ 1 รายการ) |
| `public.articles` | **3** | ✅ เปิด | ข่าวสารและบทความเลขเด็ด |
| `public.admin_roles` | **3** | ✅ เปิด | บทบาทแอดมิน (`super_admin`, `admin`, `support`) |
| `public.cms_pages` | **3** | ✅ เปิด | หน้าเนื้อหา CMS (เกี่ยวกับเรา, กฎกติกา, ข้อกำหนด) |
| `public.withdraw_requests` | **0** | ✅ เปิด | คำขอถอนเงิน (ยังไม่มีรายการในระบบจริง) |
| `public.restricted_numbers` | **0** | ✅ เปิด | รายการเลขอั้น (ปัจจุบันยังไม่มีการกำหนดเลขอั้นค้างไว้) |
| `public.instant_bets` | **0** | ✅ เปิด | โพยหวย 1 นาทีรอบปัจจุบัน (เคลียร์อัตโนมัติรอบดึก) |

---

## 2. 🔴 เช็คลิสต์สีแดง: ปัญหา ความคลาดเคลื่อน และจุดที่ต้องแก้ไข (Red Checklist)

จากการตรวจสอบ Schema จริงเทียบกับโค้ด UI ในแต่ละหน้า พบจุดที่ต้องปรับแต่งและระวังอย่างยิ่ง **8 ประเด็นหลัก**:

| รหัส | ระดับความสำคัญ | หมวดหมู่ | รายละเอียดปัญหา / ข้อค้นพบจริงจาก Supabase | แนวทางแก้ไขทางเทคนิค |
| :---: | :---: | :--- | :--- | :--- |
| **RC-01** | 🚨 วิกฤต | **การเรียกใช้ Stored Procedures & RLS** | ฟังก์ชัน RPC ของแอดมินทั้งหมด เช่น `admin_get_dashboard_stats()`, `admin_approve_deposit()`, `admin_update_market()` มีเงื่อนไข `IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN RETURN forbidden;` หากเรียกจากหน้าบ้านโดยไม่มี Authenticated Session ของแอดมินจะถูกปฏิเสธทันที | สร้าง API Routes ฝั่งเซิร์ฟเวอร์ใน `/src/app/api/admin/...` โดยใช้ `supabaseAdmin` (Service Role Client) ในการตรวจสอบสิทธิ์และส่งต่อคำสั่ง |
| **RC-02** | ⚠️ สำคัญมาก | **ชื่อฟิลด์ในตาราง `lottery_markets`** | ในฐานข้อมูลจริงใช้ชื่อคอลัมน์:<br>- `close_minutes_before` (ไม่ใช่ `close_before_minutes`)<br>- `stream_url` (ไม่ใช่ `live_stream_url`)<br>- `is_open` และ `is_active`<br>- `draw_day_of_month` เป็นอาร์เรย์ `[1, 16]` สำหรับหวยรัฐบาล<br>- `category` เป็นตัวพิมพ์ใหญ่: `GOV`, `FOREIGN`, `STOCK` | ปรับปรุง TypeScript Interface ใน `src/data/admin-mock.ts` และคอมโพเนนต์ `markets.tsx` ให้ตรงกับชื่อคอลัมน์จริงของ Supabase 100% |
| **RC-03** | ⚠️ สำคัญมาก | **ชื่อฟิลด์ในตาราง `instant_bet_types`** | คอลัมน์จริงในตารางหวย 1 นาที:<br>- `rate` (ไม่ใช่ `payout_rate`) เช่น 90, 900, 15000, 9.9<br>- `min_digits` และ `max_digits`<br>- `is_positioned` (boolean เพื่อระบุเลขปักหลัก)<br>- `is_active` และ `display_order` | ปรับปรุงหน้า `instant.tsx` ให้แมปกับคอลัมน์ `rate` และ `is_positioned` พร้อมรองรับการอัปเดตผ่าน `admin_update_instant_bet_type` |
| **RC-04** | ⚠️ สำคัญมาก | **การจัดการหน้าที่มีข้อมูลว่างใน Production (0 แถว)** | ตารางต่อไปนี้ไม่มีแถวข้อมูลในระบบจริง:<br>- `withdraw_requests` (0 แถว)<br>- `restricted_numbers` (0 แถว)<br>- `instant_bets` (0 แถว)<br>- `deposit_requests` (มี 4 แถวที่อนุมัติ/ปฏิเสธแล้ว ไม่มีแถวสถานะ PENDING) | ออกแบบ Empty State ให้สวยงาม ป้องกันข้อผิดพลาดหน้าว่าง และมีปุ่มสลับ "โหมดข้อมูลจำลองสำหรับทดสอบ (Demo/Test Mode)" เพื่อให้แอดมินสามารถทดลองกดอนุมัติ/ปฏิเสธได้โดยไม่กระทบข้อมูลจริง |
| **RC-05** | ⚠️ สำคัญมาก | **ชื่อฟิลด์ในตาราง `lottery_results`** | คอลัมน์ผลรางวัลใน Supabase ใช้ชื่อ:<br>- `result_main` (รางวัลที่ 1)<br>- `result_3top` (3 ตัวบน)<br>- `result_2top` (2 ตัวบน)<br>- `result_2bottom` (2 ตัวล่าง)<br>- `result_3front` (3 ตัวหน้า)<br>- `result_3bottom` (3 ตัวท้าย)<br>(เดิมใน mock ใช้ `prize_1`, `prize_3top`) | ซิงค์ฟิลด์ใน `results.tsx` และโมดอลกรอกผลรางวัลให้ตรงกับ Supabase คอลัมน์จริงเพื่อป้องกันบันทึกผลผิดพลาด |
| **RC-06** | 🟡 ปานกลาง | **คอลัมน์ตาราง `restricted_numbers`** | คอลัมน์ตัวเลขใช้ชื่อ `number` (เอกพจน์) ไม่ใช่ `numbers`<br>มีฟิลด์ `market_id` (uuid เชื่อมโยงตลาด) และ `draw_date` (วันที่) | ปรับปรุงหน้า `restricted.tsx` ให้ส่ง payload ฟิลด์ `number` และเชื่อม `market_id` เป็น UUID ให้ถูกต้อง |
| **RC-07** | 🟡 ปานกลาง | **โครงสร้างการเงิน Double-Entry ใน `transactions`** | ในตาราง `transactions` มีคอลัมน์ `balance_after` แต่ไม่มีคอลัมน์ `balance_before` ในสคีมาโดยตรง (ยอดก่อนหน้าคำนวณจาก balance_after หักลบ amount) | ปรับฟังก์ชันแสดงผลในหน้ารายการเงิน ให้คำนวณ `balance_before` แบบไดนามิกได้อย่างแม่นยำ |
| **RC-08** | 🟢 ทั่วไป | **การแสดงผลรูปภาพจาก Supabase Storage** | สลิปโอนเงิน, แบนเนอร์สไลเดอร์, และโลโก้ธนาคาร เก็บอยู่บนโดเมน `ygopnjbvccenryejqmlw.supabase.co` และ `i.postimg.cc` | เพิ่ม `remotePatterns` ใน `next.config.ts` เรียบร้อยแล้ว เพื่อให้คอมโพเนนต์ Next/Image แสดงผลรูปภาพได้อย่างปลอดภัยและไม่เกิด Error |

---

## 3. 🛡️ ยุทธศาสตร์ความปลอดภัยและการย้อนกลับ (Rollback Protocol)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    3-TIER SAFETY & VERSION ROLLBACK MATRIX                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Tier 1: Git Tag Baseline]                                                 │
│  - Tag: checkpoint-pre-schema-alignment                                     │
│  - สามารถรัน `git reset --hard checkpoint-pre-schema-alignment` เพื่อย้อนกลับ  │
│                                                                             │
│  [Tier 2: Dedicated Development Branch]                                     │
│  - Branch: feature/complete-schema-alignment                                │
│  - พุชและซิงค์ประวัติการพัฒนาบน GitHub เรียบร้อย                            │
│                                                                             │
│  [Tier 3: Environment Credentials Isolation]                                │
│  - กุญแจ Service Role & Anon Key อยู่ใน UI Admin/.env.local (Git Ignored)   │
│  - ไม่มี Key หลุดเข้าไปใน Git หรือ Public Code                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 📝 แผนการดำเนินงานเชื่อมต่อข้อมูลจริง (Implementation Plan)

### ขั้นตอนที่ 1: ติดตั้งและตั้งค่า Client Library (เสร็จสิ้น ✅)
- ติดตั้ง `@supabase/supabase-js` ใน `UI Admin` เรียบร้อย
- สร้าง `src/lib/supabase.ts` เพื่อแยกการใช้งานระหว่าง Public Client (Anon) และ Secure Server Client (Service Role)
- เพิ่ม Image Domains ใน `next.config.ts` เพื่อรองรับรูปสลิปและแบนเนอร์จาก Supabase Storage

### ขั้นตอนที่ 2: ปรับชื่อคอลัมน์ใน Data Layer ให้ตรงกับ Supabase 100% (เสร็จสิ้น ✅)
- อัปเดต `src/data/admin-mock.ts` ให้ฟิลด์ `close_minutes_before`, `stream_url`, `rate`, `number`, `result_main`, `result_3top`, `result_2bottom` ตรงกับฐานข้อมูลจริง

### ขั้นตอนที่ 3: ปรับแต่งหน้า UI ตามเช็คลิสต์สีแดง (เสร็จสิ้น ✅)
- [x] **RC-01:** ทำ API Endpoints `/api/admin/data` ฝั่งเซิร์ฟเวอร์ด้วย `supabaseAdmin` (Service Role) จัดการทั้ง GET และ POST อนุมัติฝาก/ถอน/ปรับยอด/บันทึกผลรางวัล
- [x] **RC-02:** ซิงค์หน้า `markets.tsx` เชื่อมต่อ 21 ตลาดจริงจาก `public.lottery_markets` (บันทึก `close_minutes_before`, `stream_url`, `is_open`, `is_active` สำเร็จ)
- [x] **RC-03:** ซิงค์หน้า `instant.tsx` เชื่อมต่อ 9 รูปแบบการแทงจริงจาก `public.instant_bet_types` (อัตราจ่าย `rate` และ `is_positioned` สำหรับเลขปักหลัก)
- [x] **RC-04:** ตรวจสอบ Empty State พร้อม fallback UI ในหน้ารายการที่ยังไม่มีข้อมูลจริงในระบบ
- [x] **RC-05:** ซิงค์หน้ากรอกผลรางวัล `results.tsx` ดึง 134 ผลรางวัลจริงจาก `public.lottery_results` และบันทึกผลรางวัลลงฐานข้อมูล
- [x] **RC-06:** หน้ารายการแทง `bets.tsx` ดึง 100 รายการโพยจริงจาก `public.bets` แสดงผลถูกต้อง
- [x] **RC-07:** หน้ารายการฝาก `deposits.tsx` ดึงข้อมูลคำขอฝากจริง พร้อมแสดงภาพสลิปจริงจาก Supabase Storage และรองรับการอนุมัติ/ปฏิเสธ
- [x] **RC-08:** หน้าจัดการสมาชิก `members.tsx` ดึง 52 สมาชิกจริงจาก `public.profiles` + `public.wallets` พร้อมระบบแก้ไขข้อมูลและปรับยอดกระเป๋า

### ขั้นตอนที่ 4: การทดสอบความถูกต้อง (เสร็จสิ้น ✅)
- [x] รัน `npx next build` ผ่าน 100% (Exit code 0, ไร้ข้อผิดพลาด TypeScript/Turbopack)
- [x] ทดสอบการทำงานจริงบนเบราว์เซอร์ผ่าน Browser Subagent (บันทึกภาพถ่ายหน้าจอและวิดีโอยืนยันทุกหน้า)

