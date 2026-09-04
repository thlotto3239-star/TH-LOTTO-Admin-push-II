#!/bin/bash
# Audit ทุกหน้า: คลิกเมนู → ภาพหน้าจอ → ดึงข้อความละติน → ตรวจ overflow
cd /home/z/my-project
OUT=scripts/audit
mkdir -p $OUT

PAGES=(
  "แผงควบคุม"
  "รายการฝากเงิน"
  "รายการถอนเงิน"
  "จัดการสมาชิก"
  "ตลาดหวย"
  "ออกผลรางวัล"
  "ภาพรวมหนึ่งนาที"
  "วงล้อโชคดี"
  "สไลเดอร์"
  "โปรโมชั่น"
  "บทความ"
  "จัดการฟีด"
  "ตั้งค่าระบบ"
  "รูปลักษณ์"
  "ธนาคาร"
  "แจ้งเตือน Broadcast"
  "Backup & ข้อมูล"
  "ผู้ดูแลระบบ"
)

i=0
for p in "${PAGES[@]}"; do
  i=$((i+1))
  id=$(printf "%02d" $i)
  agent-browser eval "(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().startsWith('$p')); if (btn) { btn.click(); return 'clicked'; } return 'NOTFOUND'; })()" > $OUT/$id.nav.txt 2>&1
  sleep 1.2
  agent-browser screenshot $OUT/$id.png > /dev/null 2>&1
  agent-browser eval "$(cat scripts/audit-latin.js)" > $OUT/$id.latin.json 2>&1
  agent-browser eval "$(cat scripts/audit-overflow.js)" > $OUT/$id.overflow.json 2>&1
  echo "== $id [$p] $(cat $OUT/$id.nav.txt)"
done

# หน้ารายละเอียดสมาชิก: ไปที่สมาชิก แล้วกดปุ่มดูรายการแรก
agent-browser eval "(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().startsWith('จัดการสมาชิก')); if (btn) { btn.click(); return 'clicked'; } return 'NOTFOUND'; })()" > /dev/null 2>&1
sleep 1.2
agent-browser eval "(() => { const btn = document.querySelector('tbody button'); if (btn) { btn.click(); return 'clicked'; } return 'NOTFOUND'; })()" > $OUT/19.nav.txt 2>&1
sleep 1.2
agent-browser screenshot $OUT/19.png > /dev/null 2>&1
agent-browser eval "$(cat scripts/audit-latin.js)" > $OUT/19.latin.json 2>&1
agent-browser eval "$(cat scripts/audit-overflow.js)" > $OUT/19.overflow.json 2>&1
echo "== 19 [รายละเอียดสมาชิก] $(cat $OUT/19.nav.txt)"
echo "AUDIT DONE"
