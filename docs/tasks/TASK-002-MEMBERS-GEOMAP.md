# TASK-002: Member Operations & Geo-Forensics

> **Status:** `[x] COMPLETED`  
> **Component:** `UI Admin/src/components/admin/geo-session-map.tsx`, `members.tsx`, `member-detail.tsx`  
> **Priority:** P0 (Core)

---

## 1. Description & Scope
สร้างและเชื่อมต่อระบบตรวจสอบพิกัดอุปกรณ์ผู้ใช้งานด้วยแผนที่ Open-Source:
- พัฒนาคอมโพเนนต์ `OpenStreetMapCard` โดยใช้ **OpenStreetMap (OSM)** 100% Open-Source ฟรี ไม่มีค่าใช้จ่าย API
- ระบบแยกประเภทอุปกรณ์ (User-Agent Parser): ตรวจจับ Mobile vs Desktop, OS, Browser
- ปักหมุดพิกัดเมืองตามพิกัดจริง (เช่น กรุงเทพมหานคร, เชียงใหม่)
- เรดาร์ไฟเขียวกระพริบ `🟢 ออนไลน์ขณะนี้`
- Pop-up แนวนอน (Landscape Widescreen 2 คอลัมน์) ในการแก้ไขข้อมูลสมาชิกและปรับยอดเงินในกระเป๋า

---

## 2. Implementation Verification
- [x] Zero external paid API key required
- [x] Interactive Leaflet/OSM embed with custom location bounding boxes
- [x] Live session indicator in Member table
- [x] Widescreen 2-column modal (`sm:max-w-3xl`) for member edit and wallet adjustment
- [x] Verified in browser with full session forensics tab
