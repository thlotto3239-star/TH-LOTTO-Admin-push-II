# ข้อกำหนดทางเทคนิคและสัญญาระบบ (Technical Specification)
**โครงการ:** THLOTTO-II (Next-Gen Lottery & Gaming Platform)  
**มาตรฐานกำกับ:** ARM AI Engineering Standard (ARM-AES v1.0)  
**เวอร์ชันเอกสาร:** 1.0.0 (Production Release Specification)  
**สถานะ:** อ้างอิงจากฐานข้อมูล Supabase และโค้ดระบบจริง 100%  

---

## 1. ข้อกำหนดโครงสร้างฐานข้อมูล (Database Schema Specification)

ระบบฐานข้อมูลทำงานบน **PostgreSQL 15 (Supabase)** ประกอบด้วย 24 ตารางหลัก โดยแบ่งกลุ่มฟังก์ชันได้ดังนี้:

### 1.1 กลุ่มตารางตลาดหวยและการออกรางวัล (Lottery Engine Core)

#### 1. `lottery_markets` (ตลาดหวยทั้งหมดในระบบ)
- `id` (uuid, PK): รหัสเฉพาะของตลาดหวย
- `code` (varchar, UNIQUE): รหัสย่อ เช่น `THAI_GOV`, `LAO_DEVELOP`, `HANOI_REGULAR`, `THLOTTO_15M`
- `name` (varchar): ชื่อภาษาไทยของตลาดหวย
- `category` (varchar): หมวดหมู่ (`government`, `lao`, `hanoi`, `foreign`, `stock`, `speed`)
- `logo_url` (text): ลิงก์รูปภาพสัญลักษณ์
- `is_active` (boolean): สถานะเปิดใช้งานในระบบ
- `is_open` (boolean): สถานะเปิดรับแทง ณ เวลาปัจจุบัน
- `draw_time` (time): เวลาที่ผลรางวัลออก
- `close_minutes_before` (int): เวลาปิดรับแทงล่วงหน้าก่อนหวยออก (นาที)
- `api_key` (varchar): Key สำหรับจับคู่กับผลรางวัลจาก **ThaiLottoAPI** (เช่น `thai`, `lao`, `vietnam`, `thlotto15m`)
- `stream_url` (text): ลิงก์ถ่ายทอดสดผลรางวัล (YouTube/Live Stream)

#### 2. `draw_schedules` (งวดการออกรางวัลและรอบแทง)
- `id` (uuid, PK): รหัสงวด
- `market_id` (uuid, FK -> `lottery_markets.id`): ตลาดหวยที่สังกัด
- `draw_date` (date): วันที่ออกรางวัล
- `round_key` (varchar, DEFAULT ''): รหัสรอบ (สำคัญมากสำหรับหวย 15 นาที เช่น `1`, `2`, ..., `96`)
- `open_time` (timestamptz): เวลาเริ่มเปิดรับแทง
- `close_time` (timestamptz): เวลาสิ้นสุดการรับแทง
- `status` (varchar): สถานะงวด (`UPCOMING`, `OPEN`, `CLOSED`, `SETTLED`, `CANCELLED`)
- **Unique Constraint:** `UNIQUE(market_id, draw_date, round_key)`

#### 3. `lottery_results` (ผลรางวัลที่ประกาศอย่างเป็นทางการ)
- `id` (uuid, PK): รหัสผลรางวัล
- `market_id` (uuid, FK -> `lottery_markets.id`): ตลาดหวย
- `draw_date` (date): วันที่ออกรางวัล
- `round_key` (varchar, DEFAULT ''): รหัสรอบสำหรับหวยรอบความถี่สูง
- `result_main` (varchar): รางวัลที่ 1 / ผลรางวัลหลักเต็มจำนวน (เช่น 6 หลัก สำหรับหวยไทย/ลาว)
- `result_3top` (varchar): 3 ตัวบน
- `result_2top` (varchar): 2 ตัวบน
- `result_2bottom` (varchar): 2 ตัวล่าง
- `result_3front` (varchar): 3 ตัวหน้า (สำหรับหวยไทยรัฐบาล)
- `result_3bottom` (varchar): 3 ตัวท้าย (สำหรับหวยไทยรัฐบาล)
- `status` (varchar): `PENDING` | `ANNOUNCED`
- `announced_at` (timestamptz): เวลาที่ประกาศผลจริง
- **Unique Constraint:** `UNIQUE(market_id, draw_date, round_key)`

#### 4. `bets` (โพยการเดิมพันของสมาชิก)
- `id` (uuid, PK): รหัสโพย
- `user_id` (uuid, FK -> `profiles.id`): สมาชิกที่แทง
- `market_id` (uuid, FK -> `lottery_markets.id`): ตลาดหวย
- `draw_date` (date): งวดที่แทง
- `round_key` (varchar, DEFAULT ''): รอบที่แทง
- `bet_type` (varchar): ประเภทแทง (`3top`, `2top`, `2bottom`, `3bottom`, `3front`, `run_top`, `run_bottom`, `4straight`, `5straight`, `6straight`)
- `number` (varchar): ตัวเลขที่แทง
- `amount` (numeric): ยอดเงินที่เดิมพัน (บาท)
- `payout_rate` (numeric): อัตราจ่ายต่อ 1 บาท
- `potential_payout` (numeric): ยอดที่อาจชนะรางวัล (`amount * payout_rate`)
- `actual_payout` (numeric): ยอดชนะรางวัลจริงที่จ่ายออก
- `status` (varchar): `PENDING` | `WON` | `LOST` | `CANCELLED`
- `created_at` (timestamptz): เวลาที่ส่งโพย

#### 5. `payout_rates` (ตารางกำหนดอัตราจ่ายรางวัลมาตรฐาน)
- `id` (uuid, PK)
- `market` (varchar): รหัสตลาด เช่น `THAI_GOV`, `LAO`, `HANOI`, `GLOBAL`
- `bet_type` (varchar): ชนิดตัวเลข เช่น `3top` (จ่าย 900), `2top` (จ่าย 90), `2bottom` (จ่าย 90)
- `rate` (numeric): อัตราจ่ายต่อ 1 บาท
- **Unique Constraint:** `UNIQUE(market, bet_type)`

#### 6. `restricted_numbers` (ตารางจัดการเลขอั้นและเลขปิดรับ)
- `id` (uuid, PK)
- `market_id` (uuid, FK -> `lottery_markets.id`)
- `bet_type` (varchar): ประเภทการแทงที่ถูกอั้น
- `number` (varchar): เลขที่ถูกอั้น
- `max_amount` (numeric): ยอดเดิมพันสูงสุดที่รับได้ต่อคน (ถ้าเป็น 0 แปลว่าปิดรับแทง)
- `payout_rate` (numeric): อัตราจ่ายลดพิเศษ (เช่น จ่ายครึ่งราคา)
- `draw_date` (date): งวดที่มีผล

---

### 1.2 กลุ่มตารางสมาชิกและการเงิน (Core Financial & Membership)

#### 7. `profiles` (ข้อมูลบัญชีผู้ใช้และแอดมิน)
- `id` (uuid, PK -> `auth.users.id`): รหัสตรงกับ Supabase Auth
- `member_id` (varchar, UNIQUE): รหัสสมาชิกระบบ (เช่น `TH882910`)
- `phone` (varchar, UNIQUE): หมายเลขโทรศัพท์
- `full_name` (varchar): ชื่อ-นามสกุลจริง
- `avatar_url` (text): ลิงก์รูปโปรไฟล์ (รองรับ Google Avatar อัตโนมัติ)
- `bank_name` (varchar): ธนาคารของสมาชิก
- `bank_account_number` (varchar): เลขบัญชีธนาคาร
- `bank_account_name` (varchar): ชื่อบัญชีธนาคาร
- `vip_level` (varchar): ระดับ VIP (`VIP 0` - `VIP 5`)
- `is_admin` (boolean): สิทธิ์ผู้ดูแลระบบ
- `admin_role` (varchar): ตำแหน่ง (`superadmin`, `admin`, `operator`)
- `status` (varchar): `active` | `banned` | `suspended`

#### 8. `wallets` (กระเป๋าเงินสมาชิก)
- `id` (uuid, PK)
- `user_id` (uuid, UNIQUE, FK -> `profiles.id`)
- `balance` (numeric, DEFAULT 0.00): ยอดเงินคงเหลือจริงที่ใช้แทงและถอนได้
- `commission_balance` (numeric, DEFAULT 0.00): ยอดเงินแนะนำเพื่อน (Affiliate)

#### 9. `transactions` (ประวัติการเดินบัญชีทุกชนิด)
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `profiles.id`)
- `type` (varchar): `DEPOSIT`, `WITHDRAW`, `BET_PLACED`, `LOTTERY_WIN`, `ADMIN_ADJUST_ADD`, `ADMIN_ADJUST_SUB`, `WHEEL_SPIN`, `WHEEL_WIN`, `REFUND_WITHDRAW`
- `amount` (numeric): จำนวนเงินในรายการ
- `balance_after` (numeric): ยอดเงินคงเหลือหลังจากทำรายการสำเร็จ
- `status` (varchar): `PENDING` | `COMPLETED` | `FAILED`
- `reference_id` (uuid): อ้างอิง ID ของโพยหวย หรือคำขอฝากถอน

#### 10. `deposit_requests` & `withdraw_requests` (คำขอฝากและถอนเงิน)
- จัดเก็บยอดเงิน, หลักฐานสลิป (`slip_url`), สถานะ (`PENDING`, `APPROVED`, `REJECTED`), และผู้ดูแลระบบผู้อนุมัติ (`approved_by`)

---

## 2. ฟังก์ชันและกระบวนการทำงานฐานข้อมูล (PL/pgSQL Functions & Triggers)

### 2.1 Trigger: `trg_on_result_announced`
- **ตารางที่จับ:** `lottery_results`
- **เงื่อนไขทำงาน:** `AFTER INSERT OR UPDATE ON lottery_results FOR EACH ROW WHEN (NEW.status = 'ANNOUNCED')`
- **การทำงาน:** เรียกคำสั่ง `PERFORM fn_settle_result(NEW.id);`

### 2.2 Function: `fn_settle_result(p_result_id uuid)`
กระบวนการคำนวณเงินและปรับสถานะโพยแบบอัตโนมัติ:
```sql
CREATE OR REPLACE FUNCTION public.fn_settle_result(p_result_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r RECORD;
    b RECORD;
    v_is_win boolean;
    v_actual_payout numeric;
    v_new_balance numeric;
BEGIN
    SELECT * INTO r FROM public.lottery_results WHERE id = p_result_id;
    IF NOT FOUND THEN RETURN; END IF;

    FOR b IN 
        SELECT * FROM public.bets 
        WHERE market_id = r.market_id 
          AND draw_date = r.draw_date
          AND round_key = COALESCE(r.round_key, '')
          AND status = 'PENDING'
    LOOP
        v_is_win := false;
        
        -- ตรวจสอบเงื่อนไขตามชนิดการแทง (3top, 2top, 2bottom, run_top, run_bottom ฯลฯ)
        IF b.bet_type = '3top' AND b.number = r.result_3top THEN
            v_is_win := true;
        ELSIF b.bet_type = '2top' AND b.number = r.result_2top THEN
            v_is_win := true;
        ELSIF b.bet_type = '2bottom' AND b.number = r.result_2bottom THEN
            v_is_win := true;
        ELSIF b.bet_type = '3front' AND b.number = r.result_3front THEN
            v_is_win := true;
        ELSIF b.bet_type = '3bottom' AND b.number = r.result_3bottom THEN
            v_is_win := true;
        ELSIF b.bet_type = 'run_top' AND position(b.number in r.result_3top) > 0 THEN
            v_is_win := true;
        ELSIF b.bet_type = 'run_bottom' AND position(b.number in r.result_2bottom) > 0 THEN
            v_is_win := true;
        END IF;

        IF v_is_win THEN
            v_actual_payout := b.amount * b.payout_rate;
            UPDATE public.bets 
            SET status = 'WON', actual_payout = v_actual_payout, updated_at = NOW() 
            WHERE id = b.id;

            -- เพิ่มเงินเข้ากระเป๋าสมาชิกแบบ Atomic
            UPDATE public.wallets 
            SET balance = balance + v_actual_payout, updated_at = NOW() 
            WHERE user_id = b.user_id 
            RETURNING balance INTO v_new_balance;

            -- บันทึกประวัติธุรกรรม
            INSERT INTO public.transactions (user_id, type, amount, balance_after, status, reference_id, note)
            VALUES (b.user_id, 'LOTTERY_WIN', v_actual_payout, v_new_balance, 'COMPLETED', b.id, 'ถูกรางวัลหวย ' || b.bet_type);
        ELSE
            UPDATE public.bets 
            SET status = 'LOST', actual_payout = 0, updated_at = NOW() 
            WHERE id = b.id;
        END IF;
    END LOOP;

    -- ปรับสถานะงวดในตาราง draw_schedules ให้เป็น SETTLED
    UPDATE public.draw_schedules 
    SET status = 'SETTLED', updated_at = NOW() 
    WHERE market_id = r.market_id 
      AND draw_date = r.draw_date 
      AND round_key = COALESCE(r.round_key, '');
END;
$$;
```

---

## 3. สัญญาระบบและ API Endpoints (API Contracts)

### 3.1 Next.js Admin Gateway (`/api/admin/data`)

#### `GET /api/admin/data?resource={RESOURCE}`
- **พารามิเตอร์ `resource` ที่รองรับ:**
  - `dashboard`: สรุปข้อมูลการเงินรวม, รายวัน, Top 10 ผู้เล่น, กราฟ 7 วัน
  - `markets`: รายการตลาดหวยทั้งหมด เรียงตาม `display_order`
  - `results`: รายการผลรางวัล 100 รายการล่าสุด พร้อม Join กับ `lottery_markets`
  - `schedules`: ตารางเวลาออกรางวัลงวดถัดไป
  - `bets`: รายการโพยเดิมพันทั้งหมด (รองรับพารามิเตอร์ `limit`)
  - `deposits`: รายการแจ้งฝากเงินทั้งหมด พร้อมข้อมูลบัญชีธนาคารสมาชิก
  - `withdrawals`: รายการแจ้งถอนเงินทั้งหมด
  - `members`: รายการสมาชิก พร้อมยอดเงินในกระเป๋า (`wallets`)
  - `member-detail&id={UUID}`: รายละเอียดเฉพาะคน (โพย, ธุรกรรม, การฝาก-ถอน, ประวัติล็อกอิน)
  - `content`: ดึงข้อมูล CMS ทั้งหมด (สไลเดอร์, บทความ, โปรโมชั่น, บัญชีธนาคาร, วงล้อ)
  - `settings`: คีย์การตั้งค่าระบบทั้งหมด
  - `restricted-numbers`: รายการเลขอั้นทั้งหมด
  - `table-stats`: จำนวนแถวและขนาดหน่วยความจำของ 24 ตารางระบบ
  - `counts`: ตัวเลขแจ้งเตือนสำหรับ Badge บนเมนู (ฝากรออนุมัติ, ถอนรออนุมัติ ฯลฯ)

#### `POST /api/admin/data`
- **รูปแบบ Request Body:** `{ action: string, payload: object }`
- **Actions ที่รองรับ:**
  - `update_market`: บันทึกการเปิด/ปิด, เวลาออกรางวัล, เวลาปิดรับแทง และอัตราจ่าย
  - `record_result`: กรอกผลรางวัลด้วยมือ และกระตุ้น Settlement อัตโนมัติ
  - `update_deposit`: อนุมัติ/ปฏิเสธการฝากเงิน (เพิ่มเครดิตเข้ากระเป๋าเมื่อ `APPROVED`)
  - `update_withdrawal`: อนุมัติ/ปฏิเสธการถอนเงิน (คืนเครดิตเข้ากระเป๋าเมื่อ `REJECTED`)
  - `adjust_wallet`: แอดมินปรับเพิ่ม/ลดยอดเงินสมาชิกด้วยตนเอง
  - `update_member`: แก้ไขชื่อ, เบอร์โทร, เลขบัญชี, ระดับ VIP หรือระงับสิทธิ์
  - `upsert_restricted_number` / `delete_restricted_number`: จัดการเลขอั้น
  - `upsert_slider` / `delete_slider` / `reorder_sliders`: จัดการแบนเนอร์หน้าแรก
  - `upsert_promotion` / `delete_promotion`: จัดการโปรโมชั่น
  - `upsert_article` / `delete_article`: จัดการบทความ
  - `upsert_bank` / `delete_bank`: จัดการบัญชีรับโอนของระบบ
  - `update_wheel_prize` / `update_wheel_config`: ปรับแต่งรางวัลวงล้อและโอกาสออก
  - `send_broadcast`: ส่งข้อความประกาศถึงสมาชิกทุกคนหรือรายบุคคล
  - `update_setting` / `batch_update_settings`: บันทึกการตั้งค่าระบบ

---

### 3.2 Automated ThaiLottoAPI Sync Gateway (`/api/admin/sync-results`)

#### `POST /api/admin/sync-results`
- **หน้าที่:** ดึงผลรางวัลสดจาก `https://thailottoapi.com/api/results` แล้วแปลงข้อมูลลง `lottery_results` อัตโนมัติ
- **Payload Response ตัวอย่าง:**
```json
{
  "success": true,
  "message": "ซิงก์ผลรางวัลสำเร็จ 79 งวด",
  "synced_count": 79,
  "results": [
    { "market_code": "THLOTTO_15M", "round_key": "75", "result_3top": "812", "result_2bottom": "45" },
    { "market_code": "THAI_GOV", "draw_date": "2026-09-01", "result_main": "982341", "result_3top": "341", "result_2bottom": "92" }
  ]
}
```

---

## 4. เมทริกซ์ประเภทตัวเลขตามชนิดหวย (Lottery Betting Capabilities)

| หมวดหมู่ตลาดหวย | ตัวอย่างตลาด | ประเภทแทงที่รองรับในระบบ | จำนวนหลักสูงสุด |
| :--- | :--- | :--- | :--- |
| **หวยรัฐบาลไทย / ออมสิน / ธ.ก.ส.** | `THAI_GOV`, `GSB`, `BAAC` | 6 ตัวตรง, 3 ตัวบน, 3 ตัวโต๊ด, 3 ตัวหน้า, 3 ตัวท้าย, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง | **6 หลัก** |
| **หวยลาว (Lao Lottery)** | `LAO_DEVELOP`, `LAO_STAR`, `LAO_VIP` | 6 ตัวตรง, 5 ตัวตรง, 4 ตัวตรง, 3 ตัวบน, 3 ตัวโต๊ด, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง | **6 หลัก** |
| **หวยฮานอย (Hanoi Lottery)** | `HANOI_REGULAR`, `HANOI_VIP`, `HANOI_SPECIAL` | 5 ตัวตรง, 4 ตัวตรง, 3 ตัวบน, 3 ตัวโต๊ด, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง | **5 หลัก** |
| **หวยมาเลย์ (Malaysia 4D)** | `MALAY_MAGNUM` | 4 ตัวตรง, 3 ตัวบน, 3 ตัวโต๊ด, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง | **4 หลัก** |
| **หวยหุ้น / หวย 15 นาที** | `NIKKEI`, `HANG_SENG`, `THLOTTO_15M` | 3 ตัวบน, 3 ตัวโต๊ด, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน, วิ่งล่าง | **3 หลัก** |
