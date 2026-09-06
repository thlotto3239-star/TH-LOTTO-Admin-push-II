# TASK-005: Core Governance & Maintenance Hub

> **Status:** `[x] COMPLETED`  
> **Component:** `UI Admin/src/components/admin/pages/settings.tsx`, `route.ts`  
> **Priority:** P1 (Feature)

---

## 1. Description & Scope
จัดระเบียบการตั้งค่าระบบใหม่ทั้งหมดเพื่อขจัดความซ้ำซ้อน:
- แบ่งเป็น **4 เสาหลักการตั้งค่าระบบ (Core Governance)**:
  1. สถานะเว็บ & ปิดปรับปรุง (Site Control & Maintenance)
  2. เกณฑ์ธุรกรรมการเงิน (Financial Policy & Thresholds)
  3. ความปลอดภัย & บอทออกผลรางวัล (CRON Secret Key)
  4. คลังข้อมูล & ล้างประวัติเก่า (Storage & History Cleaner)
- ลิงก์ตรง (Direct Jump Cards) ไปยังหน้าธนาคารและวงล้อเสี่ยงโชคโดยตรง
- Pop-up แนวนอน (Landscape Widescreen `sm:max-w-3xl`) แสดงคู่มือ/เรดาร์ความปลอดภัยฝั่งซ้าย และฟอร์มตั้งค่าฝั่งขวา
- API `batch_update_settings` ซิงก์ค่าลง Supabase แบบ Batch Upsert

---

## 2. Implementation Verification
- [x] API `batch_update_settings` implemented and tested
- [x] All 4 pillars open in widescreen landscape dialogs
- [x] Verified in browser: [system_settings_1788723941223.png](file:///C:/Users/armyn/.gemini/antigravity-ide/brain/b3b8998d-ae52-4284-9c9f-da3e15651edc/system_settings_1788723941223.png)
- [x] Verified in browser: [system_settings_security_modal_1788723957050.png](file:///C:/Users/armyn/.gemini/antigravity-ide/brain/b3b8998d-ae52-4284-9c9f-da3e15651edc/system_settings_security_modal_1788723957050.png)
