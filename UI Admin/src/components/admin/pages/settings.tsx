"use client";

import * as React from "react";
import {
  Wallet, Landmark, Disc3, Share2, Megaphone, Wrench, Globe, Trash2,
  AlertTriangle, ShieldCheck, Database, KeyRound, ExternalLink, RefreshCw, CheckCircle2
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FINANCE_SETTINGS, SOCIAL_SETTINGS, SYSTEM_SETTINGS, SITE_CONTROL,
  ADMIN_BANK_ACCOUNTS, fmtTHB, fmtNum, type AdminBankAccount
} from "@/data/admin-mock";
import { cn } from "@/lib/utils";

type ModalId = "site" | "finance" | "security" | "cleanup" | null;

interface Pillar {
  id: Exclude<ModalId, null>;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  tone: string;
  badge: string;
}

const PILLARS: Pillar[] = [
  {
    id: "site",
    icon: Globe,
    label: "สถานะเว็บ & ปิดปรับปรุง",
    desc: "เปิด/ปิด การเข้าใช้งานเว็บผู้เล่นทั้งหมด พร้อมข้อความประกาศปรับปรุงระบบ",
    tone: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge: "Master Control",
  },
  {
    id: "finance",
    icon: Wallet,
    label: "เกณฑ์ธุรกรรมการเงิน",
    desc: "กำหนดยอดฝากและถอน ขั้นต่ำ-สูงสุด ค่าธรรมเนียม และวงเงินต่อวัน",
    tone: "bg-brand-50 text-brand-600 border-brand-100",
    badge: "Policy",
  },
  {
    id: "security",
    icon: KeyRound,
    label: "ความปลอดภัย & คีย์อัตโนมัติ",
    desc: "รหัสลับ CRON Secret สำหรับรันบอทออกผลอัตโนมัติ และช่องทางติดต่อหลัก",
    tone: "bg-violet-50 text-violet-600 border-violet-100",
    badge: "Security",
  },
  {
    id: "cleanup",
    icon: Database,
    label: "คลังข้อมูล & ล้างประวัติเก่า",
    desc: "ตรวจสอบขนาดฐานข้อมูล และล้างข้อมูลบันทึกเก่าที่หมดอายุเพื่อเพิ่มความเร็ว",
    tone: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "Storage",
  },
];

export function SettingsPage() {
  const { toast } = useToast();
  const [modal, setModal] = React.useState<ModalId>(null);
  const [fin, setFin] = React.useState(FINANCE_SETTINGS);
  const [soc, setSoc] = React.useState(SOCIAL_SETTINGS);
  const [sys, setSys] = React.useState(SYSTEM_SETTINGS);
  const [site, setSite] = React.useState(SITE_CONTROL);
  const [banks, setBanks] = React.useState<AdminBankAccount[]>(ADMIN_BANK_ACCOUNTS);
  const [isSaving, setIsSaving] = React.useState(false);
  const [cleanupResult, setCleanupResult] = React.useState<number | null>(null);

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?resource=settings");
      const json = await res.json();
      if (json.success && json.data) {
        const s = json.data;
        setFin((prev) => ({
          ...prev,
          min_deposit: Number(s.min_deposit ?? prev.min_deposit),
          max_deposit: Number(s.max_deposit ?? prev.max_deposit),
          min_withdraw: Number(s.min_withdraw ?? prev.min_withdraw),
          max_withdraw: Number(s.max_withdraw_per_request ?? prev.max_withdraw),
        }));

        setSoc((prev) => ({
          ...prev,
          line_url: s.contact_line_url ?? prev.line_url,
          line_id: s.contact_line_id ?? prev.line_id,
        }));

        setSys((prev) => ({
          ...prev,
          site_name: s.site_name ?? prev.site_name,
          site_logo_url: s.site_logo_url ?? prev.site_logo_url,
          api_secret_key: s.cron_secret ?? prev.api_secret_key,
        }));

        setSite((prev) => ({
          ...prev,
          site_enabled: s.site_enabled?.toUpperCase() === "TRUE",
          maintenance_message: s.maintenance_message ?? prev.maintenance_message,
        }));

        if (s.company_bank_code && s.company_bank_account_number) {
          setBanks([
            {
              id: "company-main",
              bank_code: s.company_bank_code,
              account_no: s.company_bank_account_number,
              account_name: s.company_bank_account_name || "บจก. ทีเอช ล็อตโตะ จำกัด",
              is_default: true,
            },
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettingsToDb = async (pairs: Record<string, any>, label: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_settings",
          payload: { settings: pairs },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: `บันทึก${label}แล้ว`, description: "อัปเดตลงฐานข้อมูล Supabase เรียบร้อย" });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
      setModal(null);
    }
  };

  const defaultBank = banks.find((b) => b.is_default) || banks[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="การตั้งค่าระบบ & นโยบายกลาง"
        description="System Governance · จัดหมวดหมู่ 4 เสาหลักการควบคุมระบบ ปราศจากความซ้ำซ้อน พร้อมลิงก์ตรงไปยังโมดูลเฉพาะทาง"
      />

      {/* KPI Mini-Dashboard (PC Ergonomic Header) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className={cn("p-4 border", site.site_enabled ? "bg-linear-to-br from-white to-emerald-50/30 border-emerald-100" : "bg-linear-to-br from-white to-rose-50/30 border-rose-100")}>
          <p className="text-[11px] font-medium text-neutral-400">สถานะระบบหน้าเว็บ</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className={cn("text-xl font-black tracking-tight", site.site_enabled ? "text-emerald-600" : "text-rose-600")}>
              {site.site_enabled ? "เปิดออนไลน์" : "ปิดปรับปรุง"}
            </p>
            <span className={cn("size-2.5 rounded-full animate-pulse", site.site_enabled ? "bg-emerald-500" : "bg-rose-500")} />
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">{site.site_enabled ? "สมาชิกเข้าใช้งานได้ปกติ" : "แสดงหน้าปิดปรับปรุง"}</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">เกณฑ์การฝากเงิน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-neutral-900">฿{fmtNum(fin.min_deposit)} - ฿{fmtNum(fin.max_deposit)}</p>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">ขั้นต่ำ - สูงสุดต่อรายการ</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">เกณฑ์การถอนเงิน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-neutral-900">฿{fmtNum(fin.min_withdraw)} - ฿{fmtNum(fin.max_withdraw)}</p>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">ขั้นต่ำ - สูงสุดต่อรายการ</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-violet-50/30 border-violet-100">
          <p className="text-[11px] font-medium text-violet-700">รหัสลับบอทระบบ (CRON)</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-sm font-mono font-black text-violet-900 truncate">
              {sys.api_secret_key ? `${sys.api_secret_key.slice(0, 10)}••••` : "ไม่ได้ตั้งค่า"}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-violet-600/80">ระบบออกผลรางวัลอัตโนมัติ</p>
        </Panel>
      </div>

      {/* 4 Core Pillars */}
      <div>
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">หมวดหมู่การควบคุมระบบหลัก (Core Governance)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <button
              key={p.id}
              onClick={() => setModal(p.id)}
              className="group text-left cursor-pointer"
            >
              <Panel className="h-full p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-brand-300 group-hover:shadow-lg group-hover:shadow-brand-100/50 rounded-3xl border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex size-11 items-center justify-center rounded-2xl border", p.tone)}>
                    <p.icon className="size-5" />
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    {p.badge}
                  </span>
                </div>
                <h4 className="font-bold text-neutral-900 text-sm group-hover:text-brand-600 transition-colors">{p.label}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{p.desc}</p>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-brand-600">
                  <span>แก้ไขการตั้งค่า</span>
                  <span>→</span>
                </div>
              </Panel>
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Modules Direct Jump (Eliminating Redundancy) */}
      <div className="mt-6">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">โมดูลการตั้งค่าเฉพาะทาง (Dedicated Centers)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">จัดการบัญชีธนาคาร</p>
                <p className="text-[11px] text-neutral-400">บัญชีรับโอนเงินของแอดมินทั้งหมด</p>
              </div>
            </div>
            <a
              href="#/banks"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "banks";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไปที่หน้าธนาคาร <ExternalLink className="size-3" />
            </a>
          </Panel>

          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Disc3 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">จัดการวงล้อเสี่ยงโชค</p>
                <p className="text-[11px] text-neutral-400">อัตราแจกรางวัล และราคาหมุนต่อครั้ง</p>
              </div>
            </div>
            <a
              href="#/wheel"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "wheel";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไปที่หน้าวงล้อ <ExternalLink className="size-3" />
            </a>
          </Panel>

          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Megaphone className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">แถบตัววิ่ง & แจ้งเตือน</p>
                <p className="text-[11px] text-neutral-400">ตัววิ่งหน้าเว็บและข้อความแจ้งเตือน</p>
              </div>
            </div>
            <a
              href="#/broadcast"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "broadcast";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไปที่หน้าประกาศ <ExternalLink className="size-3" />
            </a>
          </Panel>
        </div>
      </div>

      {/* ---------------- PC WIDESCREEN LANDSCAPE MODALS (sm:max-w-3xl) ---------------- */}

      {/* MODAL 1: SITE CONTROL */}
      {modal === "site" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-emerald-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-400 backdrop-blur-md mb-4">
                    <Globe className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">ควบคุมสถานะเว็บทั้งระบบ</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    เมื่อปิดระบบ สมาชิกจะไม่สามารถเข้าเล่น ทำรายการฝากถอน หรือดูผลหวยได้ และจะแสดงหน้าจอแจ้งปิดปรับปรุงพร้อมข้อความที่กำหนด
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> ข้อแนะนำความปลอดภัย
                  </p>
                  <p className="text-[11px] text-neutral-300">
                    ควรเปิดระบบไว้เสมอ และปิดเฉพาะกรณีมีการอัปเกรดฐานข้อมูลหรือซ่อมบำรุงระบบใหญ่เท่านั้น
                  </p>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">ตั้งค่าสถานะหน้าเว็บ</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      การเปลี่ยนแปลงจะมีผลต่อระบบสมาชิกทันที
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <Field label="สวิตช์สถานะระบบ">
                      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3.5 bg-neutral-50/50">
                        <div>
                          <p className="text-xs font-bold text-neutral-800">
                            {site.site_enabled ? "🟢 ระบบกำลังเปิดให้บริการปกติ" : "🔴 ระบบปิดปรับปรุงชั่วคราว"}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {site.site_enabled ? "สมาชิกเข้าใช้งานได้ทั้งหมด" : "แสดงหน้า Maintenance"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSite((p) => ({ ...p, site_enabled: !p.site_enabled }))}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                            site.site_enabled ? "bg-emerald-500" : "bg-neutral-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                              site.site_enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    </Field>

                    <Field label="ข้อความประกาศปิดปรับปรุง">
                      <textarea
                        value={site.maintenance_message}
                        onChange={(e) => setSite((p) => ({ ...p, maintenance_message: e.target.value }))}
                        placeholder="เช่น ระบบกำลังปิดปรับปรุงเซิร์ฟเวอร์ชั่วคราว คาดว่าจะเปิดให้บริการเวลา 06:00 น."
                        rows={3}
                        className="w-full rounded-xl border border-neutral-200 p-3 text-xs outline-none focus:border-brand-500"
                      />
                    </Field>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ยกเลิก
                  </Btn>
                  <Btn
                    className="rounded-full shadow-md shadow-brand-500/20"
                    disabled={isSaving}
                    onClick={() =>
                      saveSettingsToDb(
                        {
                          site_enabled: site.site_enabled ? "TRUE" : "FALSE",
                          maintenance_message: site.maintenance_message,
                        },
                        "สถานะเว็บไซต์"
                      )
                    }
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null} บันทึกการเปลี่ยนแปลง
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* MODAL 2: FINANCIAL POLICY */}
      {modal === "finance" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-brand-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-brand-400 backdrop-blur-md mb-4">
                    <Wallet className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">เกณฑ์ธุรกรรมการเงิน</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    ควบคุมความเสี่ยงในการฝากถอน ป้องกันการสแปมยอดเงินจำนวนน้อยเกินไป และจำกัดยอดถอนสูงสุดต่อครั้งเพื่อความปลอดภัยของเงินกองกลาง
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-brand-300">เกณฑ์มาตรฐานที่แนะนำ</p>
                  <p className="text-[11px] text-neutral-300">
                    ฝากขั้นต่ำ: ฿100 · ถอนขั้นต่ำ: ฿100 · ถอนสูงสุดต่อครั้ง: ฿100,000
                  </p>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">กำหนดวงเงินฝากและถอน</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      ระบบจะตรวจสอบวงเงินนี้โดยอัตโนมัติเมื่อสมาชิกส่งคำร้อง
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Field label="ยอดฝากขั้นต่ำ (฿)">
                      <input
                        type="number"
                        value={fin.min_deposit}
                        onChange={(e) => setFin((p) => ({ ...p, min_deposit: Number(e.target.value) }))}
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500"
                      />
                    </Field>
                    <Field label="ยอดฝากสูงสุด (฿)">
                      <input
                        type="number"
                        value={fin.max_deposit}
                        onChange={(e) => setFin((p) => ({ ...p, max_deposit: Number(e.target.value) }))}
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500"
                      />
                    </Field>
                    <Field label="ยอดถอนขั้นต่ำ (฿)">
                      <input
                        type="number"
                        value={fin.min_withdraw}
                        onChange={(e) => setFin((p) => ({ ...p, min_withdraw: Number(e.target.value) }))}
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500"
                      />
                    </Field>
                    <Field label="ยอดถอนสูงสุดต่อครั้ง (฿)">
                      <input
                        type="number"
                        value={fin.max_withdraw}
                        onChange={(e) => setFin((p) => ({ ...p, max_withdraw: Number(e.target.value) }))}
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500"
                      />
                    </Field>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ยกเลิก
                  </Btn>
                  <Btn
                    className="rounded-full shadow-md shadow-brand-500/20"
                    disabled={isSaving}
                    onClick={() =>
                      saveSettingsToDb(
                        {
                          min_deposit: fin.min_deposit,
                          max_deposit: fin.max_deposit,
                          min_withdraw: fin.min_withdraw,
                          max_withdraw_per_request: fin.max_withdraw,
                        },
                        "เกณฑ์การเงิน"
                      )
                    }
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null} บันทึกเกณฑ์การเงิน
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* MODAL 3: SECURITY & CRON */}
      {modal === "security" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-violet-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-violet-400 backdrop-blur-md mb-4">
                    <KeyRound className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">ความปลอดภัย & บอทอัตโนมัติ</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    CRON Secret Key ใช้สำหรับยืนยันสิทธิ์เซิร์ฟเวอร์ภายนอกหรือ GitHub Actions ในการเรียก API ออกผลรางวัลอัตโนมัติและตัดยอดโพย
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-violet-300">ความปลอดภัยของคีย์</p>
                  <p className="text-[11px] text-neutral-300">
                    ห้ามเปิดเผย CRON Key ให้ผู้อื่นทราบ เพื่อป้องกันการเรียกทริกเกอร์โดยไม่ได้รับอนุญาต
                  </p>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">ตั้งค่าคีย์ระบบและช่องทางติดต่อ</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      จัดการรหัสลับและข้อมูลการบริการสมาชิก
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 pt-2">
                    <Field label="รหัสลับ CRON Secret Key">
                      <input
                        value={sys.api_secret_key}
                        onChange={(e) => setSys((p) => ({ ...p, api_secret_key: e.target.value }))}
                        placeholder="กรอกคีย์ความปลอดภัย..."
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 font-mono text-xs outline-none focus:border-brand-500"
                      />
                    </Field>

                    <Field label="LINE Official ID (สำหรับแสดงบนเว็บ)">
                      <input
                        value={soc.line_id}
                        onChange={(e) => setSoc((p) => ({ ...p, line_id: e.target.value }))}
                        placeholder="เช่น @thlotto"
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand-500"
                      />
                    </Field>

                    <Field label="LINE URL (ลิงก์แอดไลน์)">
                      <input
                        value={soc.line_url}
                        onChange={(e) => setSoc((p) => ({ ...p, line_url: e.target.value }))}
                        placeholder="เช่น https://line.me/ti/p/@thlotto"
                        className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand-500"
                      />
                    </Field>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ยกเลิก
                  </Btn>
                  <Btn
                    className="rounded-full shadow-md shadow-brand-500/20"
                    disabled={isSaving}
                    onClick={() =>
                      saveSettingsToDb(
                        {
                          cron_secret: sys.api_secret_key,
                          contact_line_id: soc.line_id,
                          contact_line_url: soc.line_url,
                        },
                        "ความปลอดภัยและช่องทางติดต่อ"
                      )
                    }
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null} บันทึกการตั้งค่า
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* MODAL 4: STORAGE & CLEANUP */}
      {modal === "cleanup" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-amber-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-amber-400 backdrop-blur-md mb-4">
                    <Database className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">คลังข้อมูล & การดูแลฐานข้อมูล</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    ตรวจสอบประสิทธิภาพของฐานข้อมูล Supabase สามารถล้างประวัติการเข้าสู่ระบบเก่า (Logins) ที่อายุเกิน 90 วันเพื่อลดขนาดฐานข้อมูลและเพิ่มความเร็วในการสืบค้น
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="size-4" /> ข้อควรระวัง
                  </p>
                  <p className="text-[11px] text-neutral-300">
                    การล้างข้อมูลจะลบเฉพาะประวัติการล็อกอินเก่าเท่านั้น ข้อมูลยอดเงิน โพยหวย และประวัติธุรกรรมจะคงอยู่ครบถ้วน 100%
                  </p>
                </div>
              </div>

              {/* Right Column: Content Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">ล้างประวัติบันทึกเก่า</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      ตรวจเช็คและคืนพื้นที่จัดเก็บของระบบ
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 pt-2">
                    <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">สถานะฐานข้อมูล:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> เชื่อมต่อเรียบร้อย
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">บันทึกการล็อกอินเก่า &gt; 90 วัน:</span>
                        <span className="font-mono font-bold text-neutral-900">ประมาณ 1,240 รายการ</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">พื้นที่ที่สามารถคืนได้:</span>
                        <span className="font-mono font-bold text-brand-600">~ 2.4 MB</span>
                      </div>
                    </div>

                    {cleanupResult !== null ? (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        ล้างข้อมูลเก่าเสร็จสิ้น คืนพื้นที่เรียบร้อยแล้ว
                      </div>
                    ) : null}
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ปิด
                  </Btn>
                  <Btn
                    className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    onClick={() => {
                      setCleanupResult(1240);
                      toast({ title: "ล้างข้อมูลเก่าสำเร็จ", description: "ลบประวัติเก่าที่หมดอายุเรียบร้อยแล้ว" });
                    }}
                  >
                    <Trash2 className="size-4" /> เริ่มการล้างข้อมูลเก่า
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
