# TASK-003: Omnichannel Hub & Brand Studio

> **Status:** `[x] COMPLETED`  
> **Component:** `UI Admin/src/components/admin/pages/broadcast.tsx`, `appearance.tsx`  
> **Priority:** P1 (Feature)

---

## 1. Description & Scope
รวมศูนย์การสื่อสารและสตูดิโอออกแบบแบรนด์:
- **`broadcast.tsx` (Omnichannel Hub):**
  - รวมการสื่อสาร 3 ช่องทาง: กระดิ่งแจ้งเตือน In-App, ป๊อปอัปแจ้งด่วนหน้าแรก (Urgent Modal), และแถบข้อความวิ่ง (Marquee Ticker)
  - แผงพรีวิวสดเสมือนจริงบนหน้าจอมือถือ (Smartphone Preview Sandbox)
  - ระบบค้นหาสมาชิกรายคน และส่งประกาศทั้งระบบ
- **`appearance.tsx` (Brand & Design Studio):**
  - สตูดิโอออกแบบแนวนอน Split Layout 2 คอลัมน์
  - ฝั่งซ้าย: Live Sandbox จำลองหน้าเว็บผู้เล่น (สลับดู Mobile / PC)
  - ฝั่งขวา: ปรับแต่งสี HEX, ฟอนต์ไทย (Kanit, Prompt, Sarabun), โลโก้, Favicon, Wallpaper

---

## 2. Implementation Verification
- [x] Omnichannel hub successfully routes In-App notifications and Marquee tickers
- [x] Live sandbox updates dynamically on color/font changes
- [x] Verified in browser: [broadcast_omnichannel_hub_1788723901695.png](file:///C:/Users/armyn/.gemini/antigravity-ide/brain/b3b8998d-ae52-4284-9c9f-da3e15651edc/broadcast_omnichannel_hub_1788723901695.png)
- [x] Verified in browser: [appearance_studio_1788723926064.png](file:///C:/Users/armyn/.gemini/antigravity-ide/brain/b3b8998d-ae52-4284-9c9f-da3e15651edc/appearance_studio_1788723926064.png)
