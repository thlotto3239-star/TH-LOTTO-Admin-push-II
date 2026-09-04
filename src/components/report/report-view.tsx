"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  ShieldCheck,
  UsersRound,
  Wallet,
  Dices,
  Trophy,
  Zap,
  BarChart3,
  Bell,
  LifeBuoy,
  Handshake,
  Megaphone,
  TrendingUp,
  Settings2,
  Search,
  Copy,
  ArrowUp,
  ExternalLink,
  BellRing,
  KeyRound,
  FolderTree,
  Blocks,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  reportMeta,
  lineNotifyRows,
  tableGroups,
  functionGroups,
  markets,
  banks,
  promotions,
  settingsRows,
  adminSections,
  adminPermissions,
  adminComponents,
  techStack,
  projectStructure,
  totalFunctions,
  totalTables,
  totalAdminPages,
  type RpcFunction,
  type FunctionGroup,
} from "@/data/system-report";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const iconMap: Record<string, LucideIcon> = {
  user: User,
  shield: ShieldCheck,
  users: UsersRound,
  wallet: Wallet,
  dices: Dices,
  trophy: Trophy,
  zap: Zap,
  chart: BarChart3,
  bell: Bell,
  lifebuoy: LifeBuoy,
  handshake: Handshake,
  megaphone: Megaphone,
  trending: TrendingUp,
  settings: Settings2,
};

function GIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Layers;
  return <Icon className={className ?? "h-5 w-5"} aria-hidden />;
}

function mark(text: string, q: string) {
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-hit">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function matches(fn: RpcFunction, q: string) {
  const hay = `${fn.name} ${fn.params} ${fn.desc} ${fn.sub ?? ""}`.toLowerCase();
  return hay.includes(q);
}

// ─────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────

export default function ReportView() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("overview");
  const [showTop, setShowTop] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const q = query.trim().toLowerCase();

  const filteredGroups: FunctionGroup[] = useMemo(() => {
    if (!q) return functionGroups;
    return functionGroups
      .map((g) => ({ ...g, functions: g.functions.filter((f) => matches(f, q)) }))
      .filter((g) => g.functions.length > 0);
  }, [q]);

  const matchCount = useMemo(
    () => filteredGroups.reduce((s, g) => s + g.functions.length, 0),
    [filteredGroups],
  );

  const filteredTableGroups = useMemo(() => {
    if (!q) return tableGroups;
    return tableGroups
      .map((g) => ({ ...g, tables: g.tables.filter((t) => t.toLowerCase().includes(q)) }))
      .filter((g) => g.tables.length > 0);
  }, [q]);

  const filteredAdminSections = useMemo(() => {
    if (!q) return adminSections;
    return adminSections
      .map((s) => ({
        ...s,
        pages: s.pages.filter(
          (p) =>
            `${p.name} ${p.route} ${p.file} ${p.features.join(" ")}`.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.pages.length > 0);
  }, [q]);

  const sectionIds = useMemo(
    () => [
      "overview",
      "line-notify",
      ...functionGroups.map((g) => `fn-${g.id}`),
      "tables",
      "admin",
      "live",
    ],
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionIds]);

  useEffect(() => {
    const pill = pillsRef.current?.querySelector<HTMLAnchorElement>(`[data-id="${activeId}"]`);
    pill?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const copyFn = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast({ title: "คัดลอกชื่อฟังก์ชั่นแล้ว", description: name });
    } catch {
      toast({ title: "คัดลอกไม่สำเร็จ", description: name });
    }
  };

  const navPill = (id: string, label: string) => (
    <a
      key={id}
      href={`#${id}`}
      data-id={id}
      onClick={() => setActiveId(id)}
      className={`whitespace-nowrap border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        activeId === id
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-950"
      }`}
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b-2 border-neutral-950 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <a href="#overview" className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-neutral-950 font-mono text-[13px] font-semibold text-white">
              TL
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight tracking-tight">
                TH-LOTTO
              </span>
              <span className="block truncate text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                System Functions Report
              </span>
            </span>
          </a>
          <div className="hidden items-center gap-5 lg:flex">
            <span className="font-mono text-[11px] text-neutral-500">
              supabase: {reportMeta.supabaseProject} · {reportMeta.region}
            </span>
            <span className="font-mono text-[11px] text-neutral-500">
              ดึงข้อมูล {reportMeta.fetchedAt}
            </span>
            <span className="flex items-center gap-2 border border-brand-600 bg-brand-50 px-2.5 py-1">
              <span className="h-2 w-2 rotate-45 bg-brand-600" aria-hidden />
              <span className="font-mono text-[11px] font-semibold text-brand-700">
                {reportMeta.status}
              </span>
            </span>
          </div>
          <span className="flex items-center gap-2 border border-brand-600 bg-brand-50 px-2 py-1 lg:hidden">
            <span className="h-2 w-2 rotate-45 bg-brand-600" aria-hidden />
            <span className="font-mono text-[11px] font-semibold text-brand-700">ONLINE</span>
          </span>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section id="overview" className="border-b-2 border-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14 lg:px-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">
            เอกสารฟังก์ชั่นระบบเดิม · Live Database
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            รายงานฟังก์ชั่นระบบทั้งหมด
            <span className="block text-neutral-400">TH-LOTTO Full System Report</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base">
            รวมฟังก์ชั่น RPC ทั้งหมดจาก Supabase จริง (Project {reportMeta.supabaseProject} ·
            Region {reportMeta.region}) พร้อมโครงสร้างตาราง ตลาดหวย ธนาคาร โปรโมชั่น การตั้งค่าระบบ
            และสรุปหน้าจอ Admin Panel v1.4.0 ทั้งหมดในหน้าเดียว — ค้นหาฟังก์ชั่นได้จากแถบค้นหาด้านบน
            และคลิกที่ชื่อฟังก์ชั่นเพื่อคัดลอก
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-[11px] text-neutral-600">
              🗎 {reportMeta.sourceDoc}
            </span>
            <span className="border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-[11px] text-neutral-600">
              🗎 {reportMeta.adminDoc}
            </span>
          </div>

          <dl className="mt-10 grid grid-cols-2 border-2 border-neutral-950 md:grid-cols-3 xl:grid-cols-6">
            {[
              { n: String(totalFunctions), label: "RPC Functions" },
              { n: String(totalTables), label: "ตารางข้อมูล" },
              { n: String(markets.length), label: "ตลาดหวย" },
              { n: String(banks.length), label: "ธนาคาร" },
              { n: String(promotions.length), label: "โปร Active" },
              { n: "30+", label: "หน้า Admin Panel" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-5 md:p-6 ${i % 2 === 1 ? "border-l border-neutral-200" : ""} ${
                  i >= 2 ? "max-md:border-t max-md:border-neutral-200" : ""
                } ${i >= 3 ? "md:border-l" : ""} ${i >= 3 ? "max-md:border-l-0" : ""} ${
                  i >= 3 && (i - 3) % 2 === 0 ? "max-md:border-l max-md:border-neutral-200" : ""
                } ${i >= 6 ? "xl:border-l xl:border-neutral-200" : ""} ${
                  i === 2 || i === 4 ? "md:border-l" : ""
                } ${i >= 6 ? "md:border-t md:border-neutral-200" : ""} ${
                  i === 3 || i === 4 || i === 5 ? "md:border-t md:border-neutral-200" : ""
                } border-neutral-200/0`}
              >
                <dd className="font-mono text-3xl font-semibold tracking-tight md:text-4xl">
                  {s.n}
                </dd>
                <dt className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Sticky nav + search ─────────────────────────────── */}
      <div className="sticky top-14 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-12 items-center gap-3">
            <div
              ref={pillsRef}
              className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
              role="navigation"
              aria-label="เมนูส่วนต่างๆ ของรายงาน"
            >
              {navPill("overview", "ภาพรวม")}
              {navPill("line-notify", "LINE Notify")}
              {functionGroups.map((g) => navPill(`fn-${g.id}`, `${g.no} ${g.title}`))}
              {navPill("tables", "ตารางข้อมูล")}
              {navPill("admin", "Admin Panel")}
              {navPill("live", "Live Data")}
            </div>
            <div className="relative hidden w-64 shrink-0 md:block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาฟังก์ชั่น ตาราง หน้าจอ..."
                className="h-9 border-neutral-300 bg-white pl-8 text-sm focus-visible:ring-brand-600"
                aria-label="ค้นหา"
              />
            </div>
          </div>
          <div className="relative pb-2 md:hidden">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาฟังก์ชั่น ตาราง หน้าจอ..."
              className="h-9 border-neutral-300 bg-white pl-8 text-sm focus-visible:ring-brand-600"
              aria-label="ค้นหา"
            />
          </div>
        </div>
      </div>

      {/* ── Search result summary ───────────────────────────── */}
      {q && (
        <div className="border-b border-neutral-200 bg-brand-50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 lg:px-8">
            <p className="text-sm text-brand-900">
              พบ <b className="font-mono">{matchCount}</b> ฟังก์ชั่น ·{" "}
              <b className="font-mono">{filteredTableGroups.reduce((s, g) => s + g.tables.length, 0)}</b> ตาราง ·{" "}
              <b className="font-mono">
                {filteredAdminSections.reduce((s, x) => s + x.pages.length, 0)}
              </b>{" "}
              หน้าจอ ที่ตรงกับ “{query.trim()}”
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
              className="h-7 border-neutral-300 px-2.5 text-xs hover:bg-neutral-950 hover:text-white"
            >
              ล้างการค้นหา
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 lg:px-8">
        {/* ── LINE Notify callout ───────────────────────────── */}
        <section id="line-notify" className="scroll-mt-32 pt-12">
          <div className="border-2 border-brand-600">
            <div className="flex items-center gap-2.5 border-b-2 border-brand-600 bg-brand-600 px-5 py-3 text-white">
              <BellRing className="h-5 w-5" aria-hidden />
              <h2 className="text-sm font-bold tracking-tight md:text-base">
                ข้อค้นพบสำคัญ — LINE Notify มีอยู่จริง!
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-neutral-700">
                จาก settings table บน database จริง พบค่าการตั้งค่าที่ยืนยันว่าระบบแจ้งเตือนผ่าน LINE
                ถูกเปิดใช้งานอยู่ โดยมีรายการคีย์ที่พบดังนี้
              </p>
              <div className="mt-4 overflow-x-auto border border-neutral-200">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="px-4 py-2.5 font-semibold">Key</th>
                      <th className="px-4 py-2.5 font-semibold">ค่า</th>
                      <th className="px-4 py-2.5 font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineNotifyRows.map((r) => (
                      <tr key={r.key} className="border-t border-neutral-200">
                        <td className="px-4 py-2.5 font-mono text-[13px] font-medium text-neutral-900">
                          {r.key}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[13px]">
                          <span className={r.ok ? "font-semibold text-brand-700" : "text-neutral-800"}>
                            {r.value}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[13px] text-neutral-600">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
                ข้อสังเกต: LINE Notify ถูก implement ที่ฝั่ง <b>Supabase Backend</b> (ไม่ได้อยู่ใน
                Admin frontend code) และพบ RPC{" "}
                <code className="bg-amber-100 px-1.5 py-0.5 font-mono text-[12px]">
                  fn_daily_summary_line
                </code>{" "}
                ที่ส่ง daily summary ทาง LINE ทุกวัน
              </p>
            </div>
          </div>
        </section>

        {/* ── Function groups ───────────────────────────────── */}
        <div className="pt-12">
          <div className="flex items-end justify-between gap-4 border-b-2 border-neutral-950 pb-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">
                Section A
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                RPC Functions ทั้งหมด — จัดกลุ่มตามหน้าที่
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                คลิกชื่อฟังก์ชั่นเพื่อคัดลอก · แถวที่มีเครื่องหมายสี่เหลี่ยมสีเขียวคือฟังก์ชั่นเด่นตามเอกสารต้นฉบับ
              </p>
            </div>
            <span className="hidden shrink-0 border-2 border-neutral-950 px-3 py-1.5 font-mono text-sm font-semibold md:block">
              {q ? `${matchCount}/${totalFunctions}` : totalFunctions} ฟังก์ชั่น
            </span>
          </div>

          {filteredGroups.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-500">
              ไม่พบฟังก์ชั่นที่ตรงกับการค้นหา
            </p>
          )}

          {filteredGroups.map((g) => (
            <section key={g.id} id={`fn-${g.id}`} className="scroll-mt-32 pt-12">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-4xl font-semibold leading-none text-neutral-200 md:text-5xl">
                    {g.no}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2.5 text-xl font-bold tracking-tight md:text-2xl">
                      <GIcon name={g.icon} className="h-5 w-5 text-brand-700" />
                      {g.title}
                    </h3>
                    {g.subtitle && (
                      <p className="mt-1 text-sm text-neutral-500">{g.subtitle}</p>
                    )}
                  </div>
                </div>
                <span className="border border-neutral-300 px-2.5 py-1 font-mono text-xs font-medium text-neutral-600">
                  {g.functions.length} functions
                </span>
              </div>

              <div className="mt-5 overflow-x-auto border border-neutral-200">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="w-[30%] px-4 py-2.5 font-semibold">Function</th>
                      <th className="w-[34%] px-4 py-2.5 font-semibold">Parameters</th>
                      <th className="px-4 py-2.5 font-semibold">หน้าที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.functions.map((f) => (
                      <tr
                        key={`${g.id}-${f.name}`}
                        className="border-t border-neutral-200 transition-colors hover:bg-neutral-50"
                      >
                        <td className="px-4 py-2.5 align-top">
                          <button
                            type="button"
                            onClick={() => copyFn(f.name)}
                            title="คลิกเพื่อคัดลอกชื่อฟังก์ชั่น"
                            className="group inline-flex max-w-full items-center gap-1.5 text-left"
                          >
                            {f.hl && (
                              <span
                                className="h-2 w-2 shrink-0 rotate-45 bg-brand-600"
                                aria-label="ฟังก์ชั่นเด่น"
                              />
                            )}
                            <span className="truncate font-mono text-[13px] font-medium text-brand-700 group-hover:underline">
                              {mark(f.name, q)}
                            </span>
                            <Copy
                              className="h-3 w-3 shrink-0 text-neutral-300 group-hover:text-neutral-600"
                              aria-hidden
                            />
                          </button>
                          {f.sub && (
                            <span className="ml-2 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-500">
                              {f.sub}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 align-top font-mono text-xs leading-relaxed text-neutral-500">
                          {mark(f.params, q)}
                        </td>
                        <td className="px-4 py-2.5 align-top text-[13px] text-neutral-800">
                          {mark(f.desc, q)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
        {/* ── Database tables ───────────────────────────────── */}
        <section id="tables" className="scroll-mt-32 pt-16">
          <div className="flex items-end justify-between gap-4 border-b-2 border-neutral-950 pb-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">
                Section B
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                ตารางข้อมูลหลัก (Tables)
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                โครงสร้างตารางบน Supabase จัดกลุ่มตามหน้าที่ของระบบ
              </p>
            </div>
            <span className="hidden shrink-0 border-2 border-neutral-950 px-3 py-1.5 font-mono text-sm font-semibold md:block">
              {filteredTableGroups.reduce((s, g) => s + g.tables.length, 0)} ตาราง
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTableGroups.map((g) => (
              <div key={g.group} className="border border-neutral-200 p-4 transition-colors hover:border-neutral-950">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{g.group}</h3>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {g.tables.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.tables.map((t) => (
                    <code
                      key={t}
                      className="border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700"
                    >
                      {mark(t, q)}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Admin Panel ───────────────────────────────────── */}
        <section id="admin" className="scroll-mt-32 pt-16">
          <div className="flex items-end justify-between gap-4 border-b-2 border-neutral-950 pb-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">
                Section C
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                TH-LOTTO Admin Panel
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                สรุปหน้าจอและฟังก์ชันของ Admin Panel จาก {reportMeta.adminDoc}
              </p>
            </div>
            <span className="hidden shrink-0 border-2 border-neutral-950 px-3 py-1.5 font-mono text-sm font-semibold md:block">
              {filteredAdminSections.reduce((s, x) => s + x.pages.length, 0)} หน้าจอ
            </span>
          </div>

          {/* Meta strip */}
          <div className="mt-8 grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-3">
            <div className="bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                เวอร์ชั่น
              </p>
              <p className="mt-1 font-mono text-lg font-semibold">{reportMeta.adminVersion}</p>
            </div>
            <div className="bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Tech Stack
              </p>
              <p className="mt-1 text-sm font-medium">{reportMeta.adminStack}</p>
            </div>
            <div className="bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Production
              </p>
              <a
                href={reportMeta.adminProduction}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-medium text-brand-700 hover:underline"
              >
                th-lotto-admin-v2.vercel.app
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Permission keys */}
            <div className="border border-neutral-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <KeyRound className="h-4 w-4 text-brand-700" aria-hidden />
                ระบบ Permission (PermGuard)
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                ตรวจสอบ permission ระดับ page ผ่าน <code className="font-mono text-[12px] bg-neutral-100 px-1 py-0.5">hasPermission(perm)</code> ใน useAuth() โดยแบ่งตาม key ดังนี้
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {adminPermissions.map((p) => (
                  <code
                    key={p}
                    className="border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700"
                  >
                    {p}
                  </code>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
                ประกอบด้วย AdminGuard (บังคับ login ก่อนเข้าทุกหน้า) · AuthContext (จัดการ session
                และ profile ของ admin) · AdminGuard.jsx (Route protection)
              </p>
            </div>
            {/* Project structure */}
            <div className="border border-neutral-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <FolderTree className="h-4 w-4 text-brand-700" aria-hidden />
                โครงสร้างโปรเจค
              </h3>
              <pre className="mt-3 overflow-x-auto bg-neutral-950 p-4 font-mono text-[11.5px] leading-relaxed text-brand-400">
{projectStructure}
              </pre>
            </div>
          </div>

          {/* Admin sections & pages */}
          {filteredAdminSections.length === 0 && q && (
            <p className="py-8 text-center text-sm text-neutral-500">ไม่พบหน้าจอที่ตรงกับการค้นหา</p>
          )}
          {filteredAdminSections.map((sec) => (
            <div key={sec.id} className="mt-10">
              <h3 className="flex items-center gap-2.5 border-b border-neutral-200 pb-3 text-lg font-bold tracking-tight">
                <GIcon name={sec.icon} className="h-5 w-5 text-brand-700" />
                {sec.title}
                <span className="ml-auto font-mono text-xs font-normal text-neutral-400">
                  {sec.pages.length} หน้า
                </span>
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {sec.pages.map((p) => (
                  <article key={`${sec.id}-${p.route}`} className="border border-neutral-200 p-4 transition-colors hover:border-neutral-950">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold">{p.name}</h4>
                      <code className="bg-neutral-950 px-1.5 py-0.5 font-mono text-[11px] text-white">
                        {mark(p.route, q)}
                      </code>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] text-neutral-400">{p.file}</p>
                    <ul className="mt-3 space-y-1.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2 text-[13px] leading-relaxed text-neutral-700">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-brand-600" aria-hidden />
                          <span>{mark(f, q)}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          ))}

          {/* Components + Tech stack */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="border border-neutral-200">
              <h3 className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 text-sm font-bold">
                <Blocks className="h-4 w-4 text-brand-700" aria-hidden />
                Components หลัก
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <tbody>
                    {adminComponents.map((c) => (
                      <tr key={c.name} className="border-t border-neutral-200 first:border-t-0">
                        <td className="w-[38%] px-5 py-2.5 font-mono text-[12.5px] font-medium text-neutral-900">
                          {c.name}
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-neutral-600">{c.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border border-neutral-200">
              <h3 className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 text-sm font-bold">
                <Layers className="h-4 w-4 text-brand-700" aria-hidden />
                Tech Stack
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <tbody>
                    {techStack.map((t) => (
                      <tr key={t.part} className="border-t border-neutral-200 first:border-t-0">
                        <td className="w-[38%] px-5 py-2.5 text-[13px] font-medium text-neutral-900">
                          {t.part}
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[12.5px] text-neutral-600">{t.tech}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── Live data ─────────────────────────────────────── */}
        <section id="live" className="scroll-mt-32 pt-16">
          <div className="flex items-end justify-between gap-4 border-b-2 border-neutral-950 pb-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-700">
                Section D
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                ข้อมูล Live จากระบบ
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                ตลาดหวย ธนาคาร โปรโมชั่น และการตั้งค่าระบบ ณ วันที่ {reportMeta.fetchedAt}
              </p>
            </div>
            <span className="hidden shrink-0 border-2 border-neutral-950 px-3 py-1.5 font-mono text-sm font-semibold md:block">
              LIVE
            </span>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Markets */}
            <div className="border border-neutral-200">
              <h3 className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 text-sm font-bold">
                ตลาดหวย (Live Data)
                <span className="font-mono text-[11px] font-normal text-neutral-400">
                  {markets.length} ตลาด
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="px-5 py-2 font-semibold">ตลาด</th>
                      <th className="px-5 py-2 font-semibold">Code</th>
                      <th className="px-5 py-2 font-semibold">หมวด</th>
                      <th className="px-5 py-2 font-semibold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map((m) => (
                      <tr key={m.code} className="border-t border-neutral-200">
                        <td className="px-5 py-2.5 text-[13px] font-medium">{m.name}</td>
                        <td className="px-5 py-2.5 font-mono text-[12.5px] text-neutral-600">{m.code}</td>
                        <td className="px-5 py-2.5">
                          <span className="border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10.5px] uppercase text-neutral-600">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-700">
                            <span className="h-1.5 w-1.5 rotate-45 bg-brand-600" aria-hidden />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              {/* Banks */}
              <div className="border border-neutral-200 p-5">
                <h3 className="flex items-center justify-between text-sm font-bold">
                  ธนาคารที่รองรับ (Live Data)
                  <span className="font-mono text-[11px] font-normal text-neutral-400">
                    {banks.length} ธนาคาร
                  </span>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {banks.map((b) => (
                    <span
                      key={b}
                      className="border-2 border-neutral-950 px-3 py-1.5 font-mono text-[12px] font-semibold tracking-wide"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Promotions */}
              <div className="border border-neutral-200">
                <h3 className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 text-sm font-bold">
                  โปรโมชั่นที่ Active (Live Data)
                  <span className="font-mono text-[11px] font-normal text-neutral-400">
                    {promotions.length} รายการ
                  </span>
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                      <th className="px-5 py-2 font-semibold">ชื่อ</th>
                      <th className="px-5 py-2 font-semibold">ประเภท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((p) => (
                      <tr key={p.name} className="border-t border-neutral-200">
                        <td className="px-5 py-2.5 text-[13px] font-medium">{p.name}</td>
                        <td className="px-5 py-2.5">
                          <code className="border border-brand-600 bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] text-brand-700">
                            {p.type}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mt-6 border border-neutral-200">
            <h3 className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 text-sm font-bold">
              สรุปการตั้งค่า System (Live Settings)
              <span className="font-mono text-[11px] font-normal text-neutral-400">
                {settingsRows.length} keys
              </span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              {settingsRows.map((s, i) => (
                <div
                  key={s.key}
                  className={`border-neutral-200 p-4 ${i % 3 !== 2 ? "lg:border-r" : ""} ${
                    i % 2 === 0 ? "sm:border-r lg:border-r-0" : ""
                  } ${i % 3 !== 2 ? "lg:border-r" : ""} ${i >= 3 ? "sm:border-t" : ""} ${
                    i >= 9 ? "lg:border-t lg:border-neutral-200" : ""
                  } ${i >= 9 ? "sm:border-t" : ""} border-t-0 first:border-t-0 sm:border-t-0`}
                  style={{ borderTop: "1px solid #e5e5e5" }}
                >
                  <p className="font-mono text-[11.5px] text-neutral-500">{s.key}</p>
                  <p
                    className={`mt-1 break-all font-mono text-[13px] font-semibold ${
                      s.ok ? "text-brand-700" : "text-neutral-900"
                    }`}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-16" aria-hidden />
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-16 border-t-2 border-neutral-950 bg-neutral-950 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-white font-mono text-[13px] font-semibold text-neutral-950">
                  TL
                </span>
                <span className="text-sm font-bold text-white">TH-LOTTO</span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-neutral-400">
                รายงานฟังก์ชั่นระบบทั้งหมด (Live Database) จัดทำจากเอกสารระบบเดิมฉบับ v1
                เพื่อใช้อ้างอิงโครงสร้าง RPC Functions, ตารางข้อมูล, การตั้งค่าระบบ
                และหน้าจอ Admin Panel ทั้งหมดในที่เดียว
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                แหล่งข้อมูลอ้างอิง
              </p>
              <ul className="mt-3 space-y-2 font-mono text-[12px] text-neutral-400">
                <li>🗎 {reportMeta.sourceDoc}</li>
                <li>🗎 {reportMeta.adminDoc}</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                ระบบ
              </p>
              <ul className="mt-3 space-y-2 font-mono text-[12px] text-neutral-400">
                <li>Supabase {reportMeta.supabaseProject}</li>
                <li>Region {reportMeta.region} · สถานะ {reportMeta.status}</li>
                <li>ดึงข้อมูล {reportMeta.fetchedAt}</li>
                <li>Admin Panel {reportMeta.adminVersion}</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-5">
            <p className="font-mono text-[11px] text-neutral-500">
              TH-LOTTO SYSTEM REPORT · V1 · สร้างจากเอกสารต้นฉบับ
            </p>
            <p className="font-mono text-[11px] text-neutral-500">
              {totalFunctions} RPC · {totalTables} TABLES · {totalAdminPages} ADMIN PAGES
            </p>
          </div>
        </div>
      </footer>

      {/* ── Back to top ─────────────────────────────────────── */}
      {showTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          size="icon"
          aria-label="กลับขึ้นด้านบน"
          className="fixed bottom-6 right-6 z-50 h-11 w-11 border-2 border-neutral-950 bg-white text-neutral-950 shadow-lg hover:bg-neutral-950 hover:text-white"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
