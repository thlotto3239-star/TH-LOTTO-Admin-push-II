# Worklog

---
Task ID: 1
Agent: Super Z (main agent)
Task: สร้างเว็บแสดงเอกสารฟังก์ชั่นระบบเดิม TH-LOTTO สไตล์ทันสมัย พื้นหลังสีขาว ปุ่มขอบม่น

Work Log:
- อ่านเอกสารอัปโหลด 2 ไฟล์: full_system_functions_report v1 (RPC 164+ ฟังก์ชั่น, ตาราง, Live Data) และ admin_system_summary v1 (Admin Panel v1.4.0)
- เรียก Skill fullstack-dev และรัน init script เตรียมโปรเจกต์ Next.js 16
- สร้าง src/data/system-report.ts — ข้อมูลครบ: 14 กลุ่มฟังก์ชั่น RPC (176 รายการ), 36 ตารางใน 10 กลุ่ม, ตลาดหวย 9, ธนาคาร 7, โปรโมชั่น 4, settings 11 keys, LINE Notify 5 keys, Admin Panel 8 หมวด (28 หน้าจอ), permissions 15 keys, components 9, tech stack 8
- ปรับ globals.css: --radius 0rem + global border-radius 0 !important (ปุ่มขอบม่น), scrollbar บาง, font IBM Plex Sans Thai/Mono, scroll-padding
- ปรับ layout.tsx: metadata ภาษาไทย, โหลดฟอนต์ Google Fonts แบบ <link>
- สร้าง src/components/report/report-view.tsx: header sticky, hero + stats grid, sticky nav pills + scrollspy (IntersectionObserver), ค้นหากรอง functions/tables/admin pages พร้อมไฮไลต์, คลิกชื่อฟังก์ชั่นเพื่อคัดลอก + toast, ส่วน LINE Notify, ตารางกลุ่มฟังก์ชั่น, Section B ตาราง, Section C Admin Panel, Section D Live Data, footer ดำ, ปุ่มกลับขึ้นด้านบน
- lint ผ่าน (0 errors), ทดสอบด้วย Agent Browser: desktop + mobile 375px, search "withdraw" กรองถูก (3/176 + 1 ตาราง), toast คัดลอกแสดง, scrollspy ทำงาน, ไม่มี console error

Stage Summary:
- เว็บรันที่ port 3000 คอมไพล์ผ่าน ทุก interaction ทดสอบแล้วผ่าน
- ไฟล์หลัก: src/data/system-report.ts, src/components/report/report-view.tsx, src/app/page.tsx, src/app/layout.tsx, src/app/globals.css
- ดีไซน์: Swiss modern — พื้นขาว, ขอบม่นทั้งหน้า (global radius 0), เส้น border ชัด, accent เขียว emerald

---
Task ID: 2
Agent: Super Z (main agent)
Task: สร้างหน้า UI แอดมินทั้งหมด 28 หน้าจอ TH-LOTTO Admin Panel ตามเอกสารระบบเดิม (ทันสมัย พื้นหลังขาว ปุ่มขอบมน)

Work Log:
- อ่านเอกสาร admin_system_summary v1 และ worklog เดิม ระบุ requirement: UI-only ทั้ง 28 หน้าจอ
- สร้าง src/components/admin/store.ts — Zustand nav store + PAGE_META ครบ 28 หน้า
- สร้าง src/data/admin-mock.ts — mock data ครบ: สมาชิก 12, ฝาก 10, ถอน 10, ตลาด 9, โพย 12, แอดมิน 5, ธนาคาร 7, โปรฯ 4, บทความ 6, ฟีด 5, เลขดัง 6, สไลด์ 4, วงล้อ 8 รางวัล+ประวัติ, แอฟฟิลิเอต 6, แจ้งเตือน 5, instant (bet types/draws/bets/settings), ผลย้อนหลัง 3, เลขอั้น 5, ประกาศ 3, ตาราง DB 8
- สร้าง src/components/admin/primitives.tsx — Btn (ปุ่มขอบมน rounded-full), PageHeader, Panel, StatCard, StatusBadge, SearchInput, Table (Th/Td), Pagination, EmptyState, ConfirmDialog, ToggleRow, Field
- สร้าง 28 หน้าจอใน 8 ไฟล์: dashboard (recharts 3 กราฟ + notification panel), finance (deposits/withdrawals อนุมัติ-ปฏิเสธ-สลิป), members (list/detail/affiliates/admins สิทธิ์ 15 keys), lottery (markets 9 การ์ด/results กรอกผล/bets/restricted), instant 6 หน้า, wheel (โอกาสรวม %), content 5 หน้า, system 5 หน้า (settings 8 modals/appearance/banks/broadcast/data-management)
- สร้าง admin-app.tsx — Sidebar 8 กลุ่มตามเอกสาร + Topbar (ค้นหา/กระดิ่ง badge/โปรไฟล์) + Sheet mobile + footer
- แก้ lint 11 errors: ย้าย DigitInput/PermList/SettingsFooter ออกนอก render, fix placeholder="0".repeat JSX syntax, เพิ่ม import Switch
- แก้ globals.css: --radius 0.75rem + ลบ border-radius:0 !important (แก้ Turbopack stale cache ด้วยการ append comment บังคับ rebuild)
- ทดสอบ Agent Browser: desktop + mobile 375px (Sheet menu, ไม่มี overflow), อนุมัติฝาก (สถานะเปลี่ยน+toast+ตัวนับ 3→2), กรอกผลรางวัล 6/2/3/3 หลัก + confirm, modal การเงิน, กระดิ่งแจ้งเตือน popover, ไล่คลิกครบ 28 หน้า ไม่มี console error

Stage Summary:
- ครบเช็คลิสต์: ทันสมัย (Swiss modern + emerald accent + IBM Plex Sans Thai) / พื้นหลังขาวทั้งแอป / ปุ่มขอบมน rounded-full ทุกปุ่ม + การ์ด rounded-2xl/3xl
- 28 หน้าจอครบตามเอกสาร admin_system_summary, interaction ทำงานจริง (local state + toast)
- ไฟล์หลัก: src/components/admin/* (store.ts, primitives.tsx, admin-app.tsx, pages/*.tsx 8 ไฟล์), src/data/admin-mock.ts
- lint ผ่าน (0 errors), dev server 200 OK, Agent Browser verified

---
Task ID: 3
Agent: Super Z (main agent)
Task: สร้างหน้า UI แอดมินใหม่ครบ 12 หน้าตามสเปกล่าสุดที่ผู้ใช้ส่งมา (แทนเวอร์ชัน 28 จอเดิม) — ทันสมัย พื้นหลังขาว ปุ่มขอบมน

Work Log:
- ผู้ใช้ส่งสเปกใหม่แบบละเอียด 12 หน้า (Dashboard/Deposits/Withdrawals/Members/MemberDetail/Markets/Results/Instant/Wheel/Promotions/Settings/Admins) พร้อมฟิลด์, คอลัมน์, โมดัล, RPC ครบ — ลบหน้าเก่า 8 ไฟล์แล้วสร้างใหม่ทั้งหมด
- เขียน src/data/admin-mock.ts ใหม่ 605 บรรทัด: ธนาคาร 10, สมาชิก 24, ฝาก 14, ถอน 12, โปรรายละเอียด 4, dashboard stats + weekly chart + activity feed 18 + top10, ตลาด 9 (อัตราจ่าย 9 BET_TYPES + limits), draw_schedules + recent results, instant (stats/draws/bets/hourly), wheel 8 slots (probability รวม 100%), promotions 4, settings 5 ชุด + admin banks + announcements + cleanup, admins 4 + permission 15 keys, member detail (bets/txs/logins), notifications 5
- store.ts: PageId 12 หน้า + PAGE_META; primitives.tsx เพิ่ม Avatar, BankBadge (โลโก้สีแบรนด์), BankSelector (Select 10 ธนาคาร), RealtimeDot, normalize StatusBadge รองรับ uppercase, TableWrap รับ className
- 12 หน้าครบตามสเปก: Dashboard (KPI 2 แถว 8 การ์ด + advanced 3 + BarChart recharts + ฟีดรวมพร้อม filter + alert ตลาด 🟡🔴✅ + Top10 แถบเรียงอันดับ), Deposits (tabs 4 + search + ตาราง 11 คอลัมน์ + สลิป preview + โมดัลอนุมัติแสดงเงื่อนไขโปร bonus_rate/min_deposit/max_withdrawal/turnover + ปฏิเสธต้องใส่เหตุผล + Export CSV จริง), Withdrawals (ตาราง 11 คอลัมน์ + Copy เลขบัญชี/ชื่อบัญชี + โมดัลรายละเอียด + admin_note + CSV), Members (search + ตาราง 13 คอลัมน์ JOIN wallets + pagination 20/หน้า + โมดัลแก้ไข BankSelector + โมดัลปรับยอดเพิ่ม/ลด), MemberDetail (header card ครบ + 5 tabs: ภาพรวม/แทง/ธุรกรรม ±สี/ฝากถอน/ล็อกอิน IP+UA), Markets (card grid + วันออกผล pills + อัตราจ่าย 9 ประเภท + ขีดจำกัด + YouTube link + edit modal ครบ), Results (2 tabs + กรอกผล: รัฐบาล 6 หลัก auto-fill 3ตัวบน/2ตัวบน + 3 หลัก 4 ช่อง + confirm สรุปแทงรวม/โพยถูกรางวัล/ยอดจ่าย + ยืนยันแล้วสถานะเปลี่ยน+ขึ้นผลล่าสุด), Instant (6 KPI + BarChart รายชั่วโมง + ตาราง draws/bets 10 + countdown auto-refresh 30 วิ), Wheel (SVG วงล้อ 8 ช่อง gradient คลิกเลือกช่อง + ตั้งค่าราคา/โควตา/banner + slot editor 8 การ์ด (ชื่อ/ยอด/probability/color/hi_color/toggle) + validation รวม 100% เขียว-เหลือง), Promotions (การ์ด 3 คอลัมน์ + toggle/แก้ไข/ลบ confirm + ฟอร์มครบ 3 ส่วน 22 ฟิลด์), Settings (hub 8 modals: การเงิน 8 keys/บัญชีธนาคาร เพิ่ม-ลบ-ค่าเริ่มต้น/วงล้อ/Social/ประกาศ Marquee CRUD+ลำดับ/ระบบ/ควบคุมเว็บ owner-only/Cleanup preview 4 ตาราง + total_deleted), Admins (ตาราง + โมดัล permission checkboxes 15 keys พร้อม label+page+key)
- admin-app.tsx: sidebar ใหม่ 8 กลุ่ม 12 เมนู + badge รอดำเนินการ + กระดิ่ง admin_notifications + Sheet mobile + footer mt-auto
- แก้บั๊กจากการทดสอบจริง 4 จุด: (1) ปุ่ม action ตัวอักษรตั้ง → ไอคอนกลม size-8 + whitespace-nowrap (2) ตารางกว้างดันหน้า 1520px → min-w-0 ที่ flex item + sticky action column ขวา (3) label JSX raw `{isApprove...}` → template literal (4) StatCard มือถือตัวเลขถูกตัด → responsive text-lg/p-4/size-9
- แก้ hydration mismatch (Radix aria-controls): mounted-guard ที่ page.tsx + NotificationBell + เพิ่ม DialogDescription ใน ConfirmDialog
- lint ผ่าน 0 errors, Agent Browser ทดสอบครบ: desktop (คลิกครบ 12 หน้า, อนุมัติฝาก→toast, กรอกผลรัฐบาล auto-fill 617/17→confirm→ออกผลแล้ว→ขึ้นตารางล่าสุด, Cleanup total_deleted 13,853, wheel 125% เตือน) + mobile 375px (KPI เต็มตัวเลข, Sheet menu ครบ, sticky actions เลื่อนตารางได้) — console error 0 หลัง reload สะอาด

Stage Summary:
- ครบ 12 หน้าตามสเปกล่าสุดทุกรายการ + components ร่วม (BankBadge/BankSelector/StatusBadge/Toast/Modal/Layout+Bell)
- ดีไซน์: ทันสมัย Swiss + emerald accent, พื้นหลังขาวทั้งแอป, ปุ่ม/การ์ดขอบมน rounded-full/rounded-2xl/3xl
- ไฟล์หลัก: src/app/page.tsx (mount guard), src/components/admin/{store,primitives,admin-app}.tsx, src/components/admin/pages/*.tsx 12 ไฟล์, src/data/admin-mock.ts
- lint 0 errors, dev.log 200 OK, Agent Browser verified desktop+mobile, console 0 errors

---
Task ID: 4
Agent: Super Z (main agent)
Task: ตรวจละเอียด 3 เอกสารระบบเดิม (full_system_functions_report / admin_system_summary / admin_detailed_modules) เทียบกับโค้ด 12 หน้า แล้วแก้ทุกจุดที่ไม่ตรงสเปก

Work Log:
- อ่านเอกสารอัปโหลด 3 ไฟล์ครบ + อ่านโค้ดทุกไฟล์ (admin-mock.ts, store, primitives, admin-app, 12 หน้า) เทียบรายฟิลด์/คอลัมน์/โมดัล/RPC
- พบและแก้ 10 กลุ่ม: (1) MemberDetail Tab4 เขียนใหม่ด้วย MEMBER_DEPOSIT_ROWS/MEMBER_WITHDRAW_ROWS ครบคอลัมน์ ถอนมี ธนาคาร+เลขบัญชี (2) Deposits คอลัมน์โปรฯ แสดงชื่อโปร+code (3) Promotions เพิ่ม image_url ใน interface+bind จริง+การ์ดแสดงรูป+type เพิ่ม referral/special/deposit (4) Results แก้ชื่อ RPC เป็น admin_set_result_and_settle (5) ตลาดหวย 9 ตลาดเปลี่ยนเป็น Live Data จริง (TH_GOV/HANOI/LAO/MALAY/NIKKEI_MORNING/HANGSENG_AFTERNOON/STOCK_INDIA/STOCK_GERMANY/STOCK_DOWJONES) + helper mktShort สำหรับโลโก้ chip (6) ธนาคารเพิ่ม BAY กรุงศรีอยุธยา (7) โปรโมชั่น 4 ตัวเป็น Live Data (สมัครใหม่/แนะนำเพื่อน/โปรวันเกิด/แทงผิด 10 งวด) (8) ACTIVITY_FEED ขยาย 18→30 รายการ + market_code ทุกโพย (9) Settings Social เพิ่มบล็อก LINE Notify read-only (enabled/threshold 5000/lin.ee/zQAyRsM/@653ufkvi + fn_daily_summary_line) (10) Admins เพิ่ม action ระงับ/ปลด+รีเซ็ตรหัสผ่าน+ลบ(ConfirmDialog, Super ลบไม่ได้) + Members เพิ่ม Select กรองสถานะ + Withdrawals เพิ่ม Copy ชื่อธนาคาร + ยอดโปรค้าง promo_hold dynamic + แก้ TS error Td title prop + ลบ dead code SlipModal
- ตรวจ tsc --noEmit ผ่าน (ไม่มี error ใน src/), dev server 200 OK
- Agent Browser ทดสอบ: Dashboard (ฟีด 30 รายการ+chip GOV/LAO/NIK/HSG/IND/GER/MAL/HAN ครบ), Markets (9 ตลาด Live Data ครบทุกชื่อ), Members (filter สถานะ), MemberDetail Tab4 (ตารางฝาก/ถอน+ธนาคาร+เลขบัญชี), Promotions (โปร Live Data 4 ตัว+ฟอร์ม image_url พิมพ์ได้จริง), Admins (4 action ต่อแถว, Super ไม่มีปุ่มลบ), Withdrawals โมดัล (Copy ธนาคาร+ยอดโปรค้าง ฿3,200), Settings Social (LINE Notify block), mobile 375px (ไม่มี overflow, Sheet menu ครบ), console error 0

Stage Summary:
- 12 หน้าตรงเอกสารทั้ง 3 ไฟล์ทุกรายการ: โครงสร้าง/คอลัมน์/โมดัล/RPC ตรง detailed_modules 100%, ข้อมูล mock ตรง Live Data ของ full_report, ฟีเจอร์เสริมจาก admin_system_summary (filter สถานะ, ระงับ/ลบ/รีเซ็ตรหัสผ่าน admin) ครบ
- ไฟล์แก้: admin-mock.ts, dashboard.tsx, deposits.tsx, withdrawals.tsx, members.tsx, member-detail.tsx, markets.tsx, results.tsx, promotions.tsx, settings.tsx, admins.tsx
- lint/tsc ผ่าน, browser verified desktop+mobile, console 0 errors

---
Task ID: 5
Agent: Super Z (main agent)
Task: สร้างหน้าที่เหลือให้ครบตามเช็คลิสต์เมนู (คอนเทนต์: สไลเดอร์/โปรโมชั่น/บทความ/จัดการฟีด · ระบบ: ตั้งค่าระบบ/รูปลักษณ์/ธนาคาร/แจ้งเตือน Broadcast/Backup & ข้อมูล) — เพิ่ม 7 หน้าใหม่ รวมเป็น 19 หน้า

Work Log:
- อ่านสเปกจาก 3 เอกสารอัปโหลด (full_report: RPC กลุ่มคอนเทนต์/Notification/Banks · admin_system_summary: ฟีเจอร์ 7 หน้า + โครงสร้างเมนู · detailed_modules: permission keys) แล้วออกแบบให้ตรงเอกสาร
- store.ts: เพิ่ม PageId 7 หน้า (sliders/articles/feeds/appearance/banks/broadcast/data-management) + PAGE_META กลุ่ม "คอนเทนต์" และ "ระบบ"
- admin-mock.ts: เพิ่มข้อมูล SLIDERS 4 / ARTICLES 6+4 หมวด / NEWS_FEEDS 5 / APPEARANCE+PRIMARY_PALETTE+FONT_OPTIONS / BANK_DISPLAYS 10 + BANK_ACCOUNT_BOOK 5 / BROADCAST_HISTORY 5 / DB_TABLE_STATS 12 ตาราง / BACKUP_LOGS 5
- สร้าง 7 หน้าใหม่ตามสเปก: (1) Sliders — การ์ดลากเรียง (HTML5 drag + ลูกศรขึ้นลง + admin_reorder_sliders) toggle toggle_modal(title,image_url,link_url) ลบ confirm (2) Articles — ตาราง ค้นหา+filter หมวด+paging 4/หน้า โมดัลเขียนแบบ rich text toolbar (H2/Bold/Italic/Underline/List) + เผยแพร่/ฉบับร่าง (3) Feeds — รายการฟีด 4 ประเภท (news/winner/promo/alert) เรียงลำดับ + toggle แสดง + CRUD (4) Appearance — เลือกสีหลัก 6 swatch + custom hex, โลโก้/favicon/login bg, ฟอนต์ 5 แบบ, Light/Dark/System + พรีวิวสด (5) Banks — ธนาคาร 10 ตัว toggle+จัดลำดับ + บัญชีรับ/โอน (copy เลข/ชื่อ, ตั้งบัญชีหลัก per bank+type, โมดัลเพิ่ม/แก้ BankSelector) (6) Broadcast — เขียนแจ้งเตือน ผู้รับทั้งหมด/รายบุคคล (ค้นหาสมาชิกจริง) p_type 3 แบบ + พรีวิว + confirm + ประวัติพร้อมลบ (7) DataManagement — สรุป 3 การ์ด + Export CSV/JSON ดาวน์โหลดได้จริง + สถิติ 12 ตาราง (แถว/ขนาด/สัดส่วน bar) + Backup ทันที (fn_log_csv_backup) + ประวัติ
- admin-app.tsx: เมนูใหม่ 8 กลุ่ม 19 รายการ (คอนเทนต์ 4 + ระบบ 6) + icons (Images/Newspaper/Rss/Palette/Landmark/RadioTower/DatabaseBackup) + switch case 7 หน้า + footer "ครบ 19 หน้า"
- แก้ TS error 2 จุด: banks cast account_type, sliders ย้าย drag props จาก Panel ไป div wrapper
- แก้ overflow มือถือ 375px หน้า Backup: แถว Export เพิ่ม flex-wrap + grid items เพิ่ม min-w-0 (578px→375px)
- ทดสอบ Agent Browser ครบ: สไลเดอร์ (ย้ายลำดับสลับการ์ดจริง, toggle 3→4, แก้ชื่อ+บันทึกสำเร็จ), บทความ (filter เทคนิค=1/ทั้งหมด=4, สร้างบทความใหม่+toggle เผยแพร่ → ขึ้นในตาราง), ฟีด (เพิ่มฟีดใหม่), รูปลักษณ์ (เลือก Violet #7c3aed + Dark Mode พรีวิวอัปเดต + บันทึก), ธนาคาร (ตั้งบัญชีหลัก, เพิ่มบัญชีใหม่ 5→6, toast), Broadcast (ปุ่ม disabled จนกรอกครบ, ส่ง→ประวัติ 5→6, ค้นหาสมาชิกรายบุคคลได้, ลบประวัติ 6→5), Backup (รีเฟรชสถิติ, Backup ทันที log 2→3, Export CSV ดาวน์โหลดจริง), มือถือ 375px ทั้ง 7 หน้าไม่มี overflow, console error 0
- lint 0 errors, tsc 0 errors (src/admin), dev server 200 OK

Stage Summary:
- ครบเช็คลิสต์เมนูเต็ม 19 หน้า: ภาพรวม 1 · การเงิน 2 · สมาชิก 2 · หวย 2 · หวยหนึ่งนาที 1 · เกม 1 · คอนเทนต์ 4 (สไลเดอร์/โปรโมชั่น/บทความ/จัดการฟีด) · ระบบ 6 (ตั้งค่าระบบ/รูปลักษณ์/ธนาคาร/แจ้งเตือน Broadcast/Backup & ข้อมูล/ผู้ดูแลระบบ)
- ดีไซน์คงเดิมทั้งแอป: ทันสมัย (Swiss + emerald) · พื้นหลังขาว · ปุ่มขอบมน rounded-full
- ไฟล์ใหม่: pages/{sliders,articles,feeds,appearance,banks,broadcast,data-management}.tsx · แก้: store.ts, admin-mock.ts, admin-app.tsx
- ภาพตรวจ: download/page-{sliders,appearance,banks,broadcast}.png

---
Task ID: 6
Agent: Super Z (main agent)
Task: สร้าง AGENTS.md Master Global Standard v2.0 (ไฟล์เดียวจบ ภาษาอังกฤษ) สำหรับใช้เป็นมาตรฐานกลางทุกโปรเจกต์ + ผู้ใช้ประกาศให้ AI ใช้กฎนี้กับตัวเองด้วย

Work Log:
- รวบรวมเนื้อหาจาก AGENTS.md v1.0 เดิม + แนวคิด Global/Project layering จากบทสนทนา แล้วเขียนใหม่เป็น Master Standard v2.0 ไฟล์เดียว 833 บรรทัด
- โครงสร้าง 4 Parts / 34 sections: §0 วิธีใช้ (Global vs Project placement + ตารางตำแหน่ง global rules ของ Antigravity/Claude Code/Codex/Cursor/Windsurf/Copilot + ลำดับ precedence 0-3) · Part I Lifecycle (§1-7: Understand→Clarify→Plan→Specify→Tasks, ตาราง compression ตามขนาดงาน, document-driven + ADR) · Part II Implementation (§8-17: implementation rules, architecture, DRY, security by design 19 จุดตรวจ, database expand-migrate-contract, API idempotency, error handling, testing, verification gate ห้ามอ้าง verify ที่ไม่ได้รัน, diff review) · Part III Governance (§18-31: root-cause debugging, change management, dependency, frontend/UI, a11y, performance, working modes 7 แบบ, communication + epistemic labeling FACT/ASSUMPTION, stop conditions, definition of done, 15 non-negotiable rules, execution algorithm 15 steps) · Part IV Adaptation (§32 Project Adapter template 9 หัวข้อ, §33 Quick-Start Card 12 ข้อ, §34 Change Log)
- ตรวจไฟล์สมบูรณ์: 833 บรรทัด, 44 headings, ปิดท้ายถูกต้อง
- บันทึก adoption: ผู้ใช้สั่งให้ AI (Super Z) อ่านและทำตามมาตรฐานนี้ด้วย — ถือเป็นกฎการทำงานระดับ workflow ของ session นี้และงานถัดไป

Stage Summary:
- ไฟล์ส่งมอบ: /home/z/my-project/download/AGENTS.md (v2.0 Master Global Standard, เนื้อหาอังกฤษทั้งหมด)
- การใช้งาน: วางที่ root โปรเจกต์เป็น AGENTS.md หรือ register เป็น global rules ของ IDE แต่ละตัว; แต่ละโปรเจกต์เติม Project Adapter (§32) แทนการแก้ไฟล์แม่
- AI รับรองการปฏิบัติตาม: อ่านก่อนแก้เสมอ / วางแผนก่อนเขียน / ถามเมื่อข้อมูลวิกฤตขาด / ไม่เดา production behavior / แจ้งเฉพาะ verification ที่รันจริง / แยก FACT vs ASSUMPTION / ไม่ขยาย scope เงียบ ๆ

---
Task ID: 7
Agent: Super Z (main agent)
Task: เปลี่ยนธีมสี Admin Panel ให้ตามโลโก้ที่อัปโหลด (คงพื้นหลังขาว) — ทำตาม AGENTS.md standard ครบทุก phase

Work Log:
- DISCOVERY: อ่านโลโก้อัปโหลด "สีแดงและสีดำ อีสปอร์ต...โลโก้.png" — พบว่าสีจริงคือเขียว 2 เฉด + ดำ (ไม่ใช่แดงตามชื่อไฟล์)
- SPECIFICATION: สกัดสีด้วย scripts/extract_logo_colors.py (PIL, สุ่ม 65,536 px): bright green #287e0b (21.9%), dark green #0c4b1c (24.6%), black (53.5%)
- สร้าง brand palette 11 ขั้น (brand-50 ถึง brand-950) anchor ที่สีจริงจากโลโก้ ใน @theme block ของ globals.css
- IMPLEMENT: bulk rename emerald-*→brand-* 23 ไฟล์ 157 จุด (sed: emerald-/"emerald"/emerald:) + แก้ teal 2 จุด (settings site tone→brand-50/700, sliders gradient to-teal-700→to-brand-800) + แทน hex hardcode: #10b981→#287e0b (dashboard/instant chart bars), #059669→#287e0b (promotions default, AVATAR_COLORS, MALAY market, wheel w1, promo pm-1, APPEARANCE primary_color, ::selection), #34d399→#579c2c (wheel hi_color), palette "Emerald"→"Logo Green"
- ใส่โลโก้จริงใน sidebar: cp upload→public/logo-th.png, เปลี่ยน Brand "TL" div เป็น <img> rounded-full
- DEBUGGING (หลักฐานครบ): หลังแก้ พบ active nav pill เป็นขาวบนขาว — eval ยืนยัน --color-brand-600 ว่าง + bg rgba(0,0,0,0) → root cause: Turbopack stale CSS cache (case เดียวกับ worklog Task 3) → แก้ด้วย append comment บังคับ rebuild → --color-brand-600 = #287e0b ถูกต้อง
- VERIFICATION: tsc 0 error ใน src/ (error ที่เหลือเป็นของ examples/, skills/ มีอยู่ก่อน), lint 0 error, browser ทดสอบ: Dashboard (โลโก้จริง+pill เขียว+กราฟแท่งเขียวโลโก้), Deposits (badge/ยอดเงิน/ปุ่มเขียว), Appearance (palette "Logo Green #287E0B" เป็นค่าเริ่มต้น+พรีวิวเขียว), Markets (MALAY chip เขียว+badge เปิดรับ), mobile 375px NO OVERFLOW, console error 0

Stage Summary:
- ธีมใหม่: พื้นหลังขาวทั้งแอป (ไม่เปลี่ยน) · accent ทุกจุด = เขียวจากโลโก้ #287e0b / เข้ม #0c4b1c · โลโก้ TH จริงแสดงใน sidebar
- สี per-market (GOV/HAN/LAO/NIK/HSG) และ avatar colors อื่น ๆ คงไว้ตาม design (identity ของตลาด ไม่ใช่ theme accent)
- ภาพตรวจ: download/rebrand-{dashboard,deposits,appearance,markets,mobile}.png
- ข้อควรจำ: แก้ @theme ใน globals.css แล้ว Turbopack ต้อง forced rebuild (append comment) ถึงจะ regenerate utilities

---
Task ID: 8
Agent: Super Z (main agent)
Task: ตรวจทุกหน้าให้แสดงผลภาษาไทยล้วน 100% (ห้ามศัพท์โค้ด/อังกฤษหลุด) + ห้ามข้อความตกบรรทัด/ล้น + เปลี่ยนฟอนต์เป็น Prompt (อัปโหลด Prompt-Light.ttf) — ทำตาม SOP_AI_ENGINEERING_OS_V1.0

Work Log:
- FONT: ติดตั้ง upload/Prompt-Light.ttf → public/fonts + @font-face (weight 100-900) + Google Fonts Prompt 300-700 + --font-sans "Prompt" ก่อนสุด · metadata title/favicon เป็นไทย+โลโก้จริง · แก้ Turbopack stale cache (append comment) จน document.fonts.check('Prompt') ผ่าน
- AUDIT รอบ 1: เขียน scripts/{audit-latin,audit-overflow,audit-pages.sh,analyze-audit.py} — สแกน 19 หน้า (18 เมนู + รายละเอียดสมาชิก) ดึง text node ที่มี [A-Za-z] ทั้งหมด → เจอข้อความอังกฤษ/ศัพท์โค้ด ~70 กลุ่ม
- LOCALIZE: scripts/thai-localize.py แก้ 177 จุด + เก็บงาน 5 จุด = 182 จุด ใน 23 ไฟล์: เมนู (ส่งแจ้งเตือน/สำรองและจัดการข้อมูล), breadcrumb, คำอธิบายหน้า (ตัดชื่อตาราง/RPC ออก เช่น "deposit_requests · realtime subscribe" → "ตารางคำขอฝากเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ"), toast/DialogDescription ตัด "RPC: ...", ปุ่ม (ส่งออกไฟล์/สำรองทันที/ส่งออกข้อมูล), badges (อัปเดตสด/ยอดนิยม/ร้อนแรง/เปิดใช้งาน/ฐานข้อมูล), ฟอร์ม (ประเภทการแจ้งเตือน: ทั่วไป/เตือนภัย/สำเร็จ, VIP→วีไอพี, Member ID→รหัสสมาชิก, turnover→ยอดแทงที่ต้องทำ), รูปลักษณ์ (พาเลตต์ไทย, Light/Dark/System→สว่าง/มืด/ตามระบบ, ตัด site_logo_url/custom_hex keys, ประโยคทดสอบฟอนต์เป็นไทย), ผู้ดูแล (Super Admin→ผู้ดูแลสูงสุด, Permission→สิทธิ์การใช้งาน, Login→การเข้าสู่ระบบ), (Owner)→เจ้าของเว็บ, วงล้อ (SPIN→หมุน, Slot→ช่อง, ตัด lucky_wheel_* keys), sidebar/footer
- WRAP FIX (มือถือ 375px เกิน 4 หน้า): deposits TabsList (max-w-full overflow-x-auto), instant/broadcast/appearance เพิ่ม min-w-0 ที่ grid items+Panels, appearance แถวรหัสสี flex-wrap + hint truncate → สแกนซ้ำ 18/18 OK
- WRAP FIX (badge ตกบรรทัดจริง): วัด DOM พบ StatusBadge "รอดำเนินการ" 52×56px ตก 3 บรรทัด (TD 84px บีบ) + vipBadge วีไอพี 35×35 ตก 2 บรรทัด → เพิ่ม whitespace-nowrap ที่ StatusBadge/RealtimeDot/BankBadge ฐาน + badge ใน member-detail/broadcast/banks → detector คำนวณ lines จริงผ่าน 18/18 (เหลือ hit เดียวเป็นวงกลม fix-size "16" = false positive)
- VERIFY: tsc 0 error (src), lint 0 error, เดสก์ท็อป 1440 ภาพ 7 หน้า + มือถือ 375 ทั้ง 18 หน้า, console error 0, font Prompt โหลดจริง

Stage Summary:
- ภาษาแสดงผลไทยล้วนทุกหน้า (เหลือเฉพาะ: แบรนด์ TH-LOTTO, รหัสข้อมูล — ธนาคาร KB/SCB, ตลาด GOV/MALAY, โค้ดโปร NEW50, รหัสสมาชิก M10xxx, ชื่อฟอนต์, ชื่อตารางในสถิติสำรอง, หน่วย MB)
- ฟอนต์ Prompt ทั้งแอป (TTF อัปโหลดเป็นฐาน + Google weights), favicon = โลโก้จริง
- ไม่มีข้อความตกบรรทัด/ล้นทั้งเดสก์ท็อปและมือถือ 375px (ตารางกว้างใช้ scroll แนวนอนตาม pattern เดิม)
- ภาพหลักฐาน: download/thai-{dash,deposits,broadcast,appearance,wheel,members,markets}.png
