"use client";

import * as React from "react";
import { Palette, Save, Upload, Sun, Moon, Monitor, Type, Check, ImageIcon } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ToggleRow, ColorPickerInput } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { APPEARANCE_SETTINGS, PRIMARY_PALETTE, FONT_OPTIONS } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function ImageSlot({
  label, hint, value, onPick,
}: { label: string; hint: string; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
        {value ? <img src={value} alt={label} className="size-16 object-cover" /> : <ImageIcon className="size-5 text-neutral-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>
        <div className="mt-2 flex items-center gap-2">
          <Btn size="sm" variant="outline" className="h-8 rounded-full px-3">
            <Upload className="size-3.5" /> อัปโหลด
          </Btn>
          <input
            value={value}
            onChange={(e) => onPick(e.target.value)}
            placeholder="หรือวาง URL รูป..."
            className="h-8 min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-3 text-xs outline-none placeholder:text-neutral-300 focus:border-brand-400"
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
        toast({ title: "บันทึกรูปลักษณ์สำเร็จ", description: "บันทึกลงตารางการตั้งค่าระบบเรียบร้อย" });
        setInitial({ ...s });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="รูปลักษณ์"
        description="ตารางการตั้งค่า · ปรับสีหลัก โลโก้ ฟอนต์ และโหมดแสดงผล"
      >
        <Btn
          className="rounded-full"
          disabled={!dirty}
          onClick={handleSave}
        >
          <Save className="size-4" /> บันทึกการเปลี่ยนแปลง
        </Btn>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Settings column */}
        <div className="min-w-0 space-y-4 lg:col-span-3">
          {/* Primary color */}
          <Panel className="min-w-0 p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Palette className="size-4" /> สีหลักของเว็บ
            </p>
            <div className="flex flex-wrap gap-2.5">
              {PRIMARY_PALETTE.map((c) => (
                <button
                  key={c.value}
                  onClick={() => set("primary_color", c.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-medium transition-all",
                    s.primary_color === c.value ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-300" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <span className="relative flex size-7 items-center justify-center rounded-full" style={{ backgroundColor: c.value }}>
                    {s.primary_color === c.value ? <Check className="size-3.5 text-white" /> : null}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
              <ColorPickerInput
                value={s.primary_color}
                onChange={(v) => set("primary_color", v)}
                ariaLabel="เลือกสีเอง"
              />
              <input
                value={s.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="h-10 w-32 rounded-xl border border-neutral-200 px-3 font-mono text-sm uppercase outline-none focus:border-brand-400"
              />
              <span className="min-w-0 flex-1 truncate text-xs text-neutral-400">รหัสสี — วางรหัสสีหรือเลือกจากตัวเลือก</span>
            </div>
          </Panel>

          {/* Logo / Favicon */}
          <Panel className="min-w-0 space-y-3 p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-neutral-400">โลโก้ / ไอคอนเว็บ</p>
            <ImageSlot label="โลโก้เว็บ" hint="ไฟล์ภาพพื้นหลังโปร่งใส แนะนำ 512×512 พิกเซล" value={s.logo_url} onPick={(v) => set("logo_url", v)} />
            <ImageSlot label="ไอคอนแท็บเบราว์เซอร์" hint="ไฟล์ภาพ 32×32 พิกเซล แสดงบนแท็บเบราว์เซอร์" value={s.favicon_url} onPick={(v) => set("favicon_url", v)} />
            <ImageSlot label="ภาพพื้นหลังหน้าล็อกอิน" hint="แนะนำขนาด 1920×1080 พิกเซล" value={s.login_bg_url} onPick={(v) => set("login_bg_url", v)} />
          </Panel>

          {/* Font + mode */}
          <Panel className="min-w-0 p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Type className="size-4" /> ฟอนต์และโหมดแสดงผล
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ฟอนต์หลักเว็บ">
                <div className="flex flex-wrap gap-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => set("font_family", f)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        s.font_family === f ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
                    { v: "system", label: "ตามระบบ", icon: Monitor },
                  ].map((m) => (
                    <button
                      key={m.v}
                      onClick={() => set("default_mode", m.v)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-medium transition-all",
                        s.default_mode === m.v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      <m.icon className="size-4" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-2 divide-y divide-neutral-100 border-t border-neutral-100">
              <ToggleRow
                label="แสดงแบนเนอร์วงล้อหน้าแรก"
                desc="ปิดได้หากต้องการหน้าแรกแบบเรียบ"
                checked
                onCheckedChange={() => toast({ title: "ตั้งค่าแล้ว (mock)" })}
              />
              <ToggleRow
                label="โหมดตารางกระชับ"
                desc="ลดระยะห่างในตารางให้แสดงได้มากขึ้น"
                checked={false}
                onCheckedChange={() => toast({ title: "ตั้งค่าแล้ว (mock)" })}
              />
            </div>
          </Panel>
        </div>

        {/* Live preview */}
        <div className="min-w-0 lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            <Panel className="min-w-0 overflow-hidden">
              <div className="border-b border-neutral-100 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">พรีวิวสด</p>
              </div>
              <div className="space-y-4 p-4">
                {/* fake site header */}
                <div className="flex items-center justify-between rounded-2xl border border-neutral-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: s.primary_color }}>
                      {s.logo_url ? <img src={s.logo_url} alt="" className="size-8 rounded-full object-cover" /> : <img src="/logo.svg" alt="" className="size-8 rounded-full object-cover" />}
                    </div>
                    <span className="text-sm font-bold text-neutral-900">TH-LOTTO</span>
                  </div>
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: s.primary_color }}>เข้าสู่ระบบ</span>
                </div>

                {/* fake button set */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: s.primary_color }}>ปุ่มหลัก</span>
                  <span className="rounded-full border px-4 py-2 text-xs font-bold" style={{ borderColor: s.primary_color, color: s.primary_color }}>ปุ่มขอบ</span>
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-600">ปุ่มรอง</span>
                </div>

                {/* fake stat */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: `${s.primary_color}14` }}>
                  <p className="text-xs text-neutral-500">ยอดฝากวันนี้</p>
                  <p className="mt-1 text-2xl font-black" style={{ color: s.primary_color }}>฿486,500</p>
                </div>

                {/* font sample */}
                <div className="rounded-2xl border border-neutral-100 p-4">
                  <p className="text-[11px] text-neutral-400">ตัวอย่างฟอนต์ — {s.font_family}</p>
                  <p className="mt-1 text-base font-bold text-neutral-900">แทงหวยออนไลน์ จ่ายไว 1 นาที</p>
                  <p className="mt-0.5 text-xs text-neutral-500">ทดสอบการแสดงผลฟอนต์ — สวัสดีชาวโลก ๐๑๒๓๔๕๖๗๘๙</p>
                </div>

                {/* mode preview */}
                <div className={cn("rounded-2xl p-4 transition-colors", s.default_mode === "dark" ? "bg-neutral-900" : "bg-neutral-50")}>
                  <p className={cn("text-xs", s.default_mode === "dark" ? "text-neutral-400" : "text-neutral-500")}>
                    โหมดเริ่มต้น: {s.default_mode === "dark" ? "มืด 🌙" : s.default_mode === "light" ? "สว่าง ☀️" : "ตามระบบของอุปกรณ์ 🖥️"}
                  </p>
                  <p className={cn("mt-1 text-sm font-semibold", s.default_mode === "dark" ? "text-white" : "text-neutral-900")}>
                    ยอดเงินคงเหลือ ฿12,450.50
                  </p>
                </div>
              </div>
            </Panel>
            <p className="px-1 text-center text-[11px] leading-relaxed text-neutral-400">
              การเปลี่ยนแปลงจะบันทึกลงตารางการตั้งค่าเมื่อกดปุ่มบันทึก
              <br />และมีผลกับเว็บสมาชิกทันที (แคชสูงสุด 60 วินาที)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
