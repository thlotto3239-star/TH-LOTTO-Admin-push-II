"use client";

import * as React from "react";
import { Disc3, Save, Coins, CalendarClock, Image as ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ColorPickerInput } from "../primitives";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { WHEEL_CONFIG, WHEEL_SLOTS, fmtTHB, fmtNum, type WheelSlot } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

// ─── SVG wheel preview (8 ช่อง live ตาม config) ──────────────────────────────
function WheelSvg({ slots, selected, onSelect }: { slots: WheelSlot[]; selected: string | null; onSelect: (id: string) => void }) {
  const n = slots.length;
  const R = 140;
  const cx = 150;
  const cy = 150;

  const arc = (i: number) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + R * Math.cos(a0);
    const y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1);
    const y1 = cy + R * Math.sin(a1);
    return { a0, a1, d: `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} Z` };
  };

  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label="พรีวิววงล้อโชคดี">
      <circle cx={cx} cy={cy} r={R + 10} fill="#fafafa" stroke="#e5e5e5" strokeWidth={2} />
      {slots.map((s, i) => {
        const { a0, a1, d } = arc(i);
        const mid = (a0 + a1) / 2;
        const lx = cx + R * 0.62 * Math.cos(mid);
        const ly = cy + R * 0.62 * Math.sin(mid);
        const gid = `grad-${s.id}`;
        return (
          <g key={s.id} onClick={() => onSelect(s.id)} className={cn("cursor-pointer transition-opacity", !s.is_active && "opacity-35", selected === s.id ? "" : "hover:opacity-80")}>
            <defs>
              <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={s.color} />
                <stop offset="100%" stopColor={s.hi_color} />
              </linearGradient>
            </defs>
            <path
              d={d}
              fill={`url(#${gid})`}
              stroke={selected === s.id ? "#111827" : "#ffffff"}
              strokeWidth={selected === s.id ? 4 : 2}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={800} fill="#ffffff" transform={`rotate(${(mid * 180) / Math.PI + 90}, ${lx}, ${ly})`}>
              {s.name.length > 14 ? s.name.slice(0, 13) + "…" : s.name}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={26} fill="#ffffff" stroke="#e5e5e5" strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={900} fill="#0d9488">
        หมุน
      </text>
      <circle cx={cx} cy={cy - R - 4} r={7} fill="#111827" />
      <circle cx={cx} cy={cy - R - 4} r={3} fill="#f59e0b" />
    </svg>
  );
}

// ─── Slot editor card ────────────────────────────────────────────────────────
function SlotCard({ slot, onChange, onSave, selected, onSelect }: {
  slot: WheelSlot;
  onChange: (s: WheelSlot) => void;
  onSave: (s: WheelSlot) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const set = <K extends keyof WheelSlot>(k: K, v: WheelSlot[K]) => onChange({ ...slot, [k]: v });
  return (
    <Panel className={cn("p-4 transition-all", selected ? "ring-2 ring-brand-500" : "")} >
      <button className="mb-3 flex w-full items-center justify-between gap-2 text-left" onClick={onSelect}>
        <span className="flex items-center gap-2">
          <span className="size-5 shrink-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-neutral-100" style={{ background: `linear-gradient(135deg, ${slot.color}, ${slot.hi_color})` }} />
          <span className="text-sm font-bold text-neutral-800">ช่อง {slot.id.replace("w", "")}</span>
        </span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">{slot.probability}%</span>
      </button>
      <div className="grid gap-2.5">
        <Field label="ชื่อรางวัล"><Input value={slot.name} onChange={(e) => set("name", e.target.value)} className="h-9 rounded-xl border-neutral-200 text-sm" /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="ยอดเงิน (บาท)"><Input type="number" min={0} value={slot.amount} onChange={(e) => set("amount", Number(e.target.value))} className="h-9 rounded-xl border-neutral-200 text-sm" /></Field>
          <Field label="ความน่าจะเป็น (%)"><Input type="number" min={0} max={100} value={slot.probability} onChange={(e) => set("probability", Number(e.target.value))} className="h-9 rounded-xl border-neutral-200 text-sm" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="สีหลัก">
            <div className="flex items-center gap-1.5">
              <ColorPickerInput size="sm" value={slot.color} onChange={(v) => set("color", v)} ariaLabel="เลือกสีหลัก" />
              <Input value={slot.color} onChange={(e) => set("color", e.target.value)} className="h-9 rounded-xl border-neutral-200 font-mono text-xs" />
            </div>
          </Field>
          <Field label="สีรอง">
            <div className="flex items-center gap-1.5">
              <ColorPickerInput size="sm" value={slot.hi_color} onChange={(v) => set("hi_color", v)} ariaLabel="เลือกสีรอง" />
              <Input value={slot.hi_color} onChange={(e) => set("hi_color", e.target.value)} className="h-9 rounded-xl border-neutral-200 font-mono text-xs" />
            </div>
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2">
          <span className="text-sm font-medium text-neutral-700">เปิดใช้งานช่องนี้</span>
          <Switch checked={slot.is_active} onCheckedChange={(v) => set("is_active", v)} />
        </div>
        <Btn size="sm" className="rounded-full" onClick={() => onSave(slot)}><Save className="size-3.5" /> บันทึกช่อง</Btn>
      </div>
    </Panel>
  );
}

export function WheelPage() {
  const { toast } = useToast();
  const [slots, setSlots] = React.useState<WheelSlot[]>(WHEEL_SLOTS);
  const [config, setConfig] = React.useState(WHEEL_CONFIG);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [spinStats, setSpinStats] = React.useState({ spins: 0, cost_collected: 0, prizes_paid: 0 });

  React.useEffect(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          if (res.data?.wheelPrizes?.length > 0) {
            setSlots(
              res.data.wheelPrizes.map((p: any) => ({
                id: String(p.id),
                name: p.name || "",
                amount: Number(p.amount || 0),
                probability: Number(p.probability || 0),
                color: p.color || "#10b981",
                hi_color: p.hi_color || "#34d399",
                is_active: Boolean(p.is_active),
              }))
            );
          }
          if (res.data?.settings && Array.isArray(res.data.settings)) {
            const sMap: Record<string, string> = {};
            res.data.settings.forEach((item: any) => {
              if (item.key) sMap[item.key] = item.value;
            });
            setConfig((prev) => ({
              ...prev,
              cost: sMap.lucky_wheel_cost ? Number(sMap.lucky_wheel_cost) : prev.cost,
              daily_limit: sMap.lucky_wheel_daily_limit ? Number(sMap.lucky_wheel_daily_limit) : prev.daily_limit,
              banner_url: sMap.lucky_wheel_banner_url || prev.banner_url,
            }));
          }
          if (res.data?.wheelSpinsStats) {
            setSpinStats(res.data.wheelSpinsStats);
          }
        }
      })
      .catch(() => {});
  }, []);

  const totalProb = slots.filter((s) => s.is_active).reduce((a, s) => a + s.probability, 0);
  const probOk = totalProb === 100;

  const handleSaveSlot = async (s: WheelSlot) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_wheel_prize",
          payload: s,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกช่องรางวัลแล้ว", description: `${s.name} (${s.probability}%) บันทึกลงระบบแล้ว` });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_wheel_config",
          payload: config,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกตั้งค่าวงล้อแล้ว", description: `ราคา ${fmtTHB(config.cost)}/ครั้ง · จำกัด ${config.daily_limit} ครั้ง/วัน` });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="วงล้อโชคดี" description={`ตั้งค่าวงล้อและรางวัล · ประวัติหมุนรวม ${fmtNum(spinStats.spins)} ครั้ง · รับเข้า ${fmtTHB(spinStats.cost_collected)} · จ่ายออก ${fmtTHB(spinStats.prizes_paid)}`} />

      {/* Bento: preview + general settings */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900"><Disc3 className="size-4 text-brand-600" /> พรีวิววงล้อ (อัปเดตตามการตั้งค่าทันที)</h2>
            <span className="hidden text-[11px] text-neutral-400 sm:block">คลิกที่ช่องเพื่อเลือกแก้ไข</span>
          </div>
          <WheelSvg slots={slots} selected={selected} onSelect={setSelected} />
          <div className={cn("mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold", probOk ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700")}>
            {probOk ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
            ความน่าจะเป็นรวม (ช่องที่เปิดใช้งาน): {totalProb}% {probOk ? "— ถูกต้อง ต้องเท่ากับ 100% พอดี" : "— ต้องปรับให้รวมได้ 100% พอดี"}
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="mb-3 text-base font-bold text-neutral-900">ส่วนตั้งค่าทั่วไป</h2>
          <div className="grid gap-3">
            <Field label="ราคาหมุน (บาทต่อครั้ง)">
              <div className="relative">
                <Coins className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input type="number" min={0} value={config.cost} onChange={(e) => setConfig({ ...config, cost: Number(e.target.value) })} className={cn(inputCls, "pl-9")} />
              </div>
            </Field>
            <Field label="จำนวนหมุนต่อวัน (ครั้ง/วัน)">
              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input type="number" min={0} value={config.daily_limit} onChange={(e) => setConfig({ ...config, daily_limit: Number(e.target.value) })} className={cn(inputCls, "pl-9")} />
              </div>
            </Field>
            <Field label="ภาพปก (วางลิงก์หรืออัปโหลด)">
              <div className="flex gap-2">
                <Input value={config.banner_url} onChange={(e) => setConfig({ ...config, banner_url: e.target.value })} placeholder="https://..." className={inputCls} />
                <label className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:bg-neutral-100" title="อัปโหลดรูป">
                  <ImageIcon className="size-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={() => toast({ title: "เลือกไฟล์แล้ว (ตัวอย่าง UI)" })} />
                </label>
              </div>
            </Field>
            <Btn className="mt-1 w-full rounded-full" onClick={handleSaveConfig}>
              บันทึกตั้งค่าทั่วไป
            </Btn>
            <div className="mt-2 rounded-2xl bg-neutral-50 p-3 text-center">
              <p className="text-[11px] text-neutral-400">สถิติรวม</p>
              <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                <div><p className="text-sm font-black text-neutral-900">{fmtNum(spinStats.spins)}</p><p className="text-[10px] text-neutral-400">หมุน</p></div>
                <div><p className="text-sm font-black text-brand-600">{fmtTHB(spinStats.cost_collected)}</p><p className="text-[10px] text-neutral-400">รับเข้า</p></div>
                <div><p className="text-sm font-black text-rose-600">{fmtTHB(spinStats.prizes_paid)}</p><p className="text-[10px] text-neutral-400">จ่ายออก</p></div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 8 slot editors */}
      <div>
        <h2 className="mb-3 text-base font-bold text-neutral-900">ช่องรางวัลทั้ง 8 ช่อง (แก้ไขได้ทุกช่อง)</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {slots.map((s) => (
            <SlotCard
              key={s.id}
              slot={s}
              selected={selected === s.id}
              onSelect={() => setSelected(s.id)}
              onChange={(ns) => setSlots((p) => p.map((x) => (x.id === ns.id ? ns : x)))}
              onSave={handleSaveSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
