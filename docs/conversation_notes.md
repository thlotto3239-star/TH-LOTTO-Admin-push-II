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
| `old-admin` | `TH-LOTTO-Admin-push` | **`master`** ⚠️ | `th-lotto-admin-push-ten.vercel.app` | ใช้งานจริงปัจจุบัน — **ต้อง push main:master** |
| `core-origin` | `thlotto-core` | `main` | - | Core backup |
| `origin` | `THLOTTO-II` | `main` | - | Root monorepo |

### UI Customer Remotes
| Remote Name | GitHub Repo | Default Branch | Vercel Deploy URL | หมายเหตุ |
|-------------|-------------|---------------|-------------------|----------|
| `origin` | `thlotto-premium` | `main` | `lotto-th-customer.vercel.app` | Customer production |
| `new-origin` | `thlotto-app-user` | `main` | - | Customer backup |

### 🚨 กฎบังคับสำหรับ Git Push
1. **ก่อน push ทุกครั้ง** ต้องเช็ค default branch ของ remote ด้วย `git ls-remote <remote> HEAD` และ `git remote show <remote>`
2. **old-admin ใช้ `master`** — ต้อง push ด้วย `git push old-admin main:master`
3. **หลัง push ทุกครั้ง** ต้องยืนยันด้วย `git ls-remote <remote> HEAD` ว่า commit hash ตรงกับ local
4. **ห้ามสมมุติว่าทุก remote ใช้ `main`** — ต้องตรวจสอบจริงเสมอ

