"use client";

import * as React from "react";
import {
  Palette, Save, Sun, Moon, Monitor, Type, Check, ImageIcon,
  RefreshCw, RotateCcw, Smartphone, Laptop, ExternalLink, Eye
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ColorPickerInput } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { APPEARANCE_SETTINGS, PRIMARY_PALETTE, FONT_OPTIONS } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function ImageSlot({
  label,
  hint,
  value,
  onPick,
}: {
  label: string;
  hint: string;
  value: string;
  onPick: (v: string) => void;
}) {
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
            placeholder="วาง URL รูปภาพ (เช่น https://... หรือ /logo.svg)"
            className="h-8 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-xs outline-none placeholder:text-neutral-300 focus:border-brand-500"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onPick("")}
              className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg bg-rose-50"
            >
              ล้าง
            </button>
          ) : null}
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
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(480);

  React.useEffect(() => {
    if (!previewContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(previewContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const pcScale = Math.min(1, Math.max(0.2, (containerWidth - 24) / 1024));

  const set = <K extends keyof typeof APPEARANCE_SETTINGS>(k: K, v: (typeof APPEARANCE_SETTINGS)[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  // ซิงค์ส่ง postMessage ไปยังหน้าเว็บจริงของลูกค้าใน iframe พรีวิว
  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_APPEARANCE",
          payload: {
            site_primary_color: s.primary_color,
            theme_primary_color: s.primary_color,
            site_logo_url: s.logo_url,
            site_name: "TH LOTTO",
          },
        },
        "*"
      );
    }
  }, [s.primary_color, s.logo_url]);

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
          setS((prev) => ({ ...prev, ...loaded }));
          setInitial((prev) => ({ ...prev, ...loaded }));
        }
      })
      .catch(() => {});
  }, []);

  const dirty = JSON.stringify(s) !== JSON.stringify(initial);

  const handleReset = () => {
    setS({ ...initial });
    toast({ title: "คืนค่าการตั้งค่าเดิม", description: "ยกเลิกการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" });
  };

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
            login_bg_url: s.login_bg_url,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "บันทึกรูปลักษณ์สำเร็จ",
          description: "อัปเดตการตั้งค่าลงฐานข้อมูล Supabase เรียบร้อย",
        });
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
        title="ตั้งค่ารูปลักษณ์ระบบ (Appearance Settings)"
        description="ปรับแต่งโทนสีหลักของระบบ ฟอนต์ที่แสดงผล โลโก้ และพรีวิวหน้าล็อกอินจริงของฝั่งลูกค้า (Real Customer Login)"
      >
        <div className="flex items-center gap-2">
          {dirty ? (
            <Btn
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="text-neutral-500 hover:text-neutral-800"
            >
              <RotateCcw className="size-3.5 mr-1" /> คืนค่าเดิม
            </Btn>
          ) : null}
          <Btn
            className="rounded-full shadow-md shadow-brand-500/20"
            disabled={!dirty || isSaving}
            onClick={handleSave}
          >
            {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            บันทึกการเปลี่ยนแปลง
          </Btn>
        </div>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN: Real Customer Login Page Iframe Preview (5 Cols) */}
        <div className="min-w-0 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="size-4 text-brand-600" /> พรีวิวหน้าล็อกอินจริงของลูกค้า (Real Customer Login)
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

          <Panel ref={previewContainerRef} className="overflow-hidden p-2 shadow-xl border-neutral-200 rounded-3xl min-h-[580px] flex flex-col items-center justify-start bg-neutral-100">
            <div
              className={cn(
                "transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl border border-neutral-300 bg-white relative flex items-center justify-center",
                previewDevice === "mobile" ? "w-[360px] h-[560px]" : "w-full overflow-hidden flex flex-col items-center"
              )}
            >
              {previewDevice === "mobile" ? (
                <iframe
                  ref={iframeRef}
                  src="http://localhost:5173/login?preview=true"
                  title="Customer Login Live Preview (Mobile)"
                  className="w-full h-full border-0"
                  onLoad={() => {
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage(
                        {
                          type: "UPDATE_APPEARANCE",
                          payload: {
                            site_primary_color: s.primary_color,
                            theme_primary_color: s.primary_color,
                            site_logo_url: s.logo_url,
                          },
                        },
                        "*"
                      );
                    }
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 1024,
                    height: 680,
                    transform: `scale(${pcScale})`,
                    transformOrigin: "top center",
                    marginBottom: `-${680 * (1 - pcScale)}px`,
                  }}
                  className="shrink-0"
                >
                  <iframe
                    ref={iframeRef}
                    src="http://localhost:5173/login?preview=true"
                    title="Customer Login Live Preview (PC Desktop)"
                    className="w-full h-full border-0"
                    onLoad={() => {
                      if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(
                          {
                            type: "UPDATE_APPEARANCE",
                            payload: {
                              site_primary_color: s.primary_color,
                              theme_primary_color: s.primary_color,
                              site_logo_url: s.logo_url,
                            },
                          },
                          "*"
                        );
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between w-full px-2 text-[11px] text-neutral-400">
              <span>พรีวิวสดจาก: http://localhost:5173/login</span>
              <a
                href="http://localhost:5173/login"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-brand-600 hover:underline font-semibold"
              >
                เปิดในแท็บใหม่ <ExternalLink className="size-3" />
              </a>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: Settings Controls (7 Cols) */}
        <div className="min-w-0 space-y-4 lg:col-span-7">
          {/* Primary Color Palette */}
          <Panel className="min-w-0 p-5 space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Palette className="size-4 text-brand-600" /> สีหลักประจำระบบ (Primary Color)
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
              <span className="text-xs text-neutral-400">ใส่รหัสสี HEX เพื่อกำหนดสีของปุ่มและไฮไลต์</span>
            </div>
          </Panel>

          {/* Logo & Visual Assets */}
          <Panel className="min-w-0 space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5">
              <ImageIcon className="size-4 text-brand-600" /> ไฟล์ภาพและโลโก้ (Visual Assets)
            </p>
            <ImageSlot
              label="โลโก้ระบบ (System Logo)"
              hint="ไฟล์รูปภาพโปร่งใส แนะนำ 512×512 px"
              value={s.logo_url}
              onPick={(v) => set("logo_url", v)}
            />
            <ImageSlot
              label="ไอคอนแท็บเบราว์เซอร์ (Favicon)"
              hint="ขนาด 32×32 หรือ 64×64 px"
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

              <Field label="โหมดเริ่มต้นของระบบ">
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
