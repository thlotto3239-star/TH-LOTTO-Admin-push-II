# TASK-006: Lotto 15M Real-Data Live Video & Results Sync (ล็อตโต้ 15 นาที)

> **Status:** `[x] COMPLETED`  
> **Component:** `UI Customer/src/components/Lotto15MLiveStudio.jsx`, `UI Customer/src/pages/Lotto15M.jsx`, `UI Customer/src/pages/Results.jsx`, Supabase `lottery_markets`  
> **Priority:** P0 (Critical Real-Data Alignment)  
> **Git Safety Checkpoint:** `checkpoint-root-safety-20260909` (Root), `checkpoint-customer-safety-20260909` (Customer)

---

## 1. Description & Scope
เชื่อมโยงระบบ **ล็อตโต้ 15 นาที (TH-LOTTO 15M)** ให้ดึงและแสดงผลจากแหล่งข้อมูลจริง 100%:
1. **Live Stream Embed:**
   - ใช้ Real Embed URL: `https://liwlottery.com/embed`
   - ฝังผ่าน Responsive Container ปรับขอบโค้งมนสไตล์ Clean White UI ของ TH-LOTTO
2. **API ผลรางวัลย้อนหลัง (96 รอบ/วัน):**
   - แหล่งข้อมูล API จริง: `https://liwlottery.com/api/results/history?limit=96&offset=0`
   - ปรับเปลี่ยนรอบจากเดิม 58 รอบ (mock) เป็น **96 รอบต่อวัน (ทุก 15 นาที 00:00 - 23:45 น.)**
   - รองรับผล 3 ตัวบน (`three`), 2 ตัวบน (`two_top`), 2 ตัวล่าง (`two_bottom`), ลูกบอล Keno (`keno`), รอบ (`no`), เวลา (`clock`)
3. **การเข้าแทง (Standardized Betting Flow):**
   - มีปุ่ม "เข้าแทงรอบปัจจุบัน" ที่ส่งตรงเข้าสู่ `/betting?draw=[marketId]&round=[roundNum]`
4. **การแสดงผลในหน้าตรวจผลรางวัล (`Results.jsx`):**
   - เพิ่มหมวด "ล็อตโต้ 15 นาที" ในหน้าตรวจผล พร้อมแสดง 96 รอบพร้อมปุ่มดูคลิปย้อนหลัง

---

## 2. Technical Contracts & Mappings
- **Live Stream Embed:**
  ```html
  <iframe
    src="https://liwlottery.com/embed"
    title="TH-LOTTO 15M Live Studio"
    width="100%"
    height="100%"
    style="border:0;border-radius:16px;overflow:hidden;max-width:100%;aspect-ratio:16/9"
    allow="autoplay *; fullscreen *; encrypted-media *"
    loading="eager"
  ></iframe>
  ```
- **Results Endpoint:**
  - `GET https://liwlottery.com/api/results/history?limit=24&offset=0`
  - Mapping:
    - `result.three` ➔ 3 ตัวบน
    - `result.two_top` ➔ 2 ตัวบน
    - `result.two_bottom` ➔ 2 ตัวล่าง
    - `result.keno` ➔ รายการลูกบอล Keno 6 ชุด
    - `result.video` ➔ วิดีโอตรวจผลย้อนหลัง

---

## 3. Rollback & Verification Protocol
- **Rollback Plan:** `git checkout checkpoint-customer-safety-20260909` (Customer) / `git checkout checkpoint-root-safety-20260909` (Root)
- **Verification Plan:**
  - Verify live iframe player loads properly
  - Verify 96 rounds data loaded from API without CORS or parse errors
  - Verify seamless navigation to betting engine
