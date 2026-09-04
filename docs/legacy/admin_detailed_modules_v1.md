# 🔍 รายละเอียด Components & ข้อมูลแต่ละหน้า — TH-LOTTO Admin

---

## 1. 📊 แผงควบคุม (Dashboard)
> **ดึงข้อมูลจาก:** `admin_dashboard_stats` RPC, `admin_dashboard_advanced_stats` RPC, `transactions`, `deposit_requests`, `withdraw_requests`, `bets`, `banks`, `get_markets_with_countdown` RPC

### KPI Cards (แถวบน) — 2 แถว
| Card | Field | ที่มา |
|---|---|---|
| 💰 ยอดฝากวันนี้ | `total_deposit_today` | `admin_dashboard_stats` |
| 💸 ยอดถอนวันนี้ | `total_withdraw_today` | `admin_dashboard_stats` |
| 🎲 ยอดแทงวันนี้ | `total_bet_today` | `admin_dashboard_stats` |
| 🏆 ยอดจ่ายรางวัล | `total_payout_today` | `admin_dashboard_stats` |
| ⏳ รอฝาก | `pending_deposits` | `admin_dashboard_stats` |
| ⏳ รอถอน | `pending_withdrawals` | `admin_dashboard_stats` |
| 👥 สมาชิกใหม่วันนี้ | `new_members_today` | `admin_dashboard_stats` |
| 📈 กำไร/ขาดทุน | `net_profit_today` | `admin_dashboard_stats` |

### Advanced Stats Row
| Card | Field |
|---|---|
| 👤 สมาชิก Active 7 วัน | `active_members_7d` |
| 🎰 เฉลี่ยแทงต่อคน | `bet_rate_per_person` |
| 📤 อัตราถอน | `withdrawal_rate` % |

### กราฟ BarChart (7 วันย้อนหลัง)
- ข้อมูล: `transactions` type = `DEPOSIT`, `WIN`, `PAYOUT`, `BET`
- แกน X: วันที่
- แกน Y: ยอดเงิน
- Legend: DEPOSIT, WITHDRAW, BET

### Activity Feed (Combined Feed)
แสดงรายการล่าสุด 30 รายการ เรียงตามเวลา ประกอบด้วย:

**รายการฝาก (DEPOSIT):**
- Avatar สมาชิก + ชื่อ + Member ID
- โลโก้ธนาคาร + ชื่อธนาคาร + เลขบัญชี
- ยอดเงิน + สถานะ (badge)
- วันเวลา

**รายการถอน (WITHDRAW):**
- Avatar สมาชิก + ชื่อ + Member ID
- โลโก้ธนาคาร + ชื่อธนาคาร + เลขบัญชี + ชื่อบัญชี
- ยอดเงิน + สถานะ
- วันเวลา

**รายการโพย (BET):** _(ตัด instant lottery ออก)_
- Avatar + ชื่อ + Member ID
- ชื่อตลาด + โลโก้
- เลขที่แทง + ประเภทแทง
- ยอดเงิน + วันเวลา

**Alert ตลาดหวย:**
- 🟡 ใกล้ปิดรับ (เหลือ < 10 นาที) → `LOTTERY_ALERT`
- 🔴 ปิดรับแทงแล้ว → `LOTTERY_CLOSED`
- ✅ ประกาศผลรางวัลแล้ว → `LOTTERY_RESULT`

### ตาราง Top 10 ผู้แทงสูงสุด
| Column | Field |
|---|---|
| Rank | ลำดับ |
| ชื่อ | `full_name` |
| ยอดแทงรวม | `total_bet` |

---

## 2. 💳 รายการฝากเงิน (Deposits)
> **Table:** `deposit_requests` | **Realtime:** ✅ subscribe `deposit_requests`

### Filter Bar
- **Tab สถานะ:** `PENDING` / `APPROVED` / `REJECTED` / `ALL`
- **Search:** ชื่อ / เบอร์ / Member ID (search ผ่าน `profiles`)

### ตารางแสดงผล (Columns)
| Column | Field | รายละเอียด |
|---|---|---|
| วันที่ | `created_at` | format: dd/mm/yyyy HH:mm |
| สมาชิก | `profiles.full_name` | + Member ID badge |
| เบอร์ | `profiles.phone` | |
| ธนาคาร | `profiles.bank_name` | BankBadge component |
| เลขบัญชี | `profiles.bank_account_number` | |
| ยอดฝาก | `amount` | format: `฿XX,XXX` |
| โปรโมชั่น | `promo_code` | แสดงชื่อโปร + เงื่อนไข |
| สถานะ | `status` | PENDING🟡 / APPROVED🟢 / REJECTED🔴 |
| ผู้อนุมัติ | `approver.full_name` | |
| วันที่อนุมัติ | `approved_at` | |

### Action Buttons (แต่ละแถว)
- 👁️ **ดูสลิป** — เปิด `slip_url` ในกล่อง preview (image modal)
- ✅ **อนุมัติ** → เปิด Modal ยืนยัน → RPC `admin_approve_deposit`
- ❌ **ปฏิเสธ** → เปิด Modal ใส่เหตุผล (required) → RPC `admin_reject_deposit`

### Modal อนุมัติ/ปฏิเสธ
```
┌─────────────────────────────────┐
│ ข้อมูลสมาชิก                    │
│   ชื่อ / Member ID / เบอร์      │
│   ธนาคาร / เลขบัญชี             │
│ ยอดเงิน: ฿XX,XXX                │
│ โปรโมชั่น: (ถ้ามี)              │
│   - bonus_rate / bonus_amount    │
│   - min_deposit / max_withdrawal │
│   - turnover_multiplier          │
│ หมายเหตุ: [textarea]             │
│ [ปฏิเสธ] [อนุมัติ]              │
└─────────────────────────────────┘
```

### Export CSV
ฟิลด์: วันที่, ชื่อ, Member ID, เบอร์, ยอด, โปร, สถานะ, ผู้ดำเนินการ, วันที่อนุมัติ, หมายเหตุ

---

## 3. 💸 รายการถอนเงิน (Withdrawals)
> **Table:** `withdraw_requests` | **Realtime:** ✅ subscribe `withdraw_requests`

### Filter Bar
- **Tab สถานะ:** `PENDING` / `APPROVED` (โอนแล้ว) / `REJECTED` / `ALL`
- **Search:** ชื่อ / เบอร์ / Member ID

### ตารางแสดงผล (Columns)
| Column | Field |
|---|---|
| วันที่ | `created_at` |
| สมาชิก | `profiles.full_name` + Member ID |
| เบอร์ | `profiles.phone` |
| ธนาคาร | `bank_name` (จาก withdraw_requests โดยตรง) |
| เลขบัญชี | `bank_account_number` |
| ชื่อบัญชี | `bank_account_name` |
| ยอดถอน | `amount` |
| สถานะ | `status` badge |
| ผู้อนุมัติ | `approver.full_name` |
| หมายเหตุ | `admin_note` |

### Action Buttons
- 📋 **Copy เลขบัญชี** → copy to clipboard + toast แจ้ง
- ✅ **โอนแล้ว/อนุมัติ** → Modal → RPC `admin_approve_withdraw`
- ❌ **ปฏิเสธ** → Modal (ต้องใส่เหตุผล) → RPC `admin_reject_withdraw`

### Modal ดูรายละเอียด
```
┌─────────────────────────────────────┐
│ ข้อมูลการถอน                         │
│   ชื่อ / Member ID                   │
│   ธนาคาร (BankBadge) + copy btn     │
│   เลขบัญชี [Copy] + ชื่อบัญชี [Copy]│
│   ยอดถอน: ฿XX,XXX                   │
│   (แสดงยอดโปรที่ยังค้างถ้ามี)       │
│ Admin Note: [textarea]               │
│ [ปฏิเสธ] [โอนแล้ว/อนุมัติ]         │
└─────────────────────────────────────┘
```

### Export CSV
ฟิลด์: วันที่, ชื่อ, Member ID, เบอร์, ยอด, ธนาคาร, เลขบัญชี, ชื่อบัญชี, สถานะ, ผู้ดำเนินการ, วันที่อนุมัติ, หมายเหตุ

---

## 4. 👥 จัดการสมาชิก (Members)
> **Table:** `profiles` JOIN `wallets` | Pagination: 20 ต่อหน้า

### Search
- ค้นหาด้วย: `member_id`, `phone`, `full_name` (ilike)

### ตารางแสดงผล (Columns)
| Column | Field |
|---|---|
| Avatar | `avatar_url` (หรือ initial ของชื่อ) |
| Member ID | `member_id` |
| ชื่อ | `full_name` |
| เบอร์โทร | `phone` |
| ธนาคาร | `bank_name` (BankBadge) + `bank_account_number` |
| ชื่อบัญชี | `bank_account_name` |
| VIP Level | `vip_level` badge |
| สถานะ | `status` (active/inactive/suspended) |
| ยอดเงิน | `wallets.balance` |
| ค่าแนะนำ | `wallets.commission_balance` |
| แทงรวม | `wallets.total_bets` |
| ชนะรวม | `wallets.total_won` |
| วันที่สมัคร | `created_at` |

### Action Buttons (แต่ละแถว)
- 👁️ **ดูรายละเอียด** → ไปหน้า `/members/:id`
- ✏️ **แก้ไข** → เปิด Edit Modal
- 💰 **ปรับยอดกระเป๋า** → เปิด Wallet Modal

### Edit Modal — แก้ไขข้อมูล (RPC: `admin_update_member`)
```
┌──────────────────────────────────┐
│ ชื่อ-นามสกุล: [input]           │
│ เบอร์โทร: [input]               │
│ ธนาคาร: [BankSelector dropdown] │
│ เลขบัญชี: [input]              │
│ ชื่อบัญชี: [input]              │
│ สถานะ: [select: active/...]     │
│ VIP Level: [select: 0-5]        │
│ [บันทึก]                        │
└──────────────────────────────────┘
```

### Wallet Modal — ปรับยอด (RPC: `admin_adjust_wallet`)
```
┌──────────────────────────────┐
│ ยอดปัจจุบัน: ฿XX,XXX        │
│ จำนวน: [+number input]      │
│ หมายเหตุ: [input]           │
│ [➕ เพิ่ม] [➖ ลด]          │
└──────────────────────────────┘
```

---

## 5. 👤 รายละเอียดสมาชิก (MemberDetail)
> **Route:** `/members/:id` | **Tabs:** 5 แท็บ

### Header Card
```
┌────────────────────────────────────────────┐
│ [Avatar]  ชื่อ  |  member_id  badge         │
│           Phone 📞 | วันที่สมัคร 📅          │
│           Status badge | VIP badge          │
│                                             │
│ 💰 ยอดเงิน    🎰 แทงรวม    🏆 ชนะรวม       │
│ 💎 ค่าแนะนำ                                │
│                                             │
│ 🏦 ธนาคาร (BankBadge) | เลขบัญชี | ชื่อ  │
└────────────────────────────────────────────┘
```

### แท็บ 1: ภาพรวม (overview)
- ข้อมูลโปรไฟล์ทั้งหมด
- ยอดกระเป๋าปัจจุบัน

### แท็บ 2: ประวัติแทง (bets)
Query: `bets` WHERE `user_id = :id` (limit 100)
| Column | Field |
|---|---|
| วันที่ | `created_at` |
| ตลาด | `lottery_markets.name` |
| งวด | `draw_date` |
| เลขแทง | `numbers` |
| ประเภท | `bet_type` (3ตัวบน/2ตัวล่าง ฯลฯ) |
| ยอดแทง | `amount` |
| อัตราจ่าย | `payout_rate` |
| ยอดรางวัล | `payout_amount` |
| สถานะ | `status` badge (PENDING/WON/LOST/CANCELLED) |

### แท็บ 3: ธุรกรรม (transactions)
Query: `transactions` WHERE `user_id = :id` (limit 100)
| Column | Field |
|---|---|
| วันที่ | `created_at` |
| ประเภท | `type` (DEPOSIT/WITHDRAW/WIN/BET/BONUS...) |
| ยอด | `amount` (+ / -) |
| หมายเหตุ | `note` |

### แท็บ 4: ฝาก/ถอน (deposits)
**ฝาก:** `deposit_requests` (limit 50)
- วันที่ / ยอด / สถานะ / หมายเหตุ admin

**ถอน:** `withdraw_requests` (limit 50)
- วันที่ / ยอด / ธนาคาร / เลขบัญชี / สถานะ / หมายเหตุ

### แท็บ 5: ล็อกอิน (logins)
Query: `login_attempts` WHERE `phone = :phone` (limit 100)
| Column | Field |
|---|---|
| วันเวลา | `attempted_at` |
| IP Address | `ip_address` |
| ผลลัพธ์ | `success` (✅ / ❌) |
| User Agent | `user_agent` |

---

## 6. 🎰 ตลาดหวย (LotteryMarkets)
> **Table:** `lottery_markets`, `market_bet_rates` | แสดงเป็น Card Grid

### Market Card — แสดงต่อ 1 ตลาด
```
┌────────────────────────────────────────────┐
│ [Logo]  ชื่อตลาด                [Toggle]   │
│         Code badge | Popular | Hot         │
│                                             │
│ วันออกผล: [จ.][อ.][พ.][พฤ.][ศ.][ส.][อา.]│
│ ปิดรับก่อน: XX นาที                        │
│ เวลาออกรางวัล: HH:MM น.                   │
│ สถานะ: 🟢 เปิดใช้งาน / ⚫ ปิด            │
│ [YouTube Live URL] (ถ้ามี)                │
│                                             │
│ อัตราจ่าย:                                │
│  4ตัวบน | 3ตัวบน | 3โต๊ด | 3ตัวหน้า     │
│  3ตัวล่าง | 2ตัวบน | 2ตัวล่าง           │
│  วิ่งบน | วิ่งล่าง                        │
│                                             │
│ ขีดจำกัด: แทงต่ำสุด / แทงสูงสุด / ต่อเลข │
│ [✏️ แก้ไข]                                │
└────────────────────────────────────────────┘
```

### Edit Modal ตลาดหวย
```
┌──────────────────────────────────┐
│ ชื่อตลาด / Code                 │
│ โลโก้ URL / อัพโหลด Logo        │
│ YouTube Stream URL               │
│ วันออกผล: [checkboxes วัน]     │
│ เวลาออกรางวัล: [time picker]   │
│ ปิดรับก่อน: [number] นาที      │
│ แสดงใน Popular: [toggle]       │
│ แสดงใน Trending: [toggle]      │
│ Active: [toggle]                │
│                                  │
│ อัตราจ่าย (ทุก BET_TYPE):       │
│  [input จำนวน] ต่อ 1 บาท        │
│                                  │
│ ขีดจำกัด:                       │
│  แทงต่ำสุด / แทงสูงสุด / ต่อเลข│
│ [บันทึก]                        │
└──────────────────────────────────┘
```

**ประเภทการแทง (BET_TYPES):**
`4TOP`, `3TOP`, `3TODE`, `3FRONT`, `3BOTTOM`, `2TOP`, `2BOTTOM`, `RUN_UP`, `RUN_DOWN`

---

## 7. 🏆 ออกผลรางวัล (Results)
> **Tables:** `draw_schedules`, `lottery_results` | 2 แท็บ

### แท็บ 1: รอออกผล (วันนี้)
แสดงรายการ `draw_schedules` ของวันนี้ เรียงตาม `close_time`
| Column | Field |
|---|---|
| ตลาด | `lottery_markets.name` + code |
| งวดวันที่ | `draw_date` |
| เวลาปิดรับ | `close_time` |
| สถานะ | `status` |
| Action | [กรอกผล] button |

### Modal กรอกผลรางวัล
**ประเภท GOVERNMENT (6 หลัก):**
```
┌─────────────────────────┐
│ รางวัลที่ 1: [6 หลัก]  │
│ → 3ตัวบน: auto-fill    │
│ → 2ตัวบน: auto-fill    │
│ 3ตัวหน้า: [3 หลัก]    │
│ 3ตัวล่าง: [3 หลัก]    │
│ 2ตัวล่าง: [2 หลัก]    │
│ [ยืนยันประกาศผล]       │
└─────────────────────────┘
```
**ประเภทอื่น (3 หลัก):**
```
┌─────────────────────────┐
│ 3ตัวบน: [3 หลัก]      │
│ 3ตัวล่าง: [3 หลัก] *  │
│ 2ตัวบน: [2 หลัก]      │
│ 2ตัวล่าง: [2 หลัก]    │
│ [ยืนยันประกาศผล]       │
└─────────────────────────┘
```
**หลัง submit** (RPC: `admin_set_result_and_settle`):
```
✅ ผลสรุป:
  - ตั้งผลสำเร็จ
  - จำนวนโพยที่ settle: XX
  - โพยที่ถูกรางวัล: XX
  - ยอดจ่ายรางวัลรวม: ฿XX,XXX
```

### แท็บ 2: ผลรางวัลล่าสุด (3 วันย้อนหลัง)
| Column | Field |
|---|---|
| ตลาด | `lottery_markets.name` |
| งวดวันที่ | `draw_date` |
| รางวัลที่ 1 | `result_main` |
| 3ตัวบน | `result_3top` |
| 2ตัวบน | `result_2top` |
| 2ตัวล่าง | `result_2bottom` |
| 3ตัวหน้า | `result_3front` |
| 3ตัวล่าง | `result_3bottom` |
| เวลาประกาศ | `announced_at` |

---

## 8. ⚡ หวยหนึ่งนาที — ภาพรวม (InstantOverview)
> **Auto-refresh:** ทุก 30 วินาที

### KPI Cards
| Card | Field | RPC |
|---|---|---|
| ⚡ Draw วันนี้ | `total_draws_today` | `admin_get_instant_stats` |
| 🎲 รายการแทงวันนี้ | `total_bets_today` | |
| 💰 ยอดแทงรวม | `total_bet_amount_today` | |
| 🏆 ยอดจ่ายรางวัล | `total_payout_today` | |
| 👥 ผู้เล่น Active | `active_players_today` | |
| 📊 กำไร/ขาดทุน | Net (bet - payout) | |

### ตาราง Draw ล่าสุด 10 รายการ (RPC: `admin_get_instant_draws`)
| Column | Field |
|---|---|
| Draw ID | `draw_id` |
| เวลา | `draw_time` |
| สถานะ | `status` (PENDING/SETTLED) |
| ผลรางวัล | `result` |
| จำนวนโพย | `bet_count` |
| ยอดแทง | `total_bet` |
| ยอดจ่าย | `total_payout` |

### ตาราง รายการแทงล่าสุด 10 รายการ (RPC: `admin_get_instant_bets`)
| Column | Field |
|---|---|
| สมาชิก | `member_name` |
| เลขแทง | `numbers` |
| ประเภท | `bet_type` |
| ยอดแทง | `amount` |
| สถานะ | `status` |

### BarChart
- ยอดแทง vs ยอดจ่ายรางวัล รายชั่วโมง/วัน

---

## 9. 🎡 วงล้อโชคดี (WheelAdmin)
> **RPC:** `admin_get_wheel_config`, `admin_update_wheel_prize`

### Layout: Bento Grid (วงล้อ + ช่องทั้งหมด)

### ส่วน Preview วงล้อ (SVG live)
- วงล้อ 8 ช่อง แสดงแบบ real-time ตาม config
- สีแต่ละช่อง (gradient 2 สี)
- ชื่อรางวัลในแต่ละช่อง
- คลิกเลือกช่องที่ต้องการแก้ไข

### ส่วนตั้งค่าทั่วไป
| Setting | Field |
|---|---|
| ราคาหมุน | `lucky_wheel_cost` (บาทต่อครั้ง) |
| จำนวนหมุนต่อวัน | `lucky_wheel_daily_limit` (ครั้ง/วัน) |
| ภาพปก Banner | `lucky_wheel_banner_url` (อัพโหลด หรือ URL) |

### ช่องรางวัล (8 Slots) — แก้ไขได้ทุกช่อง
| Field | รายละเอียด |
|---|---|
| ชื่อรางวัล | `name` |
| ยอดเงิน | `amount` (บาท) |
| ความน่าจะเป็น | `probability` (%) รวม 100% |
| สีหลัก | `color` (hex) |
| สีรอง | `hi_color` (gradient) |
| เปิด/ปิด | `is_active` toggle |
| [บันทึก Slot] | RPC: `admin_update_wheel_prize` |

**Validation:** รวม probability ทุก slot ต้องเท่ากับ 100% พอดี

---

## 10. 🎫 โปรโมชั่น (Promotions)
> **Table:** `promotions`

### Grid การ์ด (3 คอลัมน์)
แต่ละ card แสดง:
- รูปโปร (`image_url`) + Badge text
- ชื่อโปร + Promo Code badge
- ประเภท (`type`): general, deposit_bonus ฯลฯ
- สถานะ Active/Inactive badge
- วันหมดอายุ

### Form เพิ่ม/แก้ไขโปร (Modal)
```
ข้อมูลหลัก:
  title             ← ชื่อโปร
  promo_code        ← รหัสใช้โปร
  description       ← คำอธิบาย
  image_url         ← รูปโปร
  badge_text        ← text บน badge
  background_color  ← สีพื้นหลัง
  type              ← ประเภท (general/etc)
  line1, line2      ← ข้อความ highlight

เงื่อนไขทางการเงิน:
  bonus_rate        ← % โบนัส (เช่น 50%)
  bonus_amount      ← โบนัสคงที่ (บาท)
  min_deposit       ← ฝากขั้นต่ำ
  max_withdrawal    ← ถอนสูงสุดจากโปร
  turnover_multiplier ← เท่าที่ต้องทำ turnover
  default_amount    ← ยอดแนะนำ

ขอบเขตการใช้งาน:
  allowed_game      ← all / lotto / instant / wheel
  target_view       ← deposit / หน้าที่แสดง
  max_uses_per_user ← ใช้ได้กี่ครั้ง/คน
  max_uses_total    ← จำนวนสิทธิ์รวม (0 = ไม่จำกัด)
  max_uses_per_day  ← สิทธิ์ต่อวัน
  starts_at / expires_at ← วันเริ่ม-สิ้นสุด
  is_active         ← toggle เปิด/ปิด
```

### Actions
- ✅ **Toggle Active/Inactive** — ปุ่มบนการ์ด
- ✏️ **แก้ไข** — เปิด Edit Modal
- 🗑️ **ลบ** — confirm dialog ก่อนลบ

---

## 11. ⚙️ ตั้งค่าระบบ (Settings)
> **Table:** `settings` (key-value), **8 Modal**

### Hub — เลือก Modal
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 💳       │ │ 🏦       │ │ 🎡       │ │ 📱       │
│ การเงิน  │ │ ธนาคาร   │ │ วงล้อ    │ │ Social   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📢       │ │ 🛠️       │ │ 🔛       │ │ 🗑️       │
│ ประกาศ   │ │ ระบบ     │ │ ควบคุมเว็บ│ │ Cleanup  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

### Modal 1: 💳 การเงิน
| Key | Label |
|---|---|
| `min_deposit` | ฝากขั้นต่ำ (บาท) |
| `max_deposit` | ฝากสูงสุด (บาท) |
| `min_withdraw` | ถอนขั้นต่ำ (บาท) |
| `max_withdraw` | ถอนสูงสุด (บาท) |
| `deposit_fee` | ค่าธรรมเนียมฝาก (%) |
| `withdraw_fee` | ค่าธรรมเนียมถอน (%) |
| `welcome_bonus` | โบนัสต้อนรับ (บาท) |
| `welcome_bonus_turnover` | Turnover ที่ต้องทำ (x) |

---

### Modal 2: 🏦 บัญชีธนาคาร Admin
- แสดงรายการบัญชีรับเงิน
- เพิ่ม / ลบบัญชีธนาคาร admin
- ใช้ `BankSelector` component

---

### Modal 3: 🎡 วงล้อ
| Key | Label |
|---|---|
| `lucky_wheel_enabled` | เปิด/ปิดวงล้อ toggle |
| `lucky_wheel_cost` | ราคาหมุน (บาท) |
| `lucky_wheel_daily_limit` | จำนวนหมุนต่อวัน |

---

### Modal 4: 📱 Social / ช่องทางติดต่อ
| Key | Label |
|---|---|
| `line_url` | Line Official URL |
| `facebook_url` | Facebook Page URL |
| `contact_phone` | เบอร์โทรติดต่อ |
| `telegram_url` | Telegram (ถ้ามี) |

---

### Modal 5: 📢 Marquee Announcements
**Table:** `announcements`
- ข้อความวิ่ง (Marquee) ด้านบนเว็บ
- CRUD: เพิ่ม / แก้ไข / ลบ
- เรียงลำดับ `display_order`
- Toggle เปิด/ปิดแต่ละประกาศ

---

### Modal 6: 🛠️ ระบบ
| Key | Label |
|---|---|
| `site_name` | ชื่อเว็บไซต์ |
| `site_logo_url` | URL โลโก้ |
| `site_description` | คำอธิบายเว็บ |
| `api_secret_key` | รหัสลับ API (ถ้ามี) |

---

### Modal 7: 🔛 ควบคุมเว็บ (Site Control)
| Key | Label |
|---|---|
| `site_enabled` | Toggle เปิด/ปิดเว็บทั้งหมด |
| `maintenance_message` | ข้อความระหว่างปิดปรับปรุง |

> ⚠️ Feature นี้เฉพาะ **owner** (phone: `0622306037`) เท่านั้น

---

### Modal 8: 🗑️ Cleanup Storage
**Preview ก่อน cleanup:**
| ตาราง | เงื่อนไข | นับรายการ |
|---|---|---|
| `instant_draws` | status=SETTLED และ > 7 วัน | `count` |
| `notifications` | is_read=true และ > 7 วัน | `count` |
| `admin_notifications` | is_read=true และ > 7 วัน | `count` |
| `login_attempts` | > 30 วัน | `count` |

**Action:** `[เคลียร์ทั้งหมด]` → confirm dialog → RPC `admin_cleanup_storage`
**ผลลัพธ์:** แสดง `total_deleted` จำนวนรายการที่ลบ

---

## 12. 👮 ผู้ดูแลระบบ (Admins)
> **Table:** `profiles` (is_admin=true) + permission system

### ตาราง Admin ทั้งหมด
| Column | Field |
|---|---|
| Avatar + ชื่อ | `full_name` + `avatar_url` |
| เบอร์ / Login | `phone` |
| ระดับ | Super Admin / Admin badge |
| สถานะ | `status` |
| Permission | แสดง key ที่ได้รับ |

### Modal เพิ่ม/แก้ไข Admin
**ข้อมูลส่วนตัว:**
- ชื่อ / เบอร์โทร / รหัสผ่าน

**Permission Checkboxes (แต่ละ key):**
| Permission Key | ควบคุมหน้า |
|---|---|
| `deposits` | ฝากเงิน |
| `withdrawals` | ถอนเงิน |
| `members` | สมาชิก + Affiliates |
| `markets` | ตลาดหวย + ผลรางวัล |
| `bets` | รายการโพย |
| `restricted` | เลขอั้น |
| `wheel` | วงล้อ |
| `instant` | หวยหนึ่งนาที (ทั้งหมด) |
| `settings` | ตั้งค่า + Notifications + Backup |
| `appearance` | รูปลักษณ์ |
| `sliders` | สไลเดอร์ |
| `promotions` | โปรโมชั่น |
| `articles` | บทความ |
| `feeds` | ฟีด + Trending |
| `banks` | ธนาคาร |

> Super Admin มีสิทธิ์ทุกอย่างและเพิ่ม/ลด permission admin คนอื่นได้

---

## 📱 Components ที่ใช้ร่วมกัน

| Component | ใช้ใน | หน้าที่ |
|---|---|---|
| `BankBadge` | Deposits, Withdrawals, Members | แสดงโลโก้+ชื่อธนาคารจาก bank code |
| `BankSelector` | Members Edit, Settings | Dropdown เลือกธนาคาร (10 ธนาคาร) |
| `StatusBadge` | MemberDetail | Badge สถานะสี (PENDING/WON/LOST) |
| `Toast` | ทุกหน้า | Notification pop-up (success/error/warning) |
| `Modal` (ModalContext) | ทุกหน้า | confirm(), showSuccess(), showError() |
| `Layout` | ทุกหน้า | Sidebar + Navbar + Notification Bell |

---

## 🔔 Realtime Subscriptions (Supabase)

| Page | Channel | Table | Event |
|---|---|---|---|
| Deposits | `deposits-admin` | `deposit_requests` | `*` (INSERT/UPDATE/DELETE) |
| Withdrawals | `withdrawals-admin` | `withdraw_requests` | `*` |
| Layout (Bell) | auto | `admin_notifications` | INSERT |

> เมื่อมี event ใหม่ → โหลดข้อมูลใหม่อัตโนมัติ + Toast popup
