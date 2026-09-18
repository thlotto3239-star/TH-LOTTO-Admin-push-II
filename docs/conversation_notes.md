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
