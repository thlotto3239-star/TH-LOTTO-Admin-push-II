"use client";

import * as React from "react";
import {
  Sparkles, Save, Upload, RefreshCw, Eye, Image as ImageIcon,
  CheckCircle2, AlertCircle, ExternalLink, Trash2, Power, RotateCcw
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls } from "../primitives";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PopupConfig {
  popup_enabled: boolean;
  popup_title: string;
  popup_description: string;
  popup_image_url: string;
  popup_version: string;
}

export function PopupPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Active DB configuration
  const [dbData, setDbData] = React.useState<PopupConfig>({
    popup_enabled: true,
    popup_title: "",
    popup_description: "",
    popup_image_url: "",
    popup_version: "",
  });

  // Form State
  const [form, setForm] = React.useState<PopupConfig>({
    popup_enabled: true,
    popup_title: "",
    popup_description: "",
    popup_image_url: "",
    popup_version: "",
  });

  // Fetch current live settings from Supabase
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data?resource=popup");
      const json = await res.json();
      if (json.success && json.data) {
        const config: PopupConfig = {
          popup_enabled: Boolean(json.data.popup_enabled),
          popup_title: json.data.popup_title || "",
          popup_description: json.data.popup_description || "",
          popup_image_url: json.data.popup_image_url || "",
          popup_version: json.data.popup_version || "",
        };

        setDbData(config);
        setForm(config);
      }
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        description: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle direct file upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "ขนาดไฟล์เกินกำหนด",
        description: "กรุณาเลือกไฟล์ภาพขนาดไม่เกิน 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "sliders");
      formData.append("path", "popup");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, popup_image_url: data.url }));
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
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save changes to database
  const handleSave = async (bumpVersion = false) => {
    setSaving(true);
    try {
      const newVersion = bumpVersion ? String(Date.now()) : (form.popup_version || String(Date.now()));

      const payload = {
        popup_enabled: form.popup_enabled ? "true" : "false",
        popup_title: form.popup_title.trim(),
        popup_description: form.popup_description.trim(),
        popup_image_url: form.popup_image_url.trim(),
        popup_version: newVersion,
      };

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_settings",
          payload: { settings: payload },
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: "บันทึกการตั้งค่าสำเร็จ",
          description: bumpVersion
            ? "บันทึกข้อมูลและรีเซ็ตเวอร์ชันเรียบร้อย ผู้เล่นทุกคนจะเห็นป๊อปอัปนี้ใหม่ทันที"
            : "อัปเดตข้อมูลป๊อปอัปหน้าแรกบนฐานข้อมูลจริงเรียบร้อยแล้ว",
        });
        setDbData({ ...form, popup_version: newVersion });
        setForm((prev) => ({ ...prev, popup_version: newVersion }));
      } else {
        throw new Error(json.error || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err: any) {
      toast({
        title: "บันทึกล้มเหลว",
        description: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    form.popup_enabled !== dbData.popup_enabled ||
    form.popup_title !== dbData.popup_title ||
    form.popup_description !== dbData.popup_description ||
    form.popup_image_url !== dbData.popup_image_url;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <PageHeader
        title="จัดการป๊อปอัปหน้าแรก (Welcome & Promo Popup Modal)"
        description="ควบคุมป๊อปอัปโปรโมชั่นและประกาศที่เด้งขึ้นมาบนหน้าแรกของผู้ใช้งานครั้งแรก เชื่อมต่อฐานข้อมูล Supabase แบบ Real-time"
      >
        <div className="flex items-center gap-2">
          <Btn
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading || saving}
            className="gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            รีเฟรช
          </Btn>
          <Btn
            variant="default"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={saving || loading}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            บันทึกการตั้งค่า
          </Btn>
        </div>
      </PageHeader>

      {/* Live DB Status Bar */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">สถานะป๊อปอัปในฐานข้อมูลปัจจุบัน</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                    dbData.popup_enabled
                      ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", dbData.popup_enabled ? "bg-emerald-600 animate-pulse" : "bg-slate-400")} />
                  {dbData.popup_enabled ? "เปิดแสดงผลหน้าแรก (Active)" : "ปิดการแสดงผล (Disabled)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เวอร์ชันปัจจุบัน: <span className="font-mono text-slate-700 font-semibold">{dbData.popup_version || "ตั้งค่าเริ่มต้น"}</span>
                {dbData.popup_image_url ? (
                  <span className="ml-2 text-emerald-700 font-medium">✓ มีรูปภาพประกอบในระบบ</span>
                ) : (
                  <span className="ml-2 text-amber-600 font-medium">⚠ ไม่มีรูปภาพประกอบ (แสดงเฉพาะข้อความ)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 active:scale-95 transition-all"
              title="เปลี่ยนเวอร์ชันป๊อปอัปเพื่อให้ผู้ใช้งานที่เคยกดปิดไปแล้ว เห็นป๊อปอัปนี้ใหม่อีกครั้ง"
            >
              <RotateCcw className="size-3.5 text-amber-700" />
              รีเซ็ตเวอร์ชันให้ผู้เล่นทุกคนเห็นใหม่
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section 1: Activation Switch */}
          <Panel className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">เปิด / ปิดการแสดงป๊อปอัป</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  เมื่อเปิด ป๊อปอัปจะแสดงขึ้นมากลางหน้าจอทันทีเมื่อผู้ใช้งานเข้าสู่หน้าแรก
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-bold", form.popup_enabled ? "text-emerald-600" : "text-slate-400")}>
                  {form.popup_enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, popup_enabled: !prev.popup_enabled }))}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                    form.popup_enabled ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-neutral-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      form.popup_enabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Section 2: Text Contents */}
            <div className="space-y-4 pt-1">
              <Field label="หัวข้อป๊อปอัป (Popup Title)">
                <Input
                  value={form.popup_title}
                  onChange={(e) => setForm((prev) => ({ ...prev, popup_title: e.target.value }))}
                  placeholder="เช่น ยินดีต้อนรับสู่ TH LOTTO II หรือ โปรโมชั่นพิเศษวันนี้"
                  className={inputCls}
                />
              </Field>

              <Field label="รายละเอียด / คำโปรยโปรโมชั่น (Popup Description)">
                <Textarea
                  value={form.popup_description}
                  onChange={(e) => setForm((prev) => ({ ...prev, popup_description: e.target.value }))}
                  placeholder="เช่น สมาชิกใหม่ รับโบนัสฟรี 50% จากยอดฝากครั้งแรก!! หรือรายละเอียดกิจกรรม"
                  rows={3}
                  className="rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 resize-none leading-relaxed"
                />
              </Field>
            </div>
          </Panel>

          {/* Section 3: Image Management */}
          <Panel className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">รูปภาพแบนเนอร์ป๊อปอัป (Popup Image)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                แนะนำรูปภาพอัตราส่วน 1:1 (จัตุรัส เช่น 800×800 px) หรือ 4:3 รองรับไฟล์ PNG, JPG, WEBP
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพจากคอมพิวเตอร์"}
                </button>

                {form.popup_image_url ? (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, popup_image_url: "" }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="size-3.5" />
                    ลบรูปภาพ
                  </button>
                ) : null}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  หรือวางลิงก์ URL รูปภาพโดยตรง:
                </label>
                <Input
                  value={form.popup_image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, popup_image_url: e.target.value }))}
                  placeholder="https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/popup/..."
                  className={cn(inputCls, "font-mono text-xs")}
                />
              </div>

              {form.popup_image_url && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">URL ปัจจุบัน:</span>
                  <a
                    href={form.popup_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-emerald-600 hover:underline flex items-center gap-1 max-w-sm"
                  >
                    {form.popup_image_url}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </Panel>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setForm(dbData)}
              disabled={!isDirty || saving}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              คืนค่าตามฐานข้อมูลเดิม
            </button>

            <div className="flex items-center gap-2">
              <Btn
                variant="default"
                onClick={() => handleSave(false)}
                disabled={saving || loading}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 font-bold shadow-md shadow-emerald-600/20"
              >
                {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Btn>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Visual Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="size-4 text-emerald-600" />
                ตัวอย่างจริงบนหน้าจอผู้เล่น (Live Player Preview)
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                สเกล 1:1 แบบ Responsive
              </span>
            </div>

            {/* Mobile Viewport Simulation Container */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-300/80 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
              {/* Dimmed Background Overlay simulating Customer App Home */}
              <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" style={{ backgroundImage: "url('/bg.webp')" }} />

              {/* Modal Container */}
              <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
                {/* Image Section */}
                {form.popup_image_url ? (
                  <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.popup_image_url}
                      alt="ป๊อปอัปโฆษณา"
                      className="w-full h-full object-cover"
                    />
                    {!form.popup_enabled && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center gap-1 p-4 text-center">
                        <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                          ⚪ ปิดการแสดงผลอยู่
                        </span>
                        <span className="text-[11px] text-white/80">ผู้เล่นจะไม่เห็นป๊อปอัปนี้จนกว่าจะเปิดใช้งาน</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-emerald-800 via-emerald-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
                    <ImageIcon className="size-12 text-white/30 mb-2" />
                    <p className="text-xs font-bold">ไม่มีรูปภาพแบนเนอร์</p>
                    <p className="text-[11px] text-white/60 mt-1">จะแสดงเฉพาะหัวข้อและรายละเอียดข้อความ</p>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4 space-y-2 text-left">
                  <h3 className="font-bold text-slate-800 text-base leading-snug">
                    {form.popup_title || "ยินดีต้อนรับสู่ TH LOTTO II"}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {form.popup_description || "สมาชิกใหม่ รับโบนัสฟรี 50% จากยอดฝากครั้งแรก!!"}
                  </p>

                  {/* Buttons matching Customer UI Home.jsx 1:1 */}
                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl active:scale-95 transition text-center shadow-xs"
                    >
                      ปิด
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold rounded-xl active:scale-95 transition text-center"
                    >
                      ไม่แสดงอีก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
