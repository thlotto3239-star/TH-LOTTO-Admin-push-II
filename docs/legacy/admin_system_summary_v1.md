# 📋 สรุประบบ TH-LOTTO Admin Panel
> Repository: [TH-LOTTO-Admin-push](https://github.com/thlotto3239-star/TH-LOTTO-Admin-push)  
> Version: **v1.4.0** | Stack: **React + Vite + Supabase + TailwindCSS**  
> Production: https://th-lotto-admin-v2.vercel.app

---

## 🗂️ โครงสร้างโปรเจค

```
src/
├── pages/          ← หน้าหลักทั้งหมด (30+ หน้า)
├── components/     ← UI Components ใช้ซ้ำ
├── services/       ← authService, logger
├── contexts/       ← ModalContext
├── utils/          ← notifications, alert helpers
├── App.jsx         ← Router + PermGuard
├── AuthContext.jsx ← Auth + Permission state
└── AdminGuard.jsx  ← Route protection
```

---

## 🔐 ระบบ Authentication & Permission

### AdminGuard + PermGuard
- **AdminGuard** — ตรวจสอบว่า login แล้วก่อนเข้าหน้าใดๆ ถ้าไม่มี session → redirect `/login`
- **PermGuard** — ตรวจสอบ permission ระดับ page โดยอิงจาก `hasPermission(perm)` ใน `useAuth()`
- ระบบ permission แบ่งตาม key: `deposits`, `withdrawals`, `members`, `markets`, `bets`, `restricted`, `wheel`, `instant`, `settings`, `appearance`, `sliders`, `promotions`, `articles`, `feeds`, `banks`

### AuthContext.jsx
- จัดการ Supabase session, profile ของ admin
- expose `profile`, `hasPermission(perm)`, `signOut()`

---

## 📋 รายการฟังก์ชันทั้งหมด (แบ่งตามหมวด)

---

### 1. 📊 แผงควบคุม (Dashboard)
**Route:** `/`  **ไฟล์:** `Dashboard.jsx` (37 KB — ใหญ่มาก)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| ภาพรวมสถิติ | ยอดฝาก/ถอน, จำนวนสมาชิก, ยอดเดิมพัน |
| กราฟ/แผนภูมิ | แสดง trend ข้อมูลแบบ real-time |
| Notification Panel | แจ้งเตือน admin แบบ Realtime (Supabase Realtime) |

---

### 2. 💰 การเงิน

#### ฝากเงิน (Deposits) — `/deposits`
**ไฟล์:** `Deposits.jsx` (18 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการฝากเงิน | แสดงรายการทั้งหมด + filter สถานะ |
| อนุมัติ/ปฏิเสธ | admin ยืนยัน/ปฏิเสธรายการฝาก |
| ค้นหา/กรอง | ค้นหาตามชื่อ, ธนาคาร, วันที่, สถานะ |
| ดูสลิป | ดูภาพสลิปการโอนเงิน |

#### ถอนเงิน (Withdrawals) — `/withdrawals`
**ไฟล์:** `Withdrawals.jsx` (18 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการถอน | แสดงรายการถอนพร้อม status |
| อนุมัติ/ปฏิเสธ | admin ดำเนินการรายการถอน |
| ค้นหา/กรอง | filter ตามธนาคาร, สถานะ, วันที่ |
| ข้อมูลบัญชี | แสดงเลขบัญชี + ชื่อผู้รับ |

---

### 3. 👥 สมาชิก

#### จัดการสมาชิก (Members) — `/members`
**ไฟล์:** `Members.jsx` (17 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายชื่อสมาชิก | ตารางสมาชิกทั้งหมด + pagination |
| ค้นหา | ค้นหาด้วยชื่อ, เบอร์โทร, ID |
| กรองสถานะ | active / inactive / suspended |
| คลิกดูรายละเอียด | ไปหน้า `/members/:id` |

#### รายละเอียดสมาชิก (MemberDetail) — `/members/:id`
**ไฟล์:** `MemberDetail.jsx` (21 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| ข้อมูลส่วนตัว | ชื่อ, เบอร์, วันที่สมัคร, สถานะ |
| ประวัติธุรกรรม | ฝาก/ถอน ของสมาชิกคนนี้ |
| ประวัติการแทง | รายการโพยทั้งหมด |
| แก้ไขข้อมูล | แก้ไขสถานะ, ยอด credit |
| ระงับ/ปลดระงับ | toggle สถานะสมาชิก |

#### ระบบแนะนำเพื่อน (Affiliates) — `/affiliates`
**ไฟล์:** `Affiliates.jsx` (4.9 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการ referral | ดูว่าใครแนะนำใคร |
| ยอด commission | ค่าแนะนำที่ได้รับ |

#### ผู้ดูแลระบบ (Admins) — `/admins`
**ไฟล์:** `Admins.jsx` (24 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายชื่อ admin | ดูและจัดการทีม admin ทั้งหมด |
| เพิ่ม admin ใหม่ | สร้าง account admin พร้อม permission |
| แก้ไข permission | ปรับสิทธิ์แต่ละ permission key |
| ระงับ/ลบ admin | ปิดใช้งานหรือลบ admin |
| Password reset | รีเซ็ตรหัสผ่าน admin |

---

### 4. 🎰 หวย

#### ตลาดหวย (LotteryMarkets) — `/markets`
**ไฟล์:** `LotteryMarkets.jsx` (34 KB — ใหญ่มาก)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการตลาด | หวยไทย, หุ้น, ต่างประเทศ ฯลฯ |
| เพิ่ม/แก้ไขตลาด | ตั้งค่าวัน/เวลาออกรางวัล |
| เปิด/ปิดตลาด | toggle เปิด-ปิดรับแทง |
| อัตราจ่าย | กำหนดอัตราจ่ายแต่ละประเภท |
| ช่วงเวลารับแทง | ตั้งเวลาเปิด-ปิดรับแทง |

#### ออกผลรางวัล (Results) — `/results`
**ไฟล์:** `Results.jsx` (21 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| กรอกผลรางวัล | ใส่ตัวเลขผลรางวัลแต่ละตลาด |
| ยืนยันผล | confirm ก่อนบันทึกผล |
| ประวัติผลรางวัล | ดูย้อนหลัง |
| คำนวณรางวัล | trigger จ่ายรางวัลอัตโนมัติ |

#### รายการโพย (BetsList) — `/bets`
**ไฟล์:** `BetsList.jsx` (8.4 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการโพยทั้งหมด | ดูโพยทุกรายการ |
| กรองตามตลาด/งวด | ค้นหาตาม period |
| สถานะโพย | pending / won / lost |

#### เลขอั้น (RestrictedNumbers) — `/restricted`
**ไฟล์:** `RestrictedNumbers.jsx` (6.9 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| เพิ่มเลขอั้น | กำหนดเลขที่ไม่รับแทง หรือลดอัตราจ่าย |
| ลบเลขอั้น | ยกเลิกการอั้น |
| จัดการต่อตลาด | ตั้งค่าแต่ละตลาดแยกกัน |

---

### 5. ⚡ หวยหนึ่งนาที (Instant Lottery)

ระบบหวยแบบ real-time ออกรางวัลทุก 1 นาที

| หน้า | Route | ฟังก์ชัน |
|---|---|---|
| ภาพรวม | `/instant-overview` | สถิติ, ยอด, กราฟ instant lottery |
| ประเภทเดิมพัน | `/instant-bet-types` | จัดการ bet types, อัตราจ่าย |
| งวดออกรางวัล | `/instant-draws` | ดู draws ทั้งหมด, status |
| รายการแทง | `/instant-bets` | ดูรายการแทงแต่ละ draw |
| ผลรางวัล | `/instant-results` | ดู + กรอกผลรางวัล |
| ตั้งค่า Instant | `/instant-settings` | กำหนด interval, ขีดจำกัด ฯลฯ |

**InstantSettings.jsx** (20.5 KB) — ตั้งค่า:
- ระยะเวลา draw interval
- วงเงินแทงสูงสุด/ต่ำสุด
- เปิด/ปิดระบบ instant

---

### 6. 🎡 เกม

#### วงล้อโชคดี (WheelAdmin) — `/wheel`
**ไฟล์:** `WheelAdmin.jsx` (26.5 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| กำหนดรางวัลในวงล้อ | ใส่ชื่อรางวัล, โอกาสชนะ, จำนวน |
| เปิด/ปิดวงล้อ | toggle ใช้งาน |
| ประวัติการหมุน | ดูผลรางวัลที่ได้ |
| จำนวนครั้งที่หมุนได้ | กำหนด quota ต่อ user |

---

### 7. 🎨 คอนเทนต์

#### สไลเดอร์ (Sliders) — `/sliders`
**ไฟล์:** `Sliders.jsx` (10.5 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| เพิ่ม/แก้ไขสไลด์ | อัพโหลดรูป + ลิ้งก์ |
| เรียงลำดับ | drag เพื่อเรียงสไลด์ |
| เปิด/ปิดสไลด์ | toggle แต่ละรูป |

#### โปรโมชั่น (Promotions) — `/promotions`
**ไฟล์:** `Promotions.jsx` (15.3 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| เพิ่ม/แก้ไขโปรโมชั่น | ชื่อ, เงื่อนไข, มูลค่า, รูป |
| กำหนดระยะเวลา | วันเริ่ม-วันสิ้นสุด |
| เปิด/ปิดโปรโมชั่น | toggle active |

#### บทความ (Articles) — `/articles`
**ไฟล์:** `Articles.jsx` (8 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| เขียน/แก้ไขบทความ | rich text editor |
| จัดการหมวดหมู่ | กำหนด category |
| เผยแพร่/ซ่อน | toggle publish |

#### จัดการฟีด (FeedManagement) — `/feeds`
**ไฟล์:** `FeedManagement.jsx` (7.3 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| จัดการ feed ข่าว | เพิ่ม/ลบ/แก้ไขรายการ feed |

#### Trending Items — `/trending`
**ไฟล์:** `TrendingItems.jsx` (12 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการ trending | จัดการเลขดัง/เลขแนะนำ |
| เพิ่ม/ลบ | จัดการ trending list |

---

### 8. ⚙️ ระบบ / การตั้งค่า

#### ตั้งค่าระบบ (Settings) — `/settings`
**ไฟล์:** `Settings.jsx` (55 KB — ใหญ่ที่สุด!)

แบ่งเป็น **8 Modal** หลัก:

| Modal | Icon | รายละเอียดการตั้งค่า |
|---|---|---|
| **💳 การเงิน** | `financial` | ขั้นต่ำ-สูงสุดฝาก/ถอน, ค่าธรรมเนียม, โบนัสต้อนรับ |
| **🏦 บัญชีธนาคาร** | `bank` | บัญชีรับเงิน admin, เพิ่ม/ลบบัญชี |
| **🎡 วงล้อ** | `wheel` | อัตราชนะ, จำนวนโอกาสหมุน, รางวัล |
| **📱 Social / Line** | `social` | Line Official URL, Facebook, เบอร์ติดต่อ |
| **📢 ประกาศ** | `announce` | จัดการ Marquee announcements (CRUD) |
| **🛠️ ระบบ** | `system` | ชื่อเว็บ, โลโก้, รหัสผ่าน API |
| **🔛 ควบคุมเว็บ** | `siteControl` | เปิด/ปิดเว็บ (site_enabled toggle) |
| **🗑️ Cleanup** | `cleanup` | เคลียร์ข้อมูลเก่า (instant_draws, notifications, login_attempts) |

**รายละเอียด Cleanup:**
- ลบ `instant_draws` ที่ SETTLED และ > 7 วัน
- ลบ `notifications` ที่อ่านแล้ว > 7 วัน
- ลบ `admin_notifications` ที่อ่านแล้ว > 7 วัน
- ลบ `login_attempts` > 30 วัน
- ใช้ RPC: `admin_cleanup_storage`

---

#### รูปลักษณ์ (Appearance) — `/appearance`
**ไฟล์:** `Appearance.jsx` (11.3 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| Primary Color | เปลี่ยนสีหลักของเว็บ |
| โลโก้/Favicon | อัพโหลดรูปโลโก้ |
| Font | เปลี่ยน font family |
| Dark/Light Mode | ตั้งค่า default mode |

---

#### ธนาคาร (Banks) — `/banks`
**ไฟล์:** `Banks.jsx` (7.5 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| รายการธนาคาร | SCB, KBANK, BBL ฯลฯ |
| เพิ่ม/ลบบัญชีธนาคาร | บัญชีรับเงิน |
| เปิด/ปิดธนาคาร | toggle ใช้งาน |
| ลำดับการแสดงผล | จัดเรียงธนาคาร |

---

#### แจ้งเตือน Broadcast (Notifications) — `/notifications`
**ไฟล์:** `Notifications.jsx` (3.6 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| ส่งแจ้งเตือนหาสมาชิก | broadcast notification ทั้งหมด หรือรายบุคคล |
| เลือกประเภท | info / warning / success |

---

#### Backup & จัดการข้อมูล (DataManagement) — `/data-management`
**ไฟล์:** `DataManagement.jsx` (9.6 KB)

| ฟังก์ชัน | รายละเอียด |
|---|---|
| Export ข้อมูล | download CSV/JSON |
| Backup database | trigger backup Supabase |
| ดูสถิติตาราง | จำนวน rows แต่ละ table |

---

## 🧩 Components หลัก

| Component | ฟังก์ชัน |
|---|---|
| `Layout.jsx` | Sidebar + Navbar + Notification bell + Toast |
| `Modal.jsx` | Reusable modal dialog (native `<dialog>`) |
| `BankBadge.jsx` | แสดงโลโก้ธนาคาร + ชื่อ |
| `BankSelector.jsx` | Dropdown เลือกธนาคาร |
| `StatusBadge.jsx` | Badge สถานะสี (pending/approved/rejected) |
| `ProfessionalTable.jsx` | ตารางข้อมูลแบบ professional |
| `Toast.jsx` | Toast notification system |
| `SearchInput.jsx` | Search bar |
| `CategoryNav.jsx` | Tab navigation |

---

## 🔔 ระบบ Notification (Real-time)

- ใช้ **Supabase Realtime** subscribe ตาราง `admin_notifications`
- แสดง notification bell ใน navbar + unread count badge
- ฟังก์ชัน: `fetchNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `deleteAllNotifications`
- Toast popup เมื่อมี notification ใหม่

---

## 🗺️ Sidebar Navigation (สรุป)

```
📊 ภาพรวม
  └── แผงควบคุม

💰 การเงิน
  ├── รายการฝากเงิน
  └── รายการถอนเงิน

👥 สมาชิก
  ├── จัดการสมาชิก
  ├── ระบบแนะนำเพื่อน
  └── ผู้ดูแลระบบ

🎰 หวย
  ├── ตลาดหวย
  ├── ออกผลรางวัล
  ├── รายการโพย
  └── เลขอั้น

⚡ หวยหนึ่งนาที
  ├── ภาพรวม
  ├── ประเภทเดิมพัน
  ├── งวดออกรางวัล
  ├── รายการแทง
  ├── ผลรางวัล
  └── ตั้งค่า

🎮 เกม
  └── วงล้อโชคดี

🎨 คอนเทนต์
  ├── สไลเดอร์
  ├── โปรโมชั่น
  ├── บทความ
  └── จัดการฟีด

⚙️ ระบบ
  ├── ตั้งค่าระบบ
  ├── รูปลักษณ์
  ├── ธนาคาร
  ├── แจ้งเตือน Broadcast
  └── Backup & ข้อมูล
```

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend Framework | React 18 + Vite |
| Routing | React Router v6 (lazy loading) |
| Styling | TailwindCSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Deployment | Vercel |
| Icons | Lucide React + Google Material Icons |

---

> **หมายเหตุ:** มี special owner check (`profile?.phone === '0622306037'`) สำหรับ feature บางอย่างที่จำกัดเฉพาะ owner
