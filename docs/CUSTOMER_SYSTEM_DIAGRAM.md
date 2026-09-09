# 📱 THLOTTO-II — CUSTOMER APPLICATION & UI ARCHITECTURE DIAGRAMS
**เอกสารประกอบการออกแบบ UI/UX ผังการใช้งาน และโครงสร้างข้อมูลฝั่งผู้เล่น (Customer App 35 Pages)**  
**มาตรฐาน:** ARM AI Engineering Standard (ARM-AES v1.0) & [docs/SYSTEM_BLUEPRINT.md](file:///c:/Users/armyn/Downloads/THLOTTO-II/docs/SYSTEM_BLUEPRINT.md)  
**Tech Stack:** React 19, Vite 6, Tailwind CSS, Supabase BaaS (`ygopnjbvccenryejqmlw`)

---

## 1. 🗺️ ผังเส้นทางการใช้งานของผู้เล่น (Customer User Journey & Page Map)

```mermaid
graph TD
    classDef auth fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e;
    classDef lotto fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af;
    classDef fin fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534;
    classDef acc fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#6b21a8;
    classDef cms fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#334155;

    subgraph SEC_AUTH [🔐 1. เข้าสู่ระบบ & ยืนยันตัวตน]
        P_LOG[23. Login.jsx<br/>/login]:::auth
        P_REG[24. Register.jsx<br/>/register]:::auth
        P_SUC[25. RegSuccess.jsx<br/>/register/success]:::auth
        P_FGP[22. ForgotPw.jsx<br/>/forgot-password]:::auth
    end

    subgraph SEC_CORE [🏠 2. หน้าแรก & ตลาดหวย]
        P_HOME[1. Home.jsx<br/>/]:::lotto
        P_LIST[2. LotteryList.jsx<br/>/lottery]:::lotto
        P_BET[3. Betting.jsx<br/>/betting/:marketId]:::lotto
        P_PREV[34. Preview.jsx<br/>/preview]:::lotto
        P_15M[4. Lotto15M.jsx<br/>/lotto-15m]:::lotto
        P_INST[5. InstantLottery.jsx<br/>/instant]:::lotto
        P_HIST[14. BetHistory.jsx<br/>/history]:::lotto
        P_RES[15. Results.jsx<br/>/results]:::lotto
    end

    subgraph SEC_WALLET [💳 3. กระเป๋าเงิน & การเงิน]
        P_WAL[12. Wallet.jsx<br/>/wallet]:::fin
        P_DEP[6. Deposit.jsx<br/>/deposit]:::fin
        P_QR[7. QRPayment.jsx<br/>/deposit/qr]:::fin
        P_UP[8. UploadSlip.jsx<br/>/deposit/upload]:::fin
        P_DEPOK[9. DepositSuccess.jsx<br/>/deposit/success]:::fin
        P_WTH[10. Withdrawal.jsx<br/>/withdrawal]:::fin
        P_WOK[11. WithdrawalConfirm.jsx<br/>/withdrawal/confirm]:::fin
        P_TX[13. Transactions.jsx<br/>/transactions]:::fin
        P_BNK[18. BankAccount.jsx<br/>/bank-account]:::fin
    end

    subgraph SEC_ACC [👤 4. บัญชีผู้ใช้ & สิทธิพิเศษ]
        P_PRF[19. Profile.jsx<br/>/profile]:::acc
        P_EDT[20. EditProfile.jsx<br/>/profile/edit]:::acc
        P_CPW[21. ChangePassword.jsx<br/>/change-password]:::acc
        P_WHL[16. LuckyWheel.jsx<br/>/wheel]:::acc
        P_AFF[17. Affiliate.jsx<br/>/affiliate]:::acc
    end

    subgraph SEC_INFO [📰 5. คอนเทนต์ & การสนับสนุน]
        P_NOT[26. Notifications.jsx<br/>/notifications]:::cms
        P_PRO[27. Promotions.jsx<br/>/promotions]:::cms
        P_ART[28. Articles.jsx<br/>/articles]:::cms
        P_DET[29. ArticleDetail.jsx<br/>/articles/:slug]:::cms
        P_SUP[30. Support.jsx<br/>/support]:::cms
        P_TRM[31. Terms.jsx<br/>/terms]:::cms
        P_MNT[32. Maintenance.jsx<br/>/maintenance]:::cms
        P_PRC[33. Processing.jsx<br/>/processing]:::cms
        P_DLG[35. DialogShowcase.jsx<br/>/dialogs]:::cms
    end

    P_LOG --> P_HOME
    P_REG --> P_SUC --> P_HOME
    P_HOME --> P_LIST --> P_BET --> P_PREV
    P_HOME --> P_15M
    P_HOME --> P_INST
    P_HOME --> P_WAL
    P_WAL --> P_DEP --> P_QR --> P_UP --> P_DEPOK
    P_WAL --> P_WTH --> P_WOK
    P_WAL --> P_TX
    P_HOME --> P_PRF
```

---

## 2. 🧾 ผังกระบวนการส่งโพยแทงหวยมาตรฐาน (Standard Lottery Betting Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 📱 ผู้เล่น (Customer)
    participant BetUI as 🖥️ Betting.jsx (/betting/:id)
    participant Val as 🛡️ เลขอั้น/ลิมิต Guard
    participant RPC as ⚡ submit_bet() Stored Procedure
    participant DB as 🗄️ Supabase DB (wallets, bets, bet_items)
    participant WS as 📡 Realtime Channel

    User->>BetUI: เลือกประเภทแทง (3 ตัวบน, 2 ตัวล่าง ฯลฯ) + กรอกเลข + ใส่ราคา
    BetUI->>Val: ตรวจสอบเลขอั้น/เลขจ่ายครึ่ง (restricted_numbers)
    Val-->>BetUI: แสดงเรทอัตราจ่ายจริงแบบ Realtime
    User->>BetUI: ตรวจสอบยอดรวม + กด "ส่งโพย"
    BetUI->>RPC: supabase.rpc('submit_bet', { p_market_id, p_schedule_id, p_items })
    RPC->>DB: ตรวจสอบเวลาปิดรับงวด (draw_schedules.close_time)
    RPC->>DB: ล็อกกระเป๋าเงิน FOR UPDATE และเช็กยอดคงเหลือ (balance >= total_amount)
    RPC->>DB: หักเงินในกระเป๋า: balance = balance - total_amount
    RPC->>DB: สร้างหัวบิลในตาราง bets (status = 'PENDING')
    RPC->>DB: บันทึกตัวเลขย่อยในตาราง bet_items
    RPC->>DB: บันทึก Ledger Transactions (type = 'BET')
    DB-->>BetUI: ตอบกลับบิลสำเร็จ (bet_id, new_balance)
    RPC->>WS: พุชอัปเดตกระเป๋าเงิน (realtime:wallet)
    BetUI-->>User: แสดง Pop-up "ส่งโพยสำเร็จ" + นำทางไปหน้าประวัติโพย (/history)
```

---

## 3. ⚡ ผังหวยสปีด 1 นาที Provably Fair RNG (Instant Lottery Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 📱 ผู้เล่น
    participant InstantUI as ⚡ InstantLottery.jsx (/instant)
    participant Server as ⚙️ Instant Engine (RPC: place_instant_bet)
    participant RNG as 🎲 Provably Fair SHA-256 Seed RNG
    participant DB as 🗄️ instant_draws, instant_bets, wallets
    actor Admin as 👨‍💼 Admin Monitor

    InstantUI->>InstantUI: ตัวนับถอยหลัง 60 วินาทีเดินแบบ Realtime
    User->>InstantUI: เลือกเลข 6 ตัว / 3 ตัว / 2 ตัว + กดเดิมพัน
    InstantUI->>Server: place_instant_bet(p_draw_id, p_bet_type, p_number, p_amount)
    Server->>DB: ล็อกกระเป๋าเงินและตัดเครดิตเดิมพัน
    Server->>DB: บันทึกโพย instant_bets
    Note over Server,RNG: เมื่อเวลางวด 60s หมดลง
    Server->>RNG: คำนวณผลสุ่มด้วย Server Seed + Client Seed Hash
    RNG-->>Server: ผลรางวัล 6 ตัวตรง (เช่น 842795)
    Server->>DB: บันทึกลงตาราง instant_draws
    Server->>Server: คำนวณผลแพ้/ชนะทันที
    alt ผู้เล่นถูกรางวัล (WON)
        Server->>DB: โอนเงินรางวัลเข้ากระเป๋า wallets ทันที
        Server->>DB: อัปเดตสถานะบิล instant_bets = 'WON'
    else ไม่ถูกรางวัล (LOST)
        Server->>DB: อัปเดตสถานะบิล instant_bets = 'LOST'
    end
    Server-->>InstantUI: ส่งผลลัพธ์กลับแบบ Realtime
    InstantUI-->>User: เด้ง Pop-up สรุปผล 6 ตัวตรง + เสียงเอฟเฟกต์ + อัปเดตยอดเงินทันที!
```

---

## 4. 💳 ผังกระบวนการฝาก-ถอนเงินของผู้เล่น (Deposit & Withdraw Journey)

```mermaid
graph TD
    classDef dep fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534;
    classDef wth fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b;
    classDef bank fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af;

    subgraph DEP_FLOW [💰 กระบวนการฝากเงิน (Deposit Flow)]
        D1[Deposit.jsx<br/>เลือกธนาคารบริษัท + ใส่จำนวนเงิน]:::dep
        D2[QRPayment.jsx<br/>สร้าง PromptPay QR อัตโนมัติ + เวลานับถอยหลัง 10 นาที]:::dep
        D3[UploadSlip.jsx<br/>อัปโหลดสลิปโอนเงินเข้า Supabase Storage]:::dep
        D4[DepositSuccess.jsx<br/>รอแอดมินอนุมัติหรือระบบ Auto Approved]:::dep
        D1 --> D2 --> D3 --> D4
    end

    subgraph WTH_FLOW [💸 กระบวนการถอนเงิน (Withdrawal Flow)]
        W1[Withdrawal.jsx<br/>ตรวจสอบยอดเงิน + ยอดเทิร์นโอเวอร์คงเหลือ]:::wth
        W2[WithdrawalConfirm.jsx<br/>ยืนยันเลขบัญชีรับเงิน + ใส่ PIN 6 หลัก]:::wth
        W3[ตัดยอดเงินชั่วคราว + สร้างคำขอใน withdraw_requests]:::wth
        W1 --> W2 --> W3
    end

    subgraph BNK_FLOW [🏦 ผูกบัญชีธนาคาร (Bank Management)]
        B1[BankAccount.jsx<br/>เลือกธนาคาร + ระบุเลขบัญชี]:::bank
        B2[ระบบล็อกชื่อบัญชีต้องตรงกับชื่อโปรไฟล์ เพื่อป้องกันมิจฉาชีพ]:::bank
        B1 --> B2
    end
```

---

## 5. 📑 เมทริกซ์สารบัญหน้าจอฝั่งผู้เล่น 35 หน้า (Customer 35 Pages Design Matrix)

| # | หน้าจอ / เส้นทาง (Route) | หมวดหมู่ | ตาราง Supabase จริง | องค์ประกอบและฟังก์ชันสำคัญสำหรับการออกแบบ UI |
|---|---|---|---|---|
| 1 | `Home.jsx` (`/`) | หน้าแรก | `sliders`, `announcements`, `lottery_markets`, `settings` | แบนเนอร์สไลด์, ตัววิ่ง Marquee, Pop-up โปรโมชั่นต้อนรับ, ตลาดหวยยอดนิยมพร้อม Countdown |
| 2 | `LotteryList.jsx` (`/lottery`) | หวย | `lottery_markets`, `draw_schedules` | รายการ 37 ตลาดหวย แบ่งหมวดหมู่ (ไทย, ฮานอย, ลาว, หุ้น, หวยไว), ตัวกรองสถานะ |
| 3 | `Betting.jsx` (`/betting/:id`) | หวย | `lottery_markets`, `payout_rates`, `restricted_numbers` | แผงปุ่มกดตัวเลข, แผงกลับเลข (2 ตัว/3 ตัว/โต๊ด/วิ่ง), ปรับราคาต่อตัว, เช็กเลขอั้น Realtime |
| 4 | `Lotto15M.jsx` (`/lotto-15m`) | หวย | `draw_schedules`, `lottery_results`, `bets` | Live Stream Studio หวยรอบพิเศษ 15 นาที, นับถอยหลัง, ตารางสถิติผลย้อนหลัง |
| 5 | `InstantLottery.jsx` (`/instant`) | หวย | `instant_draws`, `instant_bets`, `wallets` | หวยไว 1 นาที, วงล้อหมุนออกผล, Pop-up สรุปผล 6 ตัวตรง, สถิติย้อนหลัง, เอฟเฟกต์เสียง |
| 6 | `Deposit.jsx` (`/deposit`) | การเงิน | `company_bank_accounts`, `financial_settings`, `promotions` | เลือกบัญชีธนาคารบริษัท, เลือกรับโปรโมชั่นโบนัส, ปุ่มลัดจำนวนเงิน (100, 300, 500, 1000) |
| 7 | `QRPayment.jsx` (`/deposit/qr`) | การเงิน | `deposit_requests` | สร้าง QR Code พร้อมเพย์, ปุ่มคัดลอกเลขบัญชี, ตัวนับถอยหลังหมดอายุ QR 10 นาที |
| 8 | `UploadSlip.jsx` (`/deposit/upload`) | การเงิน | `deposit_requests`, Storage `slips` | ฟอร์มอัปโหลดรูปภาพสลิป, ตรวจสอบขนาด/นามสกุลไฟล์, แสดงรูปตัวอย่างก่อนส่ง |
| 9 | `DepositSuccess.jsx` (`/deposit/success`) | การเงิน | `deposit_requests` | หน้าจอแอนิเมชันส่งคำขอสำเร็จ, แสดงสถานะ "กำลังตรวจสอบ" และเวลารอเฉลี่ย |
| 10 | `Withdrawal.jsx` (`/withdrawal`) | การเงิน | `wallets`, `user_banks`, `financial_settings` | เช็กยอดเครดิตที่ถอนได้, แสดงแถบ Turnover Progress Bar, ระบุจำนวนเงินถอน |
| 11 | `WithdrawalConfirm.jsx` (`/withdrawal/confirm`) | การเงิน | `withdraw_requests`, `profiles` | สรุปยอดเงินและค่าธรรมเนียม, ยืนยันบัญชีปลายทาง, คีย์บอร์ดตัวเลขใส่รหัส PIN 6 หลัก |
| 12 | `Wallet.jsx` (`/wallet`) | การเงิน | `wallets`, `transactions` | การ์ดกระเป๋าเงินรวม, ยอดคอมมิชชั่น, ปุ่มลัดฝาก-ถอน, รายการเคลื่อนไหวล่าสุด |
| 13 | `Transactions.jsx` (`/transactions`) | การเงิน | `transactions` | ประวัติการเงินละเอียด, ฟิลเตอร์ (ฝาก, ถอน, โบนัส, คืนเงิน), แสดง Badge สถานะ |
| 14 | `BetHistory.jsx` (`/history`) | หวย | `bets`, `bet_items` | ประวัติโพยหวย, แท็บแยก (รอผล, ถูกรางวัล, ไม่ถูก), ดูรายการตัวเลขย่อยในบิล, ปุ่มแชร์โพย |
| 15 | `Results.jsx` (`/results`) | หวย | `lottery_results`, `lottery_markets` | ตรวจผลรางวัลย้อนหลังทุกตลาด, ปฏิทินเลือกงวดวันที่, กล่องค้นหาตัวเลขตรวจหวย |
| 16 | `LuckyWheel.jsx` (`/wheel`) | เกม | `lucky_wheel_prizes`, `lucky_wheel_spins` | มินิเกมวงล้อหมุนลุ้นรางวัล, แสดงสิทธิ์หมุนคงเหลือ, เสียงหมุนวงล้อ, Pop-up แจกเครดิต |
| 17 | `Affiliate.jsx` (`/affiliate`) | สิทธิพิเศษ | `referrals`, `wallets`, `settings` | ลิงก์และ QR Code แนะนำเพื่อน, สถิติสมาชิกในสายงาน, ยอดรายได้คอมมิชชั่น, ปุ่มโอนเข้ากระเป๋า |
| 18 | `BankAccount.jsx` (`/bank-account`) | บัญชี | `user_banks`, `bank_list` | จัดการผูกบัญชีธนาคารสำหรับถอนเงิน, ล็อกชื่อบัญชีตรงกับโปรไฟล์, ป้ายสถานะยืนยันแล้ว |
| 19 | `Profile.jsx` (`/profile`) | บัญชี | `profiles`, `vip_tiers` | การ์ดข้อมูลโปรไฟล์, ป้ายระดับ VIP Tier, วันที่สมัคร, เมนูความปลอดภัยและตั้งค่า |
| 20 | `EditProfile.jsx` (`/profile/edit`) | บัญชี | `profiles` | แก้ไขข้อมูลส่วนตัว, เบอร์โทร, อัปโหลดรูปภาพ Avatar โปรไฟล์ |
| 21 | `ChangePassword.jsx` (`/change-password`) | บัญชี | `profiles`, GoTrue Auth | ฟอร์มเปลี่ยนรหัสผ่านเดิม/ใหม่, เปลี่ยนรหัส PIN 6 หลัก |
| 22 | `ForgotPassword.jsx` (`/forgot-password`) | บัญชี | GoTrue OTP Auth | ขอรีเซ็ตรหัสผ่านผ่านเบอร์โทรศัพท์ด้วย SMS OTP ยืนยันตัวตน |
| 23 | `Login.jsx` (`/login`) | ยืนยันตัวตน | `profiles`, `login_attempts` | เข้าสู่ระบบด้วย เบอร์โทร/รหัสผ่าน, PIN 6 หลัก, หรือ Google OAuth, เก็บ Geo IP อัตโนมัติ |
| 24 | `Register.jsx` (`/register`) | ยืนยันตัวตน | `profiles`, `wallets`, `referrals` | สมัครสมาชิก: เบอร์โทร, รหัสผ่าน, ข้อมูลบัญชีธนาคาร, รหัสผู้แนะนำเพื่อน |
| 25 | `RegistrationSuccess.jsx` (`/register/success`) | ยืนยันตัวตน | `promotions` | หน้าต้อนรับสมาชิกใหม่พร้อมรับโบนัสเริ่มต้น, ปุ่มลัดไปหน้าฝากเงิน |
| 26 | `Notifications.jsx` (`/notifications`) | ข่าวสาร | `notifications`, Realtime Channel | กล่องข้อความแจ้งเตือนส่วนบุคคล (ผลหวย, เงินเข้า, บรอดแคสต์), ปุ่มกดทำเครื่องหมายอ่านทั้งหมด |
| 27 | `Promotions.jsx` (`/promotions`) | คอนเทนต์ | `promotions` | หน้ารวมการ์ดโปรโมชั่นทั้งหมด (4 โปรหลัก), กดดูเงื่อนไขโบนัส, ปุ่มกดรับสิทธิ์ |
| 28 | `Articles.jsx` (`/articles`) | คอนเทนต์ | `articles` | หน้ารวมบทความ ข่าวสาร เลขเด็ด และแนวทางหวย แบ่งหมวดหมู่ |
| 29 | `ArticleDetail.jsx` (`/articles/:slug`) | คอนเทนต์ | `articles` | หน้าอ่านเนื้อหาบทความความละเอียดสูง, SEO Meta, ปุ่มแชร์บทความไปยัง Social Media |
| 30 | `Support.jsx` (`/support`) | สนับสนุน | `contact_channels`, `settings` | ช่องทางติดต่อทีมงานซัพพอร์ต (LINE Official, Telegram, Live Chat 24 ชม.) |
| 31 | `Terms.jsx` (`/terms`) | สนับสนุน | `system_settings` | ข้อกำหนด เงื่อนไขการใช้งานระบบ และนโยบายความเป็นส่วนตัว (PDPA) |
| 32 | `Maintenance.jsx` (`/maintenance`) | ระบบ | `settings` | หน้าจอแจ้งปิดปรับปรุงระบบชั่วคราว (แสดงผลเมื่อ Maintenance Mode = TRUE) |
| 33 | `Processing.jsx` (`/processing`) | ระบบ | Client State | หน้าจอ Loading แอนิเมชันขณะประมวลผลธุรกรรมทางการเงิน |
| 34 | `Preview.jsx` (`/preview`) | หวย | Client State | หน้าพรีวิวใบโพยหวยก่อนกดยืนยันการส่งแทง |
| 35 | `DialogShowcase.jsx` (`/dialogs`) | ดีไซน์ | Design System | หน้ารวมตัวอย่าง Modals, Popups, Dialogs และ Bottom Sheets สำหรับ UI Reference |
