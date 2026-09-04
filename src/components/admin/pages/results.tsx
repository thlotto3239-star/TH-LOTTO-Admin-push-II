"use client";

import * as React from "react";
import { ClipboardEdit, Hash } from "lucide-react";
import { Panel, Btn, StatusBadge, PageHeader, TableWrap, Th, Td, Field, inputCls, EmptyState } from "../primitives";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DRAW_SCHEDULES, RECENT_RESULTS, fmtTHB, mktShort, type DrawSchedule, type LotteryResult } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

// ─── Digit input (จำกัดตัวเลขตามความยาว) ─────────────────────────────────────
function DigitInput({ len, value, onChange, autoFocus }: { len: number; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <Input
      inputMode="numeric"
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, len))}
      placeholder={"0".repeat(len)}
      className={cn(inputCls, "text-center font-mono text-lg font-bold tracking-[0.3em]")}
    />
  );
}

function ResultModal({ schedule, onClose, onSubmit }: { schedule: DrawSchedule; onClose: () => void; onSubmit: (s: DrawSchedule, res: ResultFields) => void }) {
  const isGov = schedule.kind === "GOVERNMENT";
  const [first, setFirst] = React.useState("");
  const [t3f, setT3f] = React.useState("");
  const [b3, setB3] = React.useState("");
  const [b2, setB2] = React.useState("");
  const [t3, setT3] = React.useState("");
  const [t2, setT2] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const { toast } = useToast();

  // auto-fill สำหรับรัฐบาล: 3ตัวบน = หลักที่ 4-6, 2ตัวบน = หลักที่ 5-6
  const auto3 = first.length === 6 ? first.slice(3) : "";
  const auto2 = first.length === 6 ? first.slice(4) : "";

  const valid = isGov
    ? first.length === 6 && t3f.length === 3 && b3.length === 3 && b2.length === 2
    : t3.length === 3 && t2.length === 2 && b2.length === 2 && (b3.length === 0 || b3.length === 3);

  const res: ResultFields = isGov
    ? { main: first, r3top: auto3, r2top: auto2, r3front: t3f, r3bottom: b3, r2bottom: b2 }
    : { main: null, r3top: t3, r2top: t2, r3front: null, r3bottom: b3 || null, r2bottom: b2 };

  const summary = {
    totalBet: schedule.total_bet,
    winners: Math.max(3, Math.round(schedule.total_bet / 9000)),
    payout: Math.round(schedule.total_bet * 0.42),
  };

  if (confirming) {
    return (
      <Dialog open onOpenChange={(o) => !o && setConfirming(false)}>
        <DialogContent className="rounded-3xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ยืนยันประกาศผลรางวัล</DialogTitle>
            <DialogDescription>ตรวจสอบสรุปยอดก่อนยืนยันผล</DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 rounded-2xl bg-neutral-50 p-4 text-sm">
            <div className="flex justify-between"><span className="text-neutral-400">ตลาด</span><span className="font-semibold text-neutral-800">{schedule.market_name} ({schedule.draw_date})</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">ผลรางวัล</span><span className="font-mono font-bold text-neutral-900">{isGov ? `${first} · 3บน ${auto3} · 2บน ${auto2} · 3หน้า ${t3f} · 3ล่าง ${b3} · 2ล่าง ${b2}` : `3บน ${t3} · 2บน ${t2} · 2ล่าง ${b2}${b3 ? ` · 3ล่าง ${b3}` : ""}`}</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">แทงรวม</span><span className="font-semibold">{fmtTHB(summary.totalBet)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">โพยที่ถูกรางวัล</span><span className="font-semibold text-brand-700">{summary.winners} โพย</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">ยอดจ่ายรางวัลรวม</span><span className="font-bold text-rose-600">{fmtTHB(summary.payout)}</span></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" className="rounded-full" onClick={() => setConfirming(false)}>กลับไปแก้</Btn>
            <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={() => { onSubmit(schedule, res); onClose(); toast({ title: "ประกาศผลรางวัลแล้ว", description: `${schedule.market_name} ตัดยอดอัตโนมัติเรียบร้อย` }); }}>ยืนยันประกาศผล</Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>กรอกผลรางวัล — {schedule.market_name}</DialogTitle>
          <DialogDescription>งวดวันที่ {schedule.draw_date} · ปิดรับ {schedule.close_time} น.</DialogDescription>
        </DialogHeader>

        {isGov ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-inset ring-brand-100">
              <p className="mb-2 text-xs font-bold text-brand-700">รางวัลที่ 1 (6 หลัก)</p>
              <DigitInput len={6} value={first} onChange={setFirst} autoFocus />
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-inset ring-brand-100">
                  <p className="text-neutral-400">3ตัวบน (auto-fill)</p>
                  <p className="font-mono text-base font-black text-brand-700">{auto3 || "—"}</p>
                </div>
                <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-inset ring-brand-100">
                  <p className="text-neutral-400">2ตัวบน (auto-fill)</p>
                  <p className="font-mono text-base font-black text-brand-700">{auto2 || "—"}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="3ตัวหน้า"><DigitInput len={3} value={t3f} onChange={setT3f} /></Field>
              <Field label="3ตัวล่าง"><DigitInput len={3} value={b3} onChange={setB3} /></Field>
              <Field label="2ตัวล่าง"><DigitInput len={2} value={b2} onChange={setB2} /></Field>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="3ตัวบน"><DigitInput len={3} value={t3} onChange={setT3} autoFocus /></Field>
              <Field label="2ตัวบน"><DigitInput len={2} value={t2} onChange={setT2} /></Field>
              <Field label="2ตัวล่าง"><DigitInput len={2} value={b2} onChange={setB2} /></Field>
              <Field label="3ตัวล่าง (ถ้ามี)"><DigitInput len={3} value={b3} onChange={setB3} /></Field>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-neutral-400"><Hash className="size-3" /> กรอกเป็นตัวเลขให้ครบตามจำนวนหลัก</p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full" disabled={!valid} onClick={() => setConfirming(true)}>ถัดไป: ตรวจสอบผล</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ResultFields {
  main: string | null;
  r3top: string;
  r2top: string;
  r3front: string | null;
  r3bottom: string;
  r2bottom: string;
}

export function ResultsPage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = React.useState<DrawSchedule[]>(DRAW_SCHEDULES);
  const [results, setResults] = React.useState<LotteryResult[]>(RECENT_RESULTS);
  const [modal, setModal] = React.useState<DrawSchedule | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [resResults, resMarkets] = await Promise.all([
        fetch("/api/admin/data?resource=results"),
        fetch("/api/admin/data?resource=markets"),
      ]);
      const jsonResults = await resResults.json();
      const jsonMarkets = await resMarkets.json();

      if (jsonResults.success && Array.isArray(jsonResults.data) && jsonResults.data.length > 0) {
        const mappedResults: LotteryResult[] = jsonResults.data.map((r: any) => ({
          id: r.id,
          market_name: r.lottery_markets?.name || "หวย",
          market_code: r.lottery_markets?.code || "MKT",
          draw_date: r.draw_date,
          result_main: r.result_main,
          result_3top: r.result_3top,
          result_2top: r.result_2top,
          result_2bottom: r.result_2bottom,
          result_3front: r.result_3front,
          result_3bottom: r.result_3bottom,
          announced_at: r.announced_at ? new Date(r.announced_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : null,
        }));
        setResults(mappedResults);
      }

      if (jsonMarkets.success && Array.isArray(jsonMarkets.data) && jsonMarkets.data.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const mappedSchedules: DrawSchedule[] = jsonMarkets.data
          .filter((m: any) => m.is_active)
          .slice(0, 8)
          .map((m: any) => ({
            id: m.id,
            market_name: m.name,
            market_code: m.code,
            market_color: m.color || "#059669",
            kind: m.category === "GOV" ? "GOVERNMENT" : "STOCK",
            draw_date: todayStr,
            close_time: m.close_time ? m.close_time.slice(0, 5) : "15:20",
            status: m.is_open ? "CLOSED" : "SETTLED",
            total_bet: 28400,
          }));
        if (mappedSchedules.length > 0) {
          setSchedules(mappedSchedules);
        }
      }
    } catch (e) {
      console.error("Failed to load results data:", e);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const submit = async (s: DrawSchedule, res: ResultFields) => {
    setSchedules((p) => p.map((x) => (x.id === s.id ? { ...x, status: "SETTLED" } : x)));
    setResults((p) => [
      {
        id: `rs-new-${Date.now()}`,
        market_name: s.market_name,
        market_code: s.market_code,
        draw_date: s.draw_date,
        result_main: res.main,
        result_3top: res.r3top,
        result_2top: res.r2top,
        result_2bottom: res.r2bottom,
        result_3front: res.r3front,
        result_3bottom: res.r3bottom,
        announced_at: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      },
      ...p,
    ]);

    try {
      const resp = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_result",
          payload: {
            market_id: s.id,
            draw_date: s.draw_date,
            result_main: res.main,
            result_3top: res.r3top,
            result_2top: res.r2top,
            result_2bottom: res.r2bottom,
            result_3front: res.r3front,
            result_3bottom: res.r3bottom,
          },
        }),
      });
      const json = await resp.json();
      if (json.success) {
        toast({ title: "บันทึกผลรางวัลสำเร็จ", description: `${s.market_name} อัปเดตเข้าระบบ Supabase เรียบร้อย` });
        loadData();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ออกผลรางวัล" description="รอบออกรางวัลและผลรางวัล · กรอกผลแล้วระบบตัดยอดอัตโนมัติ" />

      <Tabs defaultValue="today">
        <TabsList className="rounded-full bg-neutral-100 p-1">
          <TabsTrigger value="today" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">รอออกผล (วันนี้)</TabsTrigger>
          <TabsTrigger value="recent" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ผลรางวัลล่าสุด (3 วัน)</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <Panel>
            <TableWrap>
              <thead>
                <tr><Th>ตลาด</Th><Th>งวดวันที่</Th><Th>เวลาปิดรับ</Th><Th>สถานะ</Th><Th className="text-right">ยอดแทง</Th><Th className="text-right">จัดการ</Th></tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-neutral-50/70">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: s.market_color }}>
                          {mktShort(s.market_code)}
                        </span>
                        <div>
                          <p className="whitespace-nowrap font-medium text-neutral-800">{s.market_name}</p>
                          <p className="text-[10px] font-bold text-neutral-400">{s.market_code}{s.kind === "GOVERNMENT" ? " · 6 หลัก" : ""}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-sm">{s.draw_date}</Td>
                    <Td className="whitespace-nowrap text-sm">{s.close_time} น.</Td>
                    <Td><StatusBadge status={s.status} /></Td>
                    <Td className="whitespace-nowrap text-right font-semibold">{fmtTHB(s.total_bet)}</Td>
                    <Td className="text-right">
                      {s.status === "SETTLED" ? (
                        <span className="text-xs text-neutral-400">ออกผลแล้ว</span>
                      ) : (
                        <Btn size="sm" className="h-8 whitespace-nowrap rounded-full" onClick={() => setModal(s)}><ClipboardEdit className="size-3.5" /> กรอกผล</Btn>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            {schedules.length === 0 ? <EmptyState title="วันนี้ไม่มีตารางออกรางวัล" /> : null}
          </Panel>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Panel>
            <TableWrap>
              <thead>
                <tr>
                  <Th>ตลาด</Th><Th>งวดวันที่</Th><Th>รางวัลที่ 1</Th><Th>3ตัวบน</Th><Th>2ตัวบน</Th>
                  <Th>2ตัวล่าง</Th><Th>3ตัวหน้า</Th><Th>3ตัวล่าง</Th><Th>เวลาประกาศ</Th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-neutral-50/70">
                    <Td>
                      <p className="whitespace-nowrap font-medium text-neutral-800">{r.market_name}</p>
                      <p className="text-[10px] font-bold text-neutral-400">{r.market_code}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-xs">{r.draw_date}</Td>
                    <Td className="font-mono text-sm font-black text-brand-700">{r.result_main ?? "—"}</Td>
                    <Td className="font-mono text-sm font-bold">{r.result_3top ?? "—"}</Td>
                    <Td className="font-mono text-sm font-bold">{r.result_2top ?? "—"}</Td>
                    <Td className="font-mono text-sm font-bold">{r.result_2bottom ?? "—"}</Td>
                    <Td className="font-mono text-sm">{r.result_3front ?? "—"}</Td>
                    <Td className="font-mono text-sm">{r.result_3bottom ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-xs text-neutral-500">{r.announced_at ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Panel>
        </TabsContent>
      </Tabs>

      {modal ? <ResultModal schedule={modal} onClose={() => setModal(null)} onSubmit={submit} /> : null}
    </div>
  );
}
