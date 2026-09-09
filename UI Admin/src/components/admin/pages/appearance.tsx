"use client";

import * as React from "react";
import {
  Palette, Save, Sun, Moon, Monitor, Type, Check, ImageIcon,
  RefreshCw, RotateCcw, Smartphone, Laptop, ExternalLink, Eye,
  Building2, Sparkles, BarChart3, Upload, ArrowLeftRight, ShieldCheck,
  FileCheck, Lock, Globe
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ColorPickerInput } from "../primitives";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { APPEARANCE_SETTINGS, PRIMARY_PALETTE, FONT_OPTIONS } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

// ── ImageSlot Component supporting Upload from Computer + Direct URL ──────────
function ImageSlot({
  label,
  hint,
  value,
  onPick,
  isBackground = false,
}: {
  label: string;
  hint: string;
  value: string;
  onPick: (v: string) => void;
  isBackground?: boolean;
}) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "ไฟล์มีขนาดใหญ่เกินไป",
        description: "กรุณาเลือกไฟล์ภาพขนาดไม่เกิน 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "appearance");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        onPick(data.url);
        toast({
          title: "อัปโหลดรูปภาพสำเร็จ",
          description: `อัปโหลด ${file.name} เรียบร้อยแล้ว`,
        });
      } else {
        throw new Error(data.error || "ไม่สามารถอัปโหลดไฟล์ได้");
      }
    } catch (err: any) {
      toast({
        title: "อัปโหลดล้มเหลว",
        description: err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-neutral-800">{label}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{hint}</p>
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => onPick("")}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 transition-colors"
          >
            {isBackground ? "ใช้ธีมสีระบบ" : "ล้างภาพ"}
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
          {value ? (
            <img src={value} alt={label} className="size-full object-contain p-1" />
          ) : isBackground ? (
            <div
              className="size-full bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center text-[9px] font-bold text-white text-center p-1"
              title="ธีมสีทางการของระบบ"
            >
              ธีมสีระบบ
            </div>
          ) : (
            <ImageIcon className="size-6 text-neutral-300" />
          )}
        </div>

        {/* Action Buttons & Input */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:bg-neutral-50 hover:border-brand-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="size-3.5 animate-spin text-brand-600" />
              ) : (
                <Upload className="size-3.5 text-brand-600" />
              )}
              {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดจากเครื่อง"}
            </button>
            <span className="text-[11px] text-neutral-400">หรือวางลิงก์ URL</span>
          </div>

          <input
            value={value}
            onChange={(e) => onPick(e.target.value)}
            placeholder={isBackground ? "ใช้ธีมสีเขียวไล่เฉดของระบบ (หรือวางลิงก์รูปภาพ)" : "วาง URL รูปภาพ (เช่น /logo.svg หรือ https://...)"}
            className="h-8 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs outline-none placeholder:text-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Appearance Page Component ───────────────────────────────────────────
export function AppearancePage() {
  const { toast } = useToast();
  const [s, setS] = React.useState({ ...APPEARANCE_SETTINGS });
  const [initial, setInitial] = React.useState({ ...APPEARANCE_SETTINGS });
  const [previewDevice, setPreviewDevice] = React.useState<"pc" | "mobile">("pc");
  const [previewSide, setPreviewSide] = React.useState<"left" | "right">("left");
  const [isSaving, setIsSaving] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const previewBoxRef = React.useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = React.useState(600);

  // Resize observer to scale PC Desktop iframe dynamically to fill frame 100%
  React.useEffect(() => {
    if (!previewBoxRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setBoxWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(previewBoxRef.current);
    return () => ro.disconnect();
  }, [previewDevice]);

  // Scaled dimensions for PC desktop preview (Virtual canvas 1024x640)
  const virtualWidth = 1024;
  const virtualHeight = 640;
  const pcScale = Math.min(1, Math.max(0.2, boxWidth / virtualWidth));
  const pcComputedHeight = Math.round(virtualHeight * pcScale);

  const set = <K extends keyof typeof APPEARANCE_SETTINGS>(k: K, v: (typeof APPEARANCE_SETTINGS)[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  // PostMessage sync to real customer login iframe
  const postToIframe = React.useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_APPEARANCE",
          payload: {
            site_primary_color: s.primary_color,
            theme_primary_color: s.primary_color,
            site_logo_url: s.logo_url,
            site_name: s.site_name,
            site_tagline: s.site_tagline,
            login_hero_heading: s.login_hero_heading,
            login_feature_1: s.login_feature_1,
            login_feature_2: s.login_feature_2,
            login_feature_3: s.login_feature_3,
            login_stat_1_val: s.login_stat_1_val,
            login_stat_1_label: s.login_stat_1_label,
            login_stat_2_val: s.login_stat_2_val,
            login_stat_2_label: s.login_stat_2_label,
            login_stat_3_val: s.login_stat_3_val,
            login_stat_3_label: s.login_stat_3_label,
          },
        },
        "*"
      );
    }
  }, [s]);

  React.useEffect(() => {
    postToIframe();
  }, [postToIframe]);

  // Load real settings from Supabase
  React.useEffect(() => {
    fetch("/api/admin/data?resource=settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const dict = res.data;
          const loaded = {
            site_name: dict.site_name || APPEARANCE_SETTINGS.site_name,
            site_tagline: dict.site_tagline || APPEARANCE_SETTINGS.site_tagline,
            site_badge: dict.site_badge || APPEARANCE_SETTINGS.site_badge,
            login_hero_heading: dict.login_hero_heading || APPEARANCE_SETTINGS.login_hero_heading,
            login_feature_1: dict.login_feature_1 || APPEARANCE_SETTINGS.login_feature_1,
            login_feature_2: dict.login_feature_2 || APPEARANCE_SETTINGS.login_feature_2,
            login_feature_3: dict.login_feature_3 || APPEARANCE_SETTINGS.login_feature_3,
            login_stat_1_val: dict.login_stat_1_val || APPEARANCE_SETTINGS.login_stat_1_val,
            login_stat_1_label: dict.login_stat_1_label || APPEARANCE_SETTINGS.login_stat_1_label,
            login_stat_2_val: dict.login_stat_2_val || APPEARANCE_SETTINGS.login_stat_2_val,
            login_stat_2_label: dict.login_stat_2_label || APPEARANCE_SETTINGS.login_stat_2_label,
            login_stat_3_val: dict.login_stat_3_val || APPEARANCE_SETTINGS.login_stat_3_val,
            login_stat_3_label: dict.login_stat_3_label || APPEARANCE_SETTINGS.login_stat_3_label,
            login_form_title: dict.login_form_title || APPEARANCE_SETTINGS.login_form_title,
            login_form_subtitle: dict.login_form_subtitle || APPEARANCE_SETTINGS.login_form_subtitle,
            login_badge_1_title: dict.login_badge_1_title || APPEARANCE_SETTINGS.login_badge_1_title,
            login_badge_1_sub: dict.login_badge_1_sub || APPEARANCE_SETTINGS.login_badge_1_sub,
            login_badge_2_title: dict.login_badge_2_title || APPEARANCE_SETTINGS.login_badge_2_title,
            login_badge_2_sub: dict.login_badge_2_sub || APPEARANCE_SETTINGS.login_badge_2_sub,
            login_badge_3_title: dict.login_badge_3_title || APPEARANCE_SETTINGS.login_badge_3_title,
            login_badge_3_sub: dict.login_badge_3_sub || APPEARANCE_SETTINGS.login_badge_3_sub,
            site_copyright: dict.site_copyright || APPEARANCE_SETTINGS.site_copyright,
            primary_color: dict.theme_primary_color || dict.site_primary_color || APPEARANCE_SETTINGS.primary_color,
            font_family: dict.theme_font || dict.font_family || APPEARANCE_SETTINGS.font_family,
            default_mode: dict.theme_dark_mode === "true" || dict.theme_dark_mode === "dark" ? "dark" : (dict.default_mode || APPEARANCE_SETTINGS.default_mode),
            logo_url: dict.site_logo_url || dict.logo_url || APPEARANCE_SETTINGS.logo_url,
            favicon_url: dict.site_favicon_url || dict.favicon_url || APPEARANCE_SETTINGS.favicon_url,
            login_bg_url: dict.login_bg_url || APPEARANCE_SETTINGS.login_bg_url,
            popup_enabled: dict.popup_enabled !== undefined ? (dict.popup_enabled === "true" || dict.popup_enabled === true) : APPEARANCE_SETTINGS.popup_enabled,
            popup_title: dict.popup_title || APPEARANCE_SETTINGS.popup_title,
            popup_description: dict.popup_description || APPEARANCE_SETTINGS.popup_description,
            popup_image_url: dict.popup_image_url || APPEARANCE_SETTINGS.popup_image_url,
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
            site_name: s.site_name,
            site_tagline: s.site_tagline,
            site_badge: s.site_badge,
            login_hero_heading: s.login_hero_heading,
            login_feature_1: s.login_feature_1,
            login_feature_2: s.login_feature_2,
            login_feature_3: s.login_feature_3,
            login_stat_1_val: s.login_stat_1_val,
            login_stat_1_label: s.login_stat_1_label,
            login_stat_2_val: s.login_stat_2_val,
            login_stat_2_label: s.login_stat_2_label,
            login_stat_3_val: s.login_stat_3_val,
            login_stat_3_label: s.login_stat_3_label,
            login_form_title: s.login_form_title,
            login_form_subtitle: s.login_form_subtitle,
            login_badge_1_title: s.login_badge_1_title,
            login_badge_1_sub: s.login_badge_1_sub,
            login_badge_2_title: s.login_badge_2_title,
            login_badge_2_sub: s.login_badge_2_sub,
            login_badge_3_title: s.login_badge_3_title,
            login_badge_3_sub: s.login_badge_3_sub,
            site_copyright: s.site_copyright,
            primary_color: s.primary_color,
            font: s.font_family,
            dark_mode: s.default_mode === "dark",
            logo_url: s.logo_url,
            favicon_url: s.favicon_url,
            login_bg_url: s.login_bg_url,
            popup_enabled: s.popup_enabled,
            popup_title: s.popup_title,
            popup_description: s.popup_description,
            popup_image_url: s.popup_image_url,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: "อัปเดตข้อมูลรูปลักษณ์ลงระบบ Supabase เรียบร้อยแล้ว",
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

  // ── Layout Element: Preview Frame (Full-frame, zero empty bottom) ─────────────
  const PreviewSection = (
    <div className="space-y-3 sticky top-20">
      {/* Preview Header & Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-brand-600" />
          <span className="text-xs font-bold text-neutral-700 tracking-tight">
            พรีวิวหน้าจอจริง (Customer Login)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Side button */}
          <button
            type="button"
            onClick={() => setPreviewSide(previewSide === "left" ? "right" : "left")}
            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 shadow-xs transition-all"
            title="สลับฝั่งการแสดงผล พรีวิว / ตั้งค่า"
          >
            <ArrowLeftRight className="size-3 text-neutral-400" />
            <span>สลับฝั่ง ({previewSide === "left" ? "ซ้าย" : "ขวา"})</span>
          </button>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-0.5 border border-neutral-200">
            <button
              type="button"
              onClick={() => setPreviewDevice("pc")}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                previewDevice === "pc" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Laptop className="size-3" /> หน้าจอ PC
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
                previewDevice === "mobile" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Smartphone className="size-3" /> มือถือ
            </button>
          </div>
        </div>
      </div>

      {/* Browser / Device Frame — FULL FRAME */}
      <Panel className="overflow-hidden p-0 border border-neutral-300 rounded-3xl shadow-xl bg-neutral-900/5">
        {/* Desktop Browser Window Titlebar */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-1 text-[11px] text-neutral-600 max-w-sm w-full justify-center shadow-xs mx-2">
            <Lock className="size-3 text-emerald-600 shrink-0" />
            <span className="truncate font-mono text-emerald-800 font-medium">https://th-lotto-plus.vercel.app/login</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (iframeRef.current) iframeRef.current.src = "https://th-lotto-plus.vercel.app/login?preview=true";
              }}
              title="รีเฟรชหน้าพรีวิว"
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw className="size-3" />
            </button>
            <a
              href="https://th-lotto-plus.vercel.app/login"
              target="_blank"
              rel="noreferrer"
              title="เปิดหน้าเว็บจริงในแท็บใหม่"
              className="p-1 text-neutral-400 hover:text-brand-600 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Viewport Screen Content */}
        <div
          ref={previewBoxRef}
          className="w-full flex items-center justify-center bg-neutral-100 overflow-hidden"
          style={{ minHeight: previewDevice === "mobile" ? "640px" : undefined }}
        >
          {previewDevice === "mobile" ? (
            /* Mobile Device Frame */
            <div className="py-6">
              <div className="w-[360px] h-[640px] rounded-[38px] border-4 border-neutral-800 bg-white shadow-2xl overflow-hidden relative flex flex-col">
                {/* Mobile Speaker / Notch */}
                <div className="w-full bg-neutral-800 h-5 flex items-center justify-center shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-neutral-600" />
                </div>
                <iframe
                  ref={iframeRef}
                  src="https://th-lotto-plus.vercel.app/login?preview=true"
                  title="Customer Login Live Preview (Mobile)"
                  className="w-full flex-1 border-0"
                  onLoad={postToIframe}
                />
              </div>
            </div>
          ) : (
            /* PC Desktop Viewport: 100% Full-Frame (No empty bottom) */
            <div
              className="w-full overflow-hidden relative bg-white"
              style={{ height: pcComputedHeight }}
            >
              <div
                style={{
                  width: virtualWidth,
                  height: virtualHeight,
                  transform: `scale(${pcScale})`,
                  transformOrigin: "top left",
                }}
                className="absolute top-0 left-0"
              >
                <iframe
                  ref={iframeRef}
                  src="https://th-lotto-plus.vercel.app/login?preview=true"
                  title="Customer Login Live Preview (PC Desktop)"
                  className="w-full h-full border-0"
                  onLoad={postToIframe}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-2 text-[11px] text-neutral-400">
          <span>ความละเอียดพรีวิว: {previewDevice === "pc" ? `${virtualWidth}×${virtualHeight} (สเกล ${Math.round(pcScale * 100)}%)` : "360×640 (Mobile)"}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> ซิงค์สดแบบเรียลไทม์
          </span>
        </div>
      </Panel>
    </div>
  );

  // ── Layout Element: Settings Controls Form ───────────────────────────────────
  const SettingsSection = (
    <div className="space-y-4">
      {/* Group 1: Brand Identity */}
      <Panel className="p-5 space-y-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
          <Building2 className="size-4 text-brand-600" /> 1. ข้อมูลและอัตลักษณ์แบรนด์ (Brand Identity)
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="ชื่อระบบ / ชื่อแบรนด์">
            <Input
              value={s.site_name}
              onChange={(e) => set("site_name", e.target.value)}
              placeholder="เช่น TH LOTTO II"
              className={inputCls}
            />
          </Field>
          <Field label="สโลแกนใต้ชื่อแบรนด์">
            <Input
              value={s.site_tagline}
              onChange={(e) => set("site_tagline", e.target.value)}
              placeholder="เช่น ระบบสลากและล็อตโต้ออนไลน์"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="ป้ายกำกับความปลอดภัย (Badge)">
          <Input
            value={s.site_badge}
            onChange={(e) => set("site_badge", e.target.value)}
            placeholder="เช่น มาตรฐานความปลอดภัยข้อมูล SSL 256-Bit"
            className={inputCls}
          />
        </Field>
      </Panel>

      {/* Group 2: Login Highlights & Bullets */}
      <Panel className="p-5 space-y-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
          <Sparkles className="size-4 text-brand-600" /> 2. ข้อความจุดเด่นบนหน้าล็อกอิน (Login Page Highlights)
        </p>
        <Field label="หัวข้อใหญ่โปรโมทระบบ">
          <Input
            value={s.login_hero_heading}
            onChange={(e) => set("login_hero_heading", e.target.value)}
            placeholder="ระบบสลากและล็อตโต้ออนไลน์ มาตรฐานความมั่นคงระดับสูง"
            className={inputCls}
          />
        </Field>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-600">รายการจุดเด่น 3 ข้อ (Feature Bullets)</label>
          <Input
            value={s.login_feature_1}
            onChange={(e) => set("login_feature_1", e.target.value)}
            placeholder="จุดเด่นข้อที่ 1"
            className={inputCls}
          />
          <Input
            value={s.login_feature_2}
            onChange={(e) => set("login_feature_2", e.target.value)}
            placeholder="จุดเด่นข้อที่ 2"
            className={inputCls}
          />
          <Input
            value={s.login_feature_3}
            onChange={(e) => set("login_feature_3", e.target.value)}
            placeholder="จุดเด่นข้อที่ 3"
            className={inputCls}
          />
        </div>

        {/* 3 Stats Columns */}
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
            <BarChart3 className="size-3.5 text-brand-600" /> สถิติ 3 ช่อง (ด้านล่างแถบแบรนด์)
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Input
                value={s.login_stat_1_val}
                onChange={(e) => set("login_stat_1_val", e.target.value)}
                placeholder="ตัวเลข (เช่น 9)"
                className={cn(inputCls, "font-bold text-center")}
              />
              <Input
                value={s.login_stat_1_label}
                onChange={(e) => set("login_stat_1_label", e.target.value)}
                placeholder="ป้ายกำกับ"
                className={cn(inputCls, "text-[11px] text-center")}
              />
            </div>
            <div className="space-y-1">
              <Input
                value={s.login_stat_2_val}
                onChange={(e) => set("login_stat_2_val", e.target.value)}
                placeholder="ตัวเลข (เช่น 100%)"
                className={cn(inputCls, "font-bold text-center")}
              />
              <Input
                value={s.login_stat_2_label}
                onChange={(e) => set("login_stat_2_label", e.target.value)}
                placeholder="ป้ายกำกับ"
                className={cn(inputCls, "text-[11px] text-center")}
              />
            </div>
            <div className="space-y-1">
              <Input
                value={s.login_stat_3_val}
                onChange={(e) => set("login_stat_3_val", e.target.value)}
                placeholder="ตัวเลข (เช่น 24/7)"
                className={cn(inputCls, "font-bold text-center")}
              />
              <Input
                value={s.login_stat_3_label}
                onChange={(e) => set("login_stat_3_label", e.target.value)}
                placeholder="ป้ายกำกับ"
                className={cn(inputCls, "text-[11px] text-center")}
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* Group 3: Form Details & Trust Badges */}
      <Panel className="p-5 space-y-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
          <FileCheck className="size-4 text-brand-600" /> 3. ฟอร์มเข้าสู่ระบบ & ป้ายรับรอง (Login Form & Badges)
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="หัวข้อฟอร์ม">
            <Input
              value={s.login_form_title}
              onChange={(e) => set("login_form_title", e.target.value)}
              placeholder="เข้าสู่ระบบสมาชิก"
              className={inputCls}
            />
          </Field>
          <Field label="คำบรรยายใต้ฟอร์ม">
            <Input
              value={s.login_form_subtitle}
              onChange={(e) => set("login_form_subtitle", e.target.value)}
              placeholder="กรุณากรอกหมายเลขโทรศัพท์และรหัส PIN 4 หลักเพื่อเข้าใช้งาน"
              className={inputCls}
            />
          </Field>
        </div>

        {/* 3 Trust Badges */}
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
            <ShieldCheck className="size-3.5 text-brand-600" /> ป้ายความน่าเชื่อถือ 3 กล่อง (Trust Badges ใต้ฟอร์ม)
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Input
                value={s.login_badge_1_title}
                onChange={(e) => set("login_badge_1_title", e.target.value)}
                placeholder="หัวข้อ 1"
                className={cn(inputCls, "text-[11px] font-bold text-center")}
              />
              <Input
                value={s.login_badge_1_sub}
                onChange={(e) => set("login_badge_1_sub", e.target.value)}
                placeholder="คำบรรยาย 1"
                className={cn(inputCls, "text-[10px] text-center text-neutral-500")}
              />
            </div>
            <div className="space-y-1">
              <Input
                value={s.login_badge_2_title}
                onChange={(e) => set("login_badge_2_title", e.target.value)}
                placeholder="หัวข้อ 2"
                className={cn(inputCls, "text-[11px] font-bold text-center")}
              />
              <Input
                value={s.login_badge_2_sub}
                onChange={(e) => set("login_badge_2_sub", e.target.value)}
                placeholder="คำบรรยาย 2"
                className={cn(inputCls, "text-[10px] text-center text-neutral-500")}
              />
            </div>
            <div className="space-y-1">
              <Input
                value={s.login_badge_3_title}
                onChange={(e) => set("login_badge_3_title", e.target.value)}
                placeholder="หัวข้อ 3"
                className={cn(inputCls, "text-[11px] font-bold text-center")}
              />
              <Input
                value={s.login_badge_3_sub}
                onChange={(e) => set("login_badge_3_sub", e.target.value)}
                placeholder="คำบรรยาย 3"
                className={cn(inputCls, "text-[10px] text-center text-neutral-500")}
              />
            </div>
          </div>
        </div>

        <Field label="ข้อความลิขสิทธิ์ (Footer Copyright)">
          <Input
            value={s.site_copyright}
            onChange={(e) => set("site_copyright", e.target.value)}
            placeholder="© 2569 TH-LOTTO · สงวนลิขสิทธิ์ทุกประการ"
            className={inputCls}
          />
        </Field>
      </Panel>

      {/* Group 4: Visual Assets with Upload from Device */}
      <Panel className="space-y-3.5 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5">
          <ImageIcon className="size-4 text-brand-600" /> 4. ไฟล์ภาพและโลโก้ (Visual Assets — อัปโหลดจากเครื่องได้)
        </p>

        <ImageSlot
          label="โลโก้ระบบ (System Logo)"
          hint="แนะนำไฟล์ SVG หรือ PNG โปร่งใส 512×512 px"
          value={s.logo_url}
          onPick={(v) => set("logo_url", v)}
        />

        <ImageSlot
          label="ไอคอนแท็บเบราว์เซอร์ (Favicon)"
          hint="ขนาด 32×32 หรือ 64×64 px (.ico / .png)"
          value={s.favicon_url}
          onPick={(v) => set("favicon_url", v)}
        />

        <ImageSlot
          label="ภาพพื้นหลังหน้าล็อกอิน (Login Wallpaper)"
          hint="ค่าเริ่มต้นคือธีมสีเขียวไล่เฉดของระบบ (หรืออัปโหลดภาพ 1920×1080 px)"
          value={s.login_bg_url}
          onPick={(v) => set("login_bg_url", v)}
          isBackground={true}
        />
      </Panel>

      {/* Group 5: Primary Color & Theme */}
      <Panel className="p-5 space-y-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
          <Palette className="size-4 text-brand-600" /> 5. สีหลักและธีม (Primary Color & Mode)
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
          <span className="text-xs text-neutral-400">กำหนดสีหลักสำหรับปุ่มและไฮไลต์</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-neutral-100 pt-3">
          <Field label="ฟอนต์หลักของระบบ">
            <div className="flex flex-wrap gap-1.5">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set("font_family", f)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
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

      {/* Group 6: ป๊อปอัปต้อนรับ & โปรโมชั่นหน้าแรก (Welcome & Promo Popup Modal) */}
      <Panel className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
            <Sparkles className="size-4 text-amber-500" /> 6. ป๊อปอัปต้อนรับ & โปรโมชั่นหน้าแรก (Welcome & Promo Popup Modal)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600">
              {s.popup_enabled ? "เปิดแสดงผลหน้าแรก" : "ปิดการแสดงผล"}
            </span>
            <button
              type="button"
              onClick={() => set("popup_enabled", !s.popup_enabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                s.popup_enabled ? "bg-emerald-500" : "bg-neutral-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  s.popup_enabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="หัวข้อป๊อปอัป (Popup Title)">
            <Input
              value={s.popup_title}
              onChange={(e) => set("popup_title", e.target.value)}
              placeholder="ยินดีต้อนรับสู่ TH LOTTO II"
              className={inputCls}
            />
          </Field>

          <Field label="รายละเอียดโปรโมชั่น / คำโปรย (Popup Description)">
            <Input
              value={s.popup_description}
              onChange={(e) => set("popup_description", e.target.value)}
              placeholder="สมาชิกใหม่ รับโบนัสฟรี 50% จากยอดฝากครั้งแรก!!"
              className={inputCls}
            />
          </Field>

          <ImageSlot
            label="รูปภาพแบนเนอร์ป๊อปอัป (Popup Banner Image)"
            hint="รองรับไฟล์ภาพ .png, .jpg, .webp อัปโหลดตรงจากคอมพิวเตอร์ หรือวางลิงก์ URL"
            value={s.popup_image_url}
            onPick={(v) => set("popup_image_url", v)}
          />
        </div>
      </Panel>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page Header with Action Buttons */}
      <PageHeader
        title="ตั้งค่ารูปลักษณ์ระบบ (Appearance Settings)"
        description="ปรับแต่งข้อมูลแบรนด์ ข้อความจุดเด่น ป้ายรับรอง โทนสี โลโก้ และพรีวิวหน้าจอจริงแบบเรียลไทม์"
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

      {/* ─── 2-Column Split Layout (50:50 side-by-side) ─── */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {previewSide === "left" ? (
          <>
            <div>{PreviewSection}</div>
            <div>{SettingsSection}</div>
          </>
        ) : (
          <>
            <div>{SettingsSection}</div>
            <div>{PreviewSection}</div>
          </>
        )}
      </div>
    </div>
  );
}
