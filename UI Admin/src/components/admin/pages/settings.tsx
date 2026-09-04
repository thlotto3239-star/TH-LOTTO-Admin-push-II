"use client";

import * as React from "react";
import {
  Wallet, Landmark, Disc3, Share2, Megaphone, Wrench, Globe, Trash2, Plus, AlertTriangle, Bell,
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, BankBadge, BankSelector, ToggleRow } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  FINANCE_SETTINGS, WHEEL_SETTINGS, SOCIAL_SETTINGS, SYSTEM_SETTINGS, SITE_CONTROL,
  ADMIN_BANK_ACCOUNTS, ANNOUNCEMENTS, CLEANUP_PREVIEW, fmtTHB, fmtNum,
  type AdminBankAccount, type Announcement,
} from "@/data/admin-mock";
import { cn } from "@/lib/utils";

type ModalId = "finance" | "banks" | "wheel" | "social" | "announce" | "system" | "site" | "cleanup" | null;

const HUB: { id: Exclude<ModalId, null>; icon: React.ComponentType<{ className?: string }>; label: string; desc: string; tone: string }[] = [
  { id: "finance", icon: Wallet, label: "การเงิน", desc: "ฝาก/ถอน ขั้นต่ำ-สูงสุด ค่าธรรมเนียม โบนัสต้อนรับ", tone: "bg-brand-50 text-brand-600" },
  { id: "banks", icon: Landmark, label: "ธนาคาร", desc: "บัญชีรับเงินของแอดมิน เพิ่ม/ลบ/ตั้งค่าเริ่มต้น", tone: "bg-sky-50 text-sky-600" },
  { id: "wheel", icon: Disc3, label: "วงล้อ", desc: "เปิด/ปิด ราคาหมุน จำนวนหมุนต่อวัน", tone: "bg-amber-50 text-amber-600" },
  { id: "social", icon: Share2, label: "ช่องทางติดต่อ", desc: "ไลน์ / เฟซบุ๊ก / เบอร์โทร / เทเลแกรม", tone: "bg-violet-50 text-violet-600" },
  { id: "announce", icon: Megaphone, label: "ประกาศ", desc: "ข้อความวิ่งด้านบนเว็บ — เพิ่ม แก้ไข ลบ จัดลำดับ", tone: "bg-rose-50 text-rose-600" },
  { id: "system", icon: Wrench, label: "ระบบ", desc: "ชื่อเว็บ โลโก้ คำอธิบาย และคีย์ลับระบบ", tone: "bg-neutral-100 text-neutral-600" },
  { id: "site", icon: Globe, label: "ควบคุมเว็บ", desc: "เปิด/ปิดเว็บทั้งหมด + ข้อความปิดปรับปรุง (เจ้าของเว็บ)", tone: "bg-brand-50 text-brand-700" },
  { id: "cleanup", icon: Trash2, label: "ล้างข้อมูลเก่า", desc: "ล้างข้อมูลเก่าในคลังระบบ พร้อมพรีวิวจำนวน", tone: "bg-orange-50 text-orange-600" },
];

function Shell({
  title,
  desc,
  children,
  onClose,
  onSave,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave?: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>
            {onSave ? "ยกเลิก" : "ปิด"}
          </Btn>
          {onSave ? (
            <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={onSave}>
              บันทึกข้อมูล
            </Btn>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const [modal, setModal] = React.useState<ModalId>(null);
  const [fin, setFin] = React.useState(FINANCE_SETTINGS);
  const [whl, setWhl] = React.useState(WHEEL_SETTINGS);
  const [soc, setSoc] = React.useState(SOCIAL_SETTINGS);
  const [sys, setSys] = React.useState(SYSTEM_SETTINGS);
  const [site, setSite] = React.useState(SITE_CONTROL);
  const [banks, setBanks] = React.useState<AdminBankAccount[]>(ADMIN_BANK_ACCOUNTS);
  const [newBank, setNewBank] = React.useState<AdminBankAccount>({ id: "", bank_code: "", account_no: "", account_name: "", is_default: false });
  const [anns, setAnns] = React.useState<Announcement[]>(ANNOUNCEMENTS);
  const [newAnn, setNewAnn] = React.useState("");
  const [cleanupResult, setCleanupResult] = React.useState<number | null>(null);

  const save = (label: string) => {
    toast({ title: `บันทึก${label}แล้ว`, description: "บันทึกลงตารางการตั้งค่าเรียบร้อย (ตัวอย่าง)" });
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="ตั้งค่าระบบ" description="ตารางการตั้งค่า · เลือกหมวดที่ต้องการตั้งค่า — ทั้งหมด 8 หมวด" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {HUB.map((h) => (
          <button key={h.id} onClick={() => setModal(h.id)} className="group text-left">
            <Panel className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-md group-hover:shadow-brand-100/60">
              <div className={cn("mb-3 flex size-12 items-center justify-center rounded-2xl", h.tone)}>
                <h.icon className="size-5" />
              </div>
              <p className="font-bold text-neutral-900">{h.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{h.desc}</p>
            </Panel>
          </button>
        ))}
      </div>

      {/* Modal 1: การเงิน */}
      {modal === "finance" ? (
        <Shell title="การเงิน (Finance Settings)" desc="กำหนดขั้นต่ำ/สูงสุดของฝาก-ถอน ค่าธรรมเนียม และโบนัสต้อนรับ" onClose={() => setModal(null)} onSave={() => save("ตั้งค่าการเงิน")}>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ฝากขั้นต่ำ (บาท)"><Input type="number" value={fin.min_deposit} onChange={(e) => setFin({ ...fin, min_deposit: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ฝากสูงสุด (บาท)"><Input type="number" value={fin.max_deposit} onChange={(e) => setFin({ ...fin, max_deposit: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ถอนขั้นต่ำ (บาท)"><Input type="number" value={fin.min_withdraw} onChange={(e) => setFin({ ...fin, min_withdraw: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ถอนสูงสุด (บาท)"><Input type="number" value={fin.max_withdraw} onChange={(e) => setFin({ ...fin, max_withdraw: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ค่าธรรมเนียมฝาก (%)"><Input type="number" value={fin.deposit_fee} onChange={(e) => setFin({ ...fin, deposit_fee: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ค่าธรรมเนียมถอน (%)"><Input type="number" value={fin.withdraw_fee} onChange={(e) => setFin({ ...fin, withdraw_fee: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="โบนัสต้อนรับ (บาท)"><Input type="number" value={fin.welcome_bonus} onChange={(e) => setFin({ ...fin, welcome_bonus: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="ยอดแทงที่ต้องทำ (เท่า)"><Input type="number" value={fin.welcome_bonus_turnover} onChange={(e) => setFin({ ...fin, welcome_bonus_turnover: Number(e.target.value) })} className={inputCls} /></Field>
            </div>
          </div>
        </Shell>
      ) : null}

      {/* Modal 2: บัญชีธนาคาร Admin */}
      {modal === "banks" ? (
        <Shell title="บัญชีธนาคาร Admin" desc="รายการบัญชีรับเงินของระบบ — เพิ่ม/ลบ/ตั้งค่าเริ่มต้น" onClose={() => setModal(null)} onSave={() => save("บัญชีธนาคาร")}>
          <div className="space-y-2.5">
            {banks.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 rounded-2xl bg-neutral-50 px-3.5 py-3">
                <div className="min-w-0">
                  <BankBadge code={b.bank_code} />
                  <p className="mt-0.5 truncate font-mono text-xs text-neutral-600">{b.account_no} · {b.account_name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {b.is_default ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200">ค่าเริ่มต้น</span>
                  ) : (
                    <Btn variant="ghost" size="sm" className="h-7 rounded-full text-[11px]" onClick={() => { setBanks((p) => p.map((x) => ({ ...x, is_default: x.id === b.id }))); toast({ title: "ตั้งบัญชีค่าเริ่มต้นแล้ว" }); }}>ตั้งเริ่มต้น</Btn>
                  )}
                  <Btn variant="ghost" size="sm" className="h-7 rounded-full text-rose-500 hover:bg-rose-50" onClick={() => { setBanks((p) => p.filter((x) => x.id !== b.id)); toast({ title: "ลบบัญชีธนาคารแล้ว" }); }}>ลบ</Btn>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-neutral-300 p-3.5">
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-neutral-500"><Plus className="size-3.5" /> เพิ่มบัญชีธนาคารใหม่</p>
              <div className="grid gap-2.5">
                <BankSelector value={newBank.bank_code} onChange={(v) => setNewBank({ ...newBank, bank_code: v })} />
                <Input value={newBank.account_no} onChange={(e) => setNewBank({ ...newBank, account_no: e.target.value })} placeholder="เลขบัญชี" className={inputCls} />
                <Input value={newBank.account_name} onChange={(e) => setNewBank({ ...newBank, account_name: e.target.value })} placeholder="ชื่อบัญชี" className={inputCls} />
                <Btn size="sm" variant="outline" className="rounded-full" onClick={() => {
                  if (!newBank.bank_code || !newBank.account_no) { toast({ title: "กรอกธนาคารและเลขบัญชีก่อน", variant: "destructive" }); return; }
                  setBanks((p) => [...p, { ...newBank, id: `ab-${Date.now()}` }]);
                  setNewBank({ id: "", bank_code: "", account_no: "", account_name: "", is_default: false });
                  toast({ title: "เพิ่มบัญชีธนาคารแล้ว" });
                }}><Plus className="size-3.5" /> เพิ่มบัญชี</Btn>
              </div>
            </div>
          </div>
        </Shell>
      ) : null}

      {/* Modal 3: วงล้อ */}
      {modal === "wheel" ? (
        <Shell title="ตั้งค่าวงล้อโชคดี" desc="เปิด/ปิดเกมวงล้อ ราคาต่อครั้ง และโควตารายวัน" onClose={() => setModal(null)} onSave={() => save("ตั้งค่าวงล้อ")}>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-neutral-50 px-3.5 py-1">
              <ToggleRow label="เปิด/ปิดวงล้อ" desc="ปิดแล้วสมาชิกจะเห็นหน้าปิดปรับปรุงของเกม" checked={whl.lucky_wheel_enabled} onCheckedChange={(v) => setWhl({ ...whl, lucky_wheel_enabled: v })} />
            </div>
            <Field label="ราคาหมุน (บาท)"><Input type="number" value={whl.lucky_wheel_cost} onChange={(e) => setWhl({ ...whl, lucky_wheel_cost: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="จำนวนหมุนต่อวัน (ครั้ง)"><Input type="number" value={whl.lucky_wheel_daily_limit} onChange={(e) => setWhl({ ...whl, lucky_wheel_daily_limit: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
        </Shell>
      ) : null}

      {/* Modal 4: Social */}
      {modal === "social" ? (
        <Shell title="ช่องทางติดต่อ" desc="ลิงก์ช่องทางติดต่อที่แสดงบนหน้าเว็บสมาชิก" onClose={() => setModal(null)} onSave={() => save("ช่องทางติดต่อ")}>
          <div className="grid gap-3">
            <Field label="Line Official URL"><Input value={soc.line_url} onChange={(e) => setSoc({ ...soc, line_url: e.target.value })} className={inputCls} /></Field>
            <Field label="Facebook Page URL"><Input value={soc.facebook_url} onChange={(e) => setSoc({ ...soc, facebook_url: e.target.value })} className={inputCls} /></Field>
            <Field label="เบอร์โทรติดต่อ"><Input value={soc.contact_phone} onChange={(e) => setSoc({ ...soc, contact_phone: e.target.value })} className={inputCls} /></Field>
            <Field label="Telegram URL"><Input value={soc.telegram_url} onChange={(e) => setSoc({ ...soc, telegram_url: e.target.value })} className={inputCls} /></Field>
            <div className="rounded-2xl border border-neutral-100 p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">
                <Bell className="size-3.5" /> LINE Notify (จัดการที่ Supabase Backend)
              </p>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                <span className="text-neutral-400">line_notify_enabled</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700">🟢 เปิดอยู่ (true)</span>
                <span className="text-neutral-400">line_notify_win_threshold</span>
                <span className="font-mono text-neutral-700">&quot;5000&quot; — แจ้งเมื่อถอน/ชนะ ≥ ฿5,000</span>
                <span className="text-neutral-400">contact_line_url</span>
                <span className="font-mono text-neutral-700">https://lin.ee/zQAyRsM</span>
                <span className="text-neutral-400">contact_line_id</span>
                <span className="font-mono text-neutral-700">@653ufkvi</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
                ระบบส่งแจ้งเตือน LINE ทำงานฝั่ง Backend รวมถึง RPC fn_daily_summary_line (สรุปยอดประจำวัน) — หน้าเว็บแอดมินแสดงค่า read-only เท่านั้น
              </p>
            </div>
          </div>
        </Shell>
      ) : null}

      {/* Modal 5: ประกาศ Marquee */}
      {modal === "announce" ? (
        <Shell title="ประกาศหมุนวิ่ง" desc="ข้อความวิ่งด้านบนเว็บ — จัดลำดับและเปิด/ปิดแต่ละข้อความ" onClose={() => setModal(null)} onSave={() => save("ประกาศ")}>
          <div className="space-y-2.5">
            {anns.sort((a, b) => a.display_order - b.display_order).map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-2.5">
                <Input
                  value={a.message}
                  onChange={(e) => setAnns((p) => p.map((x) => (x.id === a.id ? { ...x, message: e.target.value } : x)))}
                  className="h-9 flex-1 rounded-xl border-neutral-200 bg-white text-sm"
                />
                <Input
                  type="number"
                  value={a.display_order}
                  onChange={(e) => setAnns((p) => p.map((x) => (x.id === a.id ? { ...x, display_order: Number(e.target.value) } : x)))}
                  className="h-9 w-16 shrink-0 rounded-xl border-neutral-200 bg-white text-center text-sm"
                  aria-label="ลำดับ"
                />
                <Switch checked={a.is_active} onCheckedChange={(v) => setAnns((p) => p.map((x) => (x.id === a.id ? { ...x, is_active: v } : x)))} aria-label="เปิด/ปิดประกาศ" />
                <Btn variant="ghost" size="sm" className="h-8 shrink-0 rounded-full px-2 text-rose-500 hover:bg-rose-50" onClick={() => { setAnns((p) => p.filter((x) => x.id !== a.id)); toast({ title: "ลบประกาศแล้ว" }); }}>ลบ</Btn>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newAnn} onChange={(e) => setNewAnn(e.target.value)} placeholder="พิมพ์ข้อความประกาศใหม่..." className={cn(inputCls, "flex-1")} />
              <Btn size="sm" variant="outline" className="rounded-full" onClick={() => {
                if (!newAnn.trim()) return;
                setAnns((p) => [...p, { id: `an-${Date.now()}`, message: newAnn.trim(), display_order: p.length + 1, is_active: true }]);
                setNewAnn("");
                toast({ title: "เพิ่มประกาศแล้ว" });
              }}><Plus className="size-3.5" /> เพิ่ม</Btn>
            </div>
          </div>
        </Shell>
      ) : null}

      {/* Modal 6: ระบบ */}
      {modal === "system" ? (
        <Shell title="ตั้งค่าระบบเว็บไซต์" desc="ข้อมูลพื้นฐานและช่องทางการเชื่อมต่อเว็บไซต์" onClose={() => setModal(null)} onSave={() => save("ตั้งค่าระบบ")}>
          <div className="grid gap-3">
            <Field label="ชื่อเว็บไซต์"><Input value={sys.site_name} onChange={(e) => setSys({ ...sys, site_name: e.target.value })} className={inputCls} /></Field>
            <Field label="ลิงก์โลโก้เว็บไซต์ (URL)"><Input value={sys.site_logo_url} onChange={(e) => setSys({ ...sys, site_logo_url: e.target.value })} placeholder="https://..." className={inputCls} /></Field>
            <Field label="คำอธิบายเว็บไซต์"><Textarea value={sys.site_description} onChange={(e) => setSys({ ...sys, site_description: e.target.value })} className={cn(inputCls, "min-h-16 rounded-xl")} /></Field>
            <Field label="รหัสกุญแจลับ API"><Input value={sys.api_secret_key} onChange={(e) => setSys({ ...sys, api_secret_key: e.target.value })} className={cn(inputCls, "font-mono text-xs")} /></Field>
          </div>
        </Shell>
      ) : null}

      {/* Modal 7: ควบคุมเว็บ (owner only) */}
      {modal === "site" ? (
        <Shell title="ควบคุมการเปิด/ปิดเว็บไซต์" desc="เปิดหรือปิดระบบให้บริการชั่วคราวสำหรับปรับปรุง" onClose={() => setModal(null)} onSave={() => save("ควบคุมเว็บ")}>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 ring-1 ring-inset ring-amber-100">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                ฟีเจอร์นี้เฉพาะ <b>Owner</b> (เบอร์ 0622306037) เท่านั้น — การปิดเว็บจะทำให้สมาชิกทุกคนเห็นหน้าปิดปรับปรุงทันที
              </p>
            </div>
            <div className="rounded-2xl bg-neutral-50 px-3.5 py-1">
              <ToggleRow label="เปิดให้บริการเว็บไซต์" desc={site.site_enabled ? "สถานะปัจจุบัน: เว็บเปิดให้บริการปกติ" : "สถานะปัจจุบัน: เว็บปิด — กำลังแสดงหน้าปิดปรับปรุง"} checked={site.site_enabled} onCheckedChange={(v) => setSite({ ...site, site_enabled: v })} />
            </div>
            <Field label="ข้อความแจ้งเตือนระหว่างปิดปรับปรุง">
              <Textarea value={site.maintenance_message} onChange={(e) => setSite({ ...site, maintenance_message: e.target.value })} className={cn(inputCls, "min-h-20 rounded-xl")} />
            </Field>
          </div>
        </Shell>
      ) : null}

      {/* Modal 8: Cleanup Storage */}
      {modal === "cleanup" ? (
        <Shell title="ล้างข้อมูลเก่าในคลังระบบ" desc="ดูพรีวิวจำนวนก่อนลบ" onClose={() => { setCleanupResult(null); setModal(null); }}>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-neutral-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-left text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                    <th className="px-3 py-2">ตาราง</th>
                    <th className="px-3 py-2">เงื่อนไข</th>
                    <th className="px-3 py-2 text-right">นับรายการ</th>
                  </tr>
                </thead>
                <tbody>
                  {CLEANUP_PREVIEW.map((c) => (
                    <tr key={c.table} className="border-t border-neutral-100">
                      <td className="px-3 py-2 font-mono text-xs font-bold text-neutral-700">{c.table}</td>
                      <td className="px-3 py-2 text-[11px] text-neutral-500">{c.condition}</td>
                      <td className="px-3 py-2 text-right font-bold text-neutral-900">{fmtNum(c.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cleanupResult !== null ? (
              <div className="rounded-2xl bg-brand-50 p-4 text-center ring-1 ring-inset ring-brand-100">
                <p className="text-xs text-brand-700">ลบสำเร็จ — total_deleted</p>
                <p className="text-3xl font-black text-brand-700">{fmtNum(cleanupResult)}</p>
                <p className="text-xs text-brand-600">รายการ</p>
              </div>
            ) : (
              <Btn variant="outline" className="w-full rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => {
                const total = CLEANUP_PREVIEW.reduce((a, c) => a + c.count, 0);
                setCleanupResult(total);
                toast({ title: "เคลียร์ทั้งหมดแล้ว", description: `admin_cleanup_storage ลบ ${fmtNum(total)} รายการ (ตัวอย่าง)` });
              }}>
                <Trash2 className="size-4" /> เคลียร์ทั้งหมด ({fmtNum(CLEANUP_PREVIEW.reduce((a, c) => a + c.count, 0))} รายการ)
              </Btn>
            )}
            <p className="text-center text-[11px] text-neutral-400">ค่าใช้จ่าย storage ปัจจุบันโดยประมาณ: {fmtTHB(126)} / เดือน</p>
          </div>
        </Shell>
      ) : null}
    </div>
  );
}
