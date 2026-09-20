# พิมพ์เขียวสถาปัตยกรรมระบบ (Architecture Blueprint)
**โครงการ:** THLOTTO-II (Next-Gen Lottery & Gaming Platform)  
**มาตรฐานกำกับ:** ARM AI Engineering Standard (ARM-AES v1.0)  
**เวอร์ชันเอกสาร:** 1.0.0 (Production Release Blueprint)  
**สถานะ:** สมบูรณ์ 100% พร้อมใช้งานจริง  

---

## 1. บทสรุปผู้บริหารและวิสัยทัศน์ทางสถาปัตยกรรม (Executive Overview)

THLOTTO-II เป็นแพลตฟอร์มระบบหวยออนไลน์และการเดิมพันแบบครบวงจรระดับสากล สถาปัตยกรรมถูกออกแบบภายใต้หลักการ **Clean Architecture**, **Domain-Driven Design (DDD)**, และ **Security-by-Design** โดยแยกส่วนการทำงานระหว่าง:
1. **แผงควบคุมผู้ดูแลระบบ (UI Admin):** สร้างด้วย **Next.js 15 (App Router)** ให้ประสิทธิภาพระดับ SSR/Server Actions สำหรับงานประมวลผลและการบริหารจัดการ
2. **ระบบลูกค้าและผู้ใช้งาน (UI Customer):** สร้างด้วย **React 19 + Vite 6** ให้ความรวดเร็วระดับ Ultra-fast Single Page Application (SPA) เพื่อการเล่นเกมและการแทงหวยแบบไร้รอยต่อ
3. **โครงสร้างพื้นฐานข้อมูลและ Realtime Backend (Supabase BaaS):** ใช้ **PostgreSQL 15** ขับเคลื่อนด้วย Stored Procedures, PL/pgSQL Automated Triggers, และ Row Level Security (RLS) เพื่อให้การออกรางวัลและการคำนวณผลชนะเป็น **Atomic & Instantaneous Settlement**
4. **ผู้ให้บริการข้อมูลรางวัลภายนอก (ThaiLottoAPI Gateway):** เชื่อมโยงผลรางวัลหวยสดระดับชาติและนานาชาติมากกว่า 22 ชนิด (ทั้งหวยรัฐบาล, ออมสิน, ธ.ก.ส., ฮานอย, ลาว, มาเลย์, หุ้น และหวยความเร็วสูง 15 นาที) ผ่านระบบ Secure Automated Polling & Manual Triggering

---

## 2. C4 Architecture Models

### 2.1 C4 Level 1: บริบทระบบ (System Context Diagram)

```mermaid
C4Context
    title C4 Level 1: System Context Diagram for THLOTTO-II

    Person(customer, "ลูกค้า / สมาชิก", "เข้าใช้งานเว็บเพื่อแทงหวย ดูผลรางวัล เติมเงิน ถอนเงิน หมุนวงล้อ")
    Person(admin, "ผู้ดูแลระบบ (Admin)", "จัดการตลาดหวย, ประกาศผลรางวัล, อนุมัติการฝาก-ถอน, ดูแดชบอร์ดการเงิน")

    System(thlotto_system, "ระบบ THLOTTO-II Platform", "ศูนย์กลางการให้บริการหวยออนไลน์ การเงิน และเกมความบันเทิง")

    System_Ext(thailotto_api, "ThaiLottoAPI Service", "API ภายนอก ดึงผลรางวัลหวยไทย หวยหุ้น หวยต่างประเทศ และหวย 15 นาที")
    System_Ext(bank_transfer, "Payment & Banking System", "ระบบโอนเงินผ่านบัญชีธนาคารและสลิป PromptPay")

    Rel(customer, thlotto_system, "เข้าใช้งานผ่านเบราว์เซอร์ / มือถือ", "HTTPS / WSS")
    Rel(admin, thlotto_system, "จัดการระบบและตรวจสอบการเงิน", "HTTPS")
    Rel(thlotto_system, thailotto_api, "ดึงผลรางวัลสด (Automated Polling / On-Demand Sync)", "JSON / REST API")
    Rel(customer, bank_transfer, "โอนเงิน / อัปโหลดสลิป", "Mobile Banking")
    Rel(admin, bank_transfer, "ตรวจสอบยอดและกระทบยอดเงิน", "Online Banking")
```

---

### 2.2 C4 Level 2: สถาปัตยกรรมคอนเทนเนอร์ (Container Diagram)

```mermaid
C4Container
    title C4 Level 2: Container Diagram for THLOTTO-II

    Container(spa_customer, "UI Customer (Web SPA)", "React 19, Vite, Tailwind CSS, Lucide Icons", "ส่วนต่อประสานผู้ใช้: แทงหวย 22 ตลาด, หวย 15 นาที, วงล้อเสี่ยงโชค, กระเป๋าเงิน")
    Container(ssr_admin, "UI Admin (Management Hub)", "Next.js 15, React 19, Tailwind CSS, Radix UI", "ศูนย์สั่งการแอดมิน: แดชบอร์ดสรุปรายวัน, ซิงก์ผลหวย, จัดการสมาชิก, อนุมัติฝากถอน")
    
    ContainerDb(supabase_db, "Supabase PostgreSQL Database", "PostgreSQL 15, PL/pgSQL, Triggers, RLS", "จัดเก็บข้อมูลตลาดหวย, โพยหวย, บัญชีผู้ใช้, ธุรกรรมการเงิน, สถิติ")
    Container(supabase_auth, "Supabase Authentication", "OAuth 2.0, WebAuthn, JWT", "ระบบจัดการตัวตนผู้ใช้ รองรับ Google One-Tap และ Phone/Password")
    Container(supabase_realtime, "Supabase Realtime Engine", "WebSockets / PostgreSQL CDC", "สตรีมผลรางวัล, อัปเดตยอดเงิน, แจ้งเตือนแอดมินแบบ Realtime")

    System_Ext(ext_api, "ThaiLottoAPI Gateway", "REST HTTPS API (thailottoapi.com)", "แหล่งข้อมูลผลรางวัลหวยอย่างเป็นทางการ")

    Rel(spa_customer, supabase_auth, "ยืนยันตัวตน / Refresh Token", "HTTPS")
    Rel(spa_customer, supabase_db, "อ่านข้อมูลตลาด, ส่งโพยหวย, ดึงผลรางวัล (RLS)", "PostgREST / HTTPS")
    Rel(spa_customer, supabase_realtime, "รับผลรางวัลสดและแจ้งเตือนยอดเงิน", "WSS")

    Rel(ssr_admin, supabase_db, "อ่าน/เขียนข้อมูลระบบผ่าน Service Role Key", "PostgreSQL / HTTPS")
    Rel(ssr_admin, ext_api, "ส่งคำสั่งขอซิงก์ผลรางวัลล่าสุด", "HTTPS / JSON")
    Rel(supabase_db, ssr_admin, "ตอบกลับสถิติและข้อมูลธุรกรรม", "JSON")
```

---

### 2.3 C4 Level 3: สถาปัตยกรรมคอมโพเนนต์ภายใน UI Admin (Component Diagram)

UI Admin แบ่งออกเป็น 21 โมดูลหน้างาน โดยทุกโมดูลเชื่อมต่อฐานข้อมูลจริงผ่าน REST Gateway (`/api/admin/data` และ `/api/admin/sync-results`):

| โมดูลหน้างาน (Component) | หน้าที่หลัก (Core Responsibilities) | ฐานข้อมูลที่เกี่ยวข้อง |
| :--- | :--- | :--- |
| **Dashboard (`dashboard.tsx`)** | สรุปยอดเงินรวม (ฝาก, ถอน, กำไร-ขาดทุน), Top 10 ผู้เล่น, กราฟสถิติ 7 วัน | `deposit_requests`, `withdraw_requests`, `bets`, `profiles` |
| **Results Hub (`results.tsx`)** | ตรวจสอบผลรางวัล, กรอกผลด้วยมือ, ปุ่มกดซิงก์ ThaiLottoAPI แบบอัตโนมัติ | `lottery_results`, `draw_schedules`, `lottery_markets`, `bets` |
| **Markets Manager (`markets.tsx`)** | เปิด/ปิดรับแทง, ปรับเวลาปิดรับแทง, แก้ไขอัตราจ่ายตามประเภทหวย | `lottery_markets`, `payout_rates` |
| **Deposits Engine (`deposits.tsx`)** | ตรวจสอบสลิปโอนเงิน, อนุมัติ/ปฏิเสธ, ปรับยอดเงินเข้ากระเป๋าสมาชิกทันที | `deposit_requests`, `wallets`, `transactions` |
| **Withdrawals Engine (`withdrawals.tsx`)** | ตรวจสอบคำขอถอนเงิน, ตรวจสอบเลขบัญชี, อนุมัติ/ปฏิเสธ (พร้อมคืนยอดอัตโนมัติ) | `withdraw_requests`, `wallets`, `transactions` |
| **Members Manager (`members.tsx`, `member-detail.tsx`)** | ตรวจสอบประวัติสมาชิก, ประวัติแทง, ปรับยอดเงิน (Manual Adjustment), ระงับสิทธิ์ | `profiles`, `wallets`, `bets`, `transactions`, `login_attempts` |
| **Restricted Numbers (`restricted.tsx`)** | กำหนดเลขอั้น, ปิดรับแทงบางเลข, กำหนดอัตราจ่ายครึ่งราคา | `restricted_numbers`, `lottery_markets` |
| **Instant Lotto (`instant.tsx`)** | จัดการหวยไว 1 นาที (Instant Lotto), จัดการอัตราจ่ายและประวัติ | `instant_bet_types`, `settings` |
| **Wheel System (`wheel.tsx`)** | จัดการรางวัลวงล้อเสี่ยงโชค, กำหนดโอกาสออก (Probability), ค่าธรรมเนียมต่อรอบ | `lucky_wheel_prizes`, `lucky_wheel_spins`, `settings` |
| **Content & CMS (`sliders.tsx`, `promotions.tsx`, `articles.tsx`, `feeds.tsx`)** | ปรับแต่งแบนเนอร์, จัดการโปรโมชั่น, เขียนบทความ SEO, ฟีดข่าวสาร | `sliders`, `promotions`, `articles`, `announcements` |
| **Banking Setup (`banks.tsx`)** | จัดการบัญชีธนาคารสำหรับฝากเงินของระบบ | `banks` |
| **Admin Broadcast (`broadcast.tsx`)** | ส่งข้อความแจ้งเตือนถึงสมาชิกทุกคน หรือรายบุคคล | `notifications` |
| **System Settings & Data (`settings.tsx`, `data-management.tsx`, `admins.tsx`)** | ตั้งค่าระบบทั่วไป, แบ็กอัปข้อมูล, ตรวจสอบสถานะตารางข้อมูล, จัดการแอดมิน | `settings`, `admin_roles`, System Tables |

---

## 3. ผังการไหลของข้อมูล (Dynamic Data Flow Pipelines)

### 3.1 การออกรางวัลและการคิดเงินอัตโนมัติ (Automated Settlement Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as ผู้ดูแลระบบ / ระบบตั้งเวลา (Worker)
    participant SyncAPI as Next.js API (/api/admin/sync-results)
    participant ThaiLotto as ThaiLottoAPI (External)
    participant DB as Supabase PostgreSQL
    participant Trigger as trg_on_result_announced
    participant SettleProc as fn_settle_result()
    participant Wallet as ตาราง wallets / transactions
    participant User as สมาชิก (UI Customer)

    Admin->>SyncAPI: สั่งซิงก์ผลรางวัล (Manual หรือ Scheduled)
    SyncAPI->>ThaiLotto: GET https://thailottoapi.com/api/results
    ThaiLotto-->>SyncAPI: ส่งรายการผลรางวัลล่าสุด (JSON)
    SyncAPI->>DB: Upsert ผลรางวัลลงตาราง lottery_results (Status: ANNOUNCED)
    DB->>Trigger: ตรวจพบ INSERT/UPDATE ผลรางวัลสถานะ ANNOUNCED
    Trigger->>SettleProc: เรียกทำงาน fn_settle_result(result_id)
    Note over SettleProc: ค้นหาโพยหวย (bets) ทั้งหมดในตลาดและงวดเดียวกัน<br/>ตรวจเงื่อนไขเลข 3 ตัวตรง, 2 ตัวบน, 2 ตัวล่าง, วิ่งบน-ล่าง
    alt โพยถูกรางวัล (WON)
        SettleProc->>DB: อัปเดตสถานะโพยเป็น 'WON' พร้อมระบุยอด actual_payout
        SettleProc->>Wallet: เพิ่มยอดเงินเข้า wallets.balance
        SettleProc->>Wallet: บันทึกประวัติใน transactions (type: 'LOTTERY_WIN')
        SettleProc->>User: ส่งแจ้งเตือนถูกรางวัล (notifications)
    else โพยไม่ถูกรางวัล (LOST)
        SettleProc->>DB: อัปเดตสถานะโพยเป็น 'LOST'
    end
    DB-->>SyncAPI: บันทึกและปรับปรุงตารางสำเร็จ
    SyncAPI-->>Admin: แจ้งจำนวนงวดที่ซิงก์สำเร็จและยอดจ่าย
```

---

### 3.2 ขั้นตอนการตรวจสอบและอนุมัติการฝากเงิน (Deposit Approval Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Member as ลูกค้า / สมาชิก
    participant Web as UI Customer (QRPayment / Deposit)
    participant DB as Supabase PostgreSQL
    participant AdminUI as UI Admin (Deposits Page)
    actor Admin as เจ้าหน้าที่แอดมิน

    Member->>Web: โอนเงินและอัปโหลดหลักฐานสลิป (slip_url)
    Web->>DB: สร้างรายการใน deposit_requests (status: PENDING)
    DB-->>AdminUI: Realtime แจ้งเตือนแอดมินพบยอดฝากใหม่
    Admin->>AdminUI: ตรวจสอบหลักฐานสลิปและยอดเงิน
    alt อนุมัติ (Approve)
        Admin->>AdminUI: กดปุ่ม "อนุมัติ" (status: APPROVED)
        AdminUI->>DB: POST /api/admin/data (action: update_deposit)
        DB->>DB: ปรับปรุงสถานะ deposit_requests เป็น APPROVED
        DB->>DB: เพิ่มยอดเงินใน wallets.balance
        DB->>DB: บันทึก transactions (type: DEPOSIT, status: COMPLETED)
        DB-->>Member: ยอดเงินในหน้าเว็บอัปเดตทันทีแบบ Realtime
    else ปฏิเสธ (Reject)
        Admin->>AdminUI: ระบุเหตุผล และกด "ปฏิเสธ" (status: REJECTED)
        AdminUI->>DB: POST /api/admin/data (action: update_deposit)
        DB->>DB: บันทึก admin_note และสถานะ REJECTED
    end
```

---

## 4. มาตรการความปลอดภัยเชิงสถาปัตยกรรม (Security-by-Design Architecture)

1. **Role-Based Access Control (RBAC):**
   - แยกระดับสิทธิ์อย่างเด็ดขาดระหว่าง `is_admin = true` และผู้ใช้ทั่วไป
   - Next.js Admin API ใช้ **Service Role Key** ภายใน Server Environment เท่านั้น ไม่มีการเปิดเผยคีย์ระดับแอดมินใน Bundle ของฝั่ง Client เด็ดขาด
2. **Atomic Financial Transactions:**
   - การตัดเงินแทงหวย, การเพิ่มยอดเงินเมื่อถูกรางวัล, การอนุมัติฝากถอน ทำงานผ่านฐานข้อมูลแบบ Transaction Isolation เพื่อป้องกัน Race Condition หรือ Double Spending
3. **Automated Error Trapping & Rollback:**
   - การปฏิเสธคำขอถอนเงิน (`update_withdrawal` -> `REJECTED`) มีระบบคืนยอดเงินกลับเข้ากระเป๋าสมาชิกแบบอัตโนมัติพร้อมบันทึก Audit Log ลงในตาราง `transactions`
4. **Environment Isolation:**
   - ไฟล์คอนฟิกูเรชันความลับ (`SUPABASE_SERVICE_ROLE_KEY`, Database Passwords) ถูกแยกเก็บใน `.env.local` ปลอดภัยจากการ Commit เข้า Git Repository
5. **6-Digit Security PIN & Financial Authorization:**
   - การยืนยันตัวตนทางการเงิน (การถอนเงิน, การเปลี่ยนรหัสผ่าน, การตั้งรหัสใหม่) บังคับใช้มาตรฐานรหัส PIN ตัวเลข **6 หลัก** ที่เข้ารหัสแบบ SHA-256 (`pin_hash`) และประมวลผลผ่าน Stored Procedure `request_withdrawal_securely` พร้อมการล็อกแถว (`FOR UPDATE`)
6. **Canonical Single Source of Truth (SSOT) for Member Bank Accounts:**
   - ข้อมูลบัญชีธนาคารสำหรับรับเงินถอนของสมาชิกถูกจัดเก็บและดึงข้อมูลจากตาราง `profiles` (`bank_name`, `bank_account_number`, `bank_account_name`) เป็นศูนย์กลางความจริงหนึ่งเดียว เพื่อป้องกันความคลาดเคลื่อนและการกระจายตัวของข้อมูลทางการเงิน
