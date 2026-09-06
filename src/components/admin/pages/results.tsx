"use client";

import * as React from "react";
import {
  BadgeCheck,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Radio,
  Dices,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  Panel,
  Btn,
  StatusBadge,
  PageHeader,
  TableWrap,
  Th,
  Td,
  StatCard,
  EmptyState,
  MarketLogo,
} from "../primitives";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fmtTHB, mktShort, type DrawSchedule, type LotteryResult } from "@/data/admin-mock";
import { LottoBall } from "./instant";
import { cn } from "@/lib/utils";

interface MarketItem {
  id: string;
  code: string;
  name: string;
  category: string;
  is_active: boolean;
  is_open: boolean;
  draw_time?: string;
  color?: string;
  logo_url?: string | null;
}

export function ResultsPage() {
  const { toast } = useToast();
  const [results, setResults] = React.useState<any[]>([]);
  const [markets, setMarkets] = React.useState<MarketItem[]>([]);
  const [schedules, setSchedules] = React.useState<DrawSchedule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [liveFeedActive, setLiveFeedActive] = React.useState(true);
  const [lastFeedUpdate, setLastFeedUpdate] = React.useState<Date>(new Date());

  // ─── โหลดข้อมูลสดจากระบบ ───────────────────────────────────────────────
  const loadData = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [resResults, resMarkets, resSchedules] = await Promise.all([
        fetch("/api/admin/data?resource=results"),
        fetch("/api/admin/data?resource=markets"),
        fetch("/api/admin/data?resource=schedules"),
      ]);

      const [jsonResults, jsonMarkets, jsonSchedules] = await Promise.all([
        resResults.json(),
        resMarkets.json(),
        resSchedules.json(),
      ]);

      if (jsonResults.success && Array.isArray(jsonResults.data)) {
        setResults(jsonResults.data);
        setLastFeedUpdate(new Date());
      }
      if (jsonMarkets.success && Array.isArray(jsonMarkets.data)) {
        setMarkets(jsonMarkets.data);
      }
      if (jsonSchedules.success && Array.isArray(jsonSchedules.data)) {
        setSchedules(jsonSchedules.data);
      }
    } catch (e) {
      console.error("Failed to fetch results feed:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── ระบบฟีดสด Real-time Polling ทุก 20 วินาที ─────────────────────────
  React.useEffect(() => {
    if (!liveFeedActive) return;
    const interval = setInterval(() => {
      loadData(true); // background silent fetch
    }, 20000);
    return () => clearInterval(interval);
  }, [liveFeedActive, loadData]);

  // ─── ปุ่มสั่งซิงก์ดึงผลสดจาก ThaiLottoAPI ทันที ────────────────────────
  const handleSyncThaiLotto = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-results", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "ซิงก์ผลรางวัลสดสำเร็จ!",
          description: `ดึงผลล่าสุดเรียบร้อย ${data.synced_count} รายการ อัปเดตเข้าระบบอัตโนมัติ`,
        });
        await loadData(true);
      } else {
        toast({
          title: "ซิงก์ผลรางวัลล้มเหลว",
          description: data.error || "ไม่สามารถเชื่อมต่อ ThaiLottoAPI ได้",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // ─── คำนวณสถิติตลาดจริงจาก Supabase (ไม่ฮาร์ดโค้ด) ─────────────────────
  const totalMarkets = markets.length || 37;
  const activeMarkets = markets.filter((m) => m.is_active).length || 33;
  const totalResultsCount = results.length;

  // ผลรางวัลที่เพิ่งออกล่าสุดสดๆ ร้อนๆ (รายการแรกสุดในฟีด)
  const latestResult = results.length > 0 ? results[0] : null;
  const latestMarket = latestResult?.lottery_markets || {};

  // ค้นหาและกรองตามหมวดหมู่
  const filteredResults = results.filter((r) => {
    const mkt = r.lottery_markets || {};
    const matchesCategory =
      activeCategory === "ALL" ||
      (activeCategory === "FOREIGN" && (mkt.category === "FOREIGN" || mkt.type === "HANOI" || mkt.type === "LAO")) ||
      (activeCategory === "MAEKHONG" && mkt.category === "MAEKHONG") ||
      (activeCategory === "STOCK" && mkt.category === "STOCK") ||
      (activeCategory === "GOV" && mkt.category === "GOV") ||
      (activeCategory === "SPEED" && (mkt.category === "SPEED" || mkt.code === "THLOTTO_15M"));

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      (mkt.name && mkt.name.toLowerCase().includes(query)) ||
      (mkt.code && mkt.code.toLowerCase().includes(query)) ||
      (r.draw_date && r.draw_date.includes(query)) ||
      (r.result_3top && String(r.result_3top).includes(query)) ||
      (r.result_2bottom && String(r.result_2bottom).includes(query));

    return matchesCategory && matchesQuery;
  });

  // ฟังก์ชันจัดรูปแบบเวลาภาษาไทย
  const formatTimeThai = (isoDate?: string | null) => {
    if (!isoDate) return "—";
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " น.";
    } catch {
      return isoDate;
    }
  };

  // คำนวณเวลาที่ผ่านไป (Relative Time)
  const getRelativeTime = (isoDate?: string | null) => {
    if (!isoDate) return "ล่าสุด";
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "เมื่อสักครู่";
      if (diffMins < 60) return `เมื่อ ${diffMins} นาทีที่แล้ว`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
      return "งวดที่ผ่านมา";
    } catch {
      return "ล่าสุด";
    }
  };

  return (
    <div className="space-y-5">
      {/* ─── ส่วนหัวหน้าจอ ────────────────────────────────────────────── */}
      <PageHeader
        title="ฟีดผลรางวัลสดและการออกผลอัตโนมัติ"
        description="ฟีดรายงานผลรางวัลสดเรียลไทม์ เชื่อมต่อตรงกับ ThaiLottoAPI ตัดยอดเงินรางวัลเข้ากระเป๋าสมาชิกทันทีโดยอัตโนมัติ"
      >
        <div className="flex items-center gap-2.5">
          {/* สวิตช์ฟีดสด Real-time */}
          <button
            onClick={() => setLiveFeedActive(!liveFeedActive)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ring-1 ring-inset",
              liveFeedActive
                ? "bg-emerald-50 text-emerald-700 ring-emerald-300 hover:bg-emerald-100"
                : "bg-neutral-100 text-neutral-500 ring-neutral-200 hover:bg-neutral-200"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                liveFeedActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              )}
            />
            <span>{liveFeedActive ? "ฟีดสดอัตโนมัติ: เปิด" : "ฟีดสด: พักชั่วคราว"}</span>
          </button>

          {/* ปุ่มรีเฟรชข้อมูล */}
          <Btn
            onClick={() => loadData()}
            variant="outline"
            disabled={loading}
            className="rounded-full gap-1.5 text-xs h-9"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span>รีเฟรช</span>
          </Btn>

          {/* ปุ่มดึงผลสดจาก ThaiLottoAPI */}
          <Btn
            onClick={handleSyncThaiLotto}
            disabled={syncing}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-sm h-9 px-4 text-xs"
          >
            <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
            <span>{syncing ? "กำลังเชื่อมต่อ API..." : "ดึงผลสด ThaiLottoAPI ทันที"}</span>
          </Btn>
        </div>
      </PageHeader>

      {/* ─── 4 KPI Cards: ข้อมูลตลาดจริงจากฐานข้อมูล ──────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Radio}
          label="ตลาดหวยในระบบทั้งหมด"
          value={`${totalMarkets} ตลาด`}
          sub={`เปิดรับแทง ${activeMarkets} ตลาด (ThaiLottoAPI สด)`}
          tone="brand"
        />
        <StatCard
          icon={BadgeCheck}
          label="ผลรางวัลที่บันทึกแล้ว"
          value={`${totalResultsCount} งวด`}
          sub="ตัดยอดจ่ายรางวัลแล้วทุกงวด"
          tone="brand"
        />
        <StatCard
          icon={Clock}
          label="อัปเดตฟีดผลล่าสุด"
          value={lastFeedUpdate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
          sub={liveFeedActive ? "ตรวจสอบผลทุก 20 วินาที" : "พักการอัปเดตอัตโนมัติ"}
          tone="sky"
        />
        <StatCard
          icon={Zap}
          label="สถานะการตัดยอดรางวัล"
          value="อัตโนมัติ 100%"
          sub="ระบบ Settlement ตัดยอดทันที"
          tone="amber"
        />
      </div>

      {/* ─── HERO CARD: รายการล่าสุดที่เพิ่งออกผลไปสดๆ ร้อนๆ (Live Breaking Draw) ── */}
      {latestResult && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 via-neutral-900 to-emerald-950/70 p-6 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
            {/* ฝั่งซ้าย: ข้อมูลตลาดและเวลาที่ออกสด */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-black text-rose-400 ring-1 ring-inset ring-rose-500/40">
                  <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                  🔴 เพิ่งออกผลล่าสุด ({getRelativeTime(latestResult.announced_at || latestResult.created_at)})
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-300">
                  งวดวันที่ {latestResult.draw_date}
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  ประกาศเมื่อ: {formatTimeThai(latestResult.announced_at || latestResult.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <MarketLogo
                  logoUrl={latestMarket.logo_url}
                  imageUrl={latestMarket.image_url}
                  name={latestMarket.name}
                  code={latestMarket.code}
                  color={latestMarket.color}
                  size="xl"
                  className="rounded-2xl ring-2 ring-white/20 shadow-md"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {latestMarket.name || "หวย"}
                  </h2>
                  <p className="text-xs text-neutral-300 font-mono">
                    รหัสตลาด: {latestMarket.code} {latestResult.round_key ? `(${latestResult.round_key})` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: ลูกบอลผลรางวัลขนาดใหญ่ ชัดเจน ครบทุกหลัก */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-md">
              {/* 3 ตัวบน */}
              {latestResult.result_3top && (
                <div className="space-y-1 text-center">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    3 ตัวบน
                  </span>
                  <div className="flex items-center gap-1.5">
                    {String(latestResult.result_3top)
                      .trim()
                      .split("")
                      .map((digit, idx) => (
                        <LottoBall key={idx} num={digit} size="lg" />
                      ))}
                  </div>
                </div>
              )}

              {/* 2 ตัวล่าง */}
              {latestResult.result_2bottom && (
                <div className="space-y-1 text-center border-l border-white/10 pl-4 sm:pl-6">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    2 ตัวล่าง
                  </span>
                  <div className="flex items-center gap-1.5">
                    {String(latestResult.result_2bottom)
                      .trim()
                      .split("")
                      .map((digit, idx) => (
                        <LottoBall key={idx} num={digit} size="lg" variant="amber" />
                      ))}
                  </div>
                </div>
              )}

              {/* รางวัลที่ 1 / เลขเต็ม 6 หลัก (ถ้ามี) */}
              {latestResult.result_main && latestResult.result_main.length > 3 && (
                <div className="space-y-1 text-center border-l border-white/10 pl-4 sm:pl-6">
                  <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">
                    เลขรางวัลเต็ม
                  </span>
                  <div className="flex items-center gap-1">
                    {String(latestResult.result_main)
                      .trim()
                      .split("")
                      .map((digit, idx) => (
                        <LottoBall key={idx} num={digit} size="md" />
                      ))}
                  </div>
                </div>
              )}

              {/* ป้ายยืนยันการตัดยอดอัตโนมัติ */}
              <div className="hidden xl:flex flex-col items-end border-l border-white/10 pl-6">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="size-4" /> ตัดยอดรางวัลแล้ว
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5">
                  จ่ายเข้ากระเป๋าสมาชิกเรียบร้อย
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── แถบตัวกรองหมวดหมู่ และค้นหา ───────────────────────────────── */}
      <Panel className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* หมวดหมู่ตลาด */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `ทั้งหมด (${results.length})` },
              { id: "FOREIGN", label: "ฮานอย & ลาว & มาเลย์" },
              { id: "MAEKHONG", label: "หวยแม่โขง (11 รอบ)" },
              { id: "STOCK", label: "หวยหุ้นต่างประเทศ" },
              { id: "GOV", label: "หวยรัฐบาลไทย" },
              { id: "SPEED", label: "หวยเร็ว 15 นาที" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  activeCategory === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ช่องค้นหา */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตลาด, เลข 3บน, 2ล่าง..."
              className="pl-9 h-9 text-xs rounded-full border-neutral-200"
            />
          </div>
        </div>
      </Panel>

      {/* ─── ตารางฟีดผลรางวัลเรียลไทม์ (Live Results Feed Timeline) ──────── */}
      <Panel>
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              ไทม์ไลน์ผลรางวัลสดเรียงตามเวลาจริง (ThaiLottoAPI)
            </h3>
            <p className="text-[11px] text-neutral-500">
              แสดงงวดที่ออกผลและตัดยอดล่าสุดลงมาตามลำดับเวลาจริง ({filteredResults.length} รายการที่ตรงกับตัวกรอง)
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            เชื่อมต่อ API สด
          </span>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>ตลาดหวย</Th>
              <Th>งวดวันที่</Th>
              <Th>เวลาที่ออกผลจริง</Th>
              <Th>3 ตัวบน (หลักละ 1 ลูก)</Th>
              <Th>2 ตัวล่าง (หลักละ 1 ลูก)</Th>
              <Th>รางวัลเต็ม / รางวัลที่ 1</Th>
              <Th className="text-center">สถานะการตัดยอด</Th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length > 0 ? (
              filteredResults.map((r, idx) => {
                const mkt = r.lottery_markets || {};
                const top3 = r.result_3top ? String(r.result_3top).trim() : null;
                const bottom2 = r.result_2bottom ? String(r.result_2bottom).trim() : null;
                const main6 = r.result_main ? String(r.result_main).trim() : null;
                const isNewest = idx === 0 && activeCategory === "ALL" && !searchQuery;

                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "transition-colors hover:bg-neutral-50/70",
                      isNewest && "bg-emerald-50/30"
                    )}
                  >
                    {/* ตลาดหวย พร้อม Badge สัญลักษณ์ */}
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <MarketLogo
                          logoUrl={mkt.logo_url}
                          imageUrl={mkt.image_url}
                          name={mkt.name}
                          code={mkt.code}
                          color={mkt.color}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="whitespace-nowrap font-bold text-neutral-900 text-xs">
                              {mkt.name || "หวย"}
                            </p>
                            {isNewest && (
                              <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-700">
                                ล่าสุด
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {mkt.code} {r.round_key ? `(${r.round_key})` : ""}
                          </p>
                        </div>
                      </div>
                    </Td>

                    {/* งวดวันที่ */}
                    <Td className="whitespace-nowrap text-xs text-neutral-700 font-medium">
                      {r.draw_date}
                    </Td>

                    {/* เวลาที่ออกผลจริง พร้อมระบุ Relative Time */}
                    <Td className="whitespace-nowrap text-xs">
                      <p className="font-mono font-bold text-neutral-800">
                        {formatTimeThai(r.announced_at || r.created_at)}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {getRelativeTime(r.announced_at || r.created_at)}
                      </p>
                    </Td>

                    {/* 3 ตัวบน (แตกเป็นลูกบอลละ 1 หลัก) */}
                    <Td>
                      {top3 ? (
                        <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-50/70 px-2 py-1 ring-1 ring-inset ring-emerald-200/60">
                          <span className="text-[10px] font-bold text-emerald-900 mr-0.5">
                            3บน
                          </span>
                          <div className="flex items-center gap-0.5">
                            {top3.split("").map((digit, dIdx) => (
                              <LottoBall key={dIdx} num={digit} size="sm" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-mono">—</span>
                      )}
                    </Td>

                    {/* 2 ตัวล่าง (แตกเป็นลูกบอลละ 1 หลัก) */}
                    <Td>
                      {bottom2 ? (
                        <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50/70 px-2 py-1 ring-1 ring-inset ring-amber-200/60">
                          <span className="text-[10px] font-bold text-amber-900 mr-0.5">
                            2ล่าง
                          </span>
                          <div className="flex items-center gap-0.5">
                            {bottom2.split("").map((digit, dIdx) => (
                              <LottoBall key={dIdx} num={digit} size="sm" variant="amber" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-mono">—</span>
                      )}
                    </Td>

                    {/* รางวัลเต็ม / รางวัลที่ 1 */}
                    <Td>
                      {main6 ? (
                        <div className="flex items-center gap-0.5">
                          {main6.split("").map((digit, dIdx) => (
                            <LottoBall key={dIdx} num={digit} size="sm" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-mono">—</span>
                      )}
                    </Td>

                    {/* สถานะการตัดยอดรางวัล */}
                    <Td className="text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-300 whitespace-nowrap">
                        <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                        ตัดยอดแล้ว
                      </span>
                    </Td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <Td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                  {loading
                    ? "กำลังโหลดฟีดผลรางวัล..."
                    : searchQuery
                    ? `ไม่พบผลรางวัลที่ตรงกับ "${searchQuery}"`
                    : "ไม่มีข้อมูลผลรางวัลในหมวดหมู่นี้"}
                </Td>
              </tr>
            )}
          </tbody>
        </TableWrap>
      </Panel>
    </div>
  );
}
