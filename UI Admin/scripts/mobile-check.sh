#!/bin/bash
# ตรวจ overflow มือถือ 375px ทุกหน้า
cd /home/z/my-project
agent-browser set viewport 375 812
agent-browser reload
agent-browser wait --load networkidle
sleep 1

PAGES=(
  "แผงควบคุม" "รายการฝากเงิน" "รายการถอนเงิน" "จัดการสมาชิก" "ตลาดหวย"
  "ออกผลรางวัล" "ภาพรวมหนึ่งนาที" "วงล้อโชคดี" "สไลเดอร์" "โปรโมชั่น"
  "บทความ" "จัดการฟีด" "ตั้งค่าระบบ" "รูปลักษณ์" "ธนาคาร"
  "ส่งแจ้งเตือน" "สำรองและจัดการข้อมูล" "ผู้ดูแลระบบ"
)

i=0
for p in "${PAGES[@]}"; do
  i=$((i+1))
  id=$(printf "m%02d" $i)
  agent-browser eval "(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().startsWith('$p')); if (btn) { btn.click(); return 'ok'; } return 'NOTFOUND:$p'; })()" > /tmp/nav.txt 2>&1
  sleep 1
  agent-browser eval "document.documentElement.scrollWidth <= 375 ? 'OK' : 'PAGE-OVERFLOW ' + document.documentElement.scrollWidth" > scripts/audit/$id.width.txt 2>&1
  echo "$id $p $(cat scripts/audit/$id.width.txt)"
done
echo "MOBILE SCAN DONE"
