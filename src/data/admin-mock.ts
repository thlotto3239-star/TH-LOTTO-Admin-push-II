// ─── TH-LOTTO Admin Panel — Mock Data ตามสเปกระบบเดิม (UI Demo) ──────────────

// ── Helpers ──────────────────────────────────────────────────────────────────
export const fmtTHB = (n?: number | null) =>
  "฿" + Number(n || 0).toLocaleString("th-TH", { maximumFractionDigits: 0 });

export const fmtNum = (n?: number | null, d = 0) =>
  Number(n || 0).toLocaleString("th-TH", { maximumFractionDigits: d, minimumFractionDigits: d });

export const fmtDT = (iso: string) => {
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fmtD = (iso: string) => {
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// ── Banks (10 ธนาคาร) ────────────────────────────────────────────────────────
export interface Bank {
  code: string;
  name: string;
  short: string;
  color: string;
  logo_url?: string;
}

export const BANKS: Bank[] = [
  {
    code: "kbank",
    name: "ธนาคารกสิกรไทย",
    short: "KBANK",
    color: "#138f2d",
    logo_url: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/gtF5IDygx1zHFrvTDBiu.png",
  },
  {
    code: "scb",
    name: "ธนาคารไทยพาณิชย์",
    short: "SCB",
    color: "#4e2a84",
    logo_url: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/dGQJLcLaQtPtYTgIgJdd.png",
  },
  {
    code: "ktb",
    name: "ธนาคารกรุงไทย",
    short: "KTB",
    color: "#1897d4",
    logo_url: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/4movMnyEyWRBPCaETXn4.png",
  },
  {
    code: "bbl",
    name: "ธนาคารกรุงเทพ",
    short: "BBL",
    color: "#1e4586",
    logo_url: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/c3T2psxLLJtZwwDseqKG.png",
  },
  {
    code: "gsb",
    name: "ธนาคารออมสิน",
    short: "GSB",
    color: "#f37021",
    logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9yN5VjUxDb3v0woQnTi8aM4ZuNVWh0j3aGQ&s",
  },
  {
    code: "truewallet",
    name: "ทรูมันนี่วอลเล็ท",
    short: "TRUE",
    color: "#f97316",
    logo_url: "https://www.truemoney.com/wp-content/uploads/2021/05/truemoneywallet-howto-20201012-regis-paopunsuk-01.png",
  },
  {
    code: "bay",
    name: "ธนาคารกรุงศรีอยุธยา",
    short: "BAY",
    color: "#ff7b15",
    logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT81zQilT_Gs2CxxpvLuRzsjR97WgcaE3tC9w&s",
  },
  {
    code: "ttb",
    name: "ธนาคารทหารไทย",
    short: "TTB",
    color: "#f26522",
    logo_url: "https://www.ttbbank.com/global/assets/img/wow/LogoandCard/ttb%20touch_logo_final.png",
  },
  { code: "baac", name: "ธ.ก.ส.", short: "BAAC", color: "#00a94f" },
  { code: "ghb", name: "อาคารสงเคราะห์", short: "GHB", color: "#007f4d" },
  { code: "isbt", name: "อิสลาม", short: "IB", color: "#0b7a75" },
];

export const bankOf = (code: string): Bank => {
  const norm = (code || "").trim().toLowerCase();
  if (!norm) return BANKS[0];
  const found = BANKS.find(
    (b) =>
      b.code.toLowerCase() === norm ||
      b.short.toLowerCase() === norm ||
      b.name.toLowerCase() === norm ||
      norm.includes(b.code.toLowerCase()) ||
      norm.includes(b.short.toLowerCase()) ||
      b.name.toLowerCase().includes(norm)
  );
  return found ?? BANKS[0];
};

// ── Members (profiles JOIN wallets) ─────────────────────────────────────────
export type MemberStatus = "active" | "inactive" | "suspended";

export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  phone: string;
  bank_code: string;
  bank_account_number: string;
  bank_account_name: string;
  avatar_url?: string | null;
  status: MemberStatus;
  vip_level: number;
  balance: number;
  commission_balance: number;
  total_bets: number;
  total_won: number;
  created_at: string;
}

const NAMES = [
  "สมชาย ใจดี", "นภัสสร วงศ์สุวรรณ", "ปกรณ์ ธนกร", "จิราพร แสงทอง", "ธนกฤต ศรีสุข",
  "อารยา กมลรัตน์", "วีระชัย พรหมดี", "กัญญาณัฐ อินทร์แสง", "ณัฐวุฒิ ชัยมงคล", "พิมพ์ลภัส เจริญยศ",
  "ศักดิ์สิทธิ์ บุญเรือง", "เบญจวรรณ ทองคำ", "อดิศร วัฒนชัย", "ชนิดาภา เลิศประเสริฐ", "กิตติภพ รัตนโชติ",
  "สุพิชญา ดวงแก้ว", "ธชย ปรัชญาพร", "รัตนาภรณ์ สุขสันต์", "นนทบุรี เกษมสันต์", "ปิยะพงษ์ อาจหาญ",
  "วรรณิดา พงษ์ไพบูลย์", "จักรพงษ์ มีสุข", "ณิชานันท์ รุ่งเรือง",
];

const BANK_POOL = ["kbank", "bbl", "scb", "ktb", "ttb", "gsb", "baac", "bay", "ghb", "isbt"];

export const MEMBERS: Member[] = NAMES.map((name, i) => {
  const day = new Date(2025, 2 + (i % 9), 3 + ((i * 7) % 27), 9 + (i % 12), (i * 13) % 60);
  const d = new Date(2026, 7, 4);
  d.setMinutes(d.getMinutes() - i * 137);
  const active = i % 11 === 5 ? "inactive" : i % 17 === 9 ? "suspended" : "active";
  return {
    id: `mem-${String(i + 1).padStart(3, "0")}`,
    member_id: `M${String(10234 + i * 37)}`,
    full_name: name,
    phone: `0${[81, 82, 85, 86, 89, 91, 92, 93, 94, 95, 96, 63, 64, 65][i % 14]}${String(3000000 + i * 111111).slice(0, 7)}`,
    bank_code: BANK_POOL[i % 10],
    bank_account_number: String(1000000000 + i * 7654321),
    bank_account_name: name,
    status: active as MemberStatus,
    vip_level: i % 7 === 0 ? Math.min(5, 1 + (i % 5)) : i % 3,
    balance: (2380 + i * 9140) % 180000,
    commission_balance: (i * 340) % 4200,
    total_bets: (i * 13700) % 420000 + 1200,
    total_won: (i * 9100) % 260000,
    created_at: day.toISOString(),
  };
}).concat([
  {
    id: "mem-024", member_id: "M10290", full_name: "ทิพวรรณ สายสุนทร", phone: "0969988776",
    bank_code: "kbank", bank_account_number: "1099283746", bank_account_name: "ทิพวรรณ สายสุนทร",
    status: "active", vip_level: 2, balance: 45200, commission_balance: 890,
    total_bets: 238400, total_won: 151200,
    created_at: new Date(2026, 7, 4, 8, 12).toISOString(),
  },
]);

// ── Promotions (สำหรับแสดงในโมดัลอนุมัติฝาก + หน้าโปรโมชั่น) ─────────────────
export interface PromoInfo {
  code: string;
  name: string;
  bonus_rate: number;
  bonus_amount: number;
  min_deposit: number;
  max_withdrawal: number;
  turnover_multiplier: number;
}

export const PROMO_DETAILS: Record<string, PromoInfo> = {
  NEW50: { code: "NEW50", name: "โบนัสใหม่ 50%", bonus_rate: 50, bonus_amount: 0, min_deposit: 100, max_withdrawal: 5000, turnover_multiplier: 3 },
  DEP20: { code: "DEP20", name: "ฝากครั้งแรกรับ 20%", bonus_rate: 20, bonus_amount: 0, min_deposit: 200, max_withdrawal: 8000, turnover_multiplier: 2 },
  HOT100: { code: "HOT100", name: "โบนัสคงที่ 100 บาท", bonus_rate: 0, bonus_amount: 100, min_deposit: 500, max_withdrawal: 10000, turnover_multiplier: 5 },
  CASHBACK: { code: "CASHBACK", name: "คืนยอดเสีย 10%", bonus_rate: 10, bonus_amount: 0, min_deposit: 0, max_withdrawal: 20000, turnover_multiplier: 1 },
};

// ── Deposits (deposit_requests) ──────────────────────────────────────────────
export type TxStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DepositReq {
  id: string;
  member: Member;
  amount: number;
  promo_code: string | null;
  status: TxStatus;
  created_at: string;
  approved_at: string | null;
  approver_name: string | null;
  admin_note: string | null;
  slip_url?: string | null;
}

const dSeed = new Date(2026, 7, 4, 12, 0);
export const DEPOSITS: DepositReq[] = MEMBERS.slice(0, 14).map((m, i) => {
  const t = new Date(dSeed);
  t.setMinutes(t.getMinutes() - i * 47 - 8);
  const pending = i < 6;
  const rejected = !pending && i % 5 === 3;
  const ap = new Date(t);
  ap.setMinutes(ap.getMinutes() + 9);
  return {
    id: `dep-${String(i + 1).padStart(3, "0")}`,
    member: m,
    amount: [500, 1200, 3000, 250, 10000, 800, 1500, 5000, 3200, 1000, 600, 20000, 4500, 150][i],
    promo_code: i % 4 === 0 ? "NEW50" : i % 4 === 1 ? "DEP20" : i % 4 === 2 ? "HOT100" : null,
    status: pending ? "PENDING" : rejected ? "REJECTED" : "APPROVED",
    created_at: t.toISOString(),
    approved_at: pending ? null : ap.toISOString(),
    approver_name: pending ? null : ["ครัวพี่เลี้ยง", "Admin แดง", "Owner"][i % 3],
    admin_note: pending ? null : rejected ? "สลิปไม่ชัด กรุณาส่งใหม่" : i % 3 === 1 ? "โอนเร็ว อนุมัติไว" : null,
  };
});

// ── Withdrawals (withdraw_requests) ─────────────────────────────────────────
export interface WithdrawReq {
  id: string;
  member: Member;
  amount: number;
  bank_code: string;
  bank_account_number: string;
  bank_account_name: string;
  status: TxStatus;
  created_at: string;
  approved_at: string | null;
  approver_name: string | null;
  admin_note: string | null;
  promo_hold: number | null;
}

export const WITHDRAWALS: WithdrawReq[] = MEMBERS.slice(3, 15).map((m, i) => {
  const t = new Date(dSeed);
  t.setMinutes(t.getMinutes() - i * 53 - 22);
  const pending = i < 4;
  const rejected = !pending && i % 6 === 4;
  const ap = new Date(t);
  ap.setMinutes(ap.getMinutes() + 17);
  return {
    id: `wth-${String(i + 1).padStart(3, "0")}`,
    member: m,
    amount: [3000, 1500, 20000, 8000, 1200, 5000, 2500, 45000, 3300, 6000, 950, 12000][i],
    bank_code: m.bank_code,
    bank_account_number: m.bank_account_number,
    bank_account_name: m.bank_account_name,
    status: pending ? "PENDING" : rejected ? "REJECTED" : "APPROVED",
    created_at: t.toISOString(),
    approved_at: pending ? null : ap.toISOString(),
    approver_name: pending ? null : ["Owner", "Admin แดง", "ครัวพี่เลี้ยง"][i % 3],
    admin_note: pending ? null : rejected ? "ยอดไม่ถึงขั้นต่ำถอน" : i % 2 === 0 ? "โอนผ่าน PromptPay" : null,
    promo_hold: i === 1 ? 3200 : i === 5 ? 1500 : null,
  };
});

// ── Dashboard (admin_dashboard_stats) ───────────────────────────────────────
export const DASH_STATS = {
  total_deposit_today: 128450,
  total_withdraw_today: 96300,
  total_bet_today: 452380,
  total_payout_today: 318900,
  pending_deposits: DEPOSITS.filter((d) => d.status === "PENDING").length,
  pending_withdrawals: WITHDRAWALS.filter((d) => d.status === "PENDING").length,
  new_members_today: 14,
  net_profit_today: 133480,
  active_members_7d: 842,
  bet_rate_per_person: 3.8,
  withdrawal_rate: 71.3,
};

export const WEEKLY_CHART = [
  { date: "29/08", DEPOSIT: 98200, WITHDRAW: 71400, BET: 368500 },
  { date: "30/08", DEPOSIT: 132400, WITHDRAW: 88900, BET: 421300 },
  { date: "31/08", DEPOSIT: 156800, WITHDRAW: 104200, BET: 502700 },
  { date: "01/09", DEPOSIT: 87600, WITHDRAW: 65800, BET: 298400 },
  { date: "02/09", DEPOSIT: 104300, WITHDRAW: 79600, BET: 356200 },
  { date: "03/09", DEPOSIT: 118900, WITHDRAW: 92100, BET: 418900 },
  { date: "04/09", DEPOSIT: 128450, WITHDRAW: 96300, BET: 452380 },
];

export interface FeedItem {
  kind: "deposit" | "withdraw" | "bet" | "alert";
  id: string;
  time: string;
  // deposit/withdraw
  member?: { full_name: string; member_id: string; avatar_url?: string | null };
  bank_code?: string;
  account_no?: string;
  account_name?: string;
  amount?: number;
  status?: any;
  // bet
  market?: string;
  market_code?: string;
  market_color?: string;
  market_logo?: string | null;
  numbers?: string;
  bet_type?: string;
  // alert
  alert?: "LOTTERY_ALERT" | "LOTTERY_CLOSED" | "LOTTERY_RESULT";
  alert_market?: string;
}

const mk = (minAgo: number) => {
  const t = new Date(dSeed);
  t.setMinutes(t.getMinutes() - minAgo);
  return t.toISOString();
};

export const ACTIVITY_FEED: FeedItem[] = [
  { kind: "deposit", id: "f1", time: mk(3), member: { full_name: "ทิพวรรณ สายสุนทร", member_id: "M10290" }, bank_code: "kbank", account_no: "1099283746", amount: 1500, status: "PENDING" },
  { kind: "alert", id: "f2", time: mk(6), alert: "LOTTERY_ALERT", alert_market: "หุ้นฮั่งเส็งบ่าย" },
  { kind: "bet", id: "f3", time: mk(9), member: { full_name: "สมชาย ใจดี", member_id: "M10234" }, market: "หวยรัฐบาลไทย", market_code: "TH_GOV", market_color: "#0d9488", numbers: "123, 456", bet_type: "3TOP", amount: 200, status: "pending" },
  { kind: "withdraw", id: "f4", time: mk(14), member: { full_name: "ปกรณ์ ธนกร", member_id: "M10308" }, bank_code: "scb", account_no: "4019283746", account_name: "ปกรณ์ ธนกร", amount: 3000, status: "PENDING" },
  { kind: "deposit", id: "f5", time: mk(18), member: { full_name: "นภัสสร วงศ์สุวรรณ", member_id: "M10271" }, bank_code: "bbl", account_no: "8102345678", amount: 1200, status: "APPROVED" },
  { kind: "bet", id: "f6", time: mk(23), member: { full_name: "จิราพร แสงทอง", member_id: "M10345" }, market: "ลาวพัฒนา", market_code: "LAO", market_color: "#be123c", numbers: "77", bet_type: "2BOTTOM", amount: 500, status: "won" },
  { kind: "alert", id: "f7", time: mk(27), alert: "LOTTERY_CLOSED", alert_market: "ฮานอยปกติ · งวด 18:15" },
  { kind: "withdraw", id: "f8", time: mk(31), member: { full_name: "ธนกฤต ศรีสุข", member_id: "M10382" }, bank_code: "ktb", account_no: "9021837465", account_name: "ธนกฤต ศรีสุข", amount: 8000, status: "APPROVED" },
  { kind: "deposit", id: "f9", time: mk(38), member: { full_name: "อารยา กมลรัตน์", member_id: "M10419" }, bank_code: "gsb", account_no: "1200987654", amount: 3000, status: "PENDING" },
  { kind: "bet", id: "f10", time: mk(44), member: { full_name: "วีระชัย พรหมดี", member_id: "M10456" }, market: "หุ้นนิเคอิเช้า", market_code: "NIKKEI_MORNING", market_color: "#7c3aed", numbers: "045", bet_type: "3TODE", amount: 300, status: "pending" },
  { kind: "alert", id: "f11", time: mk(52), alert: "LOTTERY_RESULT", alert_market: "หุ้นอินเดีย" },
  { kind: "withdraw", id: "f12", time: mk(58), member: { full_name: "กัญญาณัฐ อินทร์แสง", member_id: "M10493" }, bank_code: "ttb", account_no: "2384719283", account_name: "กัญญาณัฐ อินทร์แสง", amount: 1500, status: "REJECTED" },
  { kind: "deposit", id: "f13", time: mk(65), member: { full_name: "ณัฐวุฒิ ชัยมงคล", member_id: "M10530" }, bank_code: "baac", account_no: "5588990012", amount: 10000, status: "APPROVED" },
  { kind: "bet", id: "f14", time: mk(72), member: { full_name: "พิมพ์ลภัส เจริญยศ", member_id: "M10567" }, market: "หุ้นเยอรมัน", market_code: "STOCK_GERMANY", market_color: "#0891b2", numbers: "89", bet_type: "2TOP", amount: 1000, status: "won" },
  { kind: "deposit", id: "f15", time: mk(81), member: { full_name: "ศักดิ์สิทธิ์ บุญเรือง", member_id: "M10604" }, bank_code: "bay", account_no: "6701234567", amount: 800, status: "PENDING" },
  { kind: "withdraw", id: "f16", time: mk(90), member: { full_name: "เบญจวรรณ ทองคำ", member_id: "M10641" }, bank_code: "ghb", account_no: "7788990011", account_name: "เบญจวรรณ ทองคำ", amount: 5000, status: "APPROVED" },
  { kind: "bet", id: "f17", time: mk(98), member: { full_name: "อดิศร วัฒนชัย", member_id: "M10678" }, market: "หวยมาเลย์", market_code: "MALAY", market_color: "#287e0b", numbers: "234, 432", bet_type: "3FRONT", amount: 150, status: "pending" },
  { kind: "deposit", id: "f18", time: mk(105), member: { full_name: "ชนิดาภา เลิศประเสริฐ", member_id: "M10715" }, bank_code: "isbt", account_no: "8811223344", amount: 250, status: "APPROVED" },
  { kind: "bet", id: "f19", time: mk(112), member: { full_name: "กิตติภพ รัตนโชติ", member_id: "M10752" }, market: "หุ้นฮั่งเส็งบ่าย", market_code: "HANGSENG_AFTERNOON", market_color: "#e11d48", numbers: "56", bet_type: "2BOTTOM", amount: 700, status: "lost" },
  { kind: "withdraw", id: "f20", time: mk(119), member: { full_name: "สุพิชญา ดวงแก้ว", member_id: "M10789" }, bank_code: "kbank", account_no: "3344556677", account_name: "สุพิชญา ดวงแก้ว", amount: 4200, status: "PENDING" },
  { kind: "deposit", id: "f21", time: mk(126), member: { full_name: "ธชย ปรัชญาพร", member_id: "M10826" }, bank_code: "scb", account_no: "9988776655", amount: 2000, status: "PENDING" },
  { kind: "alert", id: "f22", time: mk(133), alert: "LOTTERY_ALERT", alert_market: "ลาวพัฒนา" },
  { kind: "bet", id: "f23", time: mk(140), member: { full_name: "รัตนาภรณ์ สุขสันต์", member_id: "M10863" }, market: "ฮานอยปกติ", market_code: "HANOI", market_color: "#dc2626", numbers: "912", bet_type: "3TOP", amount: 250, status: "won" },
  { kind: "withdraw", id: "f24", time: mk(147), member: { full_name: "นนทบุรี เกษมสันต์", member_id: "M10900" }, bank_code: "gsb", account_no: "1122334455", account_name: "นนทบุรี เกษมสันต์", amount: 9800, status: "APPROVED" },
  { kind: "deposit", id: "f25", time: mk(154), member: { full_name: "ปิยะพงษ์ อาจหาญ", member_id: "M10937" }, bank_code: "ttb", account_no: "6677889900", amount: 600, status: "APPROVED" },
  { kind: "bet", id: "f26", time: mk(161), member: { full_name: "วรรณิดา พงษ์ไพบูลย์", member_id: "M10974" }, market: "หุ้นอินเดีย", market_code: "STOCK_INDIA", market_color: "#2563eb", numbers: "30", bet_type: "2TOP", amount: 450, status: "lost" },
  { kind: "alert", id: "f27", time: mk(168), alert: "LOTTERY_CLOSED", alert_market: "หุ้นนิเคอิเช้า · งวด 15:15" },
  { kind: "bet", id: "f28", time: mk(175), member: { full_name: "จักรพงษ์ มีสุข", member_id: "M11011" }, market: "หวยมาเลย์", market_code: "MALAY", market_color: "#287e0b", numbers: "07", bet_type: "RUN_DOWN", amount: 1200, status: "pending" },
  { kind: "deposit", id: "f29", time: mk(182), member: { full_name: "ณิชานันท์ รุ่งเรือง", member_id: "M11048" }, bank_code: "baac", account_no: "4433221100", amount: 5000, status: "APPROVED" },
  { kind: "withdraw", id: "f30", time: mk(189), member: { full_name: "สมชาย ใจดี", member_id: "M10234" }, bank_code: "bbl", account_no: "1010202030", account_name: "สมชาย ใจดี", amount: 15000, status: "APPROVED" },
];

export const TOP10_BETTORS = [
  { rank: 1, name: "ธนกฤต ศรีสุข", total_bet: 284500 },
  { rank: 2, name: "สมชาย ใจดี", total_bet: 236000 },
  { rank: 3, name: "พิมพ์ลภัส เจริญยศ", total_bet: 198700 },
  { rank: 4, name: "อารยา กมลรัตน์", total_bet: 174300 },
  { rank: 5, name: "วีระชัย พรหมดี", total_bet: 152800 },
  { rank: 6, name: "จิราพร แสงทอง", total_bet: 141200 },
  { rank: 7, name: "นภัสสร วงศ์สุวรรณ", total_bet: 128900 },
  { rank: 8, name: "ปกรณ์ ธนกร", total_bet: 115400 },
  { rank: 9, name: "กัญญาณัฐ อินทร์แสง", total_bet: 98600 },
  { rank: 10, name: "ชนิดาภา เลิศประเสริฐ", total_bet: 87200 },
];

// ── Lottery Markets (lottery_markets + market_bet_rates) ────────────────────
export type BetType = "4TOP" | "3TOP" | "3TODE" | "3FRONT" | "3BOTTOM" | "2TOP" | "2BOTTOM" | "RUN_UP" | "RUN_DOWN";

export const BET_TYPE_LABEL: Record<BetType, string> = {
  "4TOP": "4ตัวบน", "3TOP": "3ตัวบน", "3TODE": "3โต๊ด", "3FRONT": "3ตัวหน้า",
  "3BOTTOM": "3ตัวล่าง", "2TOP": "2ตัวบน", "2BOTTOM": "2ตัวล่าง",
  RUN_UP: "วิ่งบน", RUN_DOWN: "วิ่งล่าง",
};

export const BET_TYPES: BetType[] = ["4TOP", "3TOP", "3TODE", "3FRONT", "3BOTTOM", "2TOP", "2BOTTOM", "RUN_UP", "RUN_DOWN"];

export type MarketKind = "GOVERNMENT" | "OTHER";

export interface Market {
  id: string;
  name: string;
  code: string;
  color: string;
  kind: MarketKind;
  draw_days: number[];
  draw_time: string;
  close_minutes: number;
  popular: boolean;
  hot: boolean;
  active: boolean;
  youtube_url: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  rates: Record<BetType, number>;
  limits: { min_bet: number; max_bet: number; max_per_number: number };
}

const gRates: Record<BetType, number> = { "4TOP": 80, "3TOP": 700, "3TODE": 180, "3FRONT": 700, "3BOTTOM": 700, "2TOP": 92, "2BOTTOM": 92, RUN_UP: 3.2, RUN_DOWN: 3.2 };
const sRates: Record<BetType, number> = { "4TOP": 85, "3TOP": 720, "3TODE": 190, "3FRONT": 720, "3BOTTOM": 720, "2TOP": 95, "2BOTTOM": 95, RUN_UP: 3.4, RUN_DOWN: 3.4 };

// ย่อ code สำหรับโลโก้วงกลม (เช่น TH_GOV → GOV, HANGSENG_AFTERNOON → HSG)
// ย่อ code สำหรับโลโก้วงกลม 21 ตลาด
const MKT_SHORT: Record<string, string> = {
  TH_GOV: "GOV", LAO: "LAO", HANOI_SPECIAL: "HSP", HANOI: "HAN", HANOI_VIP: "VIP", MALAY: "MAL",
  NIKKEI_MORNING: "NKM", CHINA_MORNING: "CHM", HANGSENG_MORNING: "HSM", STOCK_TAIWAN: "TWN",
  STOCK_KOREA: "KOR", NIKKEI_AFTERNOON: "NKA", CHINA_AFTERNOON: "CHA", HANGSENG_AFTERNOON: "HSA",
  STOCK_SG: "SGP", STOCK_INDIA: "IND", STOCK_EGYPT: "EGY", STOCK_RUSSIA: "RUS", STOCK_GERMANY: "GER",
  STOCK_ENGLAND: "ENG", STOCK_DOWJONES: "DOW", THLOTTO_15M: "15M",
};
export const mktShort = (code: string): string => MKT_SHORT[code] ?? code.slice(0, 3);

// 21 ตลาดจริงบนฐานข้อมูล Supabase Production (ตามข้อ 2.2 ใน SYSTEM_ARCHITECTURE_MANUAL.md) + ล็อตโต้ 15 นาที (TH-LOTTO 15M)
export const MARKETS: Market[] = [
  { id: "mkt-01", name: "หวยรัฐบาลไทย", code: "TH_GOV", color: "#0d9488", kind: "GOVERNMENT", draw_days: [1, 16], draw_time: "15:30", close_minutes: 20, popular: true, hot: true, active: true, youtube_url: "https://youtube.com/live/gdlive", logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/th_gov_official.png", rates: gRates, limits: { min_bet: 1, max_bet: 5000, max_per_number: 100000 } },
  { id: "mkt-02", name: "ลาวพัฒนา", code: "LAO", color: "#be123c", kind: "OTHER", draw_days: [1, 3, 5], draw_time: "20:30", close_minutes: 10, popular: true, hot: true, active: true, youtube_url: "https://youtube.com/live/laoxyz", logo_url: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/fqW29ieijwwJQMBAwWoC.png", rates: sRates, limits: { min_bet: 1, max_bet: 2000, max_per_number: 30000 } },
  { id: "mkt-03", name: "ฮานอยพิเศษ", code: "HANOI_SPECIAL", color: "#e11d48", kind: "OTHER", draw_days: [0, 1, 2, 3, 4, 5, 6], draw_time: "17:30", close_minutes: 20, popular: true, hot: false, active: true, youtube_url: "https://youtube.com/live/hanoispecial", logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454312295.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 2000, max_per_number: 30000 } },
  { id: "mkt-04", name: "ฮานอยปกติ", code: "HANOI", color: "#dc2626", kind: "OTHER", draw_days: [0, 1, 2, 3, 4, 5, 6], draw_time: "18:30", close_minutes: 20, popular: true, hot: false, active: true, youtube_url: "https://youtube.com/live/hanoixyz", logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454321881.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 2000, max_per_number: 30000 } },
  { id: "mkt-05", name: "ฮานอย VIP", code: "HANOI_VIP", color: "#991b1b", kind: "OTHER", draw_days: [0, 1, 2, 3, 4, 5, 6], draw_time: "19:30", close_minutes: 20, popular: true, hot: true, active: true, youtube_url: "https://youtube.com/live/hanoivip", logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454321881.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 2000, max_per_number: 30000 } },
  { id: "mkt-06", name: "หวยมาเลย์", code: "MALAY", color: "#287e0b", kind: "OTHER", draw_days: [0, 3, 6], draw_time: "18:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781525171823.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 2000, max_per_number: 30000 } },
  { id: "mkt-07", name: "หุ้นนิเคอิเช้า", code: "NIKKEI_MORNING", color: "#7c3aed", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "09:30", close_minutes: 20, popular: true, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452606206.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-08", name: "หุ้นจีนเช้า", code: "CHINA_MORNING", color: "#ea580c", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "11:00", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452908429.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-09", name: "หุ้นฮั่งเส็งเช้า", code: "HANGSENG_MORNING", color: "#c026d3", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "11:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454049603.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-10", name: "หุ้นไต้หวัน", code: "STOCK_TAIWAN", color: "#0284c7", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "13:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452679787.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-11", name: "หุ้นเกาหลี", code: "STOCK_KOREA", color: "#4f46e5", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "13:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452733510.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-12", name: "หุ้นนิเคอิบ่าย", code: "NIKKEI_AFTERNOON", color: "#6d28d9", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "14:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453833260.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-13", name: "หุ้นจีนบ่าย", code: "CHINA_AFTERNOON", color: "#c2410c", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "14:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452899201.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-14", name: "หุ้นฮั่งเส็งบ่าย", code: "HANGSENG_AFTERNOON", color: "#db2777", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "15:00", close_minutes: 20, popular: true, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454082055.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-15", name: "หุ้นสิงคโปร์", code: "STOCK_SG", color: "#059669", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "17:00", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453140808.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-16", name: "หุ้นอินเดีย", code: "STOCK_INDIA", color: "#2563eb", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "17:00", close_minutes: 20, popular: false, hot: true, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453238397.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-17", name: "หุ้นอียิปต์", code: "STOCK_EGYPT", color: "#d97706", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "21:00", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453327973.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-18", name: "หุ้นรัสเซีย", code: "STOCK_RUSSIA", color: "#475569", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "21:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453281694.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-19", name: "หุ้นเยอรมัน", code: "STOCK_GERMANY", color: "#0891b2", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "22:00", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453342469.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-20", name: "หุ้นอังกฤษ", code: "STOCK_ENGLAND", color: "#1e3a8a", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "22:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453384284.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "mkt-21", name: "หวยหุ้นดาวน์โจนส์", code: "STOCK_DOWJONES", color: "#f59e0b", kind: "OTHER", draw_days: [1, 2, 3, 4, 5], draw_time: "02:30", close_minutes: 20, popular: false, hot: false, active: true, youtube_url: null, logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454167391.jpg", rates: sRates, limits: { min_bet: 1, max_bet: 3000, max_per_number: 50000 } },
  { id: "2ecc136e-0734-4be0-9e26-cf3149cb84cd", name: "ล็อตโต้ 15 นาที", code: "THLOTTO_15M", color: "#166534", kind: "OTHER", draw_days: [0, 1, 2, 3, 4, 5, 6], draw_time: "23:45", close_minutes: 1, popular: true, hot: true, active: true, youtube_url: null, logo_url: "/icons/thlotto-15m.png", rates: sRates, limits: { min_bet: 1, max_bet: 5000, max_per_number: 50000 } },
];

export const DAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

// ── Restricted Numbers (public.restricted_numbers) ──────────────────────────
export interface RestrictedNumber {
  id: string;
  market_id: string;
  market_code: string;
  market_name: string;
  market_color: string;
  market_logo?: string | null;
  bet_type: BetType;
  number: string;
  max_amount: number;
  payout_rate: number;
  draw_date: string;
  created_at: string;
}

export const RESTRICTED_NUMBERS: RestrictedNumber[] = [
  { id: "rn-1", market_id: "mkt-01", market_code: "TH_GOV", market_name: "หวยรัฐบาลไทย", market_color: "#0d9488", market_logo: "https://play-lh.googleusercontent.com/Wv6rE0OB0UYl487yMvp6b9GY2Jd4yvKt-PuDAHZvoS850ok1UufrW_fY4wXIfk8AvTu9Idsd4-Og5ABkrNmZ", bet_type: "3TOP", number: "915", max_amount: 0, payout_rate: 0, draw_date: "16/09/2569", created_at: "04/09/2569 09:30" },
  { id: "rn-2", market_id: "mkt-01", market_code: "TH_GOV", market_name: "หวยรัฐบาลไทย", market_color: "#0d9488", market_logo: "https://play-lh.googleusercontent.com/Wv6rE0OB0UYl487yMvp6b9GY2Jd4yvKt-PuDAHZvoS850ok1UufrW_fY4wXIfk8AvTu9Idsd4-Og5ABkrNmZ", bet_type: "2BOTTOM", number: "59", max_amount: 50000, payout_rate: 46, draw_date: "16/09/2569", created_at: "04/09/2569 09:35" },
  { id: "rn-3", market_id: "mkt-02", market_code: "LAO", market_name: "ลาวพัฒนา", market_color: "#be123c", market_logo: "https://thailottoapi.com/icons/lak-sq.png", bet_type: "3TOP", number: "888", max_amount: 20000, payout_rate: 360, draw_date: "04/09/2569", created_at: "04/09/2569 10:15" },
  { id: "rn-4", market_id: "mkt-04", market_code: "HANOI", market_name: "ฮานอยปกติ", market_color: "#dc2626", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454321881.jpg", bet_type: "2TOP", number: "99", max_amount: 0, payout_rate: 0, draw_date: "04/09/2569", created_at: "04/09/2569 11:00" },
];

// ── Instant 1-Min Bet Types (public.instant_bet_types — ข้อ 3.2 ในคู่มือ) ────
export interface InstantBetTypeConfig {
  id?: string;
  code: string;
  name: string;
  name_th?: string;
  rate: number;
  payout_rate?: number;
  min_digits: number;
  max_digits: number;
  min_bet?: number;
  max_bet?: number;
  digit_length?: number;
  is_positioned: boolean;
  display_order: number;
  is_active: boolean;
}

export const INSTANT_BET_TYPES: InstantBetTypeConfig[] = [
  { code: "2top", name: "2 ตัวบน", name_th: "2 ตัวบน", rate: 90, payout_rate: 90, min_digits: 2, max_digits: 2, digit_length: 2, min_bet: 1, max_bet: 50000, is_positioned: false, display_order: 1, is_active: true },
  { code: "2bottom", name: "2 ตัวล่าง", name_th: "2 ตัวล่าง", rate: 90, payout_rate: 90, min_digits: 2, max_digits: 2, digit_length: 2, min_bet: 1, max_bet: 50000, is_positioned: false, display_order: 2, is_active: true },
  { code: "3top", name: "3 ตัวบน", name_th: "3 ตัวบน", rate: 900, payout_rate: 900, min_digits: 3, max_digits: 3, digit_length: 3, min_bet: 1, max_bet: 30000, is_positioned: false, display_order: 3, is_active: true },
  { code: "3toad", name: "3 ตัวโต๊ด", name_th: "3 ตัวโต๊ด", rate: 180, payout_rate: 180, min_digits: 3, max_digits: 3, digit_length: 3, min_bet: 1, max_bet: 30000, is_positioned: false, display_order: 4, is_active: true },
  { code: "3front", name: "3 ตัวหน้า", name_th: "3 ตัวหน้า", rate: 900, payout_rate: 900, min_digits: 3, max_digits: 3, digit_length: 3, min_bet: 1, max_bet: 30000, is_positioned: false, display_order: 5, is_active: true },
  { code: "3back", name: "3 ตัวท้าย", name_th: "3 ตัวท้าย", rate: 900, payout_rate: 900, min_digits: 3, max_digits: 3, digit_length: 3, min_bet: 1, max_bet: 30000, is_positioned: false, display_order: 6, is_active: true },
  { code: "6straight", name: "6 ตัวตรง", name_th: "6 ตัวตรง", rate: 15000, payout_rate: 15000, min_digits: 6, max_digits: 6, digit_length: 6, min_bet: 1, max_bet: 10000, is_positioned: false, display_order: 7, is_active: true },
  { code: "pin_top", name: "ปักหลักบน", name_th: "ปักหลักบน", rate: 9.9, payout_rate: 9.9, min_digits: 1, max_digits: 1, digit_length: 1, min_bet: 1, max_bet: 100000, is_positioned: true, display_order: 8, is_active: true },
  { code: "pin_bottom", name: "ปักหลักล่าง", name_th: "ปักหลักล่าง", rate: 9.9, payout_rate: 9.9, min_digits: 1, max_digits: 1, digit_length: 1, min_bet: 1, max_bet: 100000, is_positioned: true, display_order: 9, is_active: true },
];

// ── Global Bets / Tickets (public.bets — 417 แถวในระบบจริง) ─────────────────
export interface GlobalBet {
  id: string;
  bet_no: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  member_avatar?: string | null;
  market_code: string;
  market_name: string;
  market_color: string;
  market_logo?: string | null;
  draw_date: string;
  bet_type: string;
  numbers: string;
  amount: number;
  payout_rate: number;
  payout_amount: number;
  status: "PENDING" | "WON" | "LOST" | "CANCELLED";
  is_paid: boolean;
  created_at: string;
}

export const GLOBAL_BETS: GlobalBet[] = [
  { id: "bet-101", bet_no: "B260904-001", member_id: "M10234", member_name: "สมชาย ใจดี", member_phone: "081-234-5678", member_avatar: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/avatars/8cd9dc58-d2eb-4aed-a5bc-f4cd74cb3ee4/1780530738154.jpg", market_code: "TH_GOV", market_name: "หวยรัฐบาลไทย", market_color: "#0d9488", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/th_gov_official.png", draw_date: "16/09/2569", bet_type: "3TOP", numbers: "617, 716", amount: 200, payout_rate: 700, payout_amount: 0, status: "PENDING", is_paid: false, created_at: "04/09/2569 11:20:15" },
  { id: "bet-102", bet_no: "B260904-002", member_id: "M10271", member_name: "นภัสสร วงศ์สุวรรณ", member_phone: "082-345-6789", member_avatar: null, market_code: "HANOI", market_name: "ฮานอยปกติ", market_color: "#dc2626", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454321881.jpg", draw_date: "04/09/2569", bet_type: "2TOP", numbers: "48", amount: 500, payout_rate: 95, payout_amount: 0, status: "PENDING", is_paid: false, created_at: "04/09/2569 11:25:40" },
  { id: "bet-103", bet_no: "B260904-003", member_id: "M10308", member_name: "ปกรณ์ ธนกร", member_phone: "085-456-7890", member_avatar: null, market_code: "LAO", market_name: "ลาวพัฒนา", market_color: "#be123c", market_logo: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/d3Nyjgtntlkei3MGYjuM/pub/fqW29ieijwwJQMBAwWoC.png", draw_date: "04/09/2569", bet_type: "2BOTTOM", numbers: "77", amount: 300, payout_rate: 95, payout_amount: 0, status: "PENDING", is_paid: false, created_at: "04/09/2569 11:32:02" },
  { id: "bet-104", bet_no: "B260904-004", member_id: "M10345", member_name: "จิราพร แสงทอง", member_phone: "086-567-8901", member_avatar: null, market_code: "HANOI_VIP", market_name: "ฮานอย VIP", market_color: "#991b1b", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454321881.jpg", draw_date: "04/09/2569", bet_type: "3TOP", numbers: "548", amount: 150, payout_rate: 720, payout_amount: 108000, status: "WON", is_paid: true, created_at: "03/09/2569 17:40:11" },
  { id: "bet-105", bet_no: "B260904-005", member_id: "M10382", member_name: "ธนกฤต ศรีสุข", member_phone: "089-678-9012", member_avatar: null, market_code: "NIKKEI_MORNING", market_name: "หุ้นนิเคอิเช้า", market_color: "#7c3aed", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781452606206.jpg", draw_date: "04/09/2569", bet_type: "3TODE", numbers: "045", amount: 200, payout_rate: 190, payout_amount: 0, status: "LOST", is_paid: false, created_at: "04/09/2569 08:50:55" },
  { id: "bet-106", bet_no: "B260904-006", member_id: "M10419", member_name: "อารยา กมลรัตน์", member_phone: "091-789-0123", member_avatar: null, market_code: "HANGSENG_AFTERNOON", market_name: "หุ้นฮั่งเส็งบ่าย", market_color: "#db2777", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454082055.jpg", draw_date: "04/09/2569", bet_type: "2BOTTOM", numbers: "56", amount: 400, payout_rate: 95, payout_amount: 0, status: "PENDING", is_paid: false, created_at: "04/09/2569 11:45:19" },
  { id: "bet-107", bet_no: "B260904-007", member_id: "M10456", member_name: "วีระชัย พรหมดี", member_phone: "092-890-1234", member_avatar: null, market_code: "MALAY", market_name: "หวยมาเลย์", market_color: "#287e0b", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781525171823.jpg", draw_date: "03/09/2569", bet_type: "3FRONT", numbers: "234", amount: 100, payout_rate: 720, payout_amount: 0, status: "LOST", is_paid: false, created_at: "03/09/2569 16:15:33" },
  { id: "bet-108", bet_no: "B260904-008", member_id: "M10493", member_name: "กัญญาณัฐ อินทร์แสง", member_phone: "093-901-2345", member_avatar: null, market_code: "STOCK_GERMANY", market_name: "หุ้นเยอรมัน", market_color: "#0891b2", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781453342469.jpg", draw_date: "03/09/2569", bet_type: "2TOP", numbers: "89", amount: 500, payout_rate: 95, payout_amount: 47500, status: "WON", is_paid: true, created_at: "03/09/2569 21:00:08" },
  { id: "bet-109", bet_no: "B260904-009", member_id: "M10530", member_name: "ณัฐวุฒิ ชัยมงคล", member_phone: "094-012-3456", member_avatar: null, market_code: "STOCK_DOWJONES", market_name: "หวยหุ้นดาวน์โจนส์", market_color: "#f59e0b", market_logo: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/markets/1781454167391.jpg", draw_date: "03/09/2569", bet_type: "2TOP", numbers: "54", amount: 250, payout_rate: 95, payout_amount: 0, status: "CANCELLED", is_paid: false, created_at: "03/09/2569 01:45:22" },
];

// ── Results (draw_schedules + lottery_results) ──────────────────────────────
export type ScheduleStatus = "OPEN" | "CLOSED" | "AWARDING" | "SETTLED";

export interface DrawSchedule {
  id: string;
  market_name: string;
  market_code: string;
  market_color: string;
  kind: MarketKind;
  draw_date: string;
  close_time: string;
  status: ScheduleStatus;
  total_bet: number;
  winners: number;
  total_payout: number;
}

export const DRAW_SCHEDULES: DrawSchedule[] = [
  { id: "ds-01", market_name: "หุ้นฮั่งเส็งบ่าย", market_code: "HANGSENG_AFTERNOON", market_color: "#db2777", kind: "OTHER", draw_date: "04/09/2569", close_time: "14:40", status: "OPEN", total_bet: 214800, winners: 0, total_payout: 0 },
  { id: "ds-02", market_name: "ฮานอยพิเศษ", market_code: "HANOI_SPECIAL", market_color: "#e11d48", kind: "OTHER", draw_date: "04/09/2569", close_time: "17:10", status: "OPEN", total_bet: 142500, winners: 0, total_payout: 0 },
  { id: "ds-03", market_name: "ฮานอยปกติ", market_code: "HANOI", market_color: "#dc2626", kind: "OTHER", draw_date: "04/09/2569", close_time: "18:10", status: "OPEN", total_bet: 289400, winners: 0, total_payout: 0 },
  { id: "ds-04", market_name: "ฮานอย VIP", market_code: "HANOI_VIP", market_color: "#991b1b", kind: "OTHER", draw_date: "04/09/2569", close_time: "19:10", status: "OPEN", total_bet: 183200, winners: 0, total_payout: 0 },
  { id: "ds-05", market_name: "ลาวพัฒนา", market_code: "LAO", market_color: "#be123c", kind: "OTHER", draw_date: "04/09/2569", close_time: "20:20", status: "OPEN", total_bet: 312000, winners: 0, total_payout: 0 },
  { id: "ds-06", market_name: "หวยรัฐบาลไทย", market_code: "TH_GOV", market_color: "#0d9488", kind: "GOVERNMENT", draw_date: "16/09/2569", close_time: "15:10", status: "AWARDING", total_bet: 502700, winners: 0, total_payout: 0 },
  { id: "ds-07", market_name: "หุ้นนิเคอิเช้า", market_code: "NIKKEI_MORNING", market_color: "#7c3aed", kind: "OTHER", draw_date: "04/09/2569", close_time: "09:10", status: "SETTLED", total_bet: 84200, winners: 12, total_payout: 68400 },
];

export interface LotteryResult {
  id: string;
  market_name: string;
  market_code: string;
  draw_date: string;
  result_main: string | null;
  result_3top: string | null;
  result_2top: string | null;
  result_2bottom: string | null;
  result_3front: string | null;
  result_3bottom: string | null;
  announced_at: string | null;
}

export const RECENT_RESULTS: LotteryResult[] = [
  { id: "rs-01", market_name: "ฮานอยปกติ", market_code: "HANOI", draw_date: "04/09/2569", result_main: null, result_3top: "458", result_2top: "58", result_2bottom: "19", result_3front: null, result_3bottom: "119", announced_at: "18:15" },
  { id: "rs-02", market_name: "หุ้นเยอรมัน", market_code: "STOCK_GERMANY", draw_date: "04/09/2569", result_main: null, result_3top: "731", result_2top: "31", result_2bottom: "04", result_3front: null, result_3bottom: "207", announced_at: "14:00" },
  { id: "rs-03", market_name: "ลาวพัฒนา", market_code: "LAO", draw_date: "03/09/2569", result_main: null, result_3top: "920", result_2top: "20", result_2bottom: "55", result_3front: null, result_3bottom: "333", announced_at: "13:00" },
  { id: "rs-04", market_name: "หุ้นนิเคอิเช้า", market_code: "NIKKEI_MORNING", draw_date: "03/09/2569", result_main: null, result_3top: "104", result_2top: "04", result_2bottom: "72", result_3front: null, result_3bottom: "815", announced_at: "15:15" },
  { id: "rs-05", market_name: "หวยรัฐบาลไทย", market_code: "TH_GOV", draw_date: "16/08/2569", result_main: "482617", result_3top: "617", result_2top: "17", result_2bottom: "90", result_3front: "264", result_3bottom: "825", announced_at: "15:30" },
];

// ── Instant lottery (หวยหนึ่งนาที) ───────────────────────────────────────────
export const INSTANT_STATS = {
  total_draws_today: 486,
  total_bets_today: 3124,
  total_bet_amount_today: 189300,
  total_payout_today: 141250,
  active_players_today: 216,
};

export const INSTANT_NET = INSTANT_STATS.total_bet_amount_today - INSTANT_STATS.total_payout_today;

export const INSTANT_DRAWS = [
  { draw_id: "D9241", draw_time: "12:59", status: "PENDING", result: "", bet_count: 34, total_bet: 2870, total_payout: 0 },
  { draw_id: "D9240", draw_time: "12:58", status: "SETTLED", result: "483", bet_count: 41, total_bet: 3410, total_payout: 1900 },
  { draw_id: "D9239", draw_time: "12:57", status: "SETTLED", result: "027", bet_count: 38, total_bet: 2980, total_payout: 0 },
  { draw_id: "D9238", draw_time: "12:56", status: "SETTLED", result: "915", bet_count: 45, total_bet: 4120, total_payout: 2300 },
  { draw_id: "D9237", draw_time: "12:55", status: "SETTLED", result: "260", bet_count: 29, total_bet: 2140, total_payout: 640 },
  { draw_id: "D9236", draw_time: "12:54", status: "SETTLED", result: "771", bet_count: 37, total_bet: 3060, total_payout: 0 },
  { draw_id: "D9235", draw_time: "12:53", status: "SETTLED", result: "548", bet_count: 43, total_bet: 3760, total_payout: 4700 },
  { draw_id: "D9234", draw_time: "12:52", status: "SETTLED", result: "109", bet_count: 36, total_bet: 2940, total_payout: 0 },
  { draw_id: "D9233", draw_time: "12:51", status: "SETTLED", result: "836", bet_count: 31, total_bet: 2510, total_payout: 950 },
  { draw_id: "D9232", draw_time: "12:50", status: "SETTLED", result: "622", bet_count: 40, total_bet: 3320, total_payout: 1450 },
];

export const INSTANT_BETS = [
  { member_name: "สมชาย ใจดี", numbers: "483", bet_type: "3ตัวบน", amount: 100, status: "WON" },
  { member_name: "นภัสสร วงศ์สุวรรณ", numbers: "48", bet_type: "2ตัวบน", amount: 500, status: "LOST" },
  { member_name: "ปกรณ์ ธนกร", numbers: "91", bet_type: "2ตัวล่าง", amount: 200, status: "LOST" },
  { member_name: "จิราพร แสงทอง", numbers: "548", bet_type: "3ตัวบน", amount: 150, status: "WON" },
  { member_name: "ธนกฤต ศรีสุข", numbers: "26", bet_type: "2ตัวบน", amount: 800, status: "LOST" },
  { member_name: "อารยา กมลรัตน์", numbers: "6", bet_type: "วิ่งบน", amount: 300, status: "WON" },
  { member_name: "วีระชัย พรหมดี", numbers: "027", bet_type: "3ตัวบน", amount: 120, status: "LOST" },
  { member_name: "กัญญาณัฐ อินทร์แสง", numbers: "77", bet_type: "2ตัวบน", amount: 450, status: "LOST" },
  { member_name: "พิมพ์ลภัส เจริญยศ", numbers: "109", bet_type: "3ตัวบน", amount: 90, status: "LOST" },
  { member_name: "ศักดิ์สิทธิ์ บุญเรือง", numbers: "3", bet_type: "วิ่งล่าง", amount: 600, status: "PENDING" },
];

export const INSTANT_HOURLY = [
  { hour: "05:00", BET: 8200, PAYOUT: 6100 },
  { hour: "07:00", BET: 14500, PAYOUT: 9800 },
  { hour: "09:00", BET: 22300, PAYOUT: 18400 },
  { hour: "10:00", BET: 26800, PAYOUT: 21900 },
  { hour: "11:00", BET: 31200, PAYOUT: 24100 },
  { hour: "12:00", BET: 38600, PAYOUT: 29750 },
  { hour: "13:00", BET: 27400, PAYOUT: 19200 },
  { hour: "14:00", BET: 20500, PAYOUT: 12000 },
];

// ── Wheel (วงล้อโชคดี) ───────────────────────────────────────────────────────
export interface WheelSlot {
  id: string;
  name: string;
  amount: number;
  probability: number;
  color: string;
  hi_color: string;
  is_active: boolean;
}

export const WHEEL_CONFIG = { cost: 30, daily_limit: 5, banner_url: "" };

export const WHEEL_SLOTS: WheelSlot[] = [
  { id: "w1", name: "รางวัลใหญ่ ฿500", amount: 500, probability: 2, color: "#287e0b", hi_color: "#579c2c", is_active: true },
  { id: "w2", name: "฿100", amount: 100, probability: 10, color: "#0d9488", hi_color: "#2dd4bf", is_active: true },
  { id: "w3", name: "฿50", amount: 50, probability: 20, color: "#f59e0b", hi_color: "#fbbf24", is_active: true },
  { id: "w4", name: "฿20", amount: 20, probability: 25, color: "#0891b2", hi_color: "#22d3ee", is_active: true },
  { id: "w5", name: "฿10", amount: 10, probability: 15, color: "#8b5cf6", hi_color: "#c4b5fd", is_active: true },
  { id: "w6", name: "เสียใจด้วย", amount: 0, probability: 15, color: "#78716c", hi_color: "#a8a29e", is_active: true },
  { id: "w7", name: "฿300", amount: 300, probability: 8, color: "#e11d48", hi_color: "#fb7185", is_active: true },
  { id: "w8", name: "ฟรีหมุน 1 ครั้ง", amount: 0, probability: 5, color: "#2563eb", hi_color: "#93c5fd", is_active: true },
];

// ── Promotions (promotions) ──────────────────────────────────────────────────
export interface Promotion {
  id: string;
  title: string;
  promo_code: string;
  description: string;
  image_url: string;
  badge_text: string;
  background_color: string;
  type: string;
  line1: string;
  line2: string;
  bonus_rate: number;
  bonus_amount: number;
  min_deposit: number;
  max_withdrawal: number;
  turnover_multiplier: number;
  default_amount: number;
  allowed_game: string;
  target_view: string;
  max_uses_per_user: number;
  max_uses_total: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export const PROMOTIONS: Promotion[] = [
  { id: "pm-1", title: "สมัครใหม่", promo_code: "NEW50", description: "รับโบนัสเพิ่ม 50% สำหรับสมาชิกใหม่ที่ฝากครั้งแรก", image_url: "", badge_text: "สมาชิกใหม่", background_color: "#287e0b", type: "deposit", line1: "ฝากครั้งแรกรับเพิ่ม", line2: "50%", bonus_rate: 50, bonus_amount: 0, min_deposit: 100, max_withdrawal: 5000, turnover_multiplier: 3, default_amount: 500, allowed_game: "all", target_view: "deposit", max_uses_per_user: 1, max_uses_total: 1000, starts_at: "01/06/2569", expires_at: "31/12/2569", is_active: true },
  { id: "pm-2", title: "แนะนำเพื่อน", promo_code: "REF100", description: "ชวนเพื่อนสมัครและฝากครบเงื่อนไข รับเงินรางวัลทันที 100 บาท", image_url: "", badge_text: "ชวนเพื่อน", background_color: "#dc2626", type: "referral", line1: "แนะนำเพื่อนรับ", line2: "100 บาท", bonus_rate: 0, bonus_amount: 100, min_deposit: 0, max_withdrawal: 10000, turnover_multiplier: 1, default_amount: 0, allowed_game: "all", target_view: "all", max_uses_per_user: 10, max_uses_total: 0, starts_at: "01/08/2569", expires_at: "30/09/2569", is_active: true },
  { id: "pm-3", title: "โปรวันเกิด", promo_code: "BIRTHDAY", description: "ของขวัญวันเกิดสำหรับสมาชิก รับเครดิตฟรี 500 บาท 1 ครั้งต่อปี", image_url: "", badge_text: "วันเกิดมาโปรฯ", background_color: "#0d9488", type: "special", line1: "วันเกิดปีนี้รับ", line2: "500 บาท", bonus_rate: 0, bonus_amount: 500, min_deposit: 0, max_withdrawal: 20000, turnover_multiplier: 1, default_amount: 0, allowed_game: "all", target_view: "all", max_uses_per_user: 1, max_uses_total: 0, starts_at: "01/07/2569", expires_at: "30/11/2569", is_active: true },
  { id: "pm-4", title: "แทงผิด 10 งวด", promo_code: "MISS10", description: "แทงเลขเดิมติดต่อกันครบ 10 งวดโดยไม่ถูกรางวัล รับคืนเต็มจำนวนยอดแทง", image_url: "", badge_text: "คุ้มครองโพย", background_color: "#7c3aed", type: "special", line1: "แทงผิดครบ 10 งวด", line2: "รับคืนเต็มจำนวน", bonus_rate: 0, bonus_amount: 0, min_deposit: 0, max_withdrawal: 20000, turnover_multiplier: 1, default_amount: 0, allowed_game: "lotto", target_view: "all", max_uses_per_user: 3, max_uses_total: 800, starts_at: "10/08/2569", expires_at: "10/10/2569", is_active: false },
];

// ── Settings (settings key-value) ───────────────────────────────────────────
export const FINANCE_SETTINGS = { min_deposit: 100, max_deposit: 200000, min_withdraw: 300, max_withdraw: 100000, deposit_fee: 0, withdraw_fee: 0, welcome_bonus: 50, welcome_bonus_turnover: 2 };
export const WHEEL_SETTINGS = { lucky_wheel_enabled: true, lucky_wheel_cost: 30, lucky_wheel_daily_limit: 5 };
export const SOCIAL_SETTINGS = { line_id: "@thlotto", line_url: "https://line.me/R/ti/p/@thlotto", facebook_url: "https://facebook.com/thlotto", contact_phone: "062-230-6037", telegram_url: "https://t.me/thlotto" };
export const SYSTEM_SETTINGS = { site_name: "TH-LOTTO", site_logo_url: "", site_description: "เว็บหวยออนไลน์ครบทุกตลาด ปลอดภัย จ่ายไว", api_secret_key: "sk_live_9f2e••••••••3a7b" };
export const SITE_CONTROL = { site_enabled: true, maintenance_message: "ระบบกำลังปรับปรุง ขออภัยในความไม่สะดวก จะกลับมาให้บริการโดยเร็วที่สุด" };

export interface AdminBankAccount { id: string; bank_code: string; account_no: string; account_name: string; is_default: boolean }
export const ADMIN_BANK_ACCOUNTS: AdminBankAccount[] = [
  { id: "ab-1", bank_code: "kbank", account_no: "1234567890", account_name: "บริษัท ทีเอช ล็อตโต้ จำกัด", is_default: true },
  { id: "ab-2", bank_code: "scb", account_no: "2098765432", account_name: "บริษัท ทีเอช ล็อตโต้ จำกัด", is_default: false },
  { id: "ab-3", bank_code: "bbl", account_no: "8012345678", account_name: "จิรายุ ธนโชค", is_default: false },
];

export interface Announcement { id: string; message: string; display_order: number; is_active: boolean }
export const ANNOUNCEMENTS: Announcement[] = [
  { id: "an-1", message: "🎉 ยินดีต้อนรับสู่ TH-LOTTO ฝากขั้นต่ำ 100 บาท", display_order: 1, is_active: true },
  { id: "an-2", message: "⚡ หวยรัฐบาลงวดวันที่ 16/09 เปิดรับแล้ววันนี้", display_order: 2, is_active: true },
  { id: "an-3", message: "🎁 ใช้โค้ด NEW50 รับโบนัส 50% สมาชิกใหม่", display_order: 3, is_active: false },
];

export const CLEANUP_PREVIEW = [
  { table: "instant_draws", condition: "status=SETTLED และ > 7 วัน", count: 1284 },
  { table: "notifications", condition: "is_read=true และ > 7 วัน", count: 3421 },
  { table: "admin_notifications", condition: "is_read=true และ > 7 วัน", count: 216 },
  { table: "login_attempts", condition: "> 30 วัน", count: 8932 },
];

// ── Admins (profiles is_admin + permissions) ────────────────────────────────
export const PERMISSION_KEYS: { key: string; label: string; page: string }[] = [
  { key: "deposits", label: "รายการฝากเงิน", page: "ฝากเงิน" },
  { key: "withdrawals", label: "รายการถอนเงิน", page: "ถอนเงิน" },
  { key: "members", label: "จัดการสมาชิก", page: "สมาชิก + Affiliates" },
  { key: "markets", label: "ตลาดหวย", page: "ตลาดหวย + ผลรางวัล" },
  { key: "bets", label: "รายการโพย", page: "โพย" },
  { key: "restricted", label: "เลขอั้น", page: "เลขอั้น" },
  { key: "wheel", label: "วงล้อโชคดี", page: "วงล้อ" },
  { key: "instant", label: "หวยหนึ่งนาที", page: "หวยหนึ่งนาที" },
  { key: "settings", label: "ตั้งค่าระบบ", page: "ตั้งค่า + ประกาศ + Backup" },
  { key: "appearance", label: "รูปลักษณ์เว็บ", page: "รูปลักษณ์" },
  { key: "sliders", label: "สไลเดอร์", page: "สไลเดอร์" },
  { key: "promotions", label: "โปรโมชั่น", page: "โปรโมชั่น" },
  { key: "articles", label: "บทความ", page: "บทความ" },
  { key: "feeds", label: "ฟีด", page: "ฟีด + Trending" },
  { key: "banks", label: "ธนาคาร", page: "ธนาคาร" },
];

export interface AdminUser {
  id: string;
  full_name: string;
  phone: string;
  role: "super" | "admin";
  status: "active" | "inactive";
  permissions: string[];
  avatar_color: string;
  avatar_url?: string | null;
}

export const ADMINS: AdminUser[] = [
  { id: "ad-1", full_name: "เจ้าของเว็บ", phone: "062-230-6037", role: "super", status: "active", permissions: PERMISSION_KEYS.map((p) => p.key), avatar_color: "#111827" },
  { id: "ad-2", full_name: "แอดมินแดง", phone: "089-123-4567", role: "admin", status: "active", permissions: ["deposits", "withdrawals", "members", "bets"], avatar_color: "#e11d48" },
  { id: "ad-3", full_name: "แอดมินหวย", phone: "091-555-8899", role: "admin", status: "active", permissions: ["markets", "bets", "restricted", "instant", "feeds"], avatar_color: "#0d9488" },
  { id: "ad-4", full_name: "แอดมินโปรฯ", phone: "096-777-1122", role: "admin", status: "inactive", permissions: ["promotions", "articles", "sliders", "appearance"], avatar_color: "#7c3aed" },
];

// ── Member detail mock (ใช้ต่อกับสมาชิกทุกคน) ────────────────────────────────
export interface MemberBet {
  created_at: string; market_name: string; market_color: string; draw_date: string;
  numbers: string; bet_type: string; amount: number; payout_rate: number;
  payout_amount: number; status: "PENDING" | "WON" | "LOST" | "CANCELLED";
}

export const MEMBER_BETS: MemberBet[] = [
  { created_at: "04/09/2569 12:31", market_name: "หุ้นฮั่งเส็งบ่าย", market_color: "#e11d48", draw_date: "04/09/2569", numbers: "456, 654", bet_type: "3ตัวบน", amount: 200, payout_rate: 700, payout_amount: 0, status: "PENDING" },
  { created_at: "04/09/2569 11:02", market_name: "ลาวพัฒนา", market_color: "#be123c", draw_date: "04/09/2569", numbers: "77", bet_type: "2ตัวล่าง", amount: 500, payout_rate: 92, payout_amount: 0, status: "PENDING" },
  { created_at: "03/09/2569 14:20", market_name: "หวยรัฐบาลไทย", market_color: "#0d9488", draw_date: "01/09/2569", numbers: "617", bet_type: "3ตัวบน", amount: 100, payout_rate: 700, payout_amount: 70000, status: "WON" },
  { created_at: "03/09/2569 09:15", market_name: "หุ้นนิเคอิเช้า", market_color: "#7c3aed", draw_date: "03/09/2569", numbers: "88", bet_type: "2ตัวบน", amount: 300, payout_rate: 95, payout_amount: 0, status: "LOST" },
  { created_at: "02/09/2569 16:44", market_name: "หุ้นเยอรมัน", market_color: "#0891b2", draw_date: "02/09/2569", numbers: "207", bet_type: "3ตัวล่าง", amount: 150, payout_rate: 720, payout_amount: 108000, status: "WON" },
  { created_at: "02/09/2569 10:31", market_name: "หุ้นดาวน์โจนส์", market_color: "#f59e0b", draw_date: "02/09/2569", numbers: "54", bet_type: "2ตัวบน", amount: 100, payout_rate: 95, payout_amount: 0, status: "CANCELLED" },
];

export interface MemberTx {
  created_at: string; type: string; amount: number; note: string;
}

export const MEMBER_TXS: MemberTx[] = [
  { created_at: "04/09/2569 11:58", type: "DEPOSIT", amount: 1500, note: "โอนเข้า KBank" },
  { created_at: "04/09/2569 11:02", type: "BET", amount: -500, note: "โพย 2ตัวล่าง 77 (หวยลาว)" },
  { created_at: "03/09/2569 15:42", type: "WIN", amount: 70000, note: "ถูกรางวัล 3ตัวบน รัฐบาล 01/09" },
  { created_at: "03/09/2569 10:00", type: "WITHDRAW", amount: -20000, note: "โอนออก SCB ต่อท้าย 2098" },
  { created_at: "03/09/2569 08:31", type: "BONUS", amount: 50, note: "โบนัสต้อนรับ" },
  { created_at: "02/09/2569 19:20", type: "COMMISSION", amount: 120, note: "ค่าแนะนำเพื่อน ระดับ 1" },
  { created_at: "02/09/2569 16:44", type: "BET", amount: -150, note: "โพย 3ตัวล่าง 207 (เวียดนาม)" },
  { created_at: "01/09/2569 09:12", type: "PAYOUT", amount: 108000, note: "จ่ายรางวัล 3ตัวล่าง เวียดนาม" },
];

export interface MemberLogin {
  attempted_at: string; ip_address: string; success: boolean; user_agent: string;
}

export const MEMBER_LOGINS: MemberLogin[] = [
  { attempted_at: "04/09/2569 11:55", ip_address: "171.101.44.82", success: true, user_agent: "iPhone · Safari 17 · TH" },
  { attempted_at: "04/09/2569 07:12", ip_address: "171.101.44.82", success: true, user_agent: "iPhone · Safari 17 · TH" },
  { attempted_at: "03/09/2569 22:40", ip_address: "184.22.9.130", success: false, user_agent: "Chrome 126 · Windows" },
  { attempted_at: "03/09/2569 22:41", ip_address: "184.22.9.130", success: false, user_agent: "Chrome 126 · Windows" },
  { attempted_at: "03/09/2569 22:43", ip_address: "171.99.10.15", success: true, user_agent: "Android 14 · Chrome Mobile" },
  { attempted_at: "02/09/2569 18:03", ip_address: "171.99.10.15", success: true, user_agent: "Android 14 · Chrome Mobile" },
];

// ── Member detail: ฝาก/ถอน (deposit_requests + withdraw_requests ของสมาชิก) ──
export interface MemberDepositRow {
  date: string; amount: number; status: TxStatus; admin_note: string | null;
}

export const MEMBER_DEPOSIT_ROWS: MemberDepositRow[] = [
  { date: "04/09/2569 11:58", amount: 1500, status: "PENDING", admin_note: null },
  { date: "02/09/2569 20:15", amount: 3000, status: "APPROVED", admin_note: "โอนเร็ว อนุมัติไว" },
  { date: "01/09/2569 09:40", amount: 800, status: "APPROVED", admin_note: null },
  { date: "29/08/2569 22:07", amount: 500, status: "REJECTED", admin_note: "สลิปไม่ชัด กรุณาส่งใหม่" },
  { date: "27/08/2569 13:52", amount: 1200, status: "APPROVED", admin_note: null },
];

export interface MemberWithdrawRow {
  date: string; amount: number; bank_code: string; account_no: string; status: TxStatus; admin_note: string | null;
}

export const MEMBER_WITHDRAW_ROWS: MemberWithdrawRow[] = [
  { date: "03/09/2569 10:00", amount: 20000, bank_code: "scb", account_no: "2098765432", status: "APPROVED", admin_note: "โอนผ่าน PromptPay" },
  { date: "01/09/2569 17:33", amount: 5000, bank_code: "scb", account_no: "2098765432", status: "APPROVED", admin_note: null },
  { date: "30/08/2569 21:11", amount: 1200, bank_code: "scb", account_no: "2098765432", status: "REJECTED", admin_note: "ยอดไม่ถึงขั้นต่ำถอน" },
  { date: "28/08/2569 11:26", amount: 8000, bank_code: "scb", account_no: "2098765432", status: "APPROVED", admin_note: null },
];

// ── Admin notifications (กระดิ่ง) ────────────────────────────────────────────
export interface AdminNotification {
  id: string; title: string; message: string; type: "info" | "warning" | "success"; date: string; read: boolean;
  target_page?: string;
}

export const ADMIN_NOTIFS: AdminNotification[] = [
  { id: "n1", title: "มีรายการฝากรออนุมัติ 6 รายการ", message: "รายการใหม่เข้ามา สมาชิก ทิพวรรณ ฝาก ฿1,500 ผ่าน KBank", type: "warning", date: "12:03", read: false, target_page: "deposits" },
  { id: "n2", title: "มีรายการถอนรอดำเนินการ 4 รายการ", message: "ยอดรวม ฿32,500 รอโอนเงินให้สมาชิก", type: "warning", date: "11:41", read: false, target_page: "withdrawals" },
  { id: "n3", title: "หุ้นฮั่งเส็งบ่ายกำลังจะปิดรับ", message: "ปิดรับแทงในอีก 14 นาที (16:45)", type: "info", date: "16:31", read: false, target_page: "markets" },
  { id: "n4", title: "ประกาศผลฮานอยปกติแล้ว", message: "ผล 3ตัวบน 458 · 2ตัวล่าง 19 ระบบตัดยอดอัตโนมัติแล้ว", type: "success", date: "18:15", read: true, target_page: "results" },
  { id: "n5", title: "สมาชิกใหม่วันนี้ 14 คน", message: "เพิ่มขึ้น 22% เทียบเมื่อวาน", type: "success", date: "09:00", read: true, target_page: "members" },
];

// ── Wheel spin history (ใช้ในหน้าวงล้อ) ──────────────────────────────────────
export const WHEEL_SPIN_TODAY = { spins: 462, cost_collected: 13860, prizes_paid: 8240 };

// ── Sliders (Table: sliders — หน้าสไลเดอร์) ──────────────────────────────────
export interface Slider {
  id: string; title: string; image_url: string; link_url: string;
  display_order: number; is_active: boolean; created_at: string;
}

export const SLIDERS: Slider[] = [
  { id: "sl-1", title: "โบนัสสมัครใหม่รับ 100%", image_url: "", link_url: "/promotions/welcome", display_order: 1, is_active: true, created_at: "15/07/2569" },
  { id: "sl-2", title: "หวยรัฐบาล 16 ตุลาคมนี้", image_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=60", link_url: "/lottery/TH_GOV", display_order: 2, is_active: true, created_at: "20/07/2569" },
  { id: "sl-3", title: "วงล้อโชคดี หมุนฟรีทุกวัน", image_url: "", link_url: "/wheel", display_order: 3, is_active: true, created_at: "02/08/2569" },
  { id: "sl-4", title: "แนะนำเพื่อนรับ 10%", image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=60", link_url: "/promotions/referral", display_order: 4, is_active: false, created_at: "18/08/2569" },
];

// ── Articles (Table: articles — หน้าบทความ) ──────────────────────────────────
export interface Article {
  id: string; title: string; category: string; excerpt: string; content: string;
  image_url: string; author: string; views: number; is_published: boolean;
  published_at: string;
}

export const ARTICLES: Article[] = [
  { id: "ar-1", title: "วิธีเล่นหวยออนไลน์สำหรับมือใหม่ เข้าใจง่ายใน 5 นาที", category: "คู่มือ", excerpt: "รวมทุกอย่างที่มือใหม่ต้องรู้ ตั้งแต่ประเภทการแทง อัตราจ่าย ไปจนถึงเทคนิคการวางแผนเงินทุน", content: "หวยออนไลน์มีหลายรูปแบบ ไม่ว่าจะเป็นหวยรัฐบาล หวยต่างประเทศ หรือหวยหุ้น แต่ละแบบมีวิธีเล่นและอัตราจ่ายที่ต่างกัน\n\nบทความนี้จะพาทุกคนไปทำความรู้จักประเภทการแทงหลัก ๆ ได้แก่ 4ตัวบน 3ตัวบน 3โต๊ด 2ตัวบน 2ตัวล่าง และวิ่งบนวิ่งล่าง พร้อมตัวอย่างการคำนวณเงินรางวัลจริง\n\nขั้นตอนการเริ่มเล่น: 1) สมัครสมาชิกและยืนยันเบอร์โทร 2) ฝากเงินขั้นต่ำ 100 บาท 3) เลือกตลาดที่ต้องการแทง 4) เลือกประเภทและใส่เลขที่ต้องการ 5) รอผลออกและรับเงินเข้ากระเป๋าทันที", image_url: "", author: "ทีมงาน TH-LOTTO", views: 2845, is_published: true, published_at: "12/08/2569" },
  { id: "ar-2", title: "เทคนิคการดูเลขเด็ดจากสถิติย้อนหลัง 100 งวด", category: "เทคนิค", excerpt: "อ่านสถิติอย่างไรให้เป็น หาเลขที่ออกบ่อยและเลขที่ออกยาก พร้อมวิธีจัดสรรเงินลงทุนอย่างมีวินัย", content: "การอ่านสถิติย้อนหลังเป็นเทคนิคยอดนิยมของนักเสี่ยงโชค เพราะช่วยให้เห็นแนวทางการออกของตัวเลขในช่วงเวลาที่ผ่านมา\n\nหลักการพื้นฐาน: เลขที่ออกบ่อย (Hot Numbers) คือเลขที่ปรากฏในผลรางวัลมากกว่า 5 ครั้งใน 100 งวด ส่วนเลขที่ออกยาก (Cold Numbers) คือเลขที่ไม่ออกเกิน 30 งวด\n\nแนะนำให้แบ่งเงินทุนเป็น 3 ส่วน ส่วนละไม่เกิน 30% ของเงินทั้งหมด เพื่อคุมความเสี่ยงและเล่นได้อย่างมีวินัย", image_url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=60", author: "เซียนหวย AC", views: 4123, is_published: true, published_at: "20/08/2569" },
  { id: "ar-3", title: "ประกาศเวลาปิดรับแทงงวดรัฐบาล 16 ตุลาคม 2569", category: "ประกาศ", excerpt: "ปิดรับแทงเวลา 14:30 น. ขอให้สมาชิกวางแผนเล่นล่วงหน้า และตรวจสอบยอดเงินในกระเป๋าก่อนปิดรับ", content: "งวดวันที่ 16 ตุลาคม 2569 ระบบจะปิดรับแทงเวลา 14:30 น. ตามเวลาประเทศไทย\n\nสมาชิกสามารถแทงล่วงหน้าได้ตั้งแต่บัดนี้ และควรตรวจสอบโพยก่อนกดยืนยันทุกครั้ง หากพบปัญหาสามารถติดต่อแอดมินผ่าน LINE Official ได้ตลอด 24 ชั่วโมง\n\nขอให้โชคดีทุกท่าน", image_url: "", author: "ทีมงาน TH-LOTTO", views: 1892, is_published: true, published_at: "01/09/2569" },
  { id: "ar-4", title: "รู้จักหวยหนึ่งนาที เกมใหม่ที่ออกผลทุก 60 วินาที", category: "คู่มือ", excerpt: "เล่นยังไง จ่ายเท่าไหร่ ต่างจากหวยปกติอย่างไร รวมกติกาและอัตราจ่ายของหวยหนึ่งนาทีแบบครบถ้วน", content: "หวยหนึ่งนาทีคือเกมที่ออกผลรางวัลทุก 60 วินาทีตลอด 24 ชั่วโมง เหมาะสำหรับคนที่ชอบความตื่นเต้นแบบรวดเร็ว\n\nกติกาหลัก: เลือกตัวเลข 1-2 หลัก แล้วรอผลสุ่ม หากตรงรับเงินทันที อัตราจ่ายเริ่มต้นที่ 4 เท่าสำหรับการทาย 1 หลัก และสูงสุด 80 เท่าสำหรับการทาย 2 หลักตรง\n\nแต่ละวันสามารถเล่นได้ไม่จำกัดจำนวนงวด แต่แนะนำให้ตั้งงบต่อวันเพื่อความบันเทิงอย่างยั่งยืน", image_url: "", author: "ทีมงาน TH-LOTTO", views: 956, is_published: true, published_at: "25/08/2569" },
  { id: "ar-5", title: "วิธีฝาก-ถอนอัตโนมัติผ่านระบบ ทำรายการได้ใน 1 นาที", category: "คู่มือ", excerpt: "สอนทีละขั้นตอนตั้งแต่โอนเงิน แจ้งสลิป จนถึงการถอนเข้าบัญชีของคุณ พร้อมเหตุผลที่รายการถูกระงับ", content: "การฝากเงิน: เลือกบัญชีธนาคารที่แสดงในหน้าฝากเงิน โอนตามยอดที่ต้องการ (ขั้นต่ำ 100 บาท) จากนั้นอัปโหลดสลิปหรือรอระบบดึงรายการอัตโนมัติ เงินจะเข้ากระเป๋าภายใน 1 นาที\n\nการถอนเงิน: กดถอน ระบุยอด (ขั้นต่ำ 300 บาท) ระบบจะโอนเข้าบัญชีที่ท่านลงทะเบียนไว้ หากมีเทิร์นโอเวอร์ค้างระบบจะแจ้งยอดที่ต้องทำให้ครบก่อน\n\nสาเหตุที่รายการถูกระงับ: ยอดไม่ถึงขั้นต่ำ สลิปไม่ชัด เลขบัญชีผู้รับไม่ตรง หรือมีเทิร์นโอเวอร์ค้าง", image_url: "", author: "ทีมงาน TH-LOTTO", views: 3321, is_published: false, published_at: "—" },
  { id: "ar-6", title: "ขอบคุณลูกค้าคนสำคัญ สรุปกิจกรรมเดือนกันยายน", category: "ข่าวสาร", excerpt: "สรุปกิจกรรมและโบนัสพิเศษตลอดเดือน พร้อมตัวเลขสถิติการจ่ายรางวัลของเว็บเพื่อความโปร่งใส", content: "เดือนกันยายนที่ผ่านมา TH-LOTTO มีสมาชิกใหม่เพิ่มขึ้น 1,240 คน จ่ายรางวัลรวม 8.4 ล้านบาท และมีผู้ชนะวงล้อโชคดี 312 คน\n\nกิจกรรมเดือนตุลาคม: โบนัสฝากครั้งแรกเพิ่มจาก 50% เป็น 100% (สูงสุด 2,000 บาท) และกิจกรรมรับโค้ดเครดิตฟรีทุกวันศุกร์\n\nติดตามข่าวสารได้ทางหน้าแรกของเว็บและช่องทาง LINE Official ของเรา", image_url: "", author: "ทีมงาน TH-LOTTO", views: 642, is_published: false, published_at: "—" },
];

export const ARTICLE_CATEGORIES = ["คู่มือ", "เทคนิค", "ประกาศ", "ข่าวสาร"];

// ── Feeds (Table: feeds — หน้าจัดการฟีด + Trending) ──────────────────────────
export interface NewsFeed {
  id: string; title: string; body: string; type: "news" | "winner" | "promo" | "alert" | "system";
  link_url: string; display_order: number; is_active: boolean; created_at: string;
}

export const NEWS_FEEDS: NewsFeed[] = [
  { id: "fd-1", title: "สมาชิกคุณสมชายถูกรางวัลที่ 1 งวด 16 สิงหา", body: "ถูกรางวัลที่ 1 รับเงิน 4,200,000 บาท โอนเข้าบัญชีเรียบร้อยแล้ว", type: "winner", link_url: "", display_order: 1, is_active: true, created_at: "17/08/2569 10:20" },
  { id: "fd-2", title: "โปรฝากแรกของวันรับเพิ่ม 20%", body: "ฝากครั้งแรกของวันขั้นต่ำ 500 บาท รับโบนัสเพิ่ม 20% สูงสุด 3,000 บาท", type: "promo", link_url: "/promotions", display_order: 2, is_active: true, created_at: "20/08/2569 08:00" },
  { id: "fd-3", title: "เปิดให้แทงหวยฮานอยพิเศษงวดใหม่", body: "เพิ่มงวดพิเศษทุกวันเสาร์ ออกผล 20:30 น. อัตราจ่ายเท่าเดิม", type: "news", link_url: "/lottery/HANOI", display_order: 3, is_active: true, created_at: "25/08/2569 14:45" },
  { id: "fd-4", title: "แจ้งเตือน: ระบบปรับปรุงเวลา 03:00-04:00", body: "งวดหวยหนึ่งนาทีจะหยุดชั่วคราวระหว่างปรับปรุง ขออภัยในความไม่สะดวก", type: "alert", link_url: "", display_order: 4, is_active: true, created_at: "28/08/2569 16:10" },
  { id: "fd-5", title: "สรุปยอดจ่ายเดือนสิงหาคม 8.4 ล้านบาท", body: "โปร่งใสทุกยอด ตรวจสอบได้จากหน้าผลรางวัลย้อนหลัง", type: "news", link_url: "/results", display_order: 5, is_active: false, created_at: "01/09/2569 09:30" },
];

// ── Appearance settings (หน้ารูปลักษณ์) ──────────────────────────────────────
export const APPEARANCE_SETTINGS = {
  primary_color: "#287e0b",
  logo_url: "",
  favicon_url: "",
  font_family: "IBM Plex Sans Thai",
  default_mode: "light",
  login_bg_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=60",
};

export const PRIMARY_PALETTE = [
  { name: "เขียวโลโก้", value: "#287e0b" },
  { name: "น้ำเงิน", value: "#2563eb" },
  { name: "ม่วง", value: "#7c3aed" },
  { name: "ชมพู", value: "#e11d48" },
  { name: "ส้มอำพัน", value: "#d97706" },
  { name: "ฟ้า", value: "#0284c7" },
];

export const FONT_OPTIONS = ["IBM Plex Sans Thai", "Prompt", "Kanit", "Sarabun", "Noto Sans Thai"];

// ── Banks page (ธนาคารที่รองรับ + บัญชีรับเงิน) ──────────────────────────────
export interface BankDisplay {
  code: string; display_order: number; is_active: boolean; auto_check: boolean;
}

export const BANK_DISPLAYS: BankDisplay[] = [
  { code: "kbank", display_order: 1, is_active: true, auto_check: true },
  { code: "scb", display_order: 2, is_active: true, auto_check: true },
  { code: "bbl", display_order: 3, is_active: true, auto_check: true },
  { code: "ktb", display_order: 4, is_active: true, auto_check: true },
  { code: "bay", display_order: 5, is_active: true, auto_check: true },
  { code: "ttb", display_order: 6, is_active: true, auto_check: false },
  { code: "gsb", display_order: 7, is_active: true, auto_check: false },
  { code: "baac", display_order: 8, is_active: false, auto_check: false },
  { code: "ghb", display_order: 9, is_active: false, auto_check: false },
  { code: "isbt", display_order: 10, is_active: false, auto_check: false },
];

export interface BankAccountBook {
  id: string; bank_code: string; account_no: string; account_name: string;
  branch: string; qr_code_url: string; account_type: "deposit" | "withdraw";
  is_default: boolean; is_active: boolean;
}

export const BANK_ACCOUNT_BOOK: BankAccountBook[] = [
  { id: "bk-1", bank_code: "kbank", account_no: "1234567890", account_name: "บริษัท ทีเอช ล็อตโต้ จำกัด", branch: "สาขาสีลม", qr_code_url: "", account_type: "deposit", is_default: true, is_active: true },
  { id: "bk-2", bank_code: "scb", account_no: "2098765432", account_name: "บริษัท ทีเอช ล็อตโต้ จำกัด", branch: "สาขาอโศก", qr_code_url: "", account_type: "deposit", is_default: false, is_active: true },
  { id: "bk-3", bank_code: "bbl", account_no: "8880001112223", account_name: "บริษัท ทีเอช ล็อตโต้ จำกัด", branch: "สาขาเยาวราช", qr_code_url: "", account_type: "deposit", is_default: false, is_active: true },
  { id: "bk-4", bank_code: "kbank", account_no: "9876543210", account_name: "สำนักงานบัญชีกลาง TL", branch: "สาขาเอกมัย", qr_code_url: "", account_type: "withdraw", is_default: true, is_active: true },
  { id: "bk-5", bank_code: "bay", account_no: "4567890123", account_name: "สำนักงานบัญชีกลาง TL", branch: "สาขาลาดพร้าว", qr_code_url: "", account_type: "withdraw", is_default: false, is_active: false },
];

// ── Broadcast history (หน้าแจ้งเตือน Broadcast — admin_broadcast_notification) ──
export interface BroadcastMsg {
  id: string; title: string; body: string; type: "info" | "warning" | "success";
  audience: "all" | "individual"; recipient: string; sent_by: string;
  sent_at: string; reached: number;
}

export const BROADCAST_HISTORY: BroadcastMsg[] = [
  { id: "bc-1", title: "งวด 16 ต.ค. เปิดรับแล้ว", body: "เปิดรับแทงหวยรัฐบาลงวดล่าสุดแล้ว ปิดรับ 14:30 น.", type: "info", audience: "all", recipient: "สมาชิกทั้งหมด (4,892 คน)", sent_by: "เจ้าของเว็บ", sent_at: "01/09/2569 09:00", reached: 4892 },
  { id: "bc-2", title: "ปิดปรับปรุงระบบ 03:00-04:00", body: "ระบบจะหยุดชั่วคราวเพื่อปรับปรุง โปรดวางแผนใช้งาน", type: "warning", audience: "all", recipient: "สมาชิกทั้งหมด (4,850 คน)", sent_by: "เจ้าของเว็บ", sent_at: "28/08/2569 20:15", reached: 4850 },
  { id: "bc-3", title: "แจ้งเตือนเทิร์นโอเวอร์ค้าง", body: "คุณมียอดเทิร์นโอเวอร์ค้าง ฿3,200 โปรดทำให้ครบก่อนถอน", type: "warning", audience: "individual", recipient: "สมชาย ใจดี (081-234-5678)", sent_by: "แอดมินสมศรี", sent_at: "30/08/2569 13:40", reached: 1 },
  { id: "bc-4", title: "ขอบคุณที่ใช้บริการ 🎉", body: "ครบ 1 ปีของเว็บ รับโค้ดโบนัส TLBDAY ในหน้าโปรโมชั่น", type: "success", audience: "all", recipient: "สมาชิกทั้งหมด (4,780 คน)", sent_by: "เจ้าของเว็บ", sent_at: "20/08/2569 12:00", reached: 4780 },
  { id: "bc-5", title: "ถอนเงินสำเร็จแล้ว", body: "รายการถอน ฿8,000 เข้าบัญชีกสิกรไทย ท้าย 4321 เรียบร้อย", type: "success", audience: "individual", recipient: "ประเสริฐ เงินงาม (089-555-1234)", sent_by: "แอดมินสมชาย", sent_at: "31/08/2569 17:22", reached: 1 },
];

// ── DB table stats (หน้า Backup & ข้อมูล) ────────────────────────────────────
export interface DbTableStat {
  table: string; rows: number; size_mb: number; group: string;
}

export const DB_TABLE_STATS: DbTableStat[] = [
  { table: "bets", rows: 128450, size_mb: 412.8, group: "ล็อตเตอรี่" },
  { table: "lottery_results", rows: 3410, size_mb: 12.4, group: "ล็อตเตอรี่" },
  { table: "draw_schedules", rows: 2180, size_mb: 3.1, group: "ล็อตเตอรี่" },
  { table: "restricted_numbers", rows: 640, size_mb: 0.4, group: "ล็อตเตอรี่" },
  { table: "transactions", rows: 89210, size_mb: 201.6, group: "การเงิน" },
  { table: "deposit_requests", rows: 15320, size_mb: 45.2, group: "การเงิน" },
  { table: "withdraw_requests", rows: 11840, size_mb: 38.9, group: "การเงิน" },
  { table: "profiles", rows: 4892, size_mb: 8.7, group: "สมาชิก" },
  { table: "wallets", rows: 4892, size_mb: 2.2, group: "สมาชิก" },
  { table: "instant_draws", rows: 44120, size_mb: 96.3, group: "หวยหนึ่งนาที" },
  { table: "notifications", rows: 21340, size_mb: 15.8, group: "แจ้งเตือน" },
  { table: "login_attempts", rows: 56700, size_mb: 22.5, group: "ความปลอดภัย" },
];

export interface BackupLog {
  id: string; type: "csv" | "database" | "json"; scope: string;
  file_size: string; rows_exported: number; by: string; at: string;
}

export const BACKUP_LOGS: BackupLog[] = [
  { id: "bp-1", type: "database", scope: "สำรองทั้งระบบ", file_size: "842.3 MB", rows_exported: 388686, by: "ระบบ (อัตโนมัติ)", at: "01/09/2569 04:00" },
  { id: "bp-2", type: "csv", scope: "รายการแทง (สำรองก่อนล้างข้อมูล)", file_size: "196.4 MB", rows_exported: 128450, by: "fn_log_csv_backup", at: "01/09/2569 04:05" },
  { id: "bp-3", type: "csv", scope: "ธุรกรรม สิงหาคม 2569", file_size: "38.2 MB", rows_exported: 22140, by: "เจ้าของเว็บ", at: "31/08/2569 23:58" },
  { id: "bp-4", type: "json", scope: "การตั้งค่าและรูปลักษณ์", file_size: "0.2 MB", rows_exported: 86, by: "เจ้าของเว็บ", at: "25/08/2569 10:12" },
  { id: "bp-5", type: "database", scope: "สำรองทั้งระบบ", file_size: "828.9 MB", rows_exported: 361204, by: "ระบบ (อัตโนมัติ)", at: "25/08/2569 04:00" },
];
