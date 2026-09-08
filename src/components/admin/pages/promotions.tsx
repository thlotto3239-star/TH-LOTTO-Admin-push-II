"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Ticket, Upload, Image as ImageIcon, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ColorPickerInput } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type Promotion, fmtNum, fmtTHB } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EMPTY: Promotion = {
  id: "", title: "", promo_code: "", description: "", image_url: "", badge_text: "มาแรง", background_color: "#1b5e20",
  type: "deposit", line1: "ฝากเงินวันนี้", line2: "รับโบนัสพิเศษ", bonus_rate: 0, bonus_amount: 0, min_deposit: 100,
  max_withdrawal: 5000, turnover_multiplier: 2, default_amount: 500, allowed_game: "all",
  target_view: "deposit", max_uses_per_user: 1, max_uses_total: 0, starts_at: "", expires_at: "", is_active: true,
};

function PromoForm({ initial, onClose, onSave }: { initial: Promotion; onClose: () => void; onSave: (p: Promotion) => void }) {
  const [f, setF] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const set = <K extends keyof Promotion>(k: K, v: Promotion[K]) => {
    if (k === "image_url") setImgError(false);
    setF((p) => ({ ...p, [k]: v }));
  };
  const isNew = !initial.id;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "appearance");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      }).then((r) => r.json());

      if (res.success && res.url) {
        set("image_url", res.url);
        toast({
          title: "อัปโหลดภาพสำเร็จ",
          description: "อัปเดตรูปภาพตัวอย่างโปรโมชั่นเรียบร้อย",
        });
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch (err: any) {
      toast({
        title: "อัปโหลดล้มเหลว",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5 text-brand-600" />
            {isNew ? "เพิ่มโปรโมชั่นใหม่" : `แก้ไขโปรโมชั่น — ${initial.title}`}
          </DialogTitle>
          <DialogDescription>ตั้งค่าโปรโมชั่น เงื่อนไขโบนัส และตรวจสอบตัวอย่างภาพโปรโมชั่นด้านบนแบบ Real-time</DialogDescription>
        </DialogHeader>

        {/* ─── รูปภาพตัวอย่างด้านบน (Live Banner / Card Preview at the top) ─── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span className="font-bold flex items-center gap-1.5 text-neutral-700">
              <ImageIcon className="size-3.5 text-brand-600" />
              ภาพตัวอย่างโปรโมชั่น (Live Preview บนมือถือและคอมพิวเตอร์)
            </span>
            <span className="text-[11px] text-neutral-400">
              {f.image_url && !imgError ? "โหมดแสดงรูปภาพจริง" : "โหมดสีพื้นหลังสำเร็จรูป"}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-900 shadow-sm">
            {f.image_url && !imgError ? (
              <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                <img
                  src={f.image_url}
                  alt={f.title || "ตัวอย่างโปรโมชั่น"}
                  className="h-full w-full object-cover transition-all"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {f.badge_text ? (
                    <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white shadow-sm ring-1 ring-white/20">
                      {f.badge_text}
                    </span>
                  ) : null}
                  {f.promo_code ? (
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold text-neutral-200 border border-white/10">
                      {f.promo_code}
                    </span>
                  ) : null}
                </div>

                {!f.is_active ? (
                  <span className="absolute top-3 right-3 rounded-full bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-neutral-300 border border-neutral-700">
                    ปิดใช้งาน
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    เปิดใช้งาน
                  </span>
                )}

                {/* Bottom title info */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div>
                    <p className="text-[11px] text-neutral-300 font-medium">รูปภาพแบนเนอร์จริง</p>
                    <p className="text-lg sm:text-xl font-black drop-shadow line-clamp-1">{f.title || "ชื่อโปรโมชั่น"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm text-emerald-400 font-black block drop-shadow">
                      {f.bonus_rate > 0 ? `โบนัส +${f.bonus_rate}%` : f.bonus_amount > 0 ? `โบนัส ฿${f.bonus_amount}` : ""}
                    </span>
                    {f.turnover_multiplier > 0 && (
                      <span className="text-[10px] text-neutral-300 font-mono">ทำเทิร์น ×{f.turnover_multiplier}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* การ์ดสีสำเร็จรูปเมื่อไม่มีรูปภาพหรือโหลดภาพไม่ได้ */
              <div
                className="relative h-44 sm:h-52 w-full p-5 flex flex-col justify-between text-white"
                style={{
                  background: `linear-gradient(135deg, ${f.background_color || "#1b5e20"}, ${f.background_color || "#1b5e20"}dd)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      ตัวอย่างการ์ดข้อความ (ไม่มีรูปภาพ)
                    </span>
                    {f.badge_text ? (
                      <span className="rounded-full bg-white text-neutral-900 px-2.5 py-0.5 text-[11px] font-black shadow-xs">
                        {f.badge_text}
                      </span>
                    ) : null}
                  </div>
                  {!f.is_active ? (
                    <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-bold">ปิดใช้งาน</span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-[10px] font-bold">เปิดใช้งาน</span>
                  )}
                </div>

                <div className="text-center my-auto py-2">
                  <p className="text-sm font-medium opacity-90">{f.line1 || f.title || "ข้อความไฮไลต์บรรทัดที่ 1"}</p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow">{f.line2 || "พิเศษ"}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] opacity-85 border-t border-white/15 pt-2">
                  <span>โค้ด: <b>{f.promo_code || "—"}</b></span>
                  <span>ฝากขั้นต่ำ: <b>฿{f.min_deposit}</b></span>
                  <span>เทิร์นโอเวอร์: <b>×{f.turnover_multiplier}</b></span>
                </div>
              </div>
            )}

            {/* แถบควบคุมรูปภาพด่วนบนตัวอย่าง */}
            <div className="flex items-center justify-between gap-2 bg-neutral-900 px-4 py-2 border-t border-neutral-800 text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                <span className={cn("size-1.5 rounded-full", f.image_url && !imgError ? "bg-emerald-400" : "bg-amber-400")} />
                {f.image_url && !imgError
                  ? "กำลังแสดงตัวอย่างจากลิงก์รูปภาพ"
                  : imgError
                  ? "ลิงก์รูปภาพโหลดไม่สำเร็จ (แสดงสีแทน)"
                  : "ยังไม่มีรูปภาพ (ใช้สีพื้นหลังและข้อความไฮไลต์แทน)"}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Btn
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs rounded-lg border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="size-3 mr-1" />
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดภาพแบนเนอร์"}
                </Btn>
                {f.image_url && (
                  <Btn
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-lg border-neutral-700 text-neutral-400 hover:text-rose-400 hover:border-rose-800"
                    onClick={() => { set("image_url", ""); setImgError(false); }}
                  >
                    ล้างภาพ
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column responsive layout for PC */}
        <div className="grid gap-4 lg:grid-cols-2 pt-2">
          {/* Column 1: ข้อมูลหลัก */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
                <Ticket className="size-3.5 text-brand-600" /> ข้อมูลหลัก
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ชื่อโปรโมชั่น">
                  <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="เช่น โบนัสฝากแรกรับ 100%" className={inputCls} />
                </Field>
                <Field label="รหัสโปรโมชั่น (โค้ด)">
                  <Input value={f.promo_code} onChange={(e) => set("promo_code", e.target.value.toUpperCase())} placeholder="เช่น NEW100" className={cn(inputCls, "font-mono uppercase")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="คำอธิบายโปรโมชั่น">
                    <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="ระบุเงื่อนไขและรายละเอียดโปรโมชั่น..." className={cn(inputCls, "min-h-16 rounded-xl")} />
                  </Field>
                </div>
                <Field label="ข้อความป้ายกำกับ (Badge)">
                  <Input value={f.badge_text} onChange={(e) => set("badge_text", e.target.value)} placeholder="เช่น มาแรง, สมาชิกใหม่" className={inputCls} />
                </Field>
                <Field label="สีพื้นหลังรูปโปรโมชั่น">
                  <div className="flex items-center gap-2">
                    <ColorPickerInput
                      value={f.background_color}
                      onChange={(v) => set("background_color", v)}
                      ariaLabel="เลือกสีพื้นหลัง"
                    />
                    <Input value={f.background_color} onChange={(e) => set("background_color", e.target.value)} className={cn(inputCls, "font-mono text-xs")} />
                  </div>
                </Field>
                <Field label="ประเภทโปรโมชั่น">
                  <Select value={f.type} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {[
                        { v: "general", label: "ทั่วไป" },
                        { v: "deposit", label: "โบนัสฝากเงิน" },
                        { v: "referral", label: "แนะนำเพื่อน" },
                        { v: "special", label: "กิจกรรมพิเศษ" },
                        { v: "cashback", label: "คืนยอดเสีย" },
                        { v: "wheel_bonus", label: "โบนัสวงล้อ" },
                      ].map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="ลิงก์รูปโปรโมชั่น (URL)">
                    <div className="flex items-center gap-2">
                      <Input
                        value={f.image_url}
                        onChange={(e) => set("image_url", e.target.value)}
                        placeholder="https://... หรือกดอัปโหลดภาพด้านขวา"
                        className={inputCls}
                      />
                      <Btn
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-10 px-3 rounded-xl border-brand-200 text-brand-700 hover:bg-brand-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="size-3.5 mr-1" /> อัปโหลด
                      </Btn>
                    </div>
                  </Field>
                </div>
                <Field label="ข้อความไฮไลต์บรรทัดที่ 1 (กรณีไม่มีรูป)">
                  <Input value={f.line1} onChange={(e) => set("line1", e.target.value)} placeholder="เช่น ฝากครั้งแรกรับเพิ่ม" className={inputCls} />
                </Field>
                <Field label="ข้อความไฮไลต์บรรทัดที่ 2 (กรณีไม่มีรูป)">
                  <Input value={f.line2} onChange={(e) => set("line2", e.target.value)} placeholder="เช่น 100%" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* Column 2: เงื่อนไขทางการเงิน & ขอบเขตการใช้งาน */}
          <div className="space-y-4">
            {/* เงื่อนไขทางการเงิน */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">เงื่อนไขทางการเงิน</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="อัตราโบนัส (%)">
                  <Input type="number" min={0} value={f.bonus_rate} onChange={(e) => set("bonus_rate", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="ยอดโบนัสคงที่ (บาท)">
                  <Input type="number" min={0} value={f.bonus_amount} onChange={(e) => set("bonus_amount", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="ยอดฝากขั้นต่ำ (บาท)">
                  <Input type="number" min={0} value={f.min_deposit} onChange={(e) => set("min_deposit", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="ยอดถอนสูงสุด (บาท, 0=ไม่จำกัด)">
                  <Input type="number" min={0} value={f.max_withdrawal} onChange={(e) => set("max_withdrawal", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="ยอดเทิร์นโอเวอร์ (เท่า)">
                  <Input type="number" min={0} step="0.5" value={f.turnover_multiplier} onChange={(e) => set("turnover_multiplier", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="ยอดฝากแนะนำ (บาท)">
                  <Input type="number" min={0} value={f.default_amount} onChange={(e) => set("default_amount", Number(e.target.value))} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* ขอบเขตการใช้งาน & สิทธิ์ */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">ขอบเขต & สิทธิ์การใช้งาน</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="เกมที่ร่วมรายการได้">
                  <Select value={f.allowed_game} onValueChange={(v) => set("allowed_game", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {[
                        { v: "all", label: "ทุกเกมในระบบ" },
                        { v: "lotto", label: "หวยทุกประเภท" },
                        { v: "instant", label: "หวยหนึ่งนาที" },
                        { v: "wheel", label: "วงล้อนำโชค" },
                      ].map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="หน้าที่แสดงผลโปรโมชั่น">
                  <Select value={f.target_view} onValueChange={(v) => set("target_view", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {[
                        { v: "all", label: "แสดงทุกหน้า" },
                        { v: "deposit", label: "หน้าฝากเงิน" },
                        { v: "wheel", label: "หน้าวงล้อ" },
                        { v: "instant", label: "หน้าหวยหนึ่งนาที" },
                      ].map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="จำกัดสิทธิ์ (ครั้งต่อสมาชิก)">
                  <Input type="number" min={0} value={f.max_uses_per_user} onChange={(e) => set("max_uses_per_user", Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="จำกัดสิทธิ์รวมทั้งหมด (ครั้ง)">
                  <Input type="number" min={0} value={f.max_uses_total} onChange={(e) => set("max_uses_total", Number(e.target.value))} placeholder="0 = ไม่จำกัด" className={inputCls} />
                </Field>
                <Field label="วันเริ่มต้นโปรโมชั่น">
                  <Input
                    type="date"
                    value={f.starts_at ? f.starts_at.slice(0, 10) : ""}
                    onChange={(e) => set("starts_at", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="วันสิ้นสุดโปรโมชั่น">
                  <Input
                    type="date"
                    value={f.expires_at ? f.expires_at.slice(0, 10) : ""}
                    onChange={(e) => set("expires_at", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-neutral-200 sm:col-span-2">
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">เปิดใช้งานโปรโมชั่นนี้</p>
                    <p className="text-[11px] text-neutral-400">สมาชิกจะสามารถมองเห็นและรับสิทธิ์ได้</p>
                  </div>
                  <Switch checked={f.is_active} onCheckedChange={(v) => set("is_active", v)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full" onClick={() => { onSave(f); onClose(); }}>บันทึกโปรโมชั่น</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PromotionsPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Promotion[]>([]);
  const [form, setForm] = React.useState<{ initial: Promotion } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<Promotion | null>(null);

  const loadPromos = React.useCallback(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.promotions)) {
          setRows(
            res.data.promotions.map((p: any) => ({
              id: String(p.id),
              title: p.title || "",
              description: p.description || "",
              image_url: p.image_url || "",
              bonus_rate: Number(p.bonus_rate || 0),
              bonus_amount: Number(p.bonus_amount || 0),
              min_deposit: Number(p.min_deposit || 0),
              max_withdrawal: Number(p.max_withdrawal || 0),
              turnover_multiplier: Number(p.turnover_multiplier || 1),
              type: p.type || "percent",
              allowed_game: p.allowed_game || "all",
              badge_text: p.badge_text || "โปรโมชั่น",
              background_color: p.background_color || "#10b981",
              default_amount: Number(p.default_amount || 100),
              target_view: p.target_view || "deposit",
              is_active: Boolean(p.is_active),
              line1: p.line1 || p.title || "",
              line2: p.line2 || (Number(p.bonus_rate) > 0 ? `+${p.bonus_rate}%` : "พิเศษ"),
              max_uses_per_user: Number(p.max_uses_per_user || 1),
              max_uses_total: Number(p.max_uses_total || 1000),
              max_uses_per_day: Number(p.max_uses_per_day || 100),
              starts_at: p.starts_at || "",
              expires_at: p.expires_at || "",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const handleToggle = async (p: Promotion, active: boolean) => {
    setRows((rws) => rws.map((x) => (x.id === p.id ? { ...x, is_active: active } : x)));
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_promotion",
          payload: { ...p, is_active: active },
        }),
      });
      toast({ title: active ? "เปิดใช้งานโปรโมชั่นแล้ว" : "ปิดใช้งานโปรโมชั่นแล้ว", description: p.title });
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกสถานะได้", variant: "destructive" });
    }
  };

  const handleSave = async (p: Promotion) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_promotion",
          payload: p,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกโปรโมชั่นสำเร็จ", description: `${p.title} (${p.promo_code})` });
        loadPromos();
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (p: Promotion) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_promotion",
          payload: { id: p.id },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "ลบโปรโมชั่นแล้ว", description: p.title });
        loadPromos();
      } else {
        toast({ title: "ลบล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ลบล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const activeCount = rows.filter((r) => r.is_active).length;
  const maxBonus = rows.length > 0 ? Math.max(...rows.map((r) => r.bonus_rate || 0)) : 0;
  const avgTurnover = rows.length > 0 ? Math.round((rows.reduce((acc, r) => acc + (r.turnover_multiplier || 1), 0) / rows.length) * 10) / 10 : 1;

  return (
    <div className="space-y-4">
      <PageHeader title="โปรโมชั่น" description={`ตารางโปรโมชั่น · ทั้งหมด ${rows.length} โปร · เปิดใช้งาน ${activeCount} โปร`}>
        <Btn className="rounded-full" onClick={() => setForm({ initial: EMPTY })}><Plus className="size-4" /> เพิ่มโปรโมชั่น</Btn>
      </PageHeader>

      {/* KPI Mini-Dashboard (PC Ergonomic Header) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">แคมเปญทั้งหมด</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-neutral-900">{rows.length}</p>
            <span className="text-xs font-semibold text-neutral-500">โปรโมชั่น</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">สร้างไว้ในระบบ</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-emerald-50/30 border-emerald-100">
          <p className="text-[11px] font-medium text-emerald-700">เปิดใช้งานให้สมาชิก</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-emerald-600">{activeCount}</p>
            <span className="text-xs font-bold text-emerald-600">
              {rows.length > 0 ? Math.round((activeCount / rows.length) * 100) : 0}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/80">สมาชิกสามารถกดรับได้</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-amber-50/30 border-amber-100">
          <p className="text-[11px] font-medium text-amber-700">โบนัสสูงสุดในระบบ</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-amber-600">+{maxBonus}%</p>
            <span className="text-xs font-semibold text-amber-600">อัตราแจก</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600/80">สูงสุดต่อบิลการฝาก</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-purple-50/30 border-purple-100">
          <p className="text-[11px] font-medium text-purple-700">เทิร์นโอเวอร์เฉลี่ย</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-purple-600">{avgTurnover}x</p>
            <span className="text-xs font-semibold text-purple-600">เท่าของยอด</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-600/80">เงื่อนไขการถอนเฉลี่ย</p>
        </Panel>
      </div>

      {rows.length === 0 ? <Panel><EmptyState title="ยังไม่มีโปรโมชั่น" /></Panel> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <Panel key={p.id} className="overflow-hidden">
              {/* ภาพโปร */}
              {p.image_url ? (
                <div className="relative h-36 w-full overflow-hidden">
                  <img src={p.image_url} alt={p.title} className="h-36 w-full object-cover" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-800">{p.badge_text}</span>
                  {!p.is_active ? (
                    <span className="absolute left-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-bold text-white">ปิดใช้งาน</span>
                  ) : null}
                </div>
              ) : (
                <div className="relative flex h-36 items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${p.background_color}, ${p.background_color}dd)` }}>
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-800">{p.badge_text}</span>
                  {!p.is_active ? (
                    <span className="absolute left-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-bold text-white">ปิดใช้งาน</span>
                  ) : null}
                  <div className="text-center text-white">
                    <p className="text-sm opacity-90">{p.line1}</p>
                    <p className="text-4xl font-black tracking-tight drop-shadow">{p.line2}</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-neutral-900">{p.title}</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200">{p.promo_code}</span>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", p.is_active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-neutral-500")}>
                    {p.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{p.description}</p>

                {/* Badges of Key Financial Conditions & Scope */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-neutral-50/80 p-2.5 text-[11px] border border-neutral-100">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">โบนัส</span>
                    <span className="font-bold text-emerald-700">
                      {p.bonus_rate > 0 ? `+${p.bonus_rate}%` : p.bonus_amount > 0 ? `฿${fmtNum(p.bonus_amount)}` : "ตามเงื่อนไข"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">ฝากขั้นต่ำ</span>
                    <span className="font-bold text-neutral-800">
                      {p.min_deposit > 0 ? `฿${fmtNum(p.min_deposit)}` : "ไม่มีขั้นต่ำ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">ทำยอดเทิร์น</span>
                    <span className="font-bold text-purple-700">
                      {p.turnover_multiplier > 0 ? `×${p.turnover_multiplier} เท่า` : "ไม่ต้องทำ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">ถอนสูงสุด</span>
                    <span className="font-bold text-neutral-800">
                      {p.max_withdrawal > 0 ? `฿${fmtNum(p.max_withdrawal)}` : "ไม่จำกัด"}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                    เกม: {p.allowed_game === "all" ? "ทุกเกม" : p.allowed_game === "instant" ? "หวย 1 นาที" : p.allowed_game === "lotto" ? "หวยหลัก" : "วงล้อ"}
                  </span>
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                    สิทธิ์: {p.max_uses_per_user ? `${p.max_uses_per_user} ครั้ง/คน` : "ไม่จำกัด"}
                  </span>
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                    หน้า: {p.target_view === "deposit" ? "ฝากเงิน" : p.target_view === "all" ? "ทุกหน้า" : p.target_view}
                  </span>
                  {p.expires_at ? (
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                      หมดอายุ: {new Date(p.expires_at).toLocaleDateString("th-TH")}
                    </span>
                  ) : (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                      ตลอดชีพ
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={(v) => handleToggle(p, v)}
                      aria-label="เปิด/ปิดโปรโมชั่น"
                    />
                    <span className="text-xs font-medium text-neutral-600">{p.is_active ? "เปิดอยู่" : "ปิดอยู่"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => setForm({ initial: p })}>
                      <Pencil className="size-3.5" /> แก้ไข
                    </Btn>
                    <Btn size="sm" variant="outline" className="h-8 rounded-full border-rose-200 px-3 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(p)}>
                      <Trash2 className="size-3.5" /> ลบ
                    </Btn>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {form ? <PromoForm initial={form.initial} onClose={() => setForm(null)} onSave={handleSave} /> : null}

      {confirmDel ? (
        <Dialog open onOpenChange={(o) => !o && setConfirmDel(null)}>
          <DialogContent className="rounded-3xl sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>ลบโปรโมชั่น?</DialogTitle>
              <DialogDescription>ยืนยันการลบ &quot;{confirmDel.title}&quot; ({confirmDel.promo_code}) — การกระทำนี้ย้อนกลับไม่ได้</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Btn variant="outline" className="rounded-full" onClick={() => setConfirmDel(null)}>ยกเลิก</Btn>
              <Btn className="rounded-full bg-rose-600 hover:bg-rose-700" onClick={() => { handleDelete(confirmDel); setConfirmDel(null); }}>ลบถาวร</Btn>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
