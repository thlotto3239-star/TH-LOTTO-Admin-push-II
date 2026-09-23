# Conversation Notes

## Authorized Domains (Supabase Redirect URLs)
- `http://localhost:3000/**` (สำหรับ Local เก่า - *เตรียมเลิกใช้หากย้ายมาพอร์ตใหม่*)
- `https://th-lotto-admin-push-ten.vercel.app/**` และ `https://th-lotto-admin-push-ten.vercel.app/`
- `https://th-lotto-plus.vercel.app/**` และ `https://th-lotto-plus.vercel.app/`

### มาตรฐานพอร์ตสำหรับการทดสอบ Local (อัปเดตใหม่)
- **Admin UI:** `http://localhost:62991`
- **Customer UI (User):** `http://localhost:62992`
*(พอร์ตทั้งสองได้รับการอนุมัติและเพิ่มลงใน Supabase Redirect URLs แล้ว)*

## กฎการทำงาน
1. ต้องอ้างอิงโดเมนและพอร์ตจากแหล่งข้อมูลจริงของระบบเท่านั้น (ห้ามใช้ Default หรือเดา)
2. หากต้องเดา ให้หยุดทำงานทันที
3. ทุกครั้งก่อนเริ่มทำงาน ต้องเคลียร์แคชและเช็กสถานะเซิร์ฟเวอร์ก่อนเสมอ

## บัญชีสำหรับใช้ทดสอบระบบ (Authorized Test Accounts)
- **แอดมิน (Admin Test Account):**
  - เบอร์โทรศัพท์: `0622306037`
  - รหัสผ่าน / PIN: `020257`
  - บทบาท: `super_admin`
- **สมาชิก (Customer Member Test Account):**
  - เบอร์โทรศัพท์: `0622306699`
  - รหัสผ่าน / PIN: `020257`
  - ชื่อผู้ใช้: `•PHANTOM` (•PHANTOM –)
  - วัตถุประสงค์: ใช้สำหรับทดสอบระบบผู้ใช้ (Login, ถอนเงิน, ซื้อหวย)

## ⚠️ Git Remote & Branch Mapping (ห้ามเดา — ต้องใช้ตามนี้เท่านั้น)

### UI Admin Remotes
| Remote Name | GitHub Repo | Default Branch | Vercel Deploy URL | หมายเหตุ |
|-------------|-------------|---------------|-------------------|----------|
| `admin-deploy` | `TH-LOTTO-Admin-push-II` | `main` | `th-lotto-admin-push-ii.vercel.app` | Blueprint canonical |
| `old-admin` | `TH-LOTTO-Admin-push` | **`main` / `master`** ⚠️ | `th-lotto-admin-push-ten.vercel.app` | ใช้งานจริงปัจจุบัน — **ต้อง subtree split โฟลเดอร์ `UI Admin` ไปที่ root** |
| `core-origin` | `thlotto-core` | `main` | - | Core backup |
| `origin` | `THLOTTO-II` | `main` | - | Root monorepo |

### UI Customer Remotes
| Remote Name | GitHub Repo | Default Branch | Vercel Deploy URL | หมายเหตุ |
|-------------|-------------|---------------|-------------------|----------|
| `origin` | `thlotto-premium` | `main` | `lotto-th-customer.vercel.app` | Customer production |
| `new-origin` | `thlotto-app-user` | `main` | - | Customer backup |

### 🚨 กฎบังคับสำหรับ Git Push และ Vercel Deploy
1. **โครงสร้างของ `old-admin` (`TH-LOTTO-Admin-push`):**
   - Vercel ของโปรเจกต์ `th-lotto-admin-push` มี `rootDirectory: null` (รันจาก root ของ repo)
   - ห้าม push ทั้ง monorepo ที่มีโฟลเดอร์ `UI Admin` ไปที่ `old-admin` เด็ดขาด เพราะ Vercel ไม่ยอมรับชื่อฟังก์ชัน serverless ที่มีช่องว่าง (`UI Admin/...`)
   - **ขั้นตอนการ deploy ขึ้น `old-admin`:**
     ```bash
     git subtree split --prefix="UI Admin" -b deploy-admin-latest
     git push old-admin deploy-admin-latest:main --force
     git push old-admin deploy-admin-latest:master --force
     ```
2. **ก่อนและหลัง push ทุกครั้ง:**
   - เช็คสถานะการ build จริงบน Vercel ผ่าน `npx vercel list` เสมอ
   - ยืนยันว่า Deployment มีสถานะ `READY` (ไม่ใช่ `ERROR`) ก่อนรายงานผล

