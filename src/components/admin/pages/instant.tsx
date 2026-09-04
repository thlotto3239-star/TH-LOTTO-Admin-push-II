"use client";

import * as React from "react";
import { Zap, Dices, Banknote, Trophy, Users, TrendingUp, RefreshCw, Settings2, Sliders, CheckCircle2, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Panel, StatCard, StatusBadge, PageHeader, RealtimeDot, TableWrap, Th, Td, Btn } from "../primitives";
import { Switch } from "@/components/ui/switch";
import { INSTANT_STATS, INSTANT_DRAWS, INSTANT_BETS, INSTANT_HOURLY, INSTANT_BET_TYPES, InstantBetTypeConfig, fmtTHB, fmtNum } from "@/data/admin-mock";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function InstantOverviewPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "rates">("overview");
  const [tick, setTick] = React.useState(30);
  const [refreshedAt, setRefreshedAt] = React.useState("--:--:--");
  const [betTypes, setBetTypes] = React.useState<InstantBetTypeConfig[]>(INSTANT_BET_TYPES);
  const [editingType, setEditingType] = React.useState<InstantBetTypeConfig | null>(null);
  const [editRate, setEditRate] = React.useState<number>(0);
  const [editMaxBet, setEditMaxBet] = React.useState<number>(0);
  const { toast } = useToast();

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

  // Live Supabase Sync for 9 Bet Types
  React.useEffect(() => {
    fetch("/api/admin/data?resource=instant-bet-types")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setBetTypes((prev) =>
            prev.map((bt) => {
              const live = res.data.find((d: any) => d.code === bt.code);
              if (!live) return bt;
              return {
                ...bt,
                payout_rate: parseFloat(live.rate) || bt.payout_rate,
                is_active: live.is_active,
              };
            })
          );
        }
      })
      .catch((e) => console.error("Could not fetch live instant bet types:", e));
  }, []);

  const handleToggle = async (code: string) => {
    const target = betTypes.find((b) => b.code === code);
    if (!target) return;
    const nextState = !target.is_active;

    setBetTypes((prev) =>
      prev.map((bt) => (bt.code === code ? { ...bt, is_active: nextState } : bt))
    );

    toast({
      title: nextState ? "เปิดรับแทงแล้ว" : "ปิดรับแทงชั่วคราว",
      description: `${target.name_th} (${target.code}) เปลี่ยนสถานะเป็น ${nextState ? "เปิดใช้งาน" : "ปิดชั่วคราว"}`,
    });

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_instant_bet_type",
          payload: { id: target.id, rate: target.payout_rate, is_active: nextState },
        }),
      });
    } catch (e) {
      console.error("Failed to sync toggle to Supabase:", e);
    }
  };

  const handleOpenEdit = (bt: InstantBetTypeConfig) => {
    setEditingType(bt);
    setEditRate(bt.payout_rate);
    setEditMaxBet(bt.max_bet);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setBetTypes((prev) =>
      prev.map((bt) =>
        bt.code === editingType.code ? { ...bt, payout_rate: editRate, max_bet: editMaxBet } : bt
      )
    );
    toast({
      title: "บันทึกอัตราจ่ายสำเร็จ",
      description: `ปรับปรุง ${editingType.name_th} อัตราจ่ายเป็น ${editRate}x สูงสุด ${fmtTHB(editMaxBet)}`,
    });

    const targetId = editingType.id;
    setEditingType(null);

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_instant_bet_type",
          payload: { id: targetId, rate: editRate, is_active: editingType.is_active },
        }),
      });
    } catch (err) {
      console.error("Failed to sync rate to Supabase:", err);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="หวยหนึ่งนาที (Instant 1-Minute)" description="ข้อมูลหวยหนึ่งนาที · สถิติสด รอบออกรางวัล รายการแทง และตั้งค่าอัตราจ่าย 9 รูปแบบ">
        <div className="flex items-center gap-2">
          <RealtimeDot label="อัปเดตอัตโนมัติ 30 วินาที" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
            <RefreshCw className={cn("size-3", tick === 30 && "animate-spin")} /> รีเฟรชในอีก {tick} วิ · ล่าสุด {refreshedAt}
          </span>
        </div>
      </PageHeader>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-bold transition-all",
            activeTab === "overview"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Zap className="size-4" /> ภาพรวมสถิติและมอนิเตอร์สด
        </button>
        <button
          onClick={() => setActiveTab("rates")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-bold transition-all",
            activeTab === "rates"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Sliders className="size-4" /> ตั้งค่าอัตราจ่าย 9 รูปแบบ (Bet Types)
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            9 ชนิด
          </span>
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
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
        </>
      ) : (
        /* Bet Types & Payout Rates Tab */
        <div className="space-y-4">
          <Panel className="p-4 sm:p-6">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  โครงสร้างรูปแบบการแทงและอัตราจ่าย 9 ชนิด (public.instant_bet_types)
                </h3>
                <p className="text-xs text-neutral-500">
                  ควบคุมการเปิด/ปิดรับแทงชั่วคราว และปรับเปลี่ยนตัวคูณอัตราจ่ายรางวัลสำหรับหวยเร็ว 1 นาที
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  เปิดรับแทง {betTypes.filter((b) => b.is_active).length} / 9 ชนิด
                </span>
              </div>
            </div>

            <TableWrap>
              <thead>
                <tr>
                  <Th>รหัสประเภท</Th>
                  <Th>ชื่อประเภทการแทง</Th>
                  <Th className="text-center">ความยาวตัวเลข</Th>
                  <Th className="text-right">อัตราจ่าย (เท่า)</Th>
                  <Th className="text-right">แทงขั้นต่ำ</Th>
                  <Th className="text-right">แทงสูงสุด/รอบ</Th>
                  <Th className="text-center">สถานะรับแทง</Th>
                  <Th className="text-right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {betTypes.map((bt) => (
                  <tr key={bt.code} className="transition-colors hover:bg-neutral-50/70">
                    <Td className="font-mono text-xs font-bold text-brand-700">{bt.code}</Td>
                    <Td className="font-medium text-neutral-900">{bt.name_th}</Td>
                    <Td className="text-center">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-bold text-neutral-700">
                        {bt.digit_length} หลัก
                      </span>
                    </Td>
                    <Td className="text-right">
                      <span className="font-mono text-sm font-black text-amber-600">
                        {fmtNum(bt.payout_rate)}x
                      </span>
                    </Td>
                    <Td className="text-right text-xs font-medium text-neutral-600">
                      {fmtTHB(bt.min_bet)}
                    </Td>
                    <Td className="text-right text-xs font-semibold text-neutral-800">
                      {fmtTHB(bt.max_bet)}
                    </Td>
                    <Td className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={bt.is_active}
                          onCheckedChange={() => handleToggle(bt.code)}
                        />
                      </div>
                    </Td>
                    <Td className="text-right">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(bt)}
                        className="gap-1 text-xs"
                      >
                        <Settings2 className="size-3.5" /> แก้ไขอัตรา
                      </Btn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Panel>
        </div>
      )}

      {/* Edit Rate Modal */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-5 text-brand-600" />
                <h3 className="font-bold text-neutral-900">แก้ไขอัตราจ่าย — {editingType.name_th}</h3>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium text-neutral-700">รหัสประเภท (Code)</label>
                <input
                  type="text"
                  disabled
                  value={editingType.code}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 font-mono text-xs font-bold text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-neutral-700">อัตราจ่ายรางวัล (ตัวคูณเท่า / บาทละ)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={editRate}
                    onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 font-mono font-bold text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <span className="absolute right-3 top-2 font-semibold text-neutral-400">เท่า</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  สเปกมาตรฐานฐานข้อมูล: 2 ตัว = 90x, 3 ตัวบน = 900x, 3 โต๊ด = 180x, 6 ตัวตรง = 15,000x
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-neutral-700">เพดานรับแทงสูงสุด/โพย (บาท)</label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={editMaxBet}
                  onChange={(e) => setEditMaxBet(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 font-mono text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Btn type="button" variant="outline" onClick={() => setEditingType(null)}>
                  ยกเลิก
                </Btn>
                <Btn type="submit" variant="brand" className="gap-1.5">
                  <CheckCircle2 className="size-4" /> บันทึกการเปลี่ยนแปลง
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
