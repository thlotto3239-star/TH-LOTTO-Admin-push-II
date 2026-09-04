# -*- coding: utf-8 -*-
"""แปลข้อความแสดงผลทั้งหมดเป็นไทยล้วน (ตัดศัพท์โค้ด/อังกฤษออกจาก UI)"""
import io, os

BASE = "/home/z/my-project/src"
P = os.path.join

# (file, old, new)
R = []

def add(f, pairs):
    for old, new in pairs:
        R.append((f, old, new))

STORE = P(BASE, "components/admin/store.ts")
APP = P(BASE, "components/admin/admin-app.tsx")
PRIM = P(BASE, "components/admin/primitives.tsx")
PG = lambda n: P(BASE, f"components/admin/pages/{n}.tsx")
MOCK = P(BASE, "data/admin-mock.ts")

add(STORE, [
    ('title: "แผงควบคุม (Dashboard)"', 'title: "แผงควบคุม"'),
    ('title: "แจ้งเตือน Broadcast"', 'title: "ส่งแจ้งเตือน"'),
    ('title: "Backup & ข้อมูล"', 'title: "สำรองและจัดการข้อมูล"'),
])

add(APP, [
    (">Admin Panel v1.4.0<", ">แผงควบคุมแอดมิน เวอร์ชัน 1.4.0<"),
    ("เจ้าของเว็บ (Owner)", "เจ้าของเว็บ"),
    ("TH-LOTTO Admin Panel v1.4.0 — React + Supabase · UI Mockup สำหรับทีมแอดมิน (ครบ 19 หน้าตามเช็คลิสต์)",
     "TH-LOTTO · แผงควบคุมแอดมิน เวอร์ชัน 1.4.0 · ต้นแบบหน้าจอสำหรับทีมแอดมิน (ครบ 19 หน้าตามเช็คลิสต์)"),
])

add(PRIM, [
    ('label: "Super Admin"', 'label: "ผู้ดูแลสูงสุด"'),
    ('label: "Admin"', 'label: "ผู้ดูแล"'),
])

add(PG("dashboard"), [
    ('label="สมาชิก Active 7 วัน"', 'label="สมาชิกใช้งาน 7 วัน"'),
    ('sub="โพยต่อสมาชิก active"', 'sub="โพยต่อสมาชิกที่ยังเล่น"'),
    ("ข้อมูลจาก transactions: DEPOSIT · WITHDRAW · BET (บาท)", "ข้อมูลจากธุรกรรม: ฝาก · ถอน · แทง (บาท)"),
    ('<RealtimeDot label="เชื่อมต่อ Supabase Realtime" />', '<RealtimeDot label="เชื่อมต่อข้อมูลสดอัตโนมัติ" />'),
    ("Top 10 ผู้แทงสูงสุด", "10 อันดับผู้แทงสูงสุด"),
])

add(PG("deposits"), [
    ('description="deposit_requests · realtime subscribe: deposits-admin"', 'description="ตารางคำขอฝากเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ"'),
    ('label="Realtime"', 'label="อัปเดตสด"'),
    ("/> Export CSV</Btn>", "/> ส่งออกไฟล์</Btn>"),
    ('"Member ID"', '"รหัสสมาชิก"'),
    (">Member ID<", ">รหัสสมาชิก<"),
    ("ค้นหา ชื่อ / เบอร์ / Member ID", "ค้นหา ชื่อ / เบอร์ / รหัสสมาชิก"),
    ("<span>bonus_rate: {promo.bonus_rate}%</span>", "<span>โบนัส {promo.bonus_rate}%</span>"),
    ("<span>min_deposit: {fmtTHB(promo.min_deposit)}</span>", "<span>ฝากขั้นต่ำ {fmtTHB(promo.min_deposit)}</span>"),
    ("<span>max_withdrawal: {fmtTHB(promo.max_withdrawal)}</span>", "<span>ถอนสูงสุด {fmtTHB(promo.max_withdrawal)}</span>"),
    ("<span>turnover_multiplier: {promo.turnover_multiplier} เท่า</span>", "<span>ต้องทำยอด {promo.turnover_multiplier} เท่า</span>"),
])

add(PG("withdrawals"), [
    ('description="withdraw_requests · realtime subscribe: withdrawals-admin"', 'description="ตารางคำขอถอนเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ"'),
    ('label="Realtime"', 'label="อัปเดตสด"'),
    ("/> Export CSV</Btn>", "/> ส่งออกไฟล์</Btn>"),
    ('"Member ID"', '"รหัสสมาชิก"'),
    (">Member ID<", ">รหัสสมาชิก<"),
    ("ค้นหา ชื่อ / เบอร์ / Member ID", "ค้นหา ชื่อ / เบอร์ / รหัสสมาชิก"),
    ("ยอดโปรที่ยังค้าง (turnover ยังไม่ครบ): ", "ยอดโปรที่ยังค้าง (ยอดแทงยังไม่ครบ): "),
    ("ยอดโปรที่ยังค้าง: ไม่มี (turnover ครบแล้ว)", "ยอดโปรที่ยังค้าง: ไม่มี (ยอดแทงครบแล้ว)"),
])

add(PG("members"), [
    ("profiles JOIN wallets · ทั้งหมด ${rows.length} คน · 20 ต่อหน้า", "ข้อมูลสมาชิกและกระเป๋าเงิน · ทั้งหมด ${rows.length} คน · 20 คนต่อหน้า"),
    ('placeholder="ค้นหา Member ID / เบอร์ / ชื่อ"', 'placeholder="ค้นหารหัสสมาชิก / เบอร์ / ชื่อ"'),
    ("<Th>Member ID</Th>", "<Th>รหัสสมาชิก</Th>"),
    ('<Field label="VIP Level">', '<Field label="ระดับวีไอพี">'),
    (">VIP {n}</SelectItem>", ">วีไอพี {n}</SelectItem>"),
    ("VIP {lv}", "วีไอพี {lv}"),
    ("<DialogDescription>RPC: admin_update_member · {member.member_id}</DialogDescription>", "<DialogDescription>แก้ไขข้อมูลสมาชิกรหัส {member.member_id}</DialogDescription>"),
    ("<DialogDescription>RPC: admin_adjust_wallet · {member.full_name}</DialogDescription>", "<DialogDescription>ปรับยอดกระเป๋าเงินของ {member.full_name}</DialogDescription>"),
])

add(PG("markets"), [
    ('<Star className="size-2.5" /> Popular</span>', '<Star className="size-2.5" /> ยอดนิยม</span>'),
    ('<Flame className="size-2.5" /> Hot</span>', '<Flame className="size-2.5" /> ร้อนแรง</span>'),
    ("แสดงใน Popular", "แสดงเป็นตลาดยอดนิยม"),
    ("lottery_markets · ทั้งหมด ${rows.length} ตลาด", "ตารางตลาดหวย · ทั้งหมด ${rows.length} ตลาด"),
    ('<Youtube className="size-3.5" /> YouTube Live', '<Youtube className="size-3.5" /> ถ่ายทอดสด'),
    ("<DialogDescription>RPC: admin_update_market · admin_update_payout_rates (lottery_markets + market_bet_rates)</DialogDescription>", "<DialogDescription>แก้ไขข้อมูลตลาดและอัตราจ่ายทุกประเภท</DialogDescription>"),
])

add(PG("results"), [
    ("draw_schedules + lottery_results · กรอกผลแล้วระบบตัดยอดอัตโนมัติ (admin_set_result_and_settle)", "รอบออกรางวัลและผลรางวัล · กรอกผลแล้วระบบตัดยอดอัตโนมัติ"),
    ("<DialogDescription>RPC: admin_set_result_and_settle — ตรวจสอบสรุปก่อนยืนยัน</DialogDescription>", "<DialogDescription>ตรวจสอบสรุปยอดก่อนยืนยันผล</DialogDescription>"),
])

add(PG("instant"), [
    ('description="admin_get_instant_stats · admin_get_instant_draws · admin_get_instant_bets"', 'description="ข้อมูลหวยหนึ่งนาที · สถิติ รอบออกรางวัล และรายการแทง"'),
    ('<RealtimeDot label="Auto-refresh 30 วินาที" />', '<RealtimeDot label="อัปเดตอัตโนมัติ 30 วินาที" />'),
    ('label="Draw วันนี้"', 'label="รอบวันนี้"'),
    ('label="ผู้เล่น Active"', 'label="ผู้เล่นที่ยังเล่น"'),
    ('label="กำไร/ขาดทุน (Net)"', 'label="กำไร/ขาดทุนสุทธิ"'),
    ("ยอดแทง vs ยอดจ่ายรางวัล รายชั่วโมง", "ยอดแทงเทียบยอดจ่ายรางวัล รายชั่วโมง"),
    (' <span className="ml-1 text-[11px] font-medium text-neutral-400">admin_get_instant_draws</span>', ""),
    (' <span className="ml-1 text-[11px] font-medium text-neutral-400">admin_get_instant_bets</span>', ""),
    ("<Th>Draw ID</Th>", "<Th>รหัสรอบ</Th>"),
])

add(PG("wheel"), [
    ("admin_get_wheel_config · admin_update_wheel_prize · วันนี้หมุนไป", "ตั้งค่าวงล้อและรางวัล · วันนี้หมุนไป"),
    ("พรีวิววงล้อ (แบบ Real-time ตาม config)", "พรีวิววงล้อ (อัปเดตตามการตั้งค่าทันที)"),
    ("\n        SPIN\n", "\n        หมุน\n"),
    ('label="ราคาหมุน (บาทต่อครั้ง) — lucky_wheel_cost"', 'label="ราคาหมุน (บาทต่อครั้ง)"'),
    ('label="จำนวนหมุนต่อวัน (ครั้ง/วัน) — lucky_wheel_daily_limit"', 'label="จำนวนหมุนต่อวัน (ครั้ง/วัน)"'),
    ('label="ภาพปก Banner (URL หรืออัพโหลด) — lucky_wheel_banner_url"', 'label="ภาพปก (วางลิงก์หรืออัปโหลด)"'),
    ('title="อัพโหลดรูป"', 'title="อัปโหลดรูป"'),
    ('label="สีหลัก (color)"', 'label="สีหลัก"'),
    ('label="สีรอง (hi_color)"', 'label="สีรอง"'),
    (" บันทึก Slot<", " บันทึกช่อง<"),
])

add(PG("sliders"), [
    ('Table: sliders · RPC: {isNew ? "admin_create_slider(title, image_url, link_url)" : "admin_update_slider(id, title, image_url, link_url)"}', '{isNew ? "เพิ่มสไลด์ใหม่" : "แก้ไขข้อมูลสไลด์"}'),
    ('description: "RPC: admin_reorder_sliders(items)" });', 'description: "บันทึกลำดับใหม่เรียบร้อย" });'),
    ("description: `RPC: admin_toggle_slider(id, is_active: ${v})`", 'description: "อัปเดตสถานะสไลด์เรียบร้อย"'),
    ("Table: sliders · ทั้งหมด ${rows.length} สไลด์", "ตารางสไลด์ · ทั้งหมด ${rows.length} สไลด์"),
    ('ยืนยันการลบ "${confirmDel.title}" — RPC: admin_delete_slider(id) · ย้อนกลับไม่ได้', 'ยืนยันการลบ "${confirmDel.title}" · ย้อนกลับไม่ได้'),
])

add(PG("promotions"), [
    (">Table: promotions · ตั้งค่าได้ครบทุกฟิลด์<", ">ตั้งค่าโปรโมชั่นได้ครบทุกฟิลด์<"),
    ("promotions · ทั้งหมด ${rows.length} โปร", "ตารางโปรโมชั่น · ทั้งหมด ${rows.length} โปร"),
    ('{p.is_active ? "Active" : "Inactive"}', '{p.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}'),
    ('<span>turnover <b className="text-neutral-700">×{p.turnover_multiplier}</b></span>', '<span>ทำยอดแทง <b className="text-neutral-700">×{p.turnover_multiplier}</b></span>'),
    ('<Field label="turnover_multiplier (เท่า)">', '<Field label="ยอดแทงที่ต้องทำ (เท่า)">'),
    ('<Field label="bonus_rate (%)">', '<Field label="โบนัส (%)">'),
    ('<Field label="min_deposit (บาท)">', '<Field label="ฝากขั้นต่ำ (บาท)">'),
    ('<Field label="max_withdrawal (บาท)">', '<Field label="ถอนสูงสุด (บาท)">'),
    ("<span>ประเภท <b className=\"text-neutral-700\">{p.type}</b></span>", "<span>ประเภท <b className=\"text-neutral-700\">{p.type === \"deposit\" ? \"โบนัสฝาก\" : p.type === \"referral\" ? \"แนะนำเพื่อน\" : p.type === \"special\" ? \"พิเศษ\" : \"ทั่วไป\"}</b></span>"),
])

add(PG("articles"), [
    ('Table: articles · RPC: {isNew ? "admin_create_article(title, content, image_url)" : "admin_update_article(id, title, content, image_url)"}', '{isNew ? "เขียนบทความใหม่" : "แก้ไขบทความ"}'),
    (">RPC: admin_toggle_article(id, is_active)</p>", ">สลับสถานะเผยแพร่/ซ่อน</p>"),
    ("Table: articles · ทั้งหมด ${rows.length} บทความ", "ตารางบทความ · ทั้งหมด ${rows.length} บทความ"),
    ("description: `RPC: admin_toggle_article(id, is_active: ${v})`", 'description: "อัปเดตสถานะเรียบร้อย"'),
    ('ยืนยันการลบ "${confirmDel.title}" — RPC: admin_delete_article(id) · ย้อนกลับไม่ได้', 'ยืนยันการลบ "${confirmDel.title}" · ย้อนกลับไม่ได้'),
])

add(PG("feeds"), [
    (">Table: feeds · เพิ่ม/ลบ/แก้ไขรายการฟีดที่แสดงหน้าเว็บสมาชิก<", ">เพิ่ม/ลบ/แก้ไขรายการฟีดที่แสดงหน้าเว็บสมาชิก<"),
    ("Table: feeds · ทั้งหมด ${rows.length} รายการ", "ตารางฟีด · ทั้งหมด ${rows.length} รายการ"),
])

add(PG("settings"), [
    ('description="settings (key-value) · เลือกหมวดที่ต้องการตั้งค่า — ทั้งหมด 8 หมวด"', 'description="ตารางการตั้งค่า · เลือกหมวดที่ต้องการตั้งค่า — ทั้งหมด 8 หมวด"'),
    ('description: "settings key-value อัปเดตเรียบร้อย (ตัวอย่าง)"', 'description: "บันทึกลงตารางการตั้งค่าเรียบร้อย (ตัวอย่าง)"'),
    ('label: "Social", desc: "Line / Facebook / เบอร์ติดต่อ / Telegram"', 'label: "ช่องทางติดต่อ", desc: "ไลน์ / เฟซบุ๊ก / เบอร์โทร / เทเลแกรม"'),
    ('desc: "ข้อความวิ่ง (Marquee) ด้านบนเว็บ — CRUD"', 'desc: "ข้อความวิ่งด้านบนเว็บ — เพิ่ม แก้ไข ลบ จัดลำดับ"'),
    ('desc: "ชื่อเว็บ โลโก้ คำอธิบาย API key"', 'desc: "ชื่อเว็บ โลโก้ คำอธิบาย และคีย์ลับระบบ"'),
    ('desc: "เปิด/ปิดเว็บทั้งหมด + ข้อความปิดปรับปรุง (Owner)"', 'desc: "เปิด/ปิดเว็บทั้งหมด + ข้อความปิดปรับปรุง (เจ้าของเว็บ)"'),
    ('label: "Cleanup", desc: "ล้างข้อมูลเก่าใน storage พร้อมพรีวิวจำนวน"', 'label: "ล้างข้อมูลเก่า", desc: "ล้างข้อมูลเก่าในคลังระบบ พร้อมพรีวิวจำนวน"'),
    ('<Shell title="Social / ช่องทางติดต่อ"', '<Shell title="ช่องทางติดต่อ"'),
    ('<Shell title="ประกาศหมุนวิ่ง (Marquee)" desc="ข้อความวิ่งด้านบนเว็บ — เรียงลำดับ display_order และเปิด/ปิดแต่ละข้อความ"', '<Shell title="ประกาศหมุนวิ่ง" desc="ข้อความวิ่งด้านบนเว็บ — จัดลำดับและเปิด/ปิดแต่ละข้อความ"'),
    ('<Shell title="ล้างข้อมูลเก่า (Cleanup Storage)" desc="RPC: admin_cleanup_storage — พรีวิวจำนวนก่อนลบ"', '<Shell title="ล้างข้อมูลเก่าในคลังระบบ" desc="ดูพรีวิวจำนวนก่อนลบ"'),
    ('<Field label="Turnover ที่ต้องทำ (เท่า)">', '<Field label="ยอดแทงที่ต้องทำ (เท่า)">'),
    ('<ToggleRow label="เปิด/ปิดวงล้อ (lucky_wheel_enabled)"', '<ToggleRow label="เปิด/ปิดวงล้อ"'),
])

add(PG("appearance"), [
    ('description="Table: settings (appearance) · RPC: admin_upsert_setting(p_key, p_value) · ปรับสีหลัก โลโก้ ฟอนต์ และโหมดแสดงผล"', 'description="ตารางการตั้งค่า · ปรับสีหลัก โลโก้ ฟอนต์ และโหมดแสดงผล"'),
    ('description: "RPC: admin_upsert_setting(\'appearance\', ...)"', 'description: "บันทึกลงตารางการตั้งค่าเรียบร้อย"'),
    ("Primary Color — สีหลักของเว็บ", "สีหลักของเว็บ"),
    ("custom_hex — วางโค้ดสีหรือเลือกจากตัวเลือก", "รหัสสี — วางรหัสสีหรือเลือกจากตัวเลือก"),
    ("โลโก้ / Favicon", "โลโก้ / ไอคอนเว็บ"),
    ("site_logo_url — โลโก้เว็บ", "โลโก้เว็บ"),
    ("PNG/SVG พื้นหลังโปร่งใส แนะนำ 512×512px", "ไฟล์ภาพพื้นหลังโปร่งใส แนะนำ 512×512 พิกเซล"),
    ("favicon_url — Favicon", "ไอคอนแท็บเบราว์เซอร์"),
    ("ICO/PNG 32×32px แสดงบนแท็บเบราว์เซอร์", "ไฟล์ภาพ 32×32 พิกเซล แสดงบนแท็บเบราว์เซอร์"),
    ("login_bg_url — ภาพพื้นหลังหน้าล็อกอิน", "ภาพพื้นหลังหน้าล็อกอิน"),
    ("แนะนำขนาด 1920×1080px", "แนะนำขนาด 1920×1080 พิกเซล"),
    ("font_family — ฟอนต์หลักเว็บ", "ฟอนต์หลักเว็บ"),
    ("default_mode — โหมดเริ่มต้นของเว็บสมาชิก", "โหมดเริ่มต้นของเว็บสมาชิก"),
    ('>Light</', '>สว่าง</'),
    ('>Dark</', '>มืด</'),
    ('>System</', '>ตามระบบ</'),
    ('"Dark Mode 🌙" : s.default_mode === "light" ? "Light Mode ☀️"', '"มืด 🌙" : s.default_mode === "light" ? "สว่าง ☀️"'),
    ("show_lucky_wheel_banner — แสดงแบนเนอร์วงล้อหน้าแรก", "แสดงแบนเนอร์วงล้อหน้าแรก"),
    ("compact_mode — โหมดตารางกระชับ", "โหมดตารางกระชับ"),
    ("ลด padding ของตารางให้แสดงได้มากขึ้น", "ลดระยะห่างในตารางให้แสดงได้มากขึ้น"),
    ("พรีวิวสด (Live Preview)", "พรีวิวสด"),
    ("The quick brown fox jumps over the lazy dog 0123456789", "ทดสอบการแสดงผลฟอนต์ — สวัสดีชาวโลก ๐๑๒๓๔๕๖๗๘๙"),
    ("การเปลี่ยนแปลงจะบันทึกลง settings (key: appearance) เมื่อกดปุ่มบันทึก", "การเปลี่ยนแปลงจะบันทึกลงตารางการตั้งค่าเมื่อกดปุ่มบันทึก"),
    ("และมีผลกับเว็บสมาชิกทันที (cache สูงสุด 60 วินาที)", "และมีผลกับเว็บสมาชิกทันที (แคชสูงสุด 60 วินาที)"),
    ('/> : "TL"}', '/> : <img src="/logo-th.png" alt="" className="size-8 rounded-full object-cover" />}'),
])

add(PG("banks"), [
    ('Table: banks · RPC: {isNew ? "admin_create_bank(name, account_name, account_number, branch, qr_code_url)" : "admin_update_bank(id, ...)"}', '{isNew ? "เพิ่มบัญชีธนาคารใหม่" : "แก้ไขบัญชีธนาคาร"}'),
    ('<ToggleRow label="is_active — เปิดใช้งาน" desc="RPC: admin_toggle_bank(id, is_active)"', '<ToggleRow label="เปิดใช้งานบัญชีนี้" desc="สลับสถานะการใช้งาน"'),
    ("Table: banks · ธนาคารที่รองรับ", "ตารางธนาคาร · ธนาคารที่รองรับ"),
    ('>RPC: admin_toggle_bank / admin_reorder</span>', '>สลับการใช้งานและจัดลำดับธนาคารได้</span>'),
    ("description: `RPC: admin_toggle_bank(${d.code})`", 'description: "อัปเดตสถานะธนาคารเรียบร้อย"'),
    ("— RPC: admin_delete_bank(id) · ย้อนกลับไม่ได้", "· ย้อนกลับไม่ได้"),
])

add(PG("broadcast"), [
    ("Table: notifications · RPC: admin_broadcast_notification(p_title, p_body, p_type) · ส่งแล้วทั้งหมด ${history.length} ครั้ง", "ตารางการแจ้งเตือน · ส่งแล้วทั้งหมด ${history.length} ครั้ง"),
    ("ล่าสุด {history.length} รายการ · RPC: admin_delete_notification(p_notification_id)", "ล่าสุด {history.length} รายการ"),
    ('ลบ "${confirmDel.title}" — RPC: admin_delete_notification(p_notification_id)', 'ลบ "${confirmDel.title}" · ย้อนกลับไม่ได้'),
    ('<Field label="p_type — ประเภทการแจ้งเตือน">', '<Field label="ประเภทการแจ้งเตือน">'),
    ('<span className="font-mono text-[10px] text-neutral-400">{t}</span>', '<span className="text-[10px] text-neutral-500">{t === "info" ? "ทั่วไป" : t === "warning" ? "เตือนภัย" : "สำเร็จ"}</span>'),
    ("p_title — หัวข้อ", "หัวข้อ"),
    ("p_body — ข้อความ", "ข้อความ"),
    ('sent_by: "เจ้าของเว็บ (Owner)"', 'sent_by: "เจ้าของเว็บ"'),
])

add(PG("data-management"), [
    ("จัดการสำรองฐานข้อมูล ส่งออกข้อมูล และตรวจสอบสถิติตาราง · RPC: fn_log_csv_backup / admin_cleanup_storage", "จัดการสำรองฐานข้อมูล ส่งออกข้อมูล และตรวจสอบสถิติตาราง"),
    (" <DatabaseBackup className=\"size-4\" /> Backup ทันที", " <DatabaseBackup className=\"size-4\" /> สำรองทันที"),
    ("Backup ล่าสุด (cron 04:00)", "สำรองล่าสุด (อัตโนมัติ 04:00)"),
    ("ส่งออกข้อมูล (Export)", "ส่งออกข้อมูล"),
    ("ดาวน์โหลด CSV / JSON รายกลุ่มข้อมูล", "ดาวน์โหลดไฟล์รายกลุ่มข้อมูล"),
    ("/> CSV\n", "/> ไฟล์ตาราง\n"),
    ("/> JSON\n", "/> ไฟล์ข้อมูล\n"),
    ("{b.type.toUpperCase()}", '{b.type === "database" ? "ฐานข้อมูล" : b.type === "csv" ? "ตาราง" : "ข้อมูล"}'),
    ("จำนวนแถวและขนาดของแต่ละตารางใน Supabase", "จำนวนแถวและขนาดของแต่ละตารางในระบบ"),
    ("ระบบสำรองอัตโนมัติทุกวันเวลา 04:00 น. (Supabase cron) · บันทึกด้วย fn_log_csv_backup", "ระบบสำรองอัตโนมัติทุกวันเวลา 04:00 น."),
    ('description: `RPC: fn_log_csv_backup(\'database\', today) · ${fmtNum(totalRows)} แถว`', 'description: `สำรองข้อมูล ${fmtNum(totalRows)} แถว เรียบร้อย · ระบบจะแจ้งเตือนเมื่อเสร็จ`'),
    ("สำรองข้อมูลทั้งหมด ${fmtNum(totalRows)} แถว (${totalMb.toFixed(1)} MB) — RPC: fn_log_csv_backup('database', p_backup_date) · ระบบจะแจ้งเตือนเมื่อเสร็จ", "สำรองข้อมูลทั้งหมด ${fmtNum(totalRows)} แถว (${totalMb.toFixed(1)} MB) · ระบบจะแจ้งเตือนเมื่อเสร็จ"),
    ('scope: "Supabase full backup"', 'scope: "สำรองทั้งระบบ"'),
    ("เจ้าของเว็บ (Owner)", "เจ้าของเว็บ"),
])

add(PG("admins"), [
    ("profiles (is_admin=true) · ทั้งหมด ${rows.length} คน · Super Admin จัดการสิทธิ์ได้ทุกข้อ", "บัญชีผู้ดูแลระบบ · ทั้งหมด ${rows.length} คน · ผู้ดูแลสูงสุดจัดการสิทธิ์ได้ทุกข้อ"),
    ("<Th>เบอร์ / Login</Th>", "<Th>เบอร์ / การเข้าสู่ระบบ</Th>"),
    ("<Th>Permission</Th>", "<Th>สิทธิ์การใช้งาน</Th>"),
    ("<DialogDescription>profiles (is_admin=true) + permission system</DialogDescription>", "<DialogDescription>บัญชีผู้ดูแลระบบและสิทธิ์การเข้าถึงทั้งหมด</DialogDescription>"),
    ("Permission Checkboxes ", "สิทธิ์ที่เลือก "),
    ("Super Admin มีสิทธิ์ทุกอย่างอัตโนมัติ และสามารถเพิ่ม/ลด permission ของแอดมินคนอื่นได้", "ผู้ดูแลสูงสุดมีสิทธิ์ทุกอย่างอัตโนมัติ และสามารถเพิ่ม/ลดสิทธิ์ของผู้ดูแลคนอื่นได้"),
    ('{r === "super" ? "Super Admin (ทุกสิทธิ์)" : "Admin (เลือกสิทธิ์)"}', '{r === "super" ? "ผู้ดูแลสูงสุด (ทุกสิทธิ์)" : "ผู้ดูแล (เลือกสิทธิ์)"}'),
    ("สิทธิ์ทั้งหมดจะถูกถอน (RPC: admin_revoke_admin) และย้อนกลับไม่ได้", "สิทธิ์ทั้งหมดจะถูกถอน และย้อนกลับไม่ได้"),
])

add(PG("member-detail"), [
    ('toast({ title: "คัดลอก Member ID แล้ว" });', 'toast({ title: "คัดลอกรหัสสมาชิกแล้ว" });'),
    ('<span className="text-neutral-400">Member ID</span>', '<span className="text-neutral-400">รหัสสมาชิก</span>'),
    ('<span className="text-neutral-400">VIP Level</span>', '<span className="text-neutral-400">ระดับวีไอพี</span>'),
    (">VIP {member.vip_level}<", ">วีไอพี {member.vip_level}<"),
    ("ยอดกระเป๋าปัจจุบัน (wallets)", "ยอดกระเป๋าปัจจุบัน"),
    ("ยอดเงินหลัก (balance)", "ยอดเงินหลัก"),
    ("ค่าแนะนำ (commission)", "ค่าแนะนำ"),
    ("แทงรวม (total_bets)", "แทงรวม"),
    ("ชนะรวม (total_won)", "ชนะรวม"),
])

add(MOCK, [
    ('full_name: "เจ้าของเว็บ (Owner)"', 'full_name: "เจ้าของเว็บ"'),
    ('sent_by: "เจ้าของเว็บ (Owner)"', 'sent_by: "เจ้าของเว็บ"'),
    ("เข้าบัญชี KBank ท้าย 4321", "เข้าบัญชีกสิกรไทย ท้าย 4321"),
    ('{ name: "Logo Green", value: "#287e0b" }', '{ name: "เขียวโลโก้", value: "#287e0b" }'),
    ('{ name: "Blue", value: "#2563eb" }', '{ name: "น้ำเงิน", value: "#2563eb" }'),
    ('{ name: "Violet", value: "#7c3aed" }', '{ name: "ม่วง", value: "#7c3aed" }'),
    ('{ name: "Rose", value: "#e11d48" }', '{ name: "ชมพู", value: "#e11d48" }'),
    ('{ name: "Amber", value: "#d97706" }', '{ name: "ส้มอำพัน", value: "#d97706" }'),
    ('{ name: "Sky", value: "#0284c7" }', '{ name: "ฟ้า", value: "#0284c7" }'),
    ('scope: "Supabase full backup"', 'scope: "สำรองทั้งระบบ"'),
    ('scope: "bets (สำรองก่อน cleanup)"', 'scope: "รายการแทง (สำรองก่อนล้างข้อมูล)"'),
    ('scope: "transactions สิงหาคม 2569"', 'scope: "ธุรกรรม สิงหาคม 2569"'),
    ('scope: "settings + appearance"', 'scope: "การตั้งค่าและรูปลักษณ์"'),
])

# ── รัน ──
ok, missing = 0, []
files_changed = {}
for f, old, new in R:
    try:
        s = io.open(f, encoding="utf-8").read()
    except FileNotFoundError:
        missing.append((f, old, "FILE NOT FOUND"))
        continue
    if old not in s:
        missing.append((f, old, "NOT FOUND"))
        continue
    s = s.replace(old, new)
    io.open(f, "w", encoding="utf-8").write(s)
    ok += 1
    files_changed[f] = files_changed.get(f, 0) + 1

print(f"REPLACED: {ok}/{len(R)}")
print("\nFILES:")
for f, n in sorted(files_changed.items()):
    print(f"  {n:2d}x {os.path.relpath(f, '/home/z/my-project')}")
if missing:
    print(f"\nMISSING ({len(missing)}):")
    for f, old, why in missing:
        print(f"  [{why}] {os.path.relpath(f, '/home/z/my-project')}: {old[:80]}")
