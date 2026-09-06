# TH-LOTTO-II — แผงควบคุมระบบแอดมิน (Admin Control Portal)

> **มาตรฐานวิศวกรรมซอฟต์แวร์ (Software Engineering Standard — ARM-AES v1.0)**  
> แพลตฟอร์มบริหารจัดการระบบหวยออนไลน์แบบครบวงจร (Lottery Management Platform) พัฒนาด้วย Next.js 16 (App Router + Turbopack), Tailwind CSS, Shadcn UI และเชื่อมโยงฐานข้อมูลสดกับ **Supabase PostgreSQL** และ **ThaiLottoAPI** แบบเรียลไทม์

---

## 🌟 ฟีเจอร์หลักของระบบ (Core Features)

1. **ตลาดหวย (Lottery Markets):**
   - รองรับตลาดหวยทั้งสิ้น **37 ตลาด** (หวยรัฐบาลไทย, ฮานอย 3 ตลาด, ลาวพัฒนา, มาเลย์, หวยแม่โขง 11 รอบ, หวยหุ้นไทย/ต่างประเทศ 15 ตลาด, หวย 15 นาที)
   - แสดงผล **โลโก้และธงทางการประจำตลาด (Official Market Logos)** ดึงสดจาก Supabase Storage และ ThaiLottoAPI
   - ควบคุมการเปิด/ปิดรับแทง, กำหนดอัตราจ่าย, ขีดจำกัดยอดแทง และตั้งค่าถ่ายทอดสด (YouTube Live)

2. **ระบบออกผลรางวัลสดและการซิงก์อัตโนมัติ (Live Results & Auto-Settlement):**
   - **Hero Card (Live Breaking Draw):** แสดงผลรางวัลล่าสุดพร้อมเวลาประกาศและสัญลักษณ์ตลาด
   - **Auto-Feed Polling:** อัปเดตผลรางวัลสดทุก 20 วินาทีในพื้นหลัง
   - **ปุ่มดึงผลรางวัลสด (ThaiLottoAPI Sync):** ซิงก์ผลสดตรงเข้าฐานข้อมูลและตัดยอดรางวัลเข้ากระเป๋าสมาชิกทันทีแบบ Real-time
   - แสดงผลตัวเลขรางวัลในรูปแบบ **ลูกบอลหวยแยกหลักละ 1 ลูก (1 Digit per LottoBall)**

3. **จัดการเลขอั้นและเลขจ่ายครึ่ง (Restricted Numbers):**
   - ควบคุมความเสี่ยงทางการเงิน บันทึกลงตาราง `public.restricted_numbers`
   - กำหนดสถานะปิดรับแทง (Blocked) หรือลดเรทจ่าย (Half Rate) พร้อมเพดานยอดรับสูงสุด

4. **รายการแทงหวย (Bets & Tickets):**
   - ตรวจสอบรายการโพยแทงสดของสมาชิก แปลงประเภทย่อยเป็นภาษาไทยชัดเจน (2 ตัวบน, 2 ตัวล่าง, 3 ตัวบน, ฯลฯ)
   - ป๊อปอัปตรวจสอบรายละเอียดโพยแสดงโลโก้ตลาดหวย, ข้อมูลสมาชิก และลูกบอลตัวเลขที่แทง

5. **หวยหนึ่งนาที (Instant 1-Minute Lottery):**
   - มอนิเตอร์ผลรางวัลยี่กีสดทุก 60 วินาที
   - ปรับแต่งอัตราจ่ายและขีดจำกัดสำหรับ 9 รูปแบบการแทง
   - ตั้งค่าแบรนดิ้ง, โลโก้, อัตราการชนะ (Win Rate) และสวิตช์โหมดปรับปรุง

6. **ระบบการเงินและสมาชิก (Financial & Member Management):**
   - อนุมัติ/ปฏิเสธรายการฝาก-ถอนเงิน พร้อมสลิปโอนเงิน
   - จัดการสิทธิ์สมาชิก, ระดับ VIP และการตรวจสอบตัวตน (KYC)

---

## 🛠️ สแต็กเทคโนโลยี (Tech Stack)

- **Framework:** [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack, Serverless API Routes)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS design tokens
- **UI Components:** [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Storage, Realtime, Service Role Auth)
- **Live Feed API:** [ThaiLottoAPI](https://thailottoapi.com/)
- **Charts:** [Recharts](https://recharts.org/)

---

## 🚀 การเริ่มต้นใช้งาน (Quickstart)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
```bash
cp .env.example .env.local
```
กำหนดค่าตัวแปรใน `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
SUPABASE_PROJECT_REF=[YOUR-PROJECT-REF]
```

### 3. รันเซิร์ฟเวอร์สำหรับทดสอบ (Development)
```bash
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:3000`

### 4. ตรวจสอบและบิลด์ระบบ (Production Build)
```bash
npm run build
npm start
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── src/
│   ├── app/                         # Next.js App Router & API Endpoints
│   │   ├── api/admin/data/          # Main Admin Data Resource Router (GET/POST)
│   │   ├── api/admin/sync-results/  # ThaiLottoAPI Direct Sync & Settlement Engine
│   │   ├── layout.tsx               # Root Layout
│   │   └── page.tsx                 # Root Entrypoint
│   ├── components/
│   │   ├── admin/                   # Admin Components & Pages
│   │   │   ├── admin-app.tsx        # Shell Layout & Navigation
│   │   │   ├── primitives.tsx       # Standard UI Primitives & MarketLogo
│   │   │   └── pages/               # 19 Admin Pages (markets, bets, results, etc.)
│   │   └── ui/                      # Shadcn UI primitives
│   ├── data/
│   │   └── admin-mock.ts            # Type definitions, constants, fallback data
│   └── lib/
│       ├── supabase.ts              # Supabase Client & Service Role Admin
│       └── utils.ts                 # Classname merge & helper utilities
├── docs/                            # เอกสารพิมพ์เขียวและคู่มือมาตรฐาน
│   ├── ARCHITECTURE_BLUEPRINT.md    # สถาปัตยกรรมและ Schema ความสัมพันธ์
│   ├── OPERATIONAL_MANUAL.md        # คู่มือการดำเนินงานระบบแอดมิน
│   └── DEPLOYMENT_GUIDE.md          # ขั้นตอน Deploy Vercel & Google OAuth Setup
├── public/                          # Static Assets & Icons
├── next.config.ts                   # Next.js Config & Remote Image Patterns
└── package.json                     # Dependencies & Build Scripts
```

---

## 🔒 มาตรฐานความปลอดภัย (Security & Access Control)
- **Role-Based Access Control (RBAC):** ทุก API Endpoint ภายใต้ `/api/admin/*` ใช้ `supabaseAdmin` (Service Role Key) ฝั่ง Server-side เท่านั้น ไม่เปิดเผย Key ให้ฝั่ง Client
- **Google OAuth Login Protection:** มีการตรวจสอบสถานะ `is_admin: true` ในตาราง `public.profiles` หลังการยืนยันตัวตน เพื่อป้องกันผู้ใช้ทั่วไปเข้าถึงระบบแอดมิน
- **Environment Isolation:** ไฟล์ `.env*` ถูก Ignore ออกจาก Git อย่างเคร่งครัด

---

## 📄 ลิขสิทธิ์และการบำรุงรักษา
- **Project:** TH-LOTTO-II (Admin Control Portal)
- **Standard:** ARM-AES v1.0
