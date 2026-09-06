"use client";

import * as React from "react";
import { Pencil, Flame, Star, Youtube, Clock, Timer } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ColorPickerInput, MarketLogo } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MARKETS, BET_TYPES, BET_TYPE_LABEL, DAY_LABELS, fmtTHB, mktShort, type Market, type BetType } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function MarketCard({ m, onEdit, onToggle }: { m: Market; onEdit: () => void; onToggle: (v: boolean) => void }) {
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MarketLogo
            logoUrl={m.logo_url}
            imageUrl={m.image_url}
            name={m.name}
            code={m.code}
            color={m.color}
            size="lg"
          />
          <div>
            <p className="font-bold text-neutral-900">{m.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{m.code}</span>
              {m.popular ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-600"><Star className="size-2.5" /> ยอดนิยม</span>
              ) : null}
              {m.hot ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600"><Flame className="size-2.5" /> ร้อนแรง</span>
              ) : null}
            </div>
          </div>
        </div>
        <Switch checked={m.active} onCheckedChange={onToggle} aria-label="เปิด/ปิดตลาด" />
      </div>

      <div className="mt-4 space-y-2.5 text-sm">
        {/* Row 1: วันออกผล */}
        <div className="flex items-center gap-1.5">
          <span className="w-20 shrink-0 text-xs text-neutral-400 whitespace-nowrap">วันออกผล</span>
          <div className="flex flex-wrap gap-1">
            {DAY_LABELS.map((d, i) => {
              const dayIdx = (i + 1) % 7;
              const on = m.draw_days.includes(dayIdx);
              const special = m.draw_days.includes(16) && dayIdx === 16;
              return special ? null : (
                <span key={i} className={cn("flex size-6 items-center justify-center rounded-full text-[10px] font-bold", on ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-400")}>
                  {d}
                </span>
              );
            })}
            {m.draw_days.includes(16) ? (
              <span className="flex h-6 items-center rounded-full bg-brand-600 px-2 text-[10px] font-bold text-white">16</span>
            ) : null}
          </div>
        </div>

        {/* Row 2: ปิดรับก่อน + เวลาออกรางวัล ในแถวเดียวกัน */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50/70 p-2 text-xs">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="flex items-center gap-1 text-neutral-400"><Timer className="size-3.5 text-neutral-500" /> ปิดรับก่อน</span>
            <span className="font-semibold text-neutral-800">{m.close_minutes} นาที</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="flex items-center gap-1 text-neutral-400"><Clock className="size-3.5 text-neutral-500" /> เวลาออกรางวัล</span>
            <span className="font-semibold text-neutral-800">{m.draw_time} น.</span>
          </div>
        </div>

        {/* Row 3: สถานะ + ถ่ายทอดสด ในแถวเดียวกัน */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-neutral-400">สถานะ</span>
            {m.active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">🟢 เปิดใช้งาน</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-500">⚫ ปิดให้บริการ</span>
            )}
          </div>
          {m.youtube_url ? (
            <a
              href={m.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 whitespace-nowrap"
            >
              <Youtube className="size-3.5 text-rose-600" /> ถ่ายทอดสด
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-neutral-50 p-3.5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">อัตราจ่าย (ต่อ 1 บาท)</p>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {BET_TYPES.map((bt) => (
            <div key={bt} className="rounded-xl bg-white px-1 py-1.5 ring-1 ring-inset ring-neutral-100">
              <p className="truncate text-[10px] text-neutral-400">{BET_TYPE_LABEL[bt]}</p>
              <p className="text-sm font-bold text-neutral-900">×{m.rates[bt]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
        <span>ขั้นต่ำ <b className="text-neutral-800">{fmtTHB(m.limits.min_bet)}</b></span>
        <span>สูงสุด <b className="text-neutral-800">{fmtTHB(m.limits.max_bet)}</b></span>
        <span>ต่อเลข <b className="text-neutral-800">{fmtTHB(m.limits.max_per_number)}</b></span>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-3">
        <Btn variant="outline" size="sm" className="w-full rounded-full" onClick={onEdit}><Pencil className="size-3.5" /> แก้ไข</Btn>
      </div>
    </Panel>
  );
}

function EditMarketModal({ m, onClose, onSave }: { m: Market; onClose: () => void; onSave: (m: Market) => void }) {
  const [form, setForm] = React.useState<Market>(m);
  const { toast } = useToast();
  const set = <K extends keyof Market>(k: K, v: Market[K]) => setForm((p) => ({ ...p, [k]: v }));
  const setRate = (bt: BetType, v: number) => setForm((p) => ({ ...p, rates: { ...p.rates, [bt]: v } }));

  const toggleDay = (d: number) =>
    setForm((p) => ({ ...p, draw_days: p.draw_days.includes(d) ? p.draw_days.filter((x) => x !== d) : [...p.draw_days, d].sort((a, b) => a - b) }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>แก้ไขตลาดหวย — {m.name}</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลตลาด วันเวลาออกผล ขีดจำกัด และอัตราจ่ายทุกประเภท</DialogDescription>
        </DialogHeader>

        {/* 2-Column Responsive Layout for PC */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Column 1: ข้อมูลตลาดและสถานะ */}
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">ข้อมูลตลาดหวย</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อตลาดหวย"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="เช่น หวยรัฐบาลไทย" className={inputCls} /></Field>
                <Field label="รหัสตลาด (Code)"><Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="เช่น TH_GOV" className={inputCls} /></Field>
              </div>
              <Field label="สีประจำตลาด">
                <div className="flex items-center gap-2">
                  <ColorPickerInput value={form.color} onChange={(v) => set("color", v)} ariaLabel="เลือกสีตลาด" />
                  <Input value={form.color} onChange={(e) => set("color", e.target.value)} className={inputCls} />
                  <MarketLogo
                    logoUrl={form.logo_url}
                    imageUrl={form.image_url}
                    name={form.name}
                    code={form.code}
                    color={form.color}
                    size="md"
                  />
                </div>
              </Field>
              <Field label="ลิงก์ถ่ายทอดสด (YouTube Live)">
                <Input value={form.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value || null)} placeholder="https://youtube.com/live/..." className={inputCls} />
              </Field>
              <Field label="ลิงก์โลโก้ตลาด (Logo URL)">
                <div className="flex items-center gap-2">
                  <Input value={form.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value || null)} placeholder="https://..." className={inputCls} />
                  <MarketLogo
                    logoUrl={form.logo_url}
                    imageUrl={form.image_url}
                    name={form.name}
                    code={form.code}
                    color={form.color}
                    size="md"
                  />
                </div>
              </Field>
              <Field label="วันออกผลรางวัล (เลือกวัน อา–ส)">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DAY_LABELS.map((d, i) => {
                    const dayIdx = (i + 1) % 7;
                    const on = form.draw_days.includes(dayIdx);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(dayIdx)}
                        className={cn("size-8 rounded-full text-xs font-bold transition-colors", on ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}
                      >
                        {d}
                      </button>
                    );
                  })}
                  <label className="ml-2 flex items-center gap-1.5 text-xs text-neutral-600">
                    <Checkbox checked={form.draw_days.includes(16)} onCheckedChange={() => toggleDay(16)} /> งวดวันที่ 16
                  </label>
                </div>
              </Field>
            </div>

            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white px-4">
              <label className="flex items-center justify-between py-2.5 text-xs font-medium text-neutral-700">
                <span>แสดงในหมวดหมู่ยอดนิยม</span>
                <Switch checked={form.popular} onCheckedChange={(v) => set("popular", v)} />
              </label>
              <label className="flex items-center justify-between py-2.5 text-xs font-medium text-neutral-700">
                <span>แสดงในหมวดหมู่มาแรง (Trending)</span>
                <Switch checked={form.hot} onCheckedChange={(v) => set("hot", v)} />
              </label>
              <label className="flex items-center justify-between py-2.5 text-xs font-medium text-neutral-700">
                <span>เปิดรับแทงในระบบ</span>
                <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
              </label>
            </div>
          </div>

          {/* Column 2: เวลา, ขีดจำกัด และอัตราจ่าย */}
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">เวลา & ขีดจำกัดการแทง</p>
              <div className="grid grid-cols-3 gap-2">
                <Field label="เวลาออกผลรางวัล"><Input type="time" value={form.draw_time.length === 5 ? form.draw_time : "12:00"} onChange={(e) => set("draw_time", e.target.value)} className={inputCls} /></Field>
                <Field label="ปิดรับก่อน (นาที)"><Input type="number" min={0} value={form.close_minutes} onChange={(e) => set("close_minutes", Number(e.target.value))} className={inputCls} /></Field>
                <Field label="แทงขั้นต่ำ (บาท)"><Input type="number" min={1} value={form.limits.min_bet} onChange={(e) => set("limits", { ...form.limits, min_bet: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="แทงสูงสุดต่อบิล (บาท)"><Input type="number" value={form.limits.max_bet} onChange={(e) => set("limits", { ...form.limits, max_bet: Number(e.target.value) })} className={inputCls} /></Field>
                <Field label="จำกัดยอดแทงต่อเลข (บาท)"><Input type="number" value={form.limits.max_per_number} onChange={(e) => set("limits", { ...form.limits, max_per_number: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-4">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-neutral-500">อัตราจ่าย (บาทละ)</p>
              <div className="grid grid-cols-3 gap-2">
                {BET_TYPES.map((bt) => (
                  <div key={bt} className="grid gap-1">
                    <Label className="text-[10px] text-neutral-500">{BET_TYPE_LABEL[bt]}</Label>
                    <Input type="number" step="0.1" min={0} value={form.rates[bt]} onChange={(e) => setRate(bt, Number(e.target.value))} className="h-8 rounded-lg border-neutral-200 bg-neutral-50 text-xs font-bold" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full" onClick={() => { onSave(form); toast({ title: "บันทึกตลาดหวยแล้ว", description: `${form.name} · อัตราจ่าย 9 ประเภท + ขีดจำกัด` }); onClose(); }}>บันทึก</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MarketsPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Market[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [edit, setEdit] = React.useState<Market | null>(null);
  const [tab, setTab] = React.useState<"ALL" | "GOV" | "FOREIGN" | "MAEKHONG" | "STOCK" | "15MIN">("ALL");
  const [q, setQ] = React.useState("");

  // Live Supabase Sync — Load all 37 markets directly from DB
  React.useEffect(() => {
    fetch("/api/admin/data?resource=markets")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const liveMarkets: Market[] = res.data.map((live: any) => {
            const existingMock = MARKETS.find((m) => m.code === live.code || m.id === live.id);

            const defaultRates: Record<BetType, number> = existingMock?.rates || {
              "3TOP": 900,
              "3TODE": 150,
              "2TOP": 95,
              "2BOTTOM": 95,
              "RUN_UP": 3.2,
              "RUN_DOWN": 4.2,
              "3FRONT": 450,
              "3BOTTOM": 450,
              "4TOP": 6000,
            };

            const defaultLimits = existingMock?.limits || {
              min_bet: 1,
              max_bet: 20000,
              max_per_number: 50000,
            };

            const isMaekhong = live.category === "MAEKHONG" || live.code.startsWith("MK_");
            const isGov = live.category === "GOV" || ["TH_GOV", "GSB", "BAAC"].includes(live.code);
            const isStock = live.category === "STOCK" || live.code.startsWith("STOCK_") || live.code.includes("NIKKEI") || live.code.includes("CHINA") || live.code.includes("HANGSENG");
            const isSpeed = live.category === "SPEED" || live.code === "THLOTTO_15M" || live.code.includes("15M");

            let mColor = existingMock?.color || "#6366f1";
            if (isMaekhong) mColor = "#8b5cf6";
            else if (isGov) mColor = "#eab308";
            else if (isStock) mColor = "#0284c7";
            else if (isSpeed) mColor = "#10b981";

            return {
              id: live.id,
              name: live.name,
              code: live.code,
              category: live.category,
              color: mColor,
              active: live.is_active ?? true,
              popular: live.show_in_popular ?? false,
              hot: live.show_in_trending ?? false,
              close_minutes: live.close_minutes_before ?? 5,
              draw_time: live.draw_time ? live.draw_time.slice(0, 5) : "18:00",
              draw_days: live.draw_days || [1, 2, 3, 4, 5, 6, 7],
              youtube_url: live.stream_url || "",
              logo_url: live.logo_url || live.image_url,
              image_url: live.image_url || live.logo_url,
              rates: defaultRates,
              limits: defaultLimits,
              kind: isGov ? "GOVERNMENT" : "CUSTOM",
            } as Market;
          });

          setRows(liveMarkets);
        }
      })
      .catch((err) => console.error("Could not load live markets:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveMarket = async (updated: Market) => {
    setRows((prev) => prev.map((r) => (r.code === updated.code ? updated : r)));
    setEdit(null);
    toast({ title: "บันทึกข้อมูลตลาดแล้ว", description: `${updated.name} (${updated.code}) อัปเดตเรียบร้อย` });

    try {
      const regularDays = updated.draw_days.filter((d) => d !== 16);
      const dayOfMonth = updated.draw_days.includes(16) ? [16] : null;

      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_market",
          payload: {
            id: updated.id,
            code: updated.code,
            name: updated.name,
            logo_url: updated.logo_url,
            close_minutes_before: updated.close_minutes,
            stream_url: updated.youtube_url,
            draw_days: regularDays,
            draw_day_of_month: dayOfMonth,
            draw_time: updated.draw_time.length === 5 ? `${updated.draw_time}:00` : updated.draw_time,
            show_in_popular: updated.popular,
            show_in_trending: updated.hot,
            is_open: updated.active,
            is_active: updated.active,
            rates: updated.rates,
            limits: updated.limits,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to sync market to Supabase:", e);
    }
  };

  const filtered = rows
    .filter((m) => {
      if (tab === "GOV") return m.category === "GOV" || ["TH_GOV", "GSB", "BAAC"].includes(m.code);
      if (tab === "FOREIGN") return m.category === "FOREIGN" || ["LAO", "HANOI_SPECIAL", "HANOI", "HANOI_VIP", "MALAY", "LAO_SPECIAL"].includes(m.code);
      if (tab === "MAEKHONG") return m.category === "MAEKHONG" || m.code.startsWith("MK_");
      if (tab === "STOCK") return m.category === "STOCK" || m.code.startsWith("STOCK_") || m.code.includes("NIKKEI") || m.code.includes("CHINA") || m.code.includes("HANGSENG");
      if (tab === "15MIN") return m.category === "SPEED" || m.code === "THLOTTO_15M" || m.code.includes("15M");
      return true;
    })
    .filter((m) => !q.trim() || m.name.includes(q.trim()) || m.code.toLowerCase().includes(q.toLowerCase()));

  const counts = {
    ALL: rows.length,
    GOV: rows.filter((r) => r.category === "GOV" || ["TH_GOV", "GSB", "BAAC"].includes(r.code)).length,
    FOREIGN: rows.filter((r) => (r.category === "FOREIGN" || ["LAO", "HANOI_SPECIAL", "HANOI", "HANOI_VIP", "MALAY", "LAO_SPECIAL"].includes(r.code)) && !r.code.startsWith("MK_")).length,
    MAEKHONG: rows.filter((r) => r.category === "MAEKHONG" || r.code.startsWith("MK_")).length,
    STOCK: rows.filter((r) => r.category === "STOCK" || r.code.startsWith("STOCK_") || r.code.includes("NIKKEI") || r.code.includes("CHINA") || r.code.includes("HANGSENG")).length,
    M15: rows.filter((r) => r.category === "SPEED" || r.code === "THLOTTO_15M" || r.code.includes("15M")).length,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="ตลาดหวย"
        description={`ตารางตลาดหวยทั้งหมด ${rows.length} ตลาดจริงบนฐานข้อมูล · เปิดใช้งาน ${rows.filter((r) => r.active).length} ตลาด`}
      />

      {/* Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-2xl bg-neutral-100 p-1">
          {[
            { id: "ALL", label: `ทั้งหมด (${counts.ALL})` },
            { id: "GOV", label: `รัฐบาลไทย (${counts.GOV})` },
            { id: "FOREIGN", label: `ต่างประเทศ (${counts.FOREIGN})` },
            { id: "MAEKHONG", label: `หวยแม่โขง (${counts.MAEKHONG})` },
            { id: "STOCK", label: `หวยหุ้น (${counts.STOCK})` },
            { id: "15MIN", label: `ล็อตโต้ 15 นาที (${counts.M15})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                tab === t.id ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาตลาดหวย..."
            className="h-9 rounded-full border-neutral-200 bg-white text-xs"
          />
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-100 bg-white">
          <p className="text-sm font-medium text-neutral-400">กำลังโหลดข้อมูลตลาดหวยทั้งหมด...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <MarketCard
              key={m.id}
            m={m}
            onEdit={() => setEdit(m)}
            onToggle={(v) => {
              setRows((p) => p.map((r) => (r.id === m.id ? { ...r, active: v } : r)));
              toast({ title: v ? "เปิดใช้งานตลาดแล้ว" : "ปิดตลาดแล้ว", description: m.name });
              fetch("/api/admin/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "update_market",
                  payload: {
                    id: m.id,
                    is_open: v,
                    is_active: v,
                  },
                }),
              }).catch((err) => console.error("Failed to toggle market:", err));
            }}
          />
        ))}
      </div>
      )}
      {edit ? <EditMarketModal m={edit} onClose={() => setEdit(null)} onSave={handleSaveMarket} /> : null}
    </div>
  );
}
