"use client";

import * as React from "react";
import { Zap, Dices, Banknote, Trophy, Users, TrendingUp, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Panel, StatCard, StatusBadge, PageHeader, RealtimeDot, TableWrap, Th, Td } from "../primitives";
import { INSTANT_STATS, INSTANT_DRAWS, INSTANT_BETS, INSTANT_HOURLY, fmtTHB, fmtNum } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

export function InstantOverviewPage() {
  const [tick, setTick] = React.useState(30);
  const [refreshedAt, setRefreshedAt] = React.useState("--:--:--");

  // Auto-refresh ทุก 30 วินาที (ตามสเปก admin_get_instant_stats)
  React.useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => {
        if (t <= 1) {
          setRefreshedAt(new Date().toLocaleTimeString("th-TH"));
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    setRefreshedAt(new Date().toLocaleTimeString("th-TH"));
    return () => clearInterval(iv);
  }, []);

  const s = INSTANT_STATS;
  const net = s.total_bet_amount_today - s.total_payout_today;

  return (
    <div className="space-y-5">
      <PageHeader title="หวยหนึ่งนาที — ภาพรวม" description="ข้อมูลหวยหนึ่งนาที · สถิติ รอบออกรางวัล และรายการแทง">
        <RealtimeDot label="อัปเดตอัตโนมัติ 30 วินาที" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
          <RefreshCw className={cn("size-3", tick === 30 && "animate-spin")} /> รีเฟรชในอีก {tick} วิ · ล่าสุด {refreshedAt}
        </span>
      </PageHeader>

      {/* KPI 6 cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Zap} label="รอบวันนี้" value={fmtNum(s.total_draws_today)} sub="งวด" tone="amber" />
        <StatCard icon={Dices} label="รายการแทงวันนี้" value={fmtNum(s.total_bets_today)} sub="โพย" tone="brand" />
        <StatCard icon={Banknote} label="ยอดแทงรวม" value={fmtTHB(s.total_bet_amount_today)} tone="brand" />
        <StatCard icon={Trophy} label="ยอดจ่ายรางวัล" value={fmtTHB(s.total_payout_today)} tone="rose" />
        <StatCard icon={Users} label="ผู้เล่นที่ยังเล่น" value={fmtNum(s.active_players_today)} sub="คน" tone="sky" />
        <StatCard icon={TrendingUp} label="กำไร/ขาดทุนสุทธิ" value={fmtTHB(net)} sub="แทง − จ่ายรางวัล" tone={net >= 0 ? "brand" : "rose"} />
      </div>

      {/* Chart */}
      <Panel className="p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-neutral-900">ยอดแทงเทียบยอดจ่ายรางวัล รายชั่วโมง</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INSTANT_HOURLY} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => fmtTHB(Number(v))} contentStyle={{ borderRadius: 16, border: "1px solid #e5e5e5", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="BET" name="ยอดแทง" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="PAYOUT" name="ยอดจ่าย" fill="#287e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Tables */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="min-w-0">
          <p className="border-b border-neutral-100 px-4 py-3.5 text-sm font-bold text-neutral-900">
            งวดออกรางวัลล่าสุด 10 รายการ
          </p>
          <TableWrap>
            <thead>
              <tr><Th>รหัสรอบ</Th><Th>เวลา</Th><Th>สถานะ</Th><Th>ผลรางวัล</Th><Th className="text-right">โพย</Th><Th className="text-right">ยอดแทง</Th><Th className="text-right">ยอดจ่าย</Th></tr>
            </thead>
            <tbody>
              {INSTANT_DRAWS.map((d) => (
                <tr key={d.draw_id} className="transition-colors hover:bg-neutral-50/70">
                  <Td className="font-mono text-xs font-bold text-neutral-800">{d.draw_id}</Td>
                  <Td className="whitespace-nowrap text-xs">{d.draw_time}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td>
                    {d.result ? (
                      <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-mono text-sm font-black tracking-widest text-brand-700">{d.result}</span>
                    ) : (
                      <span className="text-xs text-neutral-300">รอออกผล</span>
                    )}
                  </Td>
                  <Td className="text-right text-xs">{d.bet_count}</Td>
                  <Td className="whitespace-nowrap text-right text-xs font-semibold">{fmtTHB(d.total_bet)}</Td>
                  <Td className={cn("whitespace-nowrap text-right text-xs font-semibold", d.total_payout > 0 ? "text-rose-600" : "text-neutral-400")}>
                    {d.total_payout > 0 ? fmtTHB(d.total_payout) : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>

        <Panel className="min-w-0">
          <p className="border-b border-neutral-100 px-4 py-3.5 text-sm font-bold text-neutral-900">
            รายการแทงล่าสุด 10 รายการ
          </p>
          <TableWrap>
            <thead>
              <tr><Th>สมาชิก</Th><Th>เลขที่แทง</Th><Th>ประเภท</Th><Th className="text-right">ยอดแทง</Th><Th>สถานะ</Th></tr>
            </thead>
            <tbody>
              {INSTANT_BETS.map((b, i) => (
                <tr key={i} className="transition-colors hover:bg-neutral-50/70">
                  <Td className="whitespace-nowrap font-medium text-neutral-800">{b.member_name}</Td>
                  <Td><span className="rounded-lg bg-neutral-100 px-2 py-0.5 font-mono text-sm font-black tracking-widest text-neutral-800">{b.numbers}</span></Td>
                  <Td className="whitespace-nowrap text-xs">{b.bet_type}</Td>
                  <Td className="whitespace-nowrap text-right text-xs font-semibold">{fmtTHB(b.amount)}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      </div>
    </div>
  );
}
