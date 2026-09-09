# THLOTTO-II: DESIGN SYSTEM DNA & BRAND CODEX
## คัมภีร์อัตลักษณ์การออกแบบและสถาปัตยกรรม UI (Signature Brand DNA)

> **คำจำกัดความของสไตล์นี้ในวงการ UI/UX:**  
> สไตล์ของ THLOTTO-II จัดอยู่ในกลุ่ม **"Modern Clean Neo-Fintech & Luxury Gaming Glassmorphism"**  
> (การผสานความแม่นยำและสะอาดตาแบบแอประดับโลกอย่าง Stripe / Revolut เข้ากับความหรูหราแบบ Luxury Sportsbook)

---

## 1. คำอธิบายสไตล์ตามที่ผู้ใช้สัมผัสได้ (Why It Feels Great)

| สิ่งที่ผู้ใช้รู้สึก | ศัพท์เชิงเทคนิคในวงการ UI/UX | กลไกเบื้องหลังที่ระบบทำ |
|---|---|---|
| **"ตัวหนังสือเรียงอัตโนมัติ ไม่ตกบรรทัด ไม่ดูทุเรศ"** | **Text Safety & Content-Aware Typography** | กำหนดกฎ `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis` ให้กับหัวข้อ Badge, Tag, ตัวเลข และใช้ Container Queries คำนวณขนาดตัวอักษรตามพื้นที่ |
| **"โหลดไว สมูท ลื่นไหล สบายตา"** | **Micro-Interactions & GPU-Accelerated CSS** | ใช้ Native CSS Transitions แทน JavaScript calculation, ลดการ Repaint, และใช้ Tailwind v4 พร้อม Zero-Runtime CSS |
| **"ดูทันสมัย พรีเมียม ไม่เหมือนเว็บหวยโบราณ"** | **Modern Clean Neo-Fintech UI** | การใช้ Card-based Layout ขอบโค้งมนละมุน (`rounded-2xl`, `rounded-3xl`), เส้นขอบบางเฉียบ (`border-slate-200/80`), และสีพื้นหลัง Slate Light สะอาดตา |
| **"ทุกคนดูแล้วรู้ทันทีว่าเป็นงานของเรา"** | **Signature Brand DNA** | การคุมคู่สีเขียวมรกตราชันย์ตัดทองคำ (Emerald Zenith & Royal Gold) ร่วมกับฟอนต์ **Prompt** ที่มีความคมชัดสูง |

---

## 2. เสาหลัก DNA 5 ประการของ THLOTTO-II (The 5 Pillars of DNA)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THLOTTO-II SIGNATURE DNA                        │
├───────────────────┬────────────────────┬───────────────────────────────┤
│  1. COLOR HARMONY │  2. TEXT INTEGRITY │  3. SHAPE & ELEVATION         │
│  เขียวมรกต + ทองหรู │  ห้ามข้อความตกบรรทัด │  ความโค้งมนระดับ 2xl / 3xl   │
├───────────────────┴────────────────────┴───────────────────────────────┤
│  4. MICRO-ANIMATIONS (การตอบสนอง 60fps, active:scale-95, Skeleton Load) │
│  5. MODERN WEB STANDARDS (Native <dialog>, Container Queries, Anchor)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### เสาหลักที่ 1: สีและแสงเงา (Color Harmony & Sub-Surface Lighting)

ชุดสีนี้ถูกถอดรหัสจากโลโก้ทางการของแบรนด์ เพื่อสร้างภาพจำทันทีที่เปิดหน้าเว็บ:

- **สีหลัก (Primary Brand Green):**
  - เขียวมรกตสด: `#287e0b` (`--color-brand-600`) — แสดงสถานะพร้อมเล่น, ปุ่ม Action หลัก
  - เขียวมรกตเข้มลึก: `#0c4b1c` (`--color-brand-800`) / `#05220d` (`--color-brand-950`) — ใช้ในการ์ดพรีเมียมและ Header
  - Gradient ประจำตัว: `linear-gradient(135deg, #287e0b 0%, #0c4b1c 100%)` (Emerald Zenith)
- **สีรองรับทรัพย์ (Accent Wealth Gold):**
  - สีทองคำ: `#d4af37` (`--color-gold-premium`) — เน้นตัวเลขรางวัลใหญ่, ถ้วยรางวัล, ยอดแจ็กพอต
- **สีพื้นหลังและคอนทราสต์ (Clean Surface Canvas):**
  - สีพื้นหลังเว็บ: `#f6f8f6` (Soft Off-White Slate) — ไม่อมขาวจ้าจนแสบตา ให้ฟีลลิ่งสบายตาอ่านง่าย
  - สีการ์ดเนื้อหา: `#ffffff` — ตัดกับขอบ `border-slate-200/80` และเงาละมุน `shadow-xs`

---

### เสาหลักที่ 2: ระบบตัวอักษรและความปลอดภัยของข้อความ (Typography & Text Safety)

หัวใจสำคัญที่ทำให้ UI ดูสะอาด ไม่แตก ไม่ตกขอบ:

1. **แบบอักษรประจำแบรนด์ (Official Typography):**
   - ใช้ฟอนต์ **"Prompt" (Google Fonts)** สำหรับภาษาไทยและภาษาอังกฤษ มีสัดส่วน x-height ที่กว้างพอดี ทำให้ตัวเลขอัตราจ่ายและชื่อหวยอ่านเคลียร์ชัดในทุกขนาดหน้าจอ
2. **กฎเหล็กเรื่อง Text Truncation (No Ugly Wrap Rule):**
   - ข้อความที่เป็น **สถานะ (Badge)**, **ชื่อตลาด**, **ตัวเลขอัตราจ่าย**, **ปุ่มกด** จะต้องไม่ถูกบีบจนขึ้น 2 บรรทัดเด็ดขาด
   - บังคับใช้คลาสยูทิลิตี:
     ```css
     span.badge, .status-tag, button {
       white-space: nowrap;
       overflow: hidden;
       text-overflow: ellipsis;
     }
     ```
3. **ระบบจัดวางตัวเลขการเงิน (Monospace Tabular Numerals):**
   - ตัวเลขเงิน ยอด Balance และผลหวย ให้ใช้ `font-mono` หรือ `tabular-nums` เสมอ เพื่อให้ตำแหน่งหลักหน่วย สิบ ร้อย ตรงกันอย่างเป็นระเบียบเมื่อตัวเลขวิ่ง

---

### เสาหลักที่ 3: สรีระรูปทรงและเงา (Shapes, Borders & Elevation)

- **ความโค้งมนที่เป็นมิตร (Friendly Rounded Radii):**
  - ปุ่มกดขนาดเล็ก / Input: `rounded-xl` (12px)
  - การ์ดเนื้อหา / บอร์ดรายการ: `rounded-2xl` (16px)
  - โมดอลหลัก / การ์ดไฮไลต์สตูดิโอ: `rounded-3xl` (24px)
  - แท็กสถานะ / วงกลมตัวเลขผลหวย: `rounded-full` (Pill shape)
- **เส้นขอบและแสงเงา (Borders & Soft Shadows):**
  - หลีกเลี่ยงเส้นขอบสีดำทึบ ใช้ `border border-slate-200/80` หรือ `border border-slate-100`
  - ใช้เงาแบบ Ambient Shadow (`shadow-xs`, `shadow-sm`) ไม่ใช้เงาดำฟุ้งแบบเว็บยุคเก่า

---

### เสาหลักที่ 4: การตอบสนองและการเคลื่อนไหว (Micro-Interactions)

สิ่งที่ทำให้แอปรู้สึกมีชีวิต (Alive & Responsive):
- **ปุ่มกดสัมผัส (Tactile Button Press):** ทุกปุ่มเมื่อคลิกหรือแตะบนจอมือถือ ต้องมียุบตัวเล็กน้อยด้วย `active:scale-95` หรือ `active:scale-[0.98]` พร้อม `transition-all duration-150`
- **จุดแสดงสัญญาณสด (Live Pulse Indicator):** จุดสีเขียวกลมพร้อมเอฟเฟกต์ Ping (`animate-ping`) บ่งบอกข้อมูลสดแบบ Realtime
- **โครงสร้างโหลดข้อมูล (Skeleton Loading State):** ขณะดึงข้อมูลจริงจาก Supabase ต้องแสดง Shimmer Placeholder สีเทาอ่อนเสมอ ห้ามหน้าจอว่างเปล่า

---

### เสาหลักที่ 5: มาตรฐานเว็บทันสมัย (Global Web Standards)

เพื่อให้โค้ดรองรับอุปกรณ์ทุกรูปแบบ และได้คะแนน Performance สูงสุด:
1. **Container Queries (`@container`):** การ์ดแสดงผลสถิติและอัตราจ่ายต้องปรับเลย์เอาต์ตามความกว้างของคอลัมน์ตัวเอง ไม่ผูกติดกับขนาดหน้าจอใหญ่ (Viewport)
2. **Native HTML `<dialog>`:** ป๊อปอัปทั้งหมด (เช่น โมดอลกติกา [LottoRulesModal.jsx](file:///c:/Users/armyn/Downloads/THLOTTO-II/UI%20Customer/src/components/LottoRulesModal.jsx)) ใช้แท็ก `<dialog>` ของเบราว์เซอร์ พร้อม `::backdrop` เบลอฉากหลังอย่างนุ่มนวล
3. **Sliding Indicator Tabs:** แท็บสลับหน้าต้องมีตัวเลือกที่เคลื่อนที่เลื่อนตามตัวชี้วัดได้อย่างต่อเนื่อง

---

## 3. สรุปเช็คลิสต์: จะออกแบบหน้าไหนก็ยังเป็น "THLOTTO-II" (Design Checklist)

เมื่อใดก็ตามที่ต้องสร้างหน้าจอใหม่ ไม่ว่าจะเป็นหน้าสปีดล็อตโต้, หน้ารายงานผล, หรือหน้ากระเป๋าเงิน ให้ตรวจสอบ 5 ข้อนี้:

- [ ] **สีหลัก:** ใช้เขียวมรกต `#287e0b` เป็น Accent หลัก ตัดด้วยทองคำ `#d4af37` ในส่วนที่เกี่ยวกับเงินรางวัล
- [ ] **ตัวอักษร:** ใช้ฟอนต์ `Prompt` และล็อกข้อความสำคัญไม่ให้ตกบรรทัดด้วย `truncate / whitespace-nowrap`
- [ ] **การ์ด:** พื้นหลังขาว ตัดกับบอร์ด Slate Light `#f6f8f6` ขอบโค้งมน `rounded-2xl` หรือ `rounded-3xl`
- [ ] **การกด:** ทุกปุ่มคลิกต้องมี Interaction `active:scale-95 transition-all`
- [ ] **ข้อมูลจริง:** เชื่อมต่ออัตราจ่ายและรอบเวลาผ่าน `lotteryService.js` ห้ามฝังตัวเลขปลอมในหน้า UI
