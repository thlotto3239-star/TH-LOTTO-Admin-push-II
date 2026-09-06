"use client";

import * as React from "react";
import { Zap, Dices, Banknote, Trophy, Users, TrendingUp, RefreshCw, Settings2, Sliders, CheckCircle2, X, Save, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Panel, StatCard, StatusBadge, Avatar, PageHeader, RealtimeDot, TableWrap, Th, Td, Btn, Field, inputCls } from "../primitives";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { INSTANT_BET_TYPES, InstantBetTypeConfig, fmtTHB, fmtNum } from "@/data/admin-mock";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── ลูกบอลหวยสไตล์แบรนด์ทางการ (วงกลมสีเขียวเข้มขอบนอก + วงกลมสีขาวด้านใน + ตัวเลขสีดำเข้ม) ────
export function LottoBall({
  num,
  digit,
  size = "md",
  variant = "brand",
}: {
  num?: string | number;
  digit?: string | number;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "amber" | "rose" | "purple";
}) {
  const displayVal = num ?? digit ?? "";
  const dim = size === "sm" ? "size-6" : size === "lg" ? "size-9" : "size-7.5";
  const innerDim =
    size === "sm" ? "size-4.5 text-[11px]" : size === "lg" ? "size-7 text-sm" : "size-5.5 text-xs";

  const outerBg =
    variant === "amber"
      ? "bg-gradient-to-br from-amber-500 to-amber-700 ring-1 ring-amber-400/50 shadow-amber-900/20"
      : variant === "rose"
      ? "bg-gradient-to-br from-rose-500 to-rose-700 ring-1 ring-rose-400/50 shadow-rose-900/20"
      : variant === "purple"
      ? "bg-gradient-to-br from-purple-600 to-purple-800 ring-1 ring-purple-400/50 shadow-purple-900/20"
      : "bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] ring-1 ring-emerald-500/40 shadow-emerald-950/25";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0 shadow-sm transition-transform hover:scale-110",
        dim,
        outerBg
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-white shadow-inner font-mono font-black text-neutral-900",
          innerDim
        )}
      >
        {displayVal}
      </div>
    </div>
  );
}

// ─── แยกชุดตัวเลขที่สมาชิกแทงออกมาเป็นก้อนลูกบอล (1 ลูกบอล = 1 หลักตัวเลข) ──
function parseBetNumbers(raw: any): { position?: string; balls: string[] } {
  if (!raw) return { balls: [] };
  let position: string | undefined;
  let rawList: string[] = [];

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.units) {
          position = "หลักหน่วย";
          rawList = Array.isArray(parsed.units) ? parsed.units.map(String) : [String(parsed.units)];
        } else if (parsed.tens) {
          position = "หลักสิบ";
          rawList = Array.isArray(parsed.tens) ? parsed.tens.map(String) : [String(parsed.tens)];
        } else if (parsed.hundreds) {
          position = "หลักร้อย";
          rawList = Array.isArray(parsed.hundreds) ? parsed.hundreds.map(String) : [String(parsed.hundreds)];
        } else {
          rawList = Object.values(parsed).flat().map(String);
        }
      } catch {
        rawList = trimmed.split(/[\s,]+/);
      }
    } else if (trimmed.includes(",")) {
      rawList = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (trimmed.includes(" ")) {
      rawList = trimmed.split(/\s+/).filter(Boolean);
    } else {
      rawList = [trimmed];
    }
  } else if (Array.isArray(raw)) {
    rawList = raw.map(String);
  } else if (typeof raw === "object") {
    if (raw.units) {
      position = "หลักหน่วย";
      rawList = Array.isArray(raw.units) ? raw.units.map(String) : [String(raw.units)];
    } else if (raw.tens) {
      position = "หลักสิบ";
      rawList = Array.isArray(raw.tens) ? raw.tens.map(String) : [String(raw.tens)];
    } else if (raw.hundreds) {
      position = "หลักร้อย";
      rawList = Array.isArray(raw.hundreds) ? raw.hundreds.map(String) : [String(raw.hundreds)];
    } else {
      rawList = Object.values(raw).flat().map(String);
    }
  }

  // แตกตัวเลขทุกตัวออกเป็นหลักละ 1 ลูกบอล เช่น "999" -> ['9', '9', '9'], "59" -> ['5', '9']
  const balls: string[] = [];
  for (const item of rawList) {
    const s = String(item).trim();
    if (!isNaN(Number(s)) && s.length > 1) {
      balls.push(...s.split(""));
    } else if (s.length > 0) {
      balls.push(s);
    }
  }

  return { position, balls };
}

// ─── แปลงประเภทการแทงเป็นภาษาไทยที่คนเล่นหวยและแอดมินเข้าใจง่าย ─────────────
function formatInstantBetTypeThai(typeCode: string, position?: string): { main: string; badgeCls: string } {
  const code = (typeCode || "").toLowerCase();

  if (code === "pin_top" || code === "pak_bon") {
    return {
      main: position ? `ปัก${position}บน` : "ปักหลักบน",
      badgeCls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  }
  if (code === "pin_bottom" || code === "pak_lang") {
    return {
      main: position ? `ปัก${position}ล่าง` : "ปักหลักล่าง",
      badgeCls: "bg-teal-50 text-teal-700 ring-teal-200",
    };
  }
  if (code === "3top" || code === "3_top" || code === "3digit_top") {
    return { main: "3 ตัวบน", badgeCls: "bg-purple-50 text-purple-700 ring-purple-200" };
  }
  if (code === "3toad" || code === "3_toad" || code === "3tode") {
    return { main: "3 ตัวโต๊ด", badgeCls: "bg-amber-50 text-amber-700 ring-amber-200" };
  }
  if (code === "3front" || code === "3_front") {
    return { main: "3 ตัวหน้า", badgeCls: "bg-indigo-50 text-indigo-700 ring-indigo-200" };
  }
  if (code === "3back" || code === "3_back") {
    return { main: "3 ตัวท้าย", badgeCls: "bg-blue-50 text-blue-700 ring-blue-200" };
  }
  if (code === "2top" || code === "2_top") {
    return { main: "2 ตัวบน", badgeCls: "bg-sky-50 text-sky-700 ring-sky-200" };
  }
  if (code === "2bottom" || code === "2_bottom") {
    return { main: "2 ตัวล่าง", badgeCls: "bg-cyan-50 text-cyan-700 ring-cyan-200" };
  }
  if (code === "6straight" || code === "6_straight") {
    return { main: "6 ตัวตรง", badgeCls: "bg-rose-50 text-rose-700 ring-rose-200" };
  }
  if (code.includes("run_top")) return { main: "วิ่งบน", badgeCls: "bg-orange-50 text-orange-700 ring-orange-200" };
  if (code.includes("run_down") || code.includes("run_bottom"))
    return { main: "วิ่งล่าง", badgeCls: "bg-orange-50 text-orange-700 ring-orange-200" };

  return { main: typeCode || "หวยไว", badgeCls: "bg-neutral-100 text-neutral-700 ring-neutral-200" };
}

// ─── ป้ายสถานะภาษาไทยชัดเจน (ถูกรางวัล / ไม่ถูกรางวัล / รอออกผล) ─────────────
function InstantStatusBadge({ status, winnings }: { status: string; winnings?: number }) {
  const s = (status || "").toUpperCase();
  if (s === "WIN" || s === "WON") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-300 whitespace-nowrap">
        <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
        ถูกรางวัล {winnings && Number(winnings) > 0 ? `(+${fmtTHB(winnings)})` : ""}
      </span>
    );
  }
  if (s === "LOSE" || s === "LOST") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 ring-1 ring-inset ring-neutral-200 whitespace-nowrap">
        <X className="size-3 text-neutral-400 shrink-0" />
        ไม่ถูกรางวัล
      </span>
    );
  }
  if (s === "PENDING" || s === "WAITING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 whitespace-nowrap">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
        รอออกผล
      </span>
    );
  }
  if (s === "CANCEL" || s === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 whitespace-nowrap">
        ยกเลิก
      </span>
    );
  }
  return <span className="text-xs text-neutral-500">{status}</span>;
}

export function InstantOverviewPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "rates" | "settings">("overview");
  const [tick, setTick] = React.useState(30);
  const [refreshedAt, setRefreshedAt] = React.useState("--:--:--");
  const [betTypes, setBetTypes] = React.useState<InstantBetTypeConfig[]>(INSTANT_BET_TYPES);
  const [editingType, setEditingType] = React.useState<InstantBetTypeConfig | null>(null);
  const [editRate, setEditRate] = React.useState<number>(0);
  const [editMaxBet, setEditMaxBet] = React.useState<number>(0);
  const { toast } = useToast();

  const [liveStats, setLiveStats] = React.useState({
    total_draws_today: 0,
    total_bets_today: 0,
    total_bet_amount_today: 0,
    total_payout_today: 0,
    active_players_today: 9,
    hourly: [] as { hour: string; BET: number; PAYOUT: number }[],
  });
  const [liveDraws, setLiveDraws] = React.useState<any[]>([]);
  const [liveBets, setLiveBets] = React.useState<any[]>([]);
  const [loadingLive, setLoadingLive] = React.useState(true);

  const [instantSettings, setInstantSettings] = React.useState({
    name: "ล็อตโต้ 1 นาที (หวย 1 นาที)",
    logo_url: "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/instant/logo_1780622398844.png",
    maintenance: false,
    draw_interval: 60,
    win_rate: 5,
    max_bets: 100,
    show_popular: false,
    show_trending: true,
  });
  const [savingSettings, setSavingSettings] = React.useState(false);

  const loadLiveData = React.useCallback(async () => {
    try {
      const [resStats, resDraws, resBets] = await Promise.all([
        fetch("/api/admin/data?resource=instant-stats"),
        fetch("/api/admin/data?resource=instant-draws&limit=15"),
        fetch("/api/admin/data?resource=instant-bets&limit=15"),
      ]);
      const jsonStats = await resStats.json();
      const jsonDraws = await resDraws.json();
      const jsonBets = await resBets.json();
      if (jsonStats.success && jsonStats.data) setLiveStats(jsonStats.data);
      if (jsonDraws.success && Array.isArray(jsonDraws.data)) setLiveDraws(jsonDraws.data);
      if (jsonBets.success && Array.isArray(jsonBets.data)) setLiveBets(jsonBets.data);
      setRefreshedAt(new Date().toLocaleTimeString("th-TH"));
    } catch (e) {
      console.error("Failed to load live instant data:", e);
    } finally {
      setLoadingLive(false);
    }
  }, []);

  const s = liveStats;
  const net = (s.total_bet_amount_today || 0) - (s.total_payout_today || 0);

  // Auto-refresh ทุก 30 วินาที ดึงข้อมูลจริงจาก Supabase
  React.useEffect(() => {
    loadLiveData();
    const iv = setInterval(() => {
      setTick((t) => {
        if (t <= 1) {
          loadLiveData();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [loadLiveData]);

  // Live Supabase Sync for 9 Bet Types and Instant Settings
  React.useEffect(() => {
    fetch("/api/admin/data?resource=instant-bet-types")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setBetTypes((prev) =>
            prev.map((bt) => {
              const live = res.data.find((d: any) => d.code === bt.code);
              if (!live) return bt;
              return {
                ...bt,
                id: live.id || bt.id,
                name: live.name || bt.name,
                name_th: live.name || bt.name_th || bt.name,
                rate: parseFloat(live.rate) || bt.rate,
                payout_rate: parseFloat(live.rate) || bt.payout_rate || bt.rate,
                min_digits: live.min_digits ?? bt.min_digits,
                max_digits: live.max_digits ?? bt.max_digits,
                digit_length: live.min_digits ?? bt.digit_length ?? bt.min_digits,
                min_bet: live.min_bet ?? bt.min_bet ?? 1,
                max_bet: live.max_bet ?? bt.max_bet ?? 50000,
                is_active: live.is_active ?? bt.is_active,
              };
            })
          );
        }
      })
      .catch((e) => console.error("Could not fetch live instant bet types:", e));

    fetch("/api/admin/data?resource=settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setInstantSettings({
            name: d.instant_name || "หวยไทย 1 นาที",
            logo_url: d.instant_logo_url || "https://ygopnjbvccenryejqmlw.supabase.co/storage/v1/object/public/sliders/instant/logo_1780622398844.png",
            maintenance: d.instant_maintenance_mode === "true",
            draw_interval: parseInt(d.instant_draw_interval || "60", 10),
            win_rate: parseInt(d.instant_win_rate || "5", 10),
            max_bets: parseInt(d.instant_max_bets_per_minute || "100", 10),
            show_popular: d.instant_show_popular === "true",
            show_trending: d.instant_show_trending === "true",
          });
        }
      })
      .catch((e) => console.error("Could not fetch instant settings:", e));
  }, []);

  const handleSaveInstantSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_settings",
          payload: {
            settings: {
              instant_name: instantSettings.name,
              instant_logo_url: instantSettings.logo_url,
              instant_maintenance_mode: String(instantSettings.maintenance),
              instant_draw_interval: String(instantSettings.draw_interval),
              instant_win_rate: String(instantSettings.win_rate),
              instant_max_bets_per_minute: String(instantSettings.max_bets),
              instant_show_popular: String(instantSettings.show_popular),
              instant_show_trending: String(instantSettings.show_trending),
            },
          },
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast({
          title: "บันทึกการตั้งค่าหวย 1 นาทีแล้ว",
          description: `อัปเดตชื่อและโลโก้ "${instantSettings.name}" บันทึกลงระบบเรียบร้อย`,
        });
      } else {
        throw new Error(res.error || "Failed to save");
      }
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาดในการบันทึก",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = async (code: string) => {
    const target = betTypes.find((b) => b.code === code);
    if (!target) return;
    const nextState = !target.is_active;

    setBetTypes((prev) =>
      prev.map((bt) => (bt.code === code ? { ...bt, is_active: nextState } : bt))
    );

    toast({
      title: nextState ? "เปิดรับแทงแล้ว" : "ปิดรับแทงชั่วคราว",
      description: `${target.name_th || target.name} (${target.code}) เปลี่ยนสถานะเป็น ${nextState ? "เปิดใช้งาน" : "ปิดชั่วคราว"}`,
    });

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_instant_bet_type",
          payload: { id: target.id, rate: target.payout_rate ?? target.rate, is_active: nextState },
        }),
      });
    } catch (e) {
      console.error("Failed to sync toggle to Supabase:", e);
    }
  };

  const handleOpenEdit = (bt: InstantBetTypeConfig) => {
    setEditingType(bt);
    setEditRate(bt.payout_rate ?? bt.rate ?? 0);
    setEditMaxBet(bt.max_bet ?? 50000);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setBetTypes((prev) =>
      prev.map((bt) =>
        bt.code === editingType.code ? { ...bt, payout_rate: editRate, rate: editRate, max_bet: editMaxBet } : bt
      )
    );
    toast({
      title: "บันทึกอัตราจ่ายสำเร็จ",
      description: `ปรับปรุง ${editingType.name_th || editingType.name} อัตราจ่ายเป็น ${editRate}x สูงสุด ${fmtTHB(editMaxBet)}`,
    });

    const targetId = editingType.id;
    setEditingType(null);

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_instant_bet_type",
          payload: { id: targetId, rate: editRate, is_active: editingType.is_active },
        }),
      });
    } catch (err) {
      console.error("Failed to sync rate to Supabase:", err);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="หวยหนึ่งนาที (Instant 1-Minute)" description="ข้อมูลหวยหนึ่งนาที · สถิติสด รอบออกรางวัล รายการแทง และตั้งค่าอัตราจ่าย 9 รูปแบบ">
        <div className="flex items-center gap-2">
          <RealtimeDot label="อัปเดตอัตโนมัติ 30 วินาที" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
            <RefreshCw className={cn("size-3", tick === 30 && "animate-spin")} /> รีเฟรชในอีก {tick} วิ · ล่าสุด {refreshedAt}
          </span>
        </div>
      </PageHeader>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-bold transition-all",
            activeTab === "overview"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Zap className="size-4" /> ภาพรวมสถิติและมอนิเตอร์สด
        </button>
        <button
          onClick={() => setActiveTab("rates")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-bold transition-all",
            activeTab === "rates"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Sliders className="size-4" /> ตั้งค่าอัตราจ่าย 9 รูปแบบ (Bet Types)
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            9 ชนิด
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-bold transition-all",
            activeTab === "settings"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          )}
        >
          <Settings2 className="size-4" /> ตั้งค่าและโลโก้หวย 1 นาที (Settings)
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* KPI 6 cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Zap} label="รอบวันนี้" value={fmtNum(s.total_draws_today)} sub="งวด" tone="amber" />
            <StatCard icon={Dices} label="รายการแทงวันนี้" value={fmtNum(s.total_bets_today)} sub="โพย" tone="brand" />
            <StatCard icon={Banknote} label="ยอดแทงรวม" value={fmtTHB(s.total_bet_amount_today)} tone="brand" />
            <StatCard icon={Trophy} label="ยอดจ่ายรางวัล" value={fmtTHB(s.total_payout_today)} tone="rose" />
            <StatCard icon={Users} label="ผู้เล่นที่ยังเล่น" value={fmtNum(s.active_players_today)} sub="คน" tone="sky" />
            <StatCard icon={TrendingUp} label="กำไร/ขาดทุนสุทธิ" value={fmtTHB(net)} sub="แทง − จ่ายรางวัล" tone={net >= 0 ? "brand" : "rose"} />
          </div>

          {/* Chart */}
          <Panel className="p-5 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-neutral-900">ยอดแทงเทียบยอดจ่ายรางวัล รายชั่วโมง (ล็อตโต้ 1 นาที สด)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.hourly && s.hourly.length > 0 ? s.hourly : [{ hour: "ปัจจุบัน", BET: 0, PAYOUT: 0 }]} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmtTHB(Number(v))} contentStyle={{ borderRadius: 16, border: "1px solid #e5e5e5", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="BET" name="ยอดแทง" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="PAYOUT" name="ยอดจ่าย" fill="#287e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Tables */}
          <div className="grid gap-5 xl:grid-cols-2">
            {/* Table 1: ผลรางวัลล่าสุด */}
            <Panel className="min-w-0">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">ผลรางวัลล่าสุด</h3>
                  <p className="text-[11px] text-neutral-500">สรุปผลการออกรางวัลรอบล่าสุด (ออกผลทุก 60 วินาที)</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  สดทุก 60 วิ
                </span>
              </div>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>รหัสรอบ</Th>
                    <Th>เวลา</Th>
                    <Th>สถานะ</Th>
                    <Th>ผล 3 ตัวบน / 2 ตัวล่าง</Th>
                    <Th className="text-right">โพย</Th>
                    <Th className="text-right">ยอดแทง</Th>
                    <Th className="text-right">ยอดจ่าย</Th>
                  </tr>
                </thead>
                <tbody>
                  {liveDraws.length > 0 ? (
                    liveDraws.map((d) => {
                      const timeStr = d.created_at
                        ? new Date(d.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                        : "—";
                      const statusVal = (d.status || "PENDING").toLowerCase();
                      const threeTop = d.result_6d ? d.result_6d.slice(-3) : null;
                      const twoBottom = d.result_2bottom || null;

                      return (
                        <tr key={d.id || d.draw_id} className="transition-colors hover:bg-neutral-50/70">
                          <Td className="font-mono text-xs font-bold text-neutral-800">#{d.draw_id}</Td>
                          <Td className="whitespace-nowrap text-xs text-neutral-500">{timeStr}</Td>
                          <Td><StatusBadge status={statusVal as any} /></Td>
                          <Td>
                            {threeTop ? (
                              <div className="flex items-center gap-2 flex-wrap py-0.5">
                                <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-50/70 px-2 py-1 ring-1 ring-inset ring-emerald-200/60">
                                  <span className="text-[10px] font-bold text-emerald-900">3บน</span>
                                  <div className="flex items-center gap-0.5">
                                    {threeTop.split("").map((digit: string, idx: number) => (
                                      <LottoBall key={idx} num={digit} size="sm" />
                                    ))}
                                  </div>
                                </div>
                                {twoBottom && (
                                  <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50/70 px-2 py-1 ring-1 ring-inset ring-amber-200/60">
                                    <span className="text-[10px] font-bold text-amber-900">2ล่าง</span>
                                    <div className="flex items-center gap-0.5">
                                      {twoBottom.split("").map((digit: string, idx: number) => (
                                        <LottoBall key={idx} num={digit} size="sm" variant="amber" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 font-medium">รอออกผล</span>
                            )}
                          </Td>
                          <Td className="text-right text-xs font-mono">{d.total_bets || 0}</Td>
                          <Td className="whitespace-nowrap text-right text-xs font-semibold">{fmtTHB(d.total_wagers || d.total_bet || 0)}</Td>
                          <Td className={cn("whitespace-nowrap text-right text-xs font-semibold", Number(d.total_payouts || d.total_payout || 0) > 0 ? "text-rose-600" : "text-neutral-400")}>
                            {Number(d.total_payouts || d.total_payout || 0) > 0 ? fmtTHB(d.total_payouts || d.total_payout) : "—"}
                          </Td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <Td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                        {loadingLive ? "กำลังโหลดข้อมูลสด..." : "ยังไม่มีรอบออกรางวัล"}
                      </Td>
                    </tr>
                  )}
                </tbody>
              </TableWrap>
            </Panel>

            {/* Table 2: รายการแทงล่าสุด */}
            <Panel className="min-w-0">
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">รายการแทงล่าสุด</h3>
                  <p className="text-[11px] text-neutral-500">โพยแทงสดจากสมาชิกในรอบปัจจุบันและรอบล่าสุด</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {liveBets.length} รายการ
                </span>
              </div>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>สมาชิก</Th>
                    <Th>ประเภท</Th>
                    <Th>เลขที่แทง</Th>
                    <Th className="text-right">ยอดแทง</Th>
                    <Th className="text-center">สถานะ</Th>
                  </tr>
                </thead>
                <tbody>
                  {liveBets.length > 0 ? (
                    liveBets.map((b, i) => {
                      const profile = b.profiles;
                      const memberName = profile?.full_name || b.member_name || "ผู้ใช้งาน";
                      const memberIdentifier = profile?.member_id || profile?.phone || (b.user_id ? b.user_id.slice(0, 8) : "—");
                      const parsed = parseBetNumbers(b.numbers || b.number);
                      const betTypeThai = formatInstantBetTypeThai(b.bet_type, parsed.position);

                      return (
                        <tr key={b.id || i} className="transition-colors hover:bg-neutral-50/70">
                          {/* สมาชิกพร้อม Avatar และรหัสสมาชิก */}
                          <Td className="whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                name={memberName}
                                imageUrl={profile?.avatar_url}
                                className="size-8 text-xs font-bold"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-neutral-900 truncate">
                                  {memberName}
                                </p>
                                <p className="text-[10px] font-mono text-neutral-400">
                                  {memberIdentifier}
                                </p>
                              </div>
                            </div>
                          </Td>

                          {/* ประเภทการแทง ภาษาไทยพร้อมระบุปักหลักบน/ล่าง */}
                          <Td className="whitespace-nowrap">
                            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset", betTypeThai.badgeCls)}>
                              {betTypeThai.main}
                            </span>
                          </Td>

                          {/* เลขที่แทง แสดงผลเป็นชุดลูกบอลหวย (Lotto Balls) แบรนด์เขียว/ขาว/ดำ */}
                          <Td>
                            <div className="flex flex-wrap items-center gap-1 max-w-[220px] py-0.5">
                              {parsed.balls.length > 0 ? (
                                parsed.balls.map((ballNum, bIdx) => (
                                  <LottoBall key={bIdx} num={ballNum} size="sm" />
                                ))
                              ) : (
                                <span className="font-mono text-xs text-neutral-400">—</span>
                              )}
                            </div>
                          </Td>

                          {/* ยอดแทง */}
                          <Td className="whitespace-nowrap text-right text-xs font-semibold text-neutral-800">
                            {fmtTHB(b.amount)}
                          </Td>

                          {/* สถานะผลรางวัล ชัดเจน เข้าใจง่าย */}
                          <Td className="text-center">
                            <InstantStatusBadge status={b.status} winnings={b.payout || b.winnings} />
                          </Td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <Td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                        {loadingLive ? "กำลังโหลดข้อมูลสด..." : "รอบปัจจุบันยังไม่มีรายการแทง (ระบบรอรับโพยใหม่ทุก 60 วินาที)"}
                      </Td>
                    </tr>
                  )}
                </tbody>
              </TableWrap>
            </Panel>
          </div>
        </>
      ) : (
        /* Bet Types & Payout Rates Tab */
        <div className="space-y-4">
          <Panel className="p-4 sm:p-6">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  โครงสร้างรูปแบบการแทงและอัตราจ่าย 9 ชนิด
                </h3>
                <p className="text-xs text-neutral-500">
                  ควบคุมการเปิด/ปิดรับแทงชั่วคราว และปรับเปลี่ยนตัวคูณอัตราจ่ายรางวัลสำหรับหวยเร็ว 1 นาที
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  เปิดรับแทง {betTypes.filter((b) => b.is_active).length} / 9 ชนิด
                </span>
              </div>
            </div>

            <TableWrap>
              <thead>
                <tr>
                  <Th>รหัสประเภท</Th>
                  <Th>ชื่อประเภทการแทง</Th>
                  <Th className="text-center">ความยาวตัวเลข</Th>
                  <Th className="text-right">อัตราจ่าย (เท่า)</Th>
                  <Th className="text-right">แทงขั้นต่ำ</Th>
                  <Th className="text-right">แทงสูงสุด/รอบ</Th>
                  <Th className="text-center">สถานะรับแทง</Th>
                  <Th className="text-right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {betTypes.map((bt) => (
                  <tr key={bt.code} className="transition-colors hover:bg-neutral-50/70">
                    <Td className="font-mono text-xs font-bold text-brand-700">{bt.code}</Td>
                    <Td className="font-medium text-neutral-900">{bt.name_th || bt.name}</Td>
                    <Td className="text-center">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-bold text-neutral-700">
                        {bt.digit_length ?? bt.min_digits ?? 2} หลัก
                      </span>
                    </Td>
                    <Td className="text-right">
                      <span className="font-mono text-sm font-black text-amber-600">
                        {fmtNum(bt.payout_rate ?? bt.rate ?? 0)}x
                      </span>
                    </Td>
                    <Td className="text-right text-xs font-medium text-neutral-600">
                      {fmtTHB(bt.min_bet ?? 1)}
                    </Td>
                    <Td className="text-right text-xs font-semibold text-neutral-800">
                      {fmtTHB(bt.max_bet ?? 50000)}
                    </Td>
                    <Td className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={bt.is_active}
                          onCheckedChange={() => handleToggle(bt.code)}
                        />
                      </div>
                    </Td>
                    <Td className="text-right">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(bt)}
                        className="gap-1 text-xs"
                      >
                        <Settings2 className="size-3.5" /> แก้ไขอัตรา
                      </Btn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Panel>
        </div>
      )}

      {/* Settings & Branding Tab */}
      {activeTab === "settings" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: พรีวิวแบนเนอร์ / โลโก้หวย 1 นาที */}
          <Panel className="flex flex-col items-center justify-center p-6 text-center lg:col-span-1">
            <div className="relative mb-4 flex size-28 items-center justify-center overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-inner">
              {instantSettings.logo_url ? (
                <img
                  src={instantSettings.logo_url}
                  alt={instantSettings.name}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Zap className="size-12 text-amber-500" />
              )}
            </div>
            <h3 className="text-lg font-bold text-neutral-900">{instantSettings.name}</h3>
            <p className="mt-1 text-xs text-neutral-400">รอบออกผลทุก {instantSettings.draw_interval} วินาที</p>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                ⚡ หวยออกไว 1 นาที
              </span>
              {instantSettings.maintenance ? (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                  🔴 ปิดปรับปรุง
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  🟢 เปิดให้บริการ
                </span>
              )}
              {instantSettings.show_trending ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  🔥 มาแรง
                </span>
              ) : null}
              {instantSettings.show_popular ? (
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-600">
                  ⭐ ยอดนิยม
                </span>
              ) : null}
            </div>
          </Panel>

          {/* Card 2: ฟอร์มแก้ไขชื่อ โลโก้ และการตั้งค่าระบบ */}
          <Panel className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">ตั้งค่าชื่อ โลโก้ และพารามิเตอร์หวย 1 นาที</h3>
                <p className="text-xs text-neutral-500">ข้อมูลเชื่อมโยงกับฐานข้อมูล Supabase `settings` โดยตรง</p>
              </div>
              <Btn
                onClick={handleSaveInstantSettings}
                disabled={savingSettings}
                className="gap-2 rounded-full"
              >
                <Save className="size-4" />
                {savingSettings ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </Btn>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ชื่อรายการหวย (Display Name)">
                  <Input
                    value={instantSettings.name}
                    onChange={(e) => setInstantSettings((p) => ({ ...p, name: e.target.value }))}
                    placeholder="เช่น หวยไทย 1 นาที"
                    className={inputCls}
                  />
                </Field>

                <Field label="ลิงก์โลโก้ / รูปภาพ (Logo Image URL)">
                  <Input
                    value={instantSettings.logo_url}
                    onChange={(e) => setInstantSettings((p) => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://... หรือปล่อยว่าง"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="ระยะเวลารอบ (วินาที)">
                  <Input
                    type="number"
                    min={10}
                    max={600}
                    value={instantSettings.draw_interval}
                    onChange={(e) => setInstantSettings((p) => ({ ...p, draw_interval: parseInt(e.target.value, 10) || 60 }))}
                    className={inputCls}
                  />
                </Field>

                <Field label="อัตราการชนะ (Win Rate %)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={instantSettings.win_rate}
                    onChange={(e) => setInstantSettings((p) => ({ ...p, win_rate: parseInt(e.target.value, 10) || 5 }))}
                    className={inputCls}
                  />
                </Field>

                <Field label="จำกัดบิลต่อนาที (Max Bets/min)">
                  <Input
                    type="number"
                    min={1}
                    value={instantSettings.max_bets}
                    onChange={(e) => setInstantSettings((p) => ({ ...p, max_bets: parseInt(e.target.value, 10) || 100 }))}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50/50 px-4">
                <label className="flex items-center justify-between py-3 text-xs font-medium text-neutral-700 cursor-pointer">
                  <div>
                    <p className="font-semibold text-neutral-800">โหมดปิดปรับปรุงชั่วคราว (Maintenance Mode)</p>
                    <p className="text-[11px] text-neutral-400">ปิดรับแทงชั่วคราวทั้งระบบหวย 1 นาที</p>
                  </div>
                  <Switch
                    checked={instantSettings.maintenance}
                    onCheckedChange={(v) => setInstantSettings((p) => ({ ...p, maintenance: v }))}
                  />
                </label>

                <label className="flex items-center justify-between py-3 text-xs font-medium text-neutral-700 cursor-pointer">
                  <div>
                    <p className="font-semibold text-neutral-800">แสดงในหมวดหมู่มาแรง (Trending)</p>
                    <p className="text-[11px] text-neutral-400">นำไปแสดงในฟีด/หมวดหมู่ยอดฮิตมาแรงหน้าเว็บสมาชิก</p>
                  </div>
                  <Switch
                    checked={instantSettings.show_trending}
                    onCheckedChange={(v) => setInstantSettings((p) => ({ ...p, show_trending: v }))}
                  />
                </label>

                <label className="flex items-center justify-between py-3 text-xs font-medium text-neutral-700 cursor-pointer">
                  <div>
                    <p className="font-semibold text-neutral-800">แสดงในหมวดหมู่ยอดนิยม (Popular)</p>
                    <p className="text-[11px] text-neutral-400">นำไปแสดงในหมวดหมู่ยอดนิยมหน้าเว็บสมาชิก</p>
                  </div>
                  <Switch
                    checked={instantSettings.show_popular}
                    onCheckedChange={(v) => setInstantSettings((p) => ({ ...p, show_popular: v }))}
                  />
                </label>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Edit Rate Modal */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-5 text-brand-600" />
                <h3 className="font-bold text-neutral-900">แก้ไขอัตราจ่าย — {editingType.name_th || editingType.name}</h3>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium text-neutral-700">รหัสประเภท (Code)</label>
                <input
                  type="text"
                  disabled
                  value={editingType.code}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 font-mono text-xs font-bold text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-neutral-700">อัตราจ่ายรางวัล (ตัวคูณเท่า / บาทละ)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={editRate}
                    onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 font-mono font-bold text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <span className="absolute right-3 top-2 font-semibold text-neutral-400">เท่า</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  สเปกมาตรฐานฐานข้อมูล: 2 ตัว = 90x, 3 ตัวบน = 900x, 3 โต๊ด = 180x, 6 ตัวตรง = 15,000x
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-neutral-700">เพดานรับแทงสูงสุด/โพย (บาท)</label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={editMaxBet}
                  onChange={(e) => setEditMaxBet(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 font-mono text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Btn type="button" variant="outline" onClick={() => setEditingType(null)}>
                  ยกเลิก
                </Btn>
                <Btn type="submit" className="gap-1.5">
                  <CheckCircle2 className="size-4" /> บันทึกการเปลี่ยนแปลง
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
