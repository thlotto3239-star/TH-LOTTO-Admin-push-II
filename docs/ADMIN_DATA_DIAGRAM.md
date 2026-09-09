# 🏛️ THLOTTO-II — ADMIN DATA MANAGEMENT & UI ARCHITECTURE DIAGRAMS
**เอกสารประกอบการออกแบบ UI/UX และผังข้อมูลระบบหลังบ้าน (Admin Portal)**  
**มาตรฐาน:** ARM AI Engineering Standard (ARM-AES v1.0) & [docs/SYSTEM_BLUEPRINT.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/SYSTEM_BLUEPRINT.md)  
**Database:** Supabase PostgreSQL 15 (`ygopnjbvccenryejqmlw`)

---

## 1. 🗺️ ภาพรวมสถาปัตยกรรมข้อมูลแอดมิน 22 โมดูล (Admin Functional Topology)

```mermaid
graph TD
    classDef superAdmin fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b;
    classDef staff fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#3730a3;
    classDef core fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534;
    classDef db fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e;

    AdminAuth[🔑 Admin Authentication<br/>Super Admin / Staff RBAC]:::superAdmin

    subgraph SEC_FIN [💰 1. หมวดการเงินและความมั่นคง - Super Admin เท่านั้น]
        M_DEP[4. จัดการเงินฝาก<br/>deposits.tsx]:::superAdmin
        M_WTH[5. จัดการเงินถอน<br/>withdrawals.tsx]:::superAdmin
        M_BNK[6. บัญชีธนาคารบริษัท<br/>banks.tsx]:::superAdmin
        M_DAT[20. สำรองข้อมูล & Logs<br/>data-management.tsx]:::superAdmin
        M_ADM[21. สิทธิ์แอดมิน & Staff<br/>admins.tsx]:::superAdmin
        M_SET[18. สวิตช์ตั้งค่าระบบ<br/>settings.tsx]:::superAdmin
    end

    subgraph SEC_LOTTO [🎲 2. หมวดหวย การเดิมพัน และผลรางวัล]
        M_MKT[7. ตลาดหวย 37 ตลาด<br/>markets.tsx]:::staff
        M_RST[8. เลขอั้น & จ่ายครึ่ง<br/>restricted.tsx]:::staff
        M_BET[9. โพยหวยทั้งหมด<br/>bets.tsx]:::staff
        M_RES[10. คีย์ผล & จ่ายเงิน<br/>results.tsx]:::staff
        M_INS[11. หวยไว 1 นาที RNG<br/>instant.tsx]:::staff
    end

    subgraph SEC_USER [👥 3. หมวดสมาชิกและพันธมิตร]
        M_DASH[1. แดชบอร์ดสรุปยอด<br/>dashboard.tsx]:::staff
        M_MEM[2. จัดการสมาชิก<br/>members.tsx]:::staff
        M_DET[3. เจาะลึกรายบุคคล<br/>member-detail.tsx]:::staff
        M_AFF[22. สายงานพันธมิตร<br/>affiliate.tsx]:::staff
    end

    subgraph SEC_CMS [📢 4. หมวดเนื้อหา การตลาด & รูปลักษณ์]
        M_FEE[12. ตัววิ่ง Marquee<br/>feeds.tsx]:::staff
        M_SLI[13. สไลเดอร์แบนเนอร์<br/>sliders.tsx]:::staff
        M_PRO[14. โปรโมชั่น & โบนัส<br/>promotions.tsx]:::staff
        M_ART[15. บทความ & SEO<br/>articles.tsx]:::staff
        M_WHE[16. วงล้อเสี่ยงโชค<br/>wheel.tsx]:::staff
        M_BRO[17. บรอดแคสต์พุช<br/>broadcast.tsx]:::staff
        M_APP[19. ปรับแต่งธีม & ป๊อปอัป<br/>appearance.tsx]:::staff
    end

    AdminAuth --> SEC_FIN
    AdminAuth --> SEC_LOTTO
    AdminAuth --> SEC_USER
    AdminAuth --> SEC_CMS

    %% Database Bindings
    SEC_FIN --> DB_FIN[(💳 Financial DB<br/>deposit_requests<br/>withdraw_requests<br/>wallets, transactions<br/>banks, backup_logs)]:::db
    SEC_LOTTO --> DB_LOTTO[(🎯 Lottery DB<br/>lottery_markets<br/>payout_rates<br/>restricted_numbers<br/>draw_schedules<br/>bets, lottery_results<br/>instant_draws, instant_bets)]:::db
    SEC_USER --> DB_USER[(👤 User DB<br/>profiles, wallets<br/>login_attempts<br/>referrals, referral_settings)]:::db
    SEC_CMS --> DB_CMS[(🎨 CMS & Settings DB<br/>announcements, sliders<br/>promotions, articles<br/>lucky_wheel_prizes<br/>notifications, settings)]:::db
```

---

## 2. 🗄️ ความสัมพันธ์เชิงโครงสร้างข้อมูลแอดมิน (Entity Relationship Diagram)

```mermaid
erDiagram
    profiles ||--o{ wallets : "owns 1:1"
    profiles ||--o{ transactions : "ledger records"
    profiles ||--o{ deposit_requests : "submits"
    profiles ||--o{ withdraw_requests : "requests"
    profiles ||--o{ bets : "places"
    profiles ||--o{ instant_bets : "plays"
    profiles ||--o{ login_attempts : "logs"
    profiles ||--o{ lucky_wheel_spins : "spins"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ referrals : "refers / referred"

    lottery_markets ||--o{ draw_schedules : "schedules"
    lottery_markets ||--o{ payout_rates : "defines rates"
    lottery_markets ||--o{ restricted_numbers : "limits risk"
    draw_schedules ||--o{ bets : "contains"
    draw_schedules ||--o{ lottery_results : "settles"

    admin_users ||--o{ admin_audit_logs : "creates"
    admin_users ||--o{ backup_logs : "exports"

    settings ||--o{ system_configurations : "kv-store"

    profiles {
        uuid id PK
        string member_id UK
        string phone UK
        string full_name
        string bank_name
        string bank_account_number
        string vip_level
        boolean is_admin
        string admin_role
        string status
    }

    wallets {
        uuid id PK
        uuid user_id FK
        numeric balance
        numeric commission_balance
        numeric turnover_balance
    }

    deposit_requests {
        uuid id PK
        uuid user_id FK
        numeric amount
        string slip_url
        string status
        string promo_code
        timestamp approved_at
    }

    withdraw_requests {
        uuid id PK
        uuid user_id FK
        numeric amount
        string status
        string admin_note
        timestamp approved_at
    }

    bets {
        uuid id PK
        uuid user_id FK
        uuid schedule_id FK
        numeric amount
        numeric payout_amount
        string status
        jsonb bet_items
    }

    lottery_results {
        uuid id PK
        uuid schedule_id FK
        string result_3top
        string result_2bottom
        string result_3tod
        timestamp announced_at
    }

    lucky_wheel_prizes {
        int id PK
        int slot_index
        string name
        numeric amount
        numeric probability
        string color
        boolean is_active
    }

    settings {
        string key PK
        text value
        timestamp updated_at
    }
```

---

## 3. ⚙️ ผังกระบวนการจัดการข้อมูลการเงิน (Atomic Financial Processing Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍💼 Super Admin
    participant UI as 🖥️ Admin Portal (deposits.tsx / withdrawals.tsx)
    participant API as 🛡️ API Route (/api/admin/data)
    participant RPC as ⚡ PostgreSQL Atomic Stored Procedure
    participant DB as 🗄️ Supabase Tables (wallets, requests, transactions)
    participant WS as 📡 Realtime WebSocket Channel
    actor Player as 📱 Customer Web App

    %% Deposit Flow
    Note over Admin,Player: --- กระบวนการอนุมัติเงินฝาก (Deposit Approval) ---
    Admin->>UI: ตรวจสลิปโอนเงิน + กดปุ่ม "อนุมัติฝากเงิน"
    UI->>API: POST action: "approve_deposit", request_id
    API->>RPC: admin_service_approve_deposit(p_request_id)
    RPC->>DB: ล็อกแถว FOR UPDATE (deposit_requests + wallets)
    RPC->>DB: UPDATE wallets SET balance = balance + amount
    RPC->>DB: UPDATE deposit_requests SET status = 'approved'
    RPC->>DB: INSERT INTO transactions (type='deposit', status='completed')
    DB-->>API: คืนค่ายอดเงินคงเหลือใหม่ (new_balance)
    API-->>UI: ตอบกลับความสำเร็จ (HTTP 200 OK)
    RPC->>WS: Broadcast 'realtime:wallet:{userId}'
    WS-->>Player: ยอดเครดิตบนแถบ Header เพิ่มขึ้นทันที!

    %% Withdraw Reject Flow
    Note over Admin,Player: --- กระบวนการปฏิเสธเงินถอน & คืนเครดิต (Withdrawal Rejection) ---
    Admin->>UI: ตรวจพบข้อมูลผิดปกติ + กด "ปฏิเสธคำขอ" พร้อมระบุเหตุผล
    UI->>API: POST action: "reject_withdraw", request_id, admin_note
    API->>RPC: admin_service_reject_withdraw(p_request_id, p_admin_note)
    RPC->>DB: ล็อกแถว FOR UPDATE
    RPC->>DB: คืนเงิน: UPDATE wallets SET balance = balance + amount
    RPC->>DB: UPDATE withdraw_requests SET status = 'rejected'
    RPC->>DB: INSERT INTO transactions (type='adjustment', note='คืนเครดิต')
    DB-->>API: สำเร็จ
    API-->>UI: อัปเดตตารางคำขอถอนเงิน
    RPC->>WS: Broadcast 'realtime:wallet:{userId}'
    WS-->>Player: เครดิตถูกคืนเข้ากระเป๋าอัตโนมัติ
```

---

## 4. 🎰 ผังกระบวนการออกรางวัลและคิดเงินบิลหวย (Draw Settle Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍💼 แอดมินคีย์ผลรางวัล
    participant Page as 🖥️ results.tsx / Bot
    participant API as 🛡️ API Route (/api/admin/data)
    participant Engine as ⚙️ Draw Settle Engine (RPC)
    participant DB as 🗄️ Tables: lottery_results, bets, wallets
    participant WS as 📡 Realtime Channel (realtime:results)
    actor Player as 📱 ผู้เล่น

    Admin->>Page: เลือกงวด + กรอกเลข 3 ตัวบน, 2 ตัวล่าง ฯลฯ + กด "ออกรางวัลและจ่ายเงิน"
    Page->>API: POST action: "settle_draw", payload: { schedule_id, results }
    API->>Engine: rpc_settle_lottery_draw(p_schedule_id, p_results)
    Engine->>DB: บันทึกผลลง lottery_results
    Engine->>DB: ดึงบิลแทงทั้งหมดในงวด (WHERE schedule_id = X AND status = 'PENDING') FOR UPDATE
    loop ตรวจสอบทุกรายการแทง (Bet Items)
        Engine->>Engine: เปรียบเทียบเลขที่แทงกับผลรางวัล + คำนวณยอดจ่าย (rate * amount)
    end
    Engine->>DB: อัปเดตสถานะบิล (WON / LOST) และยอด payout_amount
    Engine->>DB: โอนเงินรางวัลเข้ากระเป๋าผู้ถูกรางวัล (UPDATE wallets SET balance = balance + payout)
    Engine->>DB: บันทึก Ledger Transactions (type = 'WIN')
    Engine-->>API: สรุปยอดจ่ายรางวัลทั้งหมด (Total Payouts)
    API-->>Page: แสดงกล่องสรุปยอดจ่ายรางวัล
    Engine->>WS: Broadcast Event: DRAW_SETTLED
    WS-->>Player: หน้าจอผู้เล่นเปลี่ยนสถานะบิลเป็น "ถูกรางวัล" + เครดิตเพิ่มทันที!
```

---

## 5. 📊 เมทริกซ์ 22 โมดูลแอดมิน: ความรับผิดชอบ, สิทธิ์, ตาราง & Actions สำหรับการดีไซน์ UI

| # | โมดูล / ไฟล์ UI | สิทธิ์ (RBAC) | ตาราง Supabase จริง | Actions & RPCs หลัก | องค์ประกอบ UI ที่ควรออกแบบ (Design Elements) |
|---|---|---|---|---|---|
| 1 | **Dashboard**<br>`dashboard.tsx` | Super Admin, Staff | `profiles`, `bets`, `deposit_requests`, `withdraw_requests` | Readonly Analytics | การ์ด KPI รวม, กราฟ BarChart 7 วัน, Top 10 Bettors (แท็บ วันนี้/สัปดาห์/ตลอดกาล), Live Feeds |
| 2 | **Members**<br>`members.tsx` | Super Admin, Staff | `profiles`, `wallets` | `adjust_balance`, `toggle_member_status`, `change_member_vip` | ตารางสมาชิก, Badge สถานะ, ปุ่ม Quick Actions (เติม/ลดเงิน, แบน), ตัวกรอง VIP, ตัวค้นหา Realtime |
| 3 | **Member Detail**<br>`member-detail.tsx` | Super Admin, Staff | `profiles`, `wallets`, `bets`, `transactions`, `login_attempts` | `adjust_balance`, `toggle_status` | ข้อมูลโปรไฟล์ + พิกัด Geo Map, แท็บประวัติแทงหวย, ประวัติการเงิน, ประวัติการเข้าสู่ระบบอุปกรณ์ |
| 4 | **Deposits**<br>`deposits.tsx` | **Super Admin เท่านั้น** | `deposit_requests`, `wallets`, `transactions` | `approve_deposit`, `reject_deposit` (Atomic RPC) | รายการรอตรวจ, Modal ซูมสลิปโอนเงินความละเอียดสูง, ตัวจับเวลาสลิป, ปุ่มกดอนุมัติ/ปฏิเสธแบบ Quick |
| 5 | **Withdrawals**<br>`withdrawals.tsx` | **Super Admin เท่านั้น** | `withdraw_requests`, `wallets`, `transactions` | `approve_withdraw`, `reject_withdraw` (Auto Refund) | รายการรอถอน, เช็กยอดเทิร์นโอเวอร์, ข้อมูลบัญชีผู้รับเงิน, ปุ่มอนุมัติโอน/ปฏิเสธคืนเครดิต |
| 6 | **Banks**<br>`banks.tsx` | **Super Admin เท่านั้น** | `banks`, `settings` | `create_bank`, `update_bank`, `delete_bank`, `toggle_bank_active` | การ์ดสมุดบัญชีธนาคารบริษัท, สวิตช์เปิด-ปิดรับโอน, คอนฟิกยอดฝาก-ถอนต่ำสุด/สูงสุด |
| 7 | **Markets**<br>`markets.tsx` | Super Admin, Staff | `lottery_markets`, `payout_rates` | `toggle_market_status`, `update_payout_rate`, `update_market` | แผง 37 ตลาดหวยจัดกลุ่ม, ตัวนับถอยหลังงวด, ฟอร์มปรับเวลาปิดรับ, ตารางแก้เรทอัตราจ่าย 24 ประเภท |
| 8 | **Restricted**<br>`restricted.tsx` | Super Admin, Staff | `restricted_numbers`, `lottery_markets` | `upsert_restricted_number`, `delete_restricted_number` | ฟอร์มเพิ่มเลขอั้น (ไม่รับแทง) / เลขจ่ายครึ่ง, ตารางกรองตามตลาด, ป้ายแสดงประเภทเลขและอัตราจ่าย |
| 9 | **Bets**<br>`bets.tsx` | Super Admin, Staff | `bets`, `profiles`, `lottery_markets` | `cancel_bet` (Refund to wallet) | ตารางโพยหวยรวม, ฟิลเตอร์สถานะ (รอผล/ถูกรางวัล/ไม่ถูก/ยกเลิก), ดูรายละเอียดตัวเลขย่อยในบิล, ปุ่มยกเลิกบิล |
| 10 | **Results**<br>`results.tsx` | Super Admin, Staff | `lottery_results`, `draw_schedules` | `settle_draw`, `save_draw_result` | หน้าคีย์ผลตัวเลข (3 ตัวบน, 2 ตัวล่าง, โต๊ด, วิ่ง), ตัวพรีวิวคำนวณเงินก่อนกดยืนยัน, ประวัติผลย้อนหลัง |
| 11 | **Instant**<br>`instant.tsx` | Super Admin, Staff | `instant_draws`, `instant_bets`, `instant_bet_types` | `update_instant_bet_type`, `update_instant_settings` | สถิติหวย 1 นาที, กราฟรายชั่วโมง Win/Loss Ratio, ตรวจสอบ Provably Fair Seed Hash, ปรับ Win Rate |
| 12 | **Feeds**<br>`feeds.tsx` | Super Admin, Staff | `announcements`, `trending_items` | `create_announcement`, `update_announcement`, `toggle_announcement` | แผงจัดการตัววิ่ง Marquee หัวเว็บ, สวิตช์เปิด/ปิดตลาดแนะนำ Popular / Trending |
| 13 | **Sliders**<br>`sliders.tsx` | Super Admin, Staff | `sliders` | `create_slider`, `update_slider`, `delete_slider`, `toggle_slider` | อัปโหลดรูปภาพแบนเนอร์ (Desktop/Mobile), จัดลำดับ Drag & Drop, ตั้งค่า Link ปลายทาง |
| 14 | **Promotions**<br>`promotions.tsx` | Super Admin, Staff | `promotions` | `upsert_promotion`, `delete_promotion` | ฟอร์มสร้างโปรโมชั่น, คำนวณโบนัส % หรือ บาท, ตั้งค่าเทิร์นโอเวอร์, ตัวพรีวิวการ์ด Live Preview |
| 15 | **Articles**<br>`articles.tsx` | Super Admin, Staff | `articles` | `create_article`, `update_article`, `delete_article` | Rich Text Editor เขียนแนวทางหวย, ตั้งค่า SEO Slug, รูปภาพ Cover, แท็กหมวดหมู่ |
| 16 | **Wheel**<br>`wheel.tsx` | Super Admin, Staff | `lucky_wheel_prizes`, `lucky_wheel_spins` | `update_wheel_prize`, `update_wheel_config` | พรีวิววงล้อ 8 ช่อง, ปรับแต่งสีและของรางวัล, กำหนดน้ำหนัก Probability % โอกาสออกรางวัล, สรุปประวัติหมุน |
| 17 | **Broadcast**<br>`broadcast.tsx` | Super Admin, Staff | `notifications`, `settings` | `send_broadcast`, `batch_update_settings` | ฟอร์มส่งข้อความพุช (เลือกกระดิ่ง หรือ ป๊อปอัปเด้งกลางจอ), เลือกผู้รับ (ทุกคน/รายคน), คอนฟิกป๊อปอัปหน้าแรก |
| 18 | **Settings**<br>`settings.tsx` | **Super Admin เท่านั้น** | `settings` (109 Keys) | `batch_update_settings` | สวิตช์ปิดปรับปรุง (Maintenance Mode), สวิตช์ Auto Draw Bot, คอนฟิกขั้นต่ำการแทง, คอนฟิกความปลอดภัย |
| 19 | **Appearance**<br>`appearance.tsx` | Super Admin, Staff | `settings` | `update_appearance` | เลือกสีธีม (Color Picker), อัปโหลดโลโก้/Favicon, พรีวิวหน้าล็อกอินแบบจำลอง (Desktop / Mobile) |
| 20 | **Data Mgmt**<br>`data-management.tsx` | **Super Admin เท่านั้น** | `backup_logs`, 24 Supabase Tables | `record_backup`, API Data Export | สถิตินับแถว 24 ตาราง, ปุ่ม Export CSV/JSON รายตาราง, ปุ่ม Full Backup Snapshot, ตารางประวัติ Backup |
| 21 | **Admins**<br>`admins.tsx` | **Super Admin เท่านั้น** | `profiles` (`is_admin`), `admin_roles` | `create_admin`, `update_admin`, `delete_admin_user` | ตารางรายชื่อผู้ดูแล, กำหนด Role (Super Admin / Staff), กำหนดสิทธิ์รายโมดูล (Permissions Checkbox) |
| 22 | **Affiliate**<br>`affiliate.tsx` | Super Admin, Staff | `referrals`, `referral_settings`, `wallets` | `update_referral_settings` | สถิติสายงานแนะนำเพื่อน, ตาราง Top Referrers, ตั้งค่า % ส่วนแบ่งคอมมิชชั่น, ขั้นต่ำการถอนรายได้ |
