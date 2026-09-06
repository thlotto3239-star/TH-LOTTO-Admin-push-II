"use client";

import * as React from "react";
import {
  Palette, Save, Upload, Sun, Moon, Monitor, Type, Check, ImageIcon,
  Smartphone, Laptop, Sparkles, RefreshCw, Eye
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ToggleRow, ColorPickerInput } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { APPEARANCE_SETTINGS, PRIMARY_PALETTE, FONT_OPTIONS } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function ImageSlot({
  label, hint, value, onPick,
}: { label: string; hint: string; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-3.5 bg-neutral-50/50">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white shadow-xs">
        {value ? (
          <img src={value} alt={label} className="size-14 object-contain p-1" />
        ) : (
          <ImageIcon className="size-5 text-neutral-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-neutral-800">{label}</p>
          <span className="text-[10px] text-neutral-400">{hint}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => onPick(e.target.value)}
            placeholder="วาง URL รูปภาพ..."
            className="h-8 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-xs outline-none placeholder:text-neutral-300 focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

export function AppearancePage() {
  const { toast } = useToast();
  const [s, setS] = React.useState({ ...APPEARANCE_SETTINGS });
  const [initial, setInitial] = React.useState({ ...APPEARANCE_SETTINGS });
  const [previewDevice, setPreviewDevice] = React.useState<"mobile" | "pc">("mobile");
  const [isSaving, setIsSaving] = React.useState(false);

  const set = <K extends keyof typeof APPEARANCE_SETTINGS>(k: K, v: (typeof APPEARANCE_SETTINGS)[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  React.useEffect(() => {
    fetch("/api/admin/data?resource=settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const dict = res.data;
          const loaded = {
            primary_color: dict.theme_primary_color || dict.site_primary_color || APPEARANCE_SETTINGS.primary_color,
            font_family: dict.theme_font || dict.font_family || APPEARANCE_SETTINGS.font_family,
            default_mode: dict.theme_dark_mode === "true" || dict.theme_dark_mode === "dark" ? "dark" : (dict.default_mode || APPEARANCE_SETTINGS.default_mode),
            logo_url: dict.site_logo_url || dict.logo_url || APPEARANCE_SETTINGS.logo_url,
            favicon_url: dict.site_favicon_url || dict.favicon_url || APPEARANCE_SETTINGS.favicon_url,
            login_bg_url: dict.login_bg_url || APPEARANCE_SETTINGS.login_bg_url,
          };
          setS(loaded);
          setInitial(loaded);
        }
      })
      .catch(() => {});
  }, []);

  const dirty = JSON.stringify(s) !== JSON.stringify(initial);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_appearance",
          payload: {
            primary_color: s.primary_color,
            font: s.font_family,
            dark_mode: s.default_mode === "dark",
            logo_url: s.logo_url,
            favicon_url: s.favicon_url,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกรูปลักษณ์สำเร็จ", description: "ตั้งค่าถูกบันทึกลงระบบ Supabase เรียบร้อย" });
        setInitial({ ...s });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="สตูดิโอออกแบบแบรนด์ & รูปลักษณ์"
        description="Brand & Theme Studio · ปรับแต่งสีหลัก ฟอนต์ โลโก้ และทดสอบแสดงผลสดทั้ง Mobile และ PC"
      >
        <Btn
          className="rounded-full shadow-md shadow-brand-500/20"
          disabled={!dirty || isSaving}
          onClick={handleSave}
        >
          {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
          บันทึกการเปลี่ยนแปลง
        </Btn>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN: Interactive PC Landscape Live Visualizer (5 Cols) */}
        <div className="min-w-0 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="size-4 text-brand-600" /> แซนด์บ็อกซ์พรีวิวสด (Live Sandbox)
            </span>
            <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-0.5 border border-neutral-200">
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                  previewDevice === "mobile" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <Smartphone className="size-3" /> มือถือ
              </button>
              <button
                onClick={() => setPreviewDevice("pc")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                  previewDevice === "pc" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <Laptop className="size-3" /> หน้าจอ PC
              </button>
            </div>
          </div>

          <Panel
            className={cn(
              "overflow-hidden p-4 shadow-xl border-neutral-200 transition-all rounded-3xl min-h-[540px] flex flex-col justify-between",
              s.default_mode === "dark" ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
            )}
            style={{ fontFamily: s.font_family }}
          >
            {/* Simulated App Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-xl font-black text-white shadow-xs overflow-hidden"
                  style={{ backgroundColor: s.primary_color }}
                >
                  {s.logo_url ? (
                    <img src={s.logo_url} alt="" className="size-8 object-contain" />
                  ) : (
                    <img src="/logo.svg" alt="" className="size-8 object-contain" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black tracking-tight leading-none">TH-LOTTO</p>
                  <p className="text-[10px] text-neutral-400 leading-none mt-0.5">หวยออนไลน์ครบวงจร</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: s.primary_color }}
                >
                  เข้าสู่ระบบ
                </span>
              </div>
            </div>

            {/* Simulated Hero Banner Card */}
            <div
              className="my-3 rounded-2xl p-4 text-white shadow-md relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${s.primary_color} 0%, #064e3b 100%)`,
              }}
            >
              <div className="relative z-10">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  งวดวันที่ 16 มีนาคม
                </span>
                <h4 className="mt-1 text-base font-black">สลากกินแบ่งรัฐบาล</h4>
                <p className="text-xs text-white/80 mt-0.5">รางวัลที่ 1 จ่ายบาทละ 900</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-neutral-900 shadow-xs">
                    แทงหวยตอนนี้
                  </span>
                  <span className="text-xs text-white/90 underline font-medium">ดูผลรางวัล</span>
                </div>
              </div>
            </div>

            {/* Simulated Lottery Ball Row */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">ผลสลากล่าสุด (ตัวอย่างลูกบอล)</p>
              <div className="flex items-center justify-between rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3 bg-neutral-50/60 dark:bg-neutral-900/60">
                <div className="flex items-center gap-1.5">
                  {["8", "4", "3", "6", "5", "0"].map((n, i) => (
                    <span
                      key={i}
                      className="flex size-7 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
                      style={{ backgroundColor: i < 3 ? s.primary_color : "#475569" }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: s.primary_color }}>
                  3 ตัวตรง 900฿
                </span>
              </div>
            </div>

            {/* Font Typography Preview Card */}
            <div className="my-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-3.5 bg-neutral-50/50 dark:bg-neutral-900/50">
              <p className="text-[10px] text-neutral-400 font-semibold">พรีวิวฟอนต์ — {s.font_family}</p>
              <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">
                แทงหวยออนไลน์ บาทละ 900 จ่ายจริง รวดเร็ว ปลอดภัย
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                กขคงจฉชซ ๐๑๒๓๔๕๖๗๘๙ The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            {/* Simulated Balance & Action Buttons */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-neutral-400">กระเป๋าเงินสมาชิก</p>
                <p className="text-sm font-black" style={{ color: s.primary_color }}>
                  ฿15,240.00
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: s.primary_color }}
                >
                  เติมเงิน
                </span>
                <span className="rounded-full border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs font-bold">
                  ถอนเงิน
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: Theme Design Controls (7 Cols) */}
        <div className="min-w-0 space-y-4 lg:col-span-7">
          {/* Primary Color Palette */}
          <Panel className="min-w-0 p-5 space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Palette className="size-4 text-brand-600" /> สีหลักประจำแบรนด์ (Primary Color)
            </p>
            <div className="flex flex-wrap gap-2.5">
              {PRIMARY_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("primary_color", c.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all",
                    s.primary_color === c.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-300 font-bold"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span
                    className="relative flex size-6 items-center justify-center rounded-full shadow-xs"
                    style={{ backgroundColor: c.value }}
                  >
                    {s.primary_color === c.value ? <Check className="size-3 text-white" /> : null}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
              <ColorPickerInput
                value={s.primary_color}
                onChange={(v) => set("primary_color", v)}
                ariaLabel="เลือกสีเอง"
              />
              <input
                value={s.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="h-9 w-28 rounded-xl border border-neutral-200 px-3 font-mono text-xs uppercase outline-none focus:border-brand-500"
              />
              <span className="text-xs text-neutral-400">ใส่รหัสสี HEX เพื่อปรับแต่งให้ตรงตามอัตลักษณ์แบรนด์</span>
            </div>
          </Panel>

          {/* Logo & Visual Assets */}
          <Panel className="min-w-0 space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5">
              <ImageIcon className="size-4 text-brand-600" /> ไฟล์ภาพและโลโก้ (Visual Assets)
            </p>
            <ImageSlot
              label="โลโก้เว็บ (Web Logo)"
              hint="ภาพโปร่งใส แนะนำ 512×512 px"
              value={s.logo_url}
              onPick={(v) => set("logo_url", v)}
            />
            <ImageSlot
              label="ไอคอนแท็บเบราว์เซอร์ (Favicon)"
              hint="ภาพ 32×32 หรือ 64×64 px"
              value={s.favicon_url}
              onPick={(v) => set("favicon_url", v)}
            />
            <ImageSlot
              label="ภาพพื้นหลังหน้าล็อกอิน (Login Wallpaper)"
              hint="ขนาด 1920×1080 px แนวนอน"
              value={s.login_bg_url}
              onPick={(v) => set("login_bg_url", v)}
            />
          </Panel>

          {/* Typography & Theme Mode */}
          <Panel className="min-w-0 p-5 space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Type className="size-4 text-brand-600" /> ฟอนต์และโหมดการแสดงผล (Typography & Mode)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ฟอนต์หลักของระบบ">
                <div className="flex flex-wrap gap-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set("font_family", f)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                        s.font_family === f
                          ? "bg-neutral-900 text-white font-bold shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="โหมดเริ่มต้นของเว็บสมาชิก">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { v: "light", label: "สว่าง", icon: Sun },
                    { v: "dark", label: "มืด", icon: Moon },
                    { v: "system", label: "ตามเครื่อง", icon: Monitor },
                  ].map((m) => (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => set("default_mode", m.v)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border py-2 text-xs font-medium transition-all",
                        s.default_mode === m.v
                          ? "border-brand-500 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300"
                          : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      <m.icon className="size-4" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
