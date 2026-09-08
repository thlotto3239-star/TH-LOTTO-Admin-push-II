"use client";

import * as React from "react";
import {
  Share2, Users, Trophy, Percent, Wallet, ArrowRight, Search,
  RefreshCw, CheckCircle2, ShieldCheck, ExternalLink, SlidersHorizontal,
  ChevronRight, ArrowUpRight, Award, UserCheck, AlertCircle
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, Avatar, StatusBadge, EmptyState } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { useAdminNav } from "../store";
import { cn } from "@/lib/utils";
import { fmtNum, fmtTHB } from "@/data/admin-mock";

interface AffiliateStats {
  total_members: number;
  total_referred: number;
  total_referrers: number;
  total_commission_balance: number;
}

interface TopReferrer {
  id: string;
  member_id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  downline_count: number;
  total_turnover: number;
  commission_balance: number;
}

interface ReferredMember {
  id: string;
  member_id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  status: string;
  referrer_id: string;
  referrer_name: string;
  referrer_phone: string;
  turnover: number;
}

interface AffiliateSettings {
  enabled: boolean;
  commission_rate: number;
  calculation_basis: "turnover" | "net_loss";
  min_transfer: number;
  cookie_days: number;
}

export function AffiliatePage() {
  const { toast } = useToast();
  const { openMember } = useAdminNav();

  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"top" | "network">("top");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [stats, setStats] = React.useState<AffiliateStats>({
    total_members: 0,
    total_referred: 0,
    total_referrers: 0,
    total_commission_balance: 0,
  });

  const [topReferrers, setTopReferrers] = React.useState<TopReferrer[]>([]);
  const [referredMembers, setReferredMembers] = React.useState<ReferredMember[]>([]);
  const [settings, setSettings] = React.useState<AffiliateSettings>({
    enabled: true,
    commission_rate: 8.0,
    calculation_basis: "turnover",
    min_transfer: 100,
    cookie_days: 30,
  });

  const fetchAffiliateData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data?resource=affiliate");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data.stats || stats);
        setTopReferrers(json.data.top_referrers || []);
        setReferredMembers(json.data.referred_members || []);
        if (json.data.settings) {
          setSettings(json.data.settings);
        }
      }
    } catch (e: any) {
      console.error("Failed to load affiliate data:", e);
      toast({ title: "โหลดข้อมูลล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_settings",
          payload: {
            settings: {
              referral_enabled: settings.enabled ? "TRUE" : "FALSE",
              referral_commission_rate: String(settings.commission_rate),
              referral_calculation_basis: settings.calculation_basis,
              referral_min_transfer: String(settings.min_transfer),
              referral_cookie_days: String(settings.cookie_days),
            },
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกการตั้งค่าคอมมิชชั่นแล้ว", description: "อัปเดตลงระบบเรียบร้อยแล้ว" });
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredNetwork = React.useMemo(() => {
    if (!searchQuery.trim()) return referredMembers;
    const q = searchQuery.toLowerCase();
    return referredMembers.filter(
      (m) =>
        m.full_name?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        m.member_id?.toLowerCase().includes(q) ||
        m.referrer_name?.toLowerCase().includes(q)
    );
  }, [referredMembers, searchQuery]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="ระบบแนะนำเพื่อน & คอมมิชชั่น"
        description="Affiliate & Commission Center · รายงานภาพรวมเครือข่ายแม่ข่าย ยอดเทิร์นโอเวอร์สายงาน และการจัดการนโยบายส่วนแบ่งรายได้"
      >
        <Btn variant="outline" className="rounded-full" onClick={fetchAffiliateData} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} /> รีเฟรชข้อมูล
        </Btn>
      </PageHeader>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4 bg-linear-to-br from-white to-blue-50/40 border-blue-100">
          <p className="text-[11px] font-medium text-blue-700">สมาชิกจากลิงก์แนะนำ</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-blue-950">{fmtNum(stats.total_referred)}</p>
            <span className="text-xs font-bold text-blue-600">
              {stats.total_members > 0 ? Math.round((stats.total_referred / stats.total_members) * 100) : 0}% ของสมาชิก
            </span>
          </div>
          <p className="mt-1 text-[11px] text-blue-600/80 truncate">
            จากสมาชิกทั้งหมด {fmtNum(stats.total_members)} คน
          </p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-indigo-50/40 border-indigo-100">
          <p className="text-[11px] font-medium text-indigo-700">แม่ข่ายที่มีลูกข่าย</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-indigo-950">{fmtNum(stats.total_referrers)}</p>
            <span className="text-xs font-semibold text-indigo-600">ผู้แนะนำ</span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-600/80 truncate">
            เฉลี่ย {stats.total_referrers > 0 ? (stats.total_referred / stats.total_referrers).toFixed(1) : 0} คน / แม่ข่าย
          </p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-emerald-50/40 border-emerald-100">
          <p className="text-[11px] font-medium text-emerald-700">คอมมิชชั่นคงค้างในกระเป๋า</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-emerald-600">฿{fmtNum(stats.total_commission_balance)}</p>
            <span className="text-xs font-bold text-emerald-700">บาท</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/80 truncate">พร้อมให้สมาชิกรอโอนเข้ากระเป๋าหลัก</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-amber-50/40 border-amber-100">
          <p className="text-[11px] font-medium text-amber-700">อัตราคอมมิชชั่นปัจจุบัน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-amber-900">{settings.commission_rate}%</p>
            <span className={cn("size-2 rounded-full", settings.enabled ? "bg-emerald-500 animate-pulse" : "bg-neutral-300")} />
          </div>
          <p className="mt-1 text-[11px] text-amber-700/80 truncate">
            {settings.calculation_basis === "turnover" ? "คิดจากยอดแทงรวม" : "คิดจากยอดเสียสุทธิ"}
          </p>
        </Panel>
      </div>

      {/* 2-Column Desktop Layout: Tables on Left, Settings on Right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column (8 cols): Leaderboard & Network Lists */}
        <div className="space-y-4 lg:col-span-8">
          <Panel className="p-5">
            {/* Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("top")}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                    activeTab === "top"
                      ? "bg-brand-600 text-white shadow-xs shadow-brand-300"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  <Trophy className="size-3.5" /> 10 อันดับแม่ข่ายยอดเยี่ยม
                  <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{topReferrers.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("network")}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                    activeTab === "network"
                      ? "bg-brand-600 text-white shadow-xs shadow-brand-300"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  <Users className="size-3.5" /> รายชื่อสายงานทั้งหมด
                  <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{referredMembers.length}</span>
                </button>
              </div>

              {activeTab === "network" && (
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาลูกข่าย / แม่ข่าย..."
                    className="h-8.5 w-full rounded-full border border-neutral-200 pl-8.5 pr-3 text-xs outline-none focus:border-brand-500 bg-neutral-50/50"
                  />
                </div>
              )}
            </div>

            {/* TAB 1: TOP REFERRERS */}
            {activeTab === "top" && (
              <div className="pt-4">
                {topReferrers.length === 0 ? (
                  <EmptyState
                    icon={Share2}
                    title="ยังไม่มีข้อมูลแม่ข่ายแนะนำเพื่อน"
                    description="เมื่อสมาชิกเริ่มแชร์ลิงก์และมีเพื่อนสมัคร รายชื่อแม่ข่ายจะแสดงที่นี่โดยอัตโนมัติ"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          <th className="pb-3 text-center w-12">อันดับ</th>
                          <th className="pb-3">แม่ข่าย (ผู้แนะนำ)</th>
                          <th className="pb-3 text-center">ลูกข่ายในสังกัด</th>
                          <th className="pb-3 text-right">ยอดแทงรวมสายงาน</th>
                          <th className="pb-3 text-right">ค่าคอมฯ ในกระเป๋า</th>
                          <th className="pb-3 text-center w-24">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {topReferrers.map((r, idx) => (
                          <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3.5 text-center">
                              {idx === 0 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                                  🥇
                                </span>
                              ) : idx === 1 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-xs">
                                  🥈
                                </span>
                              ) : idx === 2 ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-900 font-black text-xs shadow-xs">
                                  🥉
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-neutral-400">{idx + 1}</span>
                              )}
                            </td>

                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={r.full_name} src={r.avatar_url} size="sm" />
                                <div>
                                  <p className="font-bold text-neutral-900">{r.full_name}</p>
                                  <p className="text-[11px] font-mono text-neutral-400">
                                    {r.member_id} · {r.phone}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700 border border-blue-100">
                                <Users className="size-3" /> {r.downline_count} คน
                              </span>
                            </td>

                            <td className="py-3.5 text-right font-mono font-bold text-neutral-900">
                              ฿{fmtNum(r.total_turnover)}
                            </td>

                            <td className="py-3.5 text-right font-mono font-bold text-emerald-600">
                              ฿{fmtNum(r.commission_balance)}
                            </td>

                            <td className="py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => openMember(r.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
                              >
                                ดูสายงาน <ArrowRight className="size-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NETWORK REFERRED MEMBERS */}
            {activeTab === "network" && (
              <div className="pt-4">
                {filteredNetwork.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="ไม่พบรายชื่อลูกข่าย"
                    description={searchQuery ? "ลองค้นหาด้วยคำค้นอื่น" : "ยังไม่มีสมาชิกที่สมัครผ่านลิงก์แนะนำ"}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          <th className="pb-3">ลูกข่าย (ผู้สมัคร)</th>
                          <th className="pb-3">แม่ข่าย (ผู้แนะนำ)</th>
                          <th className="pb-3 text-right">ยอดแทงรวม</th>
                          <th className="pb-3 text-center">วันที่ลงทะเบียน</th>
                          <th className="pb-3 text-center">สถานะ</th>
                          <th className="pb-3 text-center w-20">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredNetwork.map((m) => (
                          <tr key={m.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={m.full_name} src={m.avatar_url} size="sm" />
                                <div>
                                  <p className="font-bold text-neutral-900">{m.full_name}</p>
                                  <p className="text-[11px] font-mono text-neutral-400">
                                    {m.member_id} · {m.phone}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3">
                              <div className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                                <Share2 className="size-3 text-blue-500" />
                                <span>{m.referrer_name}</span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-mono">{m.referrer_phone}</p>
                            </td>

                            <td className="py-3 text-right font-mono font-bold text-neutral-900">
                              ฿{fmtNum(m.turnover)}
                            </td>

                            <td className="py-3 text-center text-neutral-500 font-mono text-[11px]">
                              {m.created_at ? new Date(m.created_at).toLocaleDateString("th-TH") : "-"}
                            </td>

                            <td className="py-3 text-center">
                              <StatusBadge status={m.status || "active"} />
                            </td>

                            <td className="py-3 text-center">
                              <button
                                type="button"
                                onClick={() => openMember(m.id)}
                                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
                              >
                                ตรวจสอบ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column (4 cols): Commission Configuration Card */}
        <div className="space-y-4 lg:col-span-4">
          <Panel className="p-5 border-neutral-200 bg-linear-to-b from-white to-neutral-50/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <SlidersHorizontal className="size-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">ตั้งค่าระบบคอมมิชชั่น</h4>
                  <p className="text-[11px] text-neutral-400">ควบคุมอัตราส่วนแบ่ง & กฎการจ่ายเงิน</p>
                </div>
              </div>
            </div>

            {/* Switch Active */}
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3.5 bg-white shadow-2xs">
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {settings.enabled ? "🟢 เปิดรับค่าคอมมิชชั่น (Active)" : "🔴 ปิดระบบแนะนำชั่วคราว"}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {settings.enabled ? "สมาชิกแชร์ลิงก์และรับส่วนแบ่งได้ปกติ" : "หยุดคำนวณส่วนแบ่งใหม่ชั่วคราว"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings((p) => ({ ...p, enabled: !p.enabled }))}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  settings.enabled ? "bg-blue-600" : "bg-neutral-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    settings.enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Rate & Min Transfer */}
            <div className="space-y-3">
              <Field label="อัตราส่วนแบ่งคอมมิชชั่น (%)">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.commission_rate}
                    onChange={(e) => setSettings((p) => ({ ...p, commission_rate: Number(e.target.value) }))}
                    className={cn(inputCls, "pr-8 font-mono font-bold text-blue-700 text-sm bg-white")}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">%</span>
                </div>
              </Field>

              <Field label="เกณฑ์การคำนวณยอด (Calculation Basis)">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, calculation_basis: "turnover" }))}
                    className={cn(
                      "p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      settings.calculation_basis === "turnover"
                        ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500 font-bold"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <p className="text-xs">ยอดแทงรวม (Turnover)</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">คิดทุกโพยที่แทง</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, calculation_basis: "net_loss" }))}
                    className={cn(
                      "p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      settings.calculation_basis === "net_loss"
                        ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500 font-bold"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <p className="text-xs">ยอดเสียสุทธิ (Net Loss)</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">คิดเฉพาะโพยแพ้</p>
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="โอนขั้นต่ำ (บาท)">
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      min="10"
                      value={settings.min_transfer}
                      onChange={(e) => setSettings((p) => ({ ...p, min_transfer: Number(e.target.value) }))}
                      className={cn(inputCls, "pr-7 font-mono font-bold bg-white text-xs")}
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-neutral-400">฿</span>
                  </div>
                </Field>

                <Field label="จดจำคุกกี้ (วัน)">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.cookie_days}
                      onChange={(e) => setSettings((p) => ({ ...p, cookie_days: Number(e.target.value) }))}
                      className={cn(inputCls, "pr-8 font-mono bg-white text-xs")}
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] font-bold text-neutral-400">วัน</span>
                  </div>
                </Field>
              </div>
            </div>

            <Btn
              className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
              disabled={isSaving}
              onClick={handleSaveSettings}
            >
              {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              บันทึกการตั้งค่าคอมมิชชั่น
            </Btn>

            <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-800">
                <ShieldCheck className="size-4" /> มาตรฐานแนะนำ
              </p>
              <p className="text-[11px] text-blue-700/90 leading-relaxed">
                การตั้งส่วนแบ่ง 5.0% - 8.0% บนฐานยอดแทงรวม ช่วยสร้างแรงจูงใจให้แม่ข่ายนำลิงก์ไปโปรโมทต่อเนื่อง โดยไม่กระทบกำไรของเว็บ
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
