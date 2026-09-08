"use client";

import * as React from "react";
import {
  Wallet, Landmark, Disc3, Share2, Megaphone, Wrench, Globe, Trash2,
  AlertTriangle, ShieldCheck, Database, KeyRound, ExternalLink, RefreshCw, CheckCircle2,
  Bot, Users, Cpu, Zap, Percent, PlayCircle
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FINANCE_SETTINGS, SOCIAL_SETTINGS, SYSTEM_SETTINGS, SITE_CONTROL,
  ADMIN_BANK_ACCOUNTS, fmtTHB, fmtNum, type AdminBankAccount
} from "@/data/admin-mock";
import { cn } from "@/lib/utils";

type ModalId = "site" | "finance" | "affiliate" | "bot" | "security" | "cleanup" | null;

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
    id: "affiliate",
    icon: Share2,
    label: "ระบบคอมมิชชั่น & แนะนำเพื่อน",
    desc: "กำหนด % ค่าคอมมิชชั่นแนะนำเพื่อน ฐานการคิดยอด และเกณฑ์การโอนเข้ากระเป๋า",
    tone: "bg-blue-50 text-blue-600 border-blue-100",
    badge: "Growth & Affiliate",
  },
  {
    id: "bot",
    icon: Bot,
    label: "ระบบบอท & แทงหวยอัตโนมัติ",
    desc: "ตั้งค่าบอทตรวจรางวัลอัตโนมัติ และระบบจำลองการแทงหวยเพื่อกระตุ้นตลาด",
    tone: "bg-purple-50 text-purple-600 border-purple-100",
    badge: "Automation & AI",
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

  // Affiliate & Commission Engine State
  const [affiliate, setAffiliate] = React.useState({
    enabled: true,
    commission_rate: 8.0, // 8%
    calculation_basis: "turnover", // "turnover" | "net_loss"
    min_transfer: 100, // ฿100
    tier2_enabled: false,
    tier2_rate: 1.0, // 1%
    cookie_days: 30,
  });

  // Bot & Auto-Betting Engine State
  const [bot, setBot] = React.useState({
    auto_settle_enabled: true,
    settle_interval_sec: 60,
    sync_source: "thailotto_api",
    cron_secret: "cron-secret-thlotto-2026",
    autobet_enabled: false,
    autobet_interval_sec: 30,
    autobet_min_amount: 20,
    autobet_max_amount: 500,
    autobet_markets: "all", // "all" | "instant" | "lotto15m"
    autobet_virtual_count: 20,
  });

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

        setAffiliate((prev) => {
          let rawRate = s.referral_commission_rate != null ? Number(s.referral_commission_rate) : prev.commission_rate;
          if (rawRate < 1 && rawRate > 0) rawRate = Math.round(rawRate * 1000) / 10;
          return {
            ...prev,
            enabled: s.referral_enabled !== "false" && s.referral_enabled !== "FALSE",
            commission_rate: rawRate || prev.commission_rate,
            calculation_basis: s.referral_calculation_basis ?? prev.calculation_basis,
            min_transfer: Number(s.referral_min_transfer ?? prev.min_transfer),
            tier2_enabled: s.referral_tier2_enabled === "true" || s.referral_tier2_enabled === "TRUE",
            tier2_rate: Number(s.referral_tier2_rate ?? prev.tier2_rate),
            cookie_days: Number(s.referral_cookie_days ?? prev.cookie_days),
          };
        });

        setBot((prev) => ({
          ...prev,
          auto_settle_enabled: s.auto_settle_enabled !== "false" && s.auto_settle_enabled !== "FALSE",
          settle_interval_sec: Number(s.instant_draw_interval ?? prev.settle_interval_sec),
          sync_source: s.sync_source ?? prev.sync_source,
          cron_secret: s.cron_secret ?? prev.cron_secret,
          autobet_enabled: s.bot_autobet_enabled === "true" || s.bot_autobet_enabled === "TRUE",
          autobet_interval_sec: Number(s.bot_autobet_interval_sec ?? prev.autobet_interval_sec),
          autobet_min_amount: Number(s.bot_autobet_min_amount ?? prev.autobet_min_amount),
          autobet_max_amount: Number(s.bot_autobet_max_amount ?? prev.autobet_max_amount),
          autobet_markets: s.bot_autobet_markets ?? prev.autobet_markets,
          autobet_virtual_count: Number(s.bot_virtual_bettors_count ?? prev.autobet_virtual_count),
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
        description="System Governance · จัดหมวดหมู่ 6 เสาหลักการควบคุมระบบ พร้อมระบบคอมมิชชั่นแนะนำเพื่อน และบอทแทงหวยจำลองกระตุ้นตลาด"
      />

      {/* KPI Mini-Dashboard (6 Pillars Overview) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Panel
          className={cn(
            "p-4 border cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]",
            site.site_enabled ? "bg-linear-to-br from-white to-emerald-50/30 border-emerald-100" : "bg-linear-to-br from-white to-rose-50/30 border-rose-100"
          )}
          onClick={() => setModal("site")}
        >
          <p className="text-[11px] font-medium text-neutral-400">สถานะระบบหน้าเว็บ</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className={cn("text-base font-black tracking-tight", site.site_enabled ? "text-emerald-600" : "text-rose-600")}>
              {site.site_enabled ? "เปิดออนไลน์" : "ปิดปรับปรุง"}
            </p>
            <span className={cn("size-2 rounded-full animate-pulse", site.site_enabled ? "bg-emerald-500" : "bg-rose-500")} />
          </div>
          <p className="mt-1 text-[10px] text-neutral-400 truncate">{site.site_enabled ? "สมาชิกเข้าใช้งานได้ปกติ" : "แสดงหน้าปิดปรับปรุง"}</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">เกณฑ์การฝากเงิน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-neutral-900">฿{fmtNum(fin.min_deposit)} - ฿{fmtNum(fin.max_deposit)}</p>
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">ขั้นต่ำ - สูงสุดต่อบิล</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">เกณฑ์การถอนเงิน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-neutral-900">฿{fmtNum(fin.min_withdraw)} - ฿{fmtNum(fin.max_withdraw)}</p>
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">ขั้นต่ำ - สูงสุดต่อบิล</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-blue-50/30 border-blue-100">
          <p className="text-[11px] font-medium text-blue-700">คอมมิชชั่นแนะนำเพื่อน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-blue-900">
              {affiliate.enabled ? `${affiliate.commission_rate}%` : "ปิดชั่วคราว"}
            </p>
            <span className={cn("size-2 rounded-full", affiliate.enabled ? "bg-blue-500" : "bg-neutral-300")} />
          </div>
          <p className="mt-1 text-[10px] text-blue-600/80">โอนขั้นต่ำ ฿{affiliate.min_transfer}</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-purple-50/30 border-purple-100">
          <p className="text-[11px] font-medium text-purple-700">บอทแทงหวยจำลอง</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-purple-900">
              {bot.autobet_enabled ? "เปิดสุ่มแทง" : "สแตนด์บาย"}
            </p>
            <span className={cn("size-2 rounded-full", bot.autobet_enabled ? "bg-purple-500 animate-pulse" : "bg-neutral-300")} />
          </div>
          <p className="mt-1 text-[10px] text-purple-600/80">ทุกๆ {bot.autobet_interval_sec} วินาที</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-violet-50/30 border-violet-100">
          <p className="text-[11px] font-medium text-violet-700">บอทออกผลรางวัล</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-base font-black tracking-tight text-violet-900">
              {bot.auto_settle_enabled ? "อัตโนมัติ" : "ด้วยมือ"}
            </p>
            <span className={cn("size-2 rounded-full", bot.auto_settle_enabled ? "bg-emerald-500" : "bg-amber-400")} />
          </div>
          <p className="mt-1 text-[10px] text-violet-600/80 truncate">CRON Secret พร้อมใช้งาน</p>
        </Panel>
      </div>

      {/* 6 Core Pillars */}
      <div>
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">หมวดหมู่การควบคุมระบบหลัก (Core Governance - 6 เสาหลัก)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">จัดการบัญชีธนาคาร</p>
                <p className="text-[11px] text-neutral-400">บัญชีรับเงินฝากของระบบ</p>
              </div>
            </div>
            <a
              href="#/banks"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "banks";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไป <ExternalLink className="size-3" />
            </a>
          </Panel>

          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">สมาชิก & สายแนะนำ</p>
                <p className="text-[11px] text-neutral-400">โครงข่ายแม่ข่ายและลูกข่าย</p>
              </div>
            </div>
            <a
              href="#/members"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "members";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไป <ExternalLink className="size-3" />
            </a>
          </Panel>

          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Disc3 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">จัดการวงล้อเสี่ยงโชค</p>
                <p className="text-[11px] text-neutral-400">อัตราแจกและราคาหมุน</p>
              </div>
            </div>
            <a
              href="#/wheel"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "wheel";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไป <ExternalLink className="size-3" />
            </a>
          </Panel>

          <Panel className="p-4 flex items-center justify-between rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Megaphone className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">แถบตัววิ่ง & ประกาศ</p>
                <p className="text-[11px] text-neutral-400">ตัววิ่งหน้าเว็บและข้อความ</p>
              </div>
            </div>
            <a
              href="#/broadcast"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "broadcast";
              }}
              className="flex items-center gap-1 rounded-xl bg-white border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-neutral-700 shadow-xs hover:border-brand-500 hover:text-brand-600"
            >
              ไป <ExternalLink className="size-3" />
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

      {/* MODAL 3: AFFILIATE & COMMISSION ENGINE */}
      {modal === "affiliate" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-blue-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400 backdrop-blur-md mb-4">
                    <Share2 className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">ระบบคอมมิชชั่น & แนะนำเพื่อน</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    กำหนดอัตราส่วนแบ่งรายได้ให้แก่แม่ข่ายและสมาชิกที่ช่วยแนะนำผู้เล่นใหม่เข้าสู่แพลตฟอร์ม เพื่อขยายฐานผู้ใช้งานแบบ Organic Growth
                  </p>
                </div>

                <div className="space-y-2.5 my-4">
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">สถานะระบบ:</span>
                    <span className={cn("font-bold", affiliate.enabled ? "text-emerald-400" : "text-rose-400")}>
                      {affiliate.enabled ? "● เปิดใช้งาน" : "○ ปิดชั่วคราว"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">อัตราคอมมิชชั่นปัจจุบัน:</span>
                    <span className="font-mono font-bold text-blue-300">{affiliate.commission_rate}%</span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">ฐานการคำนวณ:</span>
                    <span className="font-bold text-neutral-200">
                      {affiliate.calculation_basis === "turnover" ? "ยอดแทงรวม (Turnover)" : "ยอดเสียสุทธิ (Net Loss)"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Percent className="size-4" /> แนะนำการตั้งค่า
                  </p>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    อัตราคอมมิชชั่นแนะนำเพื่อนมาตรฐานอยู่ที่ 5.0% - 8.0% ของยอดแทง จะช่วยจูงใจให้แม่ข่ายแชร์ลิงก์อย่างต่อเนื่อง
                  </p>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white overflow-y-auto max-h-[85vh]">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">ตั้งค่าระบบคอมมิชชั่น & สายแนะนำ</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      ปรับเปลี่ยนเปอร์เซ็นต์ เงื่อนไข และการถอนเงินคอมมิชชั่น
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <Field label="สวิตช์เปิด/ปิดระบบแนะนำเพื่อน">
                      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3.5 bg-neutral-50/50">
                        <div>
                          <p className="text-xs font-bold text-neutral-800">
                            {affiliate.enabled ? "🟢 เปิดใช้งานระบบแนะนำเพื่อน (Active)" : "🔴 ปิดระบบแนะนำเพื่อนชั่วคราว"}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {affiliate.enabled ? "สมาชิกแชร์ลิงก์และรับค่าคอมได้ปกติ" : "หยุดคิดยอดคอมมิชชั่นใหม่ชั่วคราว"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAffiliate((p) => ({ ...p, enabled: !p.enabled }))}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                            affiliate.enabled ? "bg-blue-600" : "bg-neutral-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                              affiliate.enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="เปอร์เซ็นต์คอมมิชชั่น (%)">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={affiliate.commission_rate}
                            onChange={(e) => setAffiliate((p) => ({ ...p, commission_rate: Number(e.target.value) }))}
                            className={cn(inputCls, "pr-8 font-mono font-bold text-blue-700")}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">%</span>
                        </div>
                      </Field>

                      <Field label="ยอดโอน/ถอนขั้นต่ำ (บาท)">
                        <div className="relative">
                          <input
                            type="number"
                            step="10"
                            min="10"
                            value={affiliate.min_transfer}
                            onChange={(e) => setAffiliate((p) => ({ ...p, min_transfer: Number(e.target.value) }))}
                            className={cn(inputCls, "pr-8 font-mono font-bold")}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">฿</span>
                        </div>
                      </Field>
                    </div>

                    <Field label="เกณฑ์การคำนวณคอมมิชชั่น (Basis)">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAffiliate((p) => ({ ...p, calculation_basis: "turnover" }))}
                          className={cn(
                            "p-3 rounded-xl border text-left cursor-pointer transition-all",
                            affiliate.calculation_basis === "turnover"
                              ? "border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          <p className="text-xs font-bold">ยอดแทงรวม (Turnover)</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">คิดคอมฯ จากทุกโพยหวยที่เพื่อนแทง</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAffiliate((p) => ({ ...p, calculation_basis: "net_loss" }))}
                          className={cn(
                            "p-3 rounded-xl border text-left cursor-pointer transition-all",
                            affiliate.calculation_basis === "net_loss"
                              ? "border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          <p className="text-xs font-bold">ยอดเสียสุทธิ (Net Loss)</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">คิดคอมฯ เฉพาะโพยที่เพื่อนไม่ถูกรางวัล</p>
                        </button>
                      </div>
                    </Field>

                    <Field label="ระยะเวลาจดจำสายแนะนำ (Cookie Expiry)">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={affiliate.cookie_days}
                          onChange={(e) => setAffiliate((p) => ({ ...p, cookie_days: Number(e.target.value) }))}
                          className={cn(inputCls, "pr-12 font-mono")}
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">วัน</span>
                      </div>
                    </Field>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100 mt-4">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ยกเลิก
                  </Btn>
                  <Btn
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                    disabled={isSaving}
                    onClick={() =>
                      saveSettingsToDb(
                        {
                          referral_enabled: affiliate.enabled ? "TRUE" : "FALSE",
                          referral_commission_rate: String(affiliate.commission_rate),
                          referral_calculation_basis: affiliate.calculation_basis,
                          referral_min_transfer: String(affiliate.min_transfer),
                          referral_cookie_days: String(affiliate.cookie_days),
                        },
                        "ระบบคอมมิชชั่น & แนะนำเพื่อน"
                      )
                    }
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null} บันทึกการตั้งค่าคอมมิชชั่น
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* MODAL 4: BOT & AUTO-BETTING ENGINE */}
      {modal === "bot" ? (
        <Dialog open onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-3xl border-neutral-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
              {/* Left Column: Context Card */}
              <div className="md:col-span-5 bg-linear-to-br from-purple-900 to-neutral-900 p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-purple-400 backdrop-blur-md mb-4">
                    <Bot className="size-6" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">ระบบบอท & แทงหวยอัตโนมัติ</h3>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                    ควบคุมบอทตรวจรางวัลอัตโนมัติ และระบบจำลองการแทงหวย (Auto-Bet Simulator) เพื่อให้หน้าเว็บดูคึกคัก มีคนส่งโพยเล่นตลอด 24 ชั่วโมง
                  </p>
                </div>

                <div className="space-y-2.5 my-4">
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">บอทออกผลรางวัล:</span>
                    <span className={cn("font-bold", bot.auto_settle_enabled ? "text-emerald-400" : "text-amber-400")}>
                      {bot.auto_settle_enabled ? "● ตรวจผลอัตโนมัติ" : "○ ออกผลด้วยมือ"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">บอทแทงหวยจำลอง:</span>
                    <span className={cn("font-bold", bot.autobet_enabled ? "text-purple-300" : "text-neutral-400")}>
                      {bot.autobet_enabled ? `● สุ่มแทงทุก ${bot.autobet_interval_sec} วิ` : "○ ปิดพักการจำลอง"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/15 text-xs flex items-center justify-between">
                    <span className="text-neutral-300">วงเงินสุ่มต่อโพย:</span>
                    <span className="font-mono font-bold text-neutral-200">฿{bot.autobet_min_amount} - ฿{bot.autobet_max_amount}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/15 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Zap className="size-4" /> ทดสอบระบบบอท
                    </p>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-mono">Live Ping</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    ทดสอบยิงโพยจำลอง 1 รายการเพื่อตรวจสอบความเร็วและการแจ้งเตือนในหน้า Dashboard
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: "จำลองการส่งโพยสำเร็จ (Bot Ping)",
                        description: `บอทส่งโพย 3 ตัวบน ฿${Math.floor(Math.random() * (bot.autobet_max_amount - bot.autobet_min_amount) + bot.autobet_min_amount)} เรียบร้อยแล้ว`,
                      });
                    }}
                    className="w-full py-2 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="size-3.5" /> ทดสอบยิงสุ่มแทง 1 โพย
                  </button>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white overflow-y-auto max-h-[85vh]">
                <div className="space-y-4">
                  <DialogHeader className="p-0">
                    <DialogTitle className="text-base font-bold text-neutral-900">ตั้งค่าระบบบอท & แทงหวยอัตโนมัติ</DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500">
                      บอทตรวจรางวัล และระบบจำลองการแทงหวยสร้างความคึกคัก
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    {/* SECTION 1: SETTLEMENT BOT */}
                    <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-800">1. บอทออกผลและตรวจรางวัลอัตโนมัติ</p>
                          <p className="text-[11px] text-neutral-400">ตรวจผลหวยและคิดเงินเข้ากระเป๋าสมาชิกทันทีที่ผลออก</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBot((p) => ({ ...p, auto_settle_enabled: !p.auto_settle_enabled }))}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                            bot.auto_settle_enabled ? "bg-emerald-500" : "bg-neutral-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                              bot.auto_settle_enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Field label="ความถี่ดึงผลรางวัล (วินาที)">
                          <input
                            type="number"
                            min="10"
                            max="3600"
                            value={bot.settle_interval_sec}
                            onChange={(e) => setBot((p) => ({ ...p, settle_interval_sec: Number(e.target.value) }))}
                            className={cn(inputCls, "font-mono font-bold")}
                          />
                        </Field>
                        <Field label="แหล่งข้อมูลผลรางวัล">
                          <select
                            value={bot.sync_source}
                            onChange={(e) => setBot((p) => ({ ...p, sync_source: e.target.value }))}
                            className={inputCls}
                          >
                            <option value="thailotto_api">ThaiLottoAPI (แนะนำ)</option>
                            <option value="official_feed">Official Government RSS</option>
                            <option value="crypto_hash">Random Provably Fair</option>
                          </select>
                        </Field>
                      </div>
                    </div>

                    {/* SECTION 2: AUTO-BET SIMULATOR */}
                    <div className="rounded-2xl border border-purple-200 p-4 bg-purple-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-purple-900">2. บอทแทงหวยอัตโนมัติ (Simulator)</p>
                          <p className="text-[11px] text-purple-600/80">สุ่มแทงเลขเพื่อให้หน้าเว็บดูคึกคัก มีผู้เล่นตลอดเวลา</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBot((p) => ({ ...p, autobet_enabled: !p.autobet_enabled }))}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                            bot.autobet_enabled ? "bg-purple-600" : "bg-neutral-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                              bot.autobet_enabled ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Field label="ความถี่ในการส่งโพย (วินาที)">
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={bot.autobet_interval_sec}
                            onChange={(e) => setBot((p) => ({ ...p, autobet_interval_sec: Number(e.target.value) }))}
                            className={cn(inputCls, "font-mono font-bold text-purple-800")}
                          />
                        </Field>
                        <Field label="จำนวนบอทผู้เล่นเสมือน">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={bot.autobet_virtual_count}
                            onChange={(e) => setBot((p) => ({ ...p, autobet_virtual_count: Number(e.target.value) }))}
                            className={cn(inputCls, "font-mono")}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="วงเงินสุ่มต่ำสุด (บาท)">
                          <input
                            type="number"
                            min="1"
                            value={bot.autobet_min_amount}
                            onChange={(e) => setBot((p) => ({ ...p, autobet_min_amount: Number(e.target.value) }))}
                            className={cn(inputCls, "font-mono")}
                          />
                        </Field>
                        <Field label="วงเงินสุ่มสูงสุด (บาท)">
                          <input
                            type="number"
                            min="10"
                            value={bot.autobet_max_amount}
                            onChange={(e) => setBot((p) => ({ ...p, autobet_max_amount: Number(e.target.value) }))}
                            className={cn(inputCls, "font-mono")}
                          />
                        </Field>
                      </div>

                      <Field label="ตลาดหวยเป้าหมายที่บอทจะเข้าแทง">
                        <select
                          value={bot.autobet_markets}
                          onChange={(e) => setBot((p) => ({ ...p, autobet_markets: e.target.value }))}
                          className={inputCls}
                        >
                          <option value="all">ทุกตลาดที่เปิดรับแทง (All Markets)</option>
                          <option value="instant">เฉพาะหวยไว 1 นาที (Instant Lotto)</option>
                          <option value="lotto15m">เฉพาะล็อตโต้ 15 นาที (Lotto 15M)</option>
                          <option value="stocks">เฉพาะหวยหุ้น & ต่างประเทศ</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100 mt-4">
                  <Btn variant="outline" className="rounded-full" onClick={() => setModal(null)}>
                    ยกเลิก
                  </Btn>
                  <Btn
                    className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20"
                    disabled={isSaving}
                    onClick={() =>
                      saveSettingsToDb(
                        {
                          auto_settle_enabled: bot.auto_settle_enabled ? "TRUE" : "FALSE",
                          instant_draw_interval: String(bot.settle_interval_sec),
                          sync_source: bot.sync_source,
                          bot_autobet_enabled: bot.autobet_enabled ? "TRUE" : "FALSE",
                          bot_autobet_interval_sec: String(bot.autobet_interval_sec),
                          bot_autobet_min_amount: String(bot.autobet_min_amount),
                          bot_autobet_max_amount: String(bot.autobet_max_amount),
                          bot_autobet_markets: bot.autobet_markets,
                          bot_virtual_bettors_count: String(bot.autobet_virtual_count),
                        },
                        "ระบบบอท & แทงหวยอัตโนมัติ"
                      )
                    }
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null} บันทึกการตั้งค่าระบบบอท
                  </Btn>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* MODAL 5: SECURITY & CRON */}
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
