# 🏆 THLOTTO-II — Unified System Architecture & Admin Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Architecture-Closed--Loop%20Isolation-red?style=flat)]()

THLOTTO-II เป็นระบบบริหารจัดการหวยออนไลน์ครบวงจร (Lottery Management & Operations Portal) ที่สร้างขึ้นบนสถาปัตยกรรม **In-House Closed-Loop** มีความปลอดภัยระดับสูงด้วย **Row-Level Security (RLS) 100%** และบันทึกการเงินด้วย **Double-Entry Atomic Ledger**

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
THLOTTO-II/
├── .agents/                 # AI Agent rules and workspace skills
├── docs/                    # คลังเอกสารทางเทคนิคและคู่มือการปฏิบัติการ
│   ├── manuals/             # คู่มือสถาปัตยกรรม (Architecture) และปฏิบัติการภายใน (Operations)
│   ├── legacy/              # ประวัติเอกสารสเปกระบบเดิม (Archive)
│   └── SYSTEM_AUDIT_CHECKLIST.md # เช็คลิสต์ตรวจสอบและปรับปรุงระบบ
├── UI Admin/                # เว็บแอปพลิเคชันแผงควบคุมผู้ดูแลระบบ (Next.js 14 + TypeScript)
│   ├── public/              # ไฟล์สถิติต่างๆ (แบรนด์, ฟอนต์, ไอคอน)
│   ├── src/                 # ซอร์สโค้ดหลัก
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # UI Components & Admin Pages (21 ตลาด, เลขอั้น, หวย 1 นาที, โพยหวย)
│   │   ├── data/            # Mock Data & Supabase Data Models
│   │   └── lib/             # Utility functions & Supabase clients
│   └── package.json
├── tests/                   # สคริปต์ทดสอบและสถิติการตรวจสอบ
├── AGENTS.md                # กฎเกณฑ์และคำสั่งสำหรับ AI Engineer (ARM-AES v1.0)
├── ARM-AI-ENGINEERING-STANDARD.md # มาตรฐานวิศวกรรม AI
└── README.md                # เอกสารแนะนำโปรเจกต์
```

---

## 🏛️ สถาปัตยกรรมหลัก (System Architecture Highlights)

1. **Closed-Loop Security:** 
   - ระบบทำงานแยกส่วน ไม่มีการเชื่อมต่อภายนอกที่ไม่ปลอดภัย
   - Supabase PostgreSQL พร้อม RLS ครบทั้ง 39 ตาราง
2. **21 Main Lottery Markets:**
   - รัฐบาลไทย (`TH_GOV`), ลาวพัฒนา (`LAO`), ฮานอย 3 ตลาด (`HANOI`, `HANOI_SPECIAL`, `HANOI_VIP`), หวยมาเลย์ (`MALAY`)
   - หวยหุ้นต่างประเทศ 15 ตลาด (นิเคอิ, ฮั่งเส็ง, จีน, ไต้หวัน, เกาหลี, สิงคโปร์, อินเดีย, อียิปต์, รัสเซีย, เยอรมัน, อังกฤษ, ดาวน์โจนส์)
3. **Instant 1-Minute Engine:**
   - อัตราจ่าย 9 รูปแบบจริง (`2top`, `2bottom`, `3top`, `3toad`, `3front`, `3back`, `6straight`, `pin_top`, `pin_bottom`)
   - ไมโครเซตเทิลเมนต์ (Micro-Settlement) ประมวลผลและเคลียร์ยอดทันทีทุก 60 วินาที
4. **Risk Management & Auditing:**
   - ระบบควบคุมเลขอั้นและเลขจ่ายครึ่ง (`public.restricted_numbers`)
   - ระบบตรวจสอบโพยหวยรวม (`public.bets`)
   - ระบบการเงินแบบ Double-Entry ตรวจสอบ Balance Before/After ได้ทุกรายการ

---

## 🚀 การติดตั้งและเริ่มรันในเครื่อง (Getting Started)

### ความต้องการของระบบ (Prerequisites)
* Node.js 18.x หรือ 20.x ขึ้นไป
* npm หรือ pnpm

### คำสั่งรันระบบ (Commands)

```bash
# 1. เข้าสู่โฟลเดอร์ UI Admin
cd "UI Admin"

# 2. ติดตั้ง Dependencies
npm install

# 3. รันเซิร์ฟเวอร์สำหรับ Development (พอร์ต 3000)
npm run dev

# 4. ทดสอบความถูกต้องของ Type และการ Build
npm run build
```

เปิดบราวเซอร์ที่: `http://localhost:3000`

---

## 📜 เอกสารอ้างอิงเพิ่มเติม
* [คู่มือสถาปัตยกรรมระบบ (System Architecture Manual)](docs/manuals/SYSTEM_ARCHITECTURE_MANUAL.md)
* [คู่มือปฏิบัติการภายใน (Internal System Operation Manual)](docs/manuals/INTERNAL_SYSTEM_OPERATION_MANUAL.md)
* [เช็คลิสต์ตรวจสอบและปรับปรุงระบบ (Audit Checklist)](docs/SYSTEM_AUDIT_CHECKLIST.md)
* [มาตรฐานวิศวกรรมระบบ (ARM-AI Engineering Standard)](ARM-AI-ENGINEERING-STANDARD.md)
