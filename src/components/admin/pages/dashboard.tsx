"use client";

import * as React from "react";
import {
  Banknote, ArrowUpFromLine, Dices, Trophy, Hourglass, UserPlus, TrendingUp,
  UserCheck, Gauge, Send, Eye, CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Panel, StatCard, StatusBadge, Avatar, BankBadge, RealtimeDot, EmptyState, MarketLogo } from "../primitives";
import {
  MARKETS, fmtTHB, fmtNum, fmtDT, mktShort,
  type FeedItem,
} from "@/data/admin-mock";
import { formatBetTypeThai } from "./bets";
import { LottoBall } from "./instant";
import { cn } from "@/lib/utils";

function AlertBadge({ kind }: { kind: NonNullable<FeedItem["alert"]> }) {
  if (kind === "LOTTERY_ALERT")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <CircleDot className="size-3" /> ใกล้ปิดรับ
      </span>
    );
  if (kind === "LOTTERY_CLOSED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        <CircleDot className="size-3" /> ปิดรับแทงแล้ว
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
      <CircleDot className="size-3" /> ประกาศผลรางวัลแล้ว
    </span>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  if (item.kind === "alert") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 ring-brand-50 ring-inset hover:bg-neutral-50/70">
        <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Trophy className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-800">
            {item.alert_market}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">แจ้งเตือนตลาดหวย</p>
        </div>
        <AlertBadge kind={item.alert!} />
        <span className="hidden w-24 shrink-0 text-right text-[11px] text-neutral-400 sm:block">{fmtDT(item.time)}</span>
      </div>
    );
  }

  if (item.kind === "bet") {
    const mkt = MARKETS.find(
      (m) => m.code === item.market_code || m.name === item.market
    );
    const logoUrl = item.market_logo || mkt?.logo_url;
    const betTypeThai = formatBetTypeThai(item.bet_type ?? "");

    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/70 transition-colors">
        <Avatar name={item.member?.full_name ?? "?"} imageUrl={item.member?.avatar_url} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-800">
            {item.member?.full_name}
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{item.member?.member_id}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
            <MarketLogo
              logoUrl={logoUrl}
              name={item.market}
              code={item.market_code}
              color={item.market_color}
              size="sm"
              className="size-5"
            />
            <span className="font-medium text-neutral-700">{item.market}</span>
            <span className="text-neutral-300">·</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
              {betTypeThai}
            </span>
            <div className="flex items-center gap-0.5">
              {String(item.numbers ?? "")
                .split("")
                .map((digit, idx) => (
                  <LottoBall key={idx} digit={digit} size="sm" />
                ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-neutral-900">{fmtTHB(item.amount ?? 0)}</p>
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            {item.status ? <StatusBadge status={item.status} /> : <StatusBadge status="pending" />}
            <span className="hidden text-[11px] text-neutral-400 sm:inline">{fmtDT(item.time)}</span>
          </div>
        </div>
      </div>
    );
  }

  const isDep = item.kind === "deposit";
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/70">
      <Avatar name={item.member?.full_name ?? "?"} imageUrl={item.member?.avatar_url} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-800">
          {item.member?.full_name}
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{item.member?.member_id}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", isDep ? "bg-brand-50 text-brand-600" : "bg-rose-50 text-rose-600")}>
            {isDep ? "ฝาก" : "ถอน"}
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500">
          <BankBadge code={item.bank_code ?? ""} />
          {item.account_no ? <span className="font-mono text-neutral-400">{item.account_no}</span> : null}
          {item.account_name ? <span className="text-neutral-400">· {item.account_name}</span> : null}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-neutral-900">{fmtTHB(item.amount ?? 0)}</p>
        <div className="mt-0.5 flex items-center justify-end gap-2">
          {item.status ? <StatusBadge status={item.status} /> : null}
          <span className="text-[11px] text-neutral-400">{fmtDT(item.time)}</span>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "deposit", label: "ฝาก" },
  { key: "withdraw", label: "ถอน" },
  { key: "bet", label: "โพย" },
  { key: "alert", label: "แจ้งเตือน" },
] as const;

export function DashboardPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("all");
  const [liveStats, setLiveStats] = React.useState<any>(null);
  const [liveFeed, setLiveFeed] = React.useState<FeedItem[]>([]);

  React.useEffect(() => {
    async function loadDash() {
      try {
        const res = await fetch("/api/admin/data?resource=dashboard");
        const json = await res.json();
        if (json.success && json.data) {
          setLiveStats(json.data);

          const betsFeed: FeedItem[] = (json.data.recentBets || []).map((b: any) => {
            const mkt = MARKETS.find(
              (m) => m.id === b.market_id || m.code === b.lottery_markets?.code || m.name === b.lottery_markets?.name
            );
            const statusUpper = (b.status || "PENDING").toUpperCase();
            const mappedStatus = statusUpper === "WON" ? "won" : statusUpper === "LOST" ? "lost" : "pending";

            return {
              id: `bet-${b.id}`,
              time: b.created_at,
              kind: "bet",
              member: {
                full_name: b.profiles?.full_name || "สมาชิก",
                member_id: b.profiles?.member_id || (b.user_id ? b.user_id.slice(0, 8) : "MB"),
                phone: "-",
                avatar_url: b.profiles?.avatar_url || null,
                bank_code: "KBANK",
                bank_account_number: "-",
                vip_level: 0,
              },
              market: b.lottery_markets?.name || mkt?.name || "หวย",
              market_code: b.lottery_markets?.code || mkt?.code || "MKT",
              market_color: b.lottery_markets?.color || mkt?.color || "#059669",
              market_logo: b.lottery_markets?.logo_url || mkt?.logo_url || null,
              bet_type: b.bet_type,
              numbers: b.numbers || b.number || "00",
              amount: Number(b.amount),
              status: mappedStatus,
            };
          });

          const depsFeed: FeedItem[] = (json.data.recentDeposits || []).map((d: any) => ({
            id: `dep-${d.id}`,
            time: d.created_at,
            kind: "deposit",
            member: {
              full_name: d.profiles?.full_name || "สมาชิก",
              member_id: d.profiles?.member_id || (d.user_id ? d.user_id.slice(0, 8) : "MB"),
              phone: "-",
              avatar_url: d.profiles?.avatar_url || null,
              bank_code: d.profiles?.bank_name || "KBANK",
              bank_account_number: d.profiles?.bank_account_number || "-",
              vip_level: 0,
            },
            amount: Number(d.amount),
            bank_code: d.profiles?.bank_name || "KBANK",
            account_no: d.profiles?.bank_account_number,
            account_name: d.profiles?.bank_account_name,
            status: d.status,
          }));

          const merged = [...betsFeed, ...depsFeed].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setLiveFeed(merged);
        }
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    }
    loadDash();
  }, []);

  const s = liveStats ? {
    total_deposit_today: liveStats.todayDeposit ?? 0,
    total_withdraw_today: liveStats.todayWithdraw ?? 0,
    total_bet_today: liveStats.todayBet ?? 0,
    total_payout_today: liveStats.todayPayout ?? 0,
    pending_deposits: liveStats.depositPendingCount ?? 0,
    pending_withdrawals: liveStats.withdrawPendingCount ?? 0,
    new_members_today: liveStats.memberCount ?? 0,
    net_profit_today: ((liveStats.todayDeposit ?? 0) + (liveStats.todayBet ?? 0)) - (liveStats.todayPayout ?? 0),
    active_members_7d: liveStats.memberCount ?? 0,
    bet_rate_per_person: liveStats.memberCount > 0 ? (liveStats.betCount / liveStats.memberCount) : 0,
    withdrawal_rate: (liveStats.totalDeposit > 0) ? ((liveStats.totalWithdraw / liveStats.totalDeposit) * 100) : 0,
  } : {
    total_deposit_today: 0,
    total_withdraw_today: 0,
    total_bet_today: 0,
    total_payout_today: 0,
    pending_deposits: 0,
    pending_withdrawals: 0,
    new_members_today: 0,
    net_profit_today: 0,
    active_members_7d: 0,
    bet_rate_per_person: 0,
    withdrawal_rate: 0,
  };

  const [bettorPeriod, setBettorPeriod] = React.useState<"all" | "7d" | "today">("all");

  const activeTopBettors: {
    rank: number;
    user_id?: string;
    name: string;
    member_id: string;
    avatar_url?: string | null;
    total_bet: number;
    bet_count?: number;
  }[] = (
    bettorPeriod === "today"
      ? liveStats?.topBettorsGrouped?.today
      : bettorPeriod === "7d"
      ? liveStats?.topBettorsGrouped?.week
      : liveStats?.topBettorsGrouped?.all || liveStats?.topBettors
  ) || [];
  const maxBet = activeTopBettors[0]?.total_bet || 1;
  const weeklyChartData = liveStats?.weeklyChart || [];

  const feed = liveFeed.filter((f) => filter === "all" || f.kind === filter).slice(0, 30);

  return (
    <div className="space-y-5">
      {/* KPI Row 1 + 2 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Banknote} label="ยอดฝากวันนี้" value={fmtTHB(s.total_deposit_today)} tone="brand" />
        <StatCard icon={ArrowUpFromLine} label="ยอดถอนวันนี้" value={fmtTHB(s.total_withdraw_today)} tone="rose" />
        <StatCard icon={Dices} label="ยอดแทงวันนี้" value={fmtTHB(s.total_bet_today)} tone="amber" />
        <StatCard icon={Trophy} label="ยอดจ่ายรางวัล" value={fmtTHB(s.total_payout_today)} tone="neutral" />
        <StatCard icon={Hourglass} label="รอฝาก" value={`${s.pending_deposits} รายการ`} sub="รอการอนุมัติจากแอดมิน" tone="amber" />
        <StatCard icon={Hourglass} label="รอถอน" value={`${s.pending_withdrawals} รายการ`} sub="รอโอนเงินให้สมาชิก" tone="amber" />
        <StatCard icon={UserPlus} label="สมาชิกใหม่วันนี้" value={`${s.new_members_today} คน`} sub="สมัครใหม่วันนี้" tone="brand" />
        <StatCard icon={TrendingUp} label="กำไร/ขาดทุนวันนี้" value={fmtTHB(s.net_profit_today)} sub="คำนวณสุทธิวันนี้" tone="brand" />
      </div>

      {/* Advanced Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={UserCheck} label="สมาชิกใช้งาน 7 วัน" value={fmtNum(s.active_members_7d)} sub="เข้าใช้งานในรอบ 7 วัน" tone="sky" />
        <StatCard icon={Gauge} label="เฉลี่ยแทงต่อคน" value={`${fmtNum(s.bet_rate_per_person, 1)} โพย`} sub="โพยต่อสมาชิกที่ยังเล่น" tone="amber" />
        <StatCard icon={Send} label="อัตราถอน" value={`${fmtNum(s.withdrawal_rate, 1)}%`} sub="ยอดถอน ÷ ยอดฝาก" tone="rose" />
      </div>

      {/* Chart */}
      <Panel className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">ภาพรวม 7 วันย้อนหลัง</h2>
            <p className="mt-0.5 text-xs text-neutral-500">ข้อมูลจากธุรกรรมจริง: ฝาก · ถอน · แทง (บาท)</p>
          </div>
          <RealtimeDot label="เชื่อมต่อข้อมูลสด Supabase" />
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#737373" }} dy={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => fmtTHB(Number(v))} contentStyle={{ borderRadius: 16, border: "1px solid #e5e5e5", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Bar dataKey="DEPOSIT" name="ฝาก" fill="#287e0b" radius={[6, 6, 0, 0]} maxBarSize={26} />
              <Bar dataKey="WITHDRAW" name="ถอน" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={26} />
              <Bar dataKey="BET" name="แทง" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Feed + Top10 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900">ฟีดกิจกรรมล่าสุด</h2>
              <p className="mt-0.5 text-xs text-neutral-500">ฝาก · ถอน · โพย · แจ้งเตือนตลาดหวย (ข้อมูลจริงล่าสุด)</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    filter === f.key
                      ? "bg-white text-neutral-900 shadow-sm font-bold scale-[1.02]"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[520px] divide-y divide-neutral-100 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
            {feed.length ? (
              <div className="animate-in fade-in duration-200 divide-y divide-neutral-100">
                {feed.map((item) => <FeedRow key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="p-8">
                <EmptyState title="ยังไม่มีกิจกรรมล่าสุด" desc="รายการฝาก ถอน และการแทงจะปรากฏที่นี่แบบเรียลไทม์" />
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2.5 border-b border-neutral-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">อันดับผู้แทงสูงสุด</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ดึงสดจาก DB
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                {bettorPeriod === "today" && "ยอดแทงสะสมวันนี้ (คำนวณจากตาราง public.bets)"}
                {bettorPeriod === "7d" && "ยอดแทงสะสมย้อนหลัง 7 วัน (นับเฉพาะโพยจริง)"}
                {bettorPeriod === "all" && "ยอดแทงสะสมตลอดกาลทุกโพยในระบบ"}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 text-xs font-semibold text-neutral-600">
              <button
                type="button"
                onClick={() => setBettorPeriod("all")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer",
                  bettorPeriod === "all" ? "bg-white text-neutral-900 shadow-sm font-bold scale-[1.02]" : "hover:text-neutral-900 hover:bg-neutral-200/50"
                )}
              >
                ทั้งหมด ({liveStats?.topBettorsGrouped?.all?.length ?? (liveStats?.topBettors?.length || 0)})
              </button>
              <button
                type="button"
                onClick={() => setBettorPeriod("7d")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer",
                  bettorPeriod === "7d" ? "bg-white text-neutral-900 shadow-sm font-bold scale-[1.02]" : "hover:text-neutral-900 hover:bg-neutral-200/50"
                )}
              >
                7 วันล่าสุด ({liveStats?.topBettorsGrouped?.week?.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setBettorPeriod("today")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer",
                  bettorPeriod === "today" ? "bg-white text-neutral-900 shadow-sm font-bold scale-[1.02]" : "hover:text-neutral-900 hover:bg-neutral-200/50"
                )}
              >
                วันนี้ ({liveStats?.topBettorsGrouped?.today?.length ?? 0})
              </button>
            </div>
          </div>

          {activeTopBettors.length === 0 ? (
            <div className="p-8 animate-in fade-in duration-200">
              {bettorPeriod === "today" ? (
                <EmptyState
                  title="ยังไม่มีการแทงวันนี้ (0 รายการ)"
                  desc="วันนี้ยังไม่มีสมาชิกส่งโพยในตาราง bets — ข้อมูลจะปรากฏทันทีเมื่อมีโพยแรกของวัน (สลับดูแท็บ '7 วันล่าสุด' หรือ 'ทั้งหมด' เพื่อดูสมาชิกที่มียอดแทงจริง)"
                />
              ) : (
                <EmptyState
                  title="ยังไม่มีข้อมูลผู้แทง"
                  desc="ระบบจะคำนวณและจัดอันดับอัตโนมัติจากตาราง bets ทันทีที่มีการแทง"
                />
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 animate-in fade-in duration-200">
              {activeTopBettors.map((t) => (
                <div key={`${bettorPeriod}-${t.rank}-${t.member_id}`} className="flex items-center gap-3 px-4 py-3 sm:px-5 hover:bg-neutral-50/70 transition-colors">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm",
                      t.rank === 1
                        ? "bg-amber-400 text-neutral-950 font-black"
                        : t.rank === 2
                        ? "bg-neutral-200 text-neutral-800 font-bold"
                        : t.rank === 3
                        ? "bg-amber-700 text-white font-bold"
                        : "bg-neutral-100 text-neutral-500 font-semibold"
                    )}
                  >
                    {t.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-neutral-800">{t.name}</p>
                      {t.member_id && (
                        <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-600">
                          {t.member_id}
                        </span>
                      )}
                      {t.bet_count !== undefined && (
                        <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          {t.bet_count} โพย
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (t.total_bet / maxBet) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-black text-neutral-900">{fmtTHB(t.total_bet)}</span>
                    <p className="text-[10px] text-neutral-400 font-medium">ยอดแทงรวม</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-2 sm:px-5 flex items-center justify-between text-[11px] text-neutral-400">
            <span>แหล่งข้อมูล: ตาราง <code className="text-neutral-600 font-mono">public.bets</code> เชื่อม <code className="text-neutral-600 font-mono">profiles</code></span>
            <span>อัปเดตแบบเรียลไทม์</span>
          </div>
        </Panel>
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Panel className="flex items-center gap-4 p-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Eye className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-500">รวมรายการรอดำเนินการ</p>
            <p className="mt-0.5 truncate text-base font-bold text-neutral-900 sm:text-lg">{s.pending_deposits + s.pending_withdrawals} รายการ (ฝาก {s.pending_deposits} · ถอน {s.pending_withdrawals})</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><TrendingUp className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-500">อัตราการชนะ (จ่าย ÷ แทง) วันนี้</p>
            <p className="mt-0.5 truncate text-base font-bold text-neutral-900 sm:text-lg">{fmtNum((s.total_payout_today / (s.total_bet_today || 1)) * 100, 1)}% ของยอดแทง</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
