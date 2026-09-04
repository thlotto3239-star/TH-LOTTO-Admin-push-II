"use client";

import * as React from "react";
import {
  Banknote, ArrowUpFromLine, Dices, Trophy, Hourglass, UserPlus, TrendingUp,
  UserCheck, Gauge, Send, Eye, CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Panel, StatCard, StatusBadge, Avatar, BankBadge, RealtimeDot, EmptyState } from "../primitives";
import {
  DASH_STATS, WEEKLY_CHART, ACTIVITY_FEED, TOP10_BETTORS, fmtTHB, fmtNum, fmtDT, mktShort,
  type FeedItem,
} from "@/data/admin-mock";
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
    return (
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/70">
        <Avatar name={item.member?.full_name ?? "?"} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-800">
            {item.member?.full_name}
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{item.member?.member_id}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="flex size-4 items-center justify-center rounded-full text-[7px] font-black text-white" style={{ backgroundColor: item.market_color }}>
              {mktShort(item.market_code ?? "")}
            </span>
            {item.market} · เลข <b className="font-mono text-neutral-700">{item.numbers}</b> ({item.bet_type})
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-neutral-900">{fmtTHB(item.amount ?? 0)}</p>
          <p className="text-[11px] text-neutral-400">{fmtDT(item.time)}</p>
        </div>
      </div>
    );
  }

  const isDep = item.kind === "deposit";
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/70">
      <Avatar name={item.member?.full_name ?? "?"} className="size-9" />
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
  const feed = ACTIVITY_FEED.filter((f) => filter === "all" || f.kind === filter).slice(0, 30);
  const s = DASH_STATS;

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
        <StatCard icon={UserPlus} label="สมาชิกใหม่วันนี้" value={`${s.new_members_today} คน`} sub="สมัครใหม่ภายใน 24 ชม." tone="brand" />
        <StatCard icon={TrendingUp} label="กำไร/ขาดทุนวันนี้" value={fmtTHB(s.net_profit_today)} sub="(ยอดแทง + ฝาก) − (จ่ายรางวัล + ถอน)" tone="brand" />
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
            <p className="mt-0.5 text-xs text-neutral-500">ข้อมูลจากธุรกรรม: ฝาก · ถอน · แทง (บาท)</p>
          </div>
          <RealtimeDot label="เชื่อมต่อข้อมูลสดอัตโนมัติ" />
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_CHART} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => fmtTHB(Number(v))} contentStyle={{ borderRadius: 16, border: "1px solid #e5e5e5", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
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
              <p className="mt-0.5 text-xs text-neutral-500">ฝาก · ถอน · โพย · แจ้งเตือนตลาดหวย (รวม 30 รายการล่าสุด)</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === f.key ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[520px] divide-y divide-neutral-100 overflow-y-auto">
            {feed.length ? feed.map((item) => <FeedRow key={item.id} item={item} />) : <EmptyState />}
          </div>
        </Panel>

        <Panel>
          <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
            <h2 className="text-base font-bold text-neutral-900">10 อันดับผู้แทงสูงสุด</h2>
            <p className="mt-0.5 text-xs text-neutral-500">ยอดแทงรวมทุกตลาด (วันนี้)</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {TOP10_BETTORS.map((t) => (
              <div key={t.rank} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    t.rank === 1 ? "bg-amber-100 text-amber-700" : t.rank <= 3 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {t.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">{t.name}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(t.total_bet / TOP10_BETTORS[0].total_bet) * 100}%` }} />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-neutral-900">{fmtTHB(t.total_bet)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Quick counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Panel className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Eye className="size-5" /></div>
          <div>
            <p className="text-sm text-neutral-500">รวมรายการรอดำเนินการ</p>
            <p className="text-lg font-bold text-neutral-900">{s.pending_deposits + s.pending_withdrawals} รายการ (ฝาก {s.pending_deposits} · ถอน {s.pending_withdrawals})</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><TrendingUp className="size-5" /></div>
          <div>
            <p className="text-sm text-neutral-500">อัตราการชนะ (จ่าย ÷ แทง) วันนี้</p>
            <p className="text-lg font-bold text-neutral-900">{fmtNum((s.total_payout_today / s.total_bet_today) * 100, 1)}% ของยอดแทง</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
