"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Trophy,
  Megaphone,
  Newspaper,
  AlertTriangle,
  Star,
  Flame,
  Search,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ConfirmDialog, MarketLogo } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type NewsFeed, MARKETS, mktShort } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

interface LiveMarket {
  id: string;
  name: string;
  code: string;
  category?: string;
  color?: string;
  logo_url?: string | null;
  image_url?: string | null;
  draw_time?: string;
  close_minutes_before?: number;
  show_in_popular: boolean;
  show_in_trending: boolean;
  is_open?: boolean;
  is_active?: boolean;
}

const EMPTY_FEED: NewsFeed = {
  id: "",
  title: "",
  body: "",
  type: "news",
  link_url: "",
  display_order: 0,
  is_active: true,
  created_at: "",
};

const TYPE_META: Record<NewsFeed["type"], { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  news: { label: "ข่าวสาร", icon: Newspaper, cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  winner: { label: "ผู้ชนะ", icon: Trophy, cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  promo: { label: "โปรโมชั่น", icon: Megaphone, cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  alert: { label: "แจ้งเตือน", icon: AlertTriangle, cls: "bg-rose-50 text-rose-700 ring-rose-200" },
  system: { label: "ประกาศระบบ", icon: Megaphone, cls: "bg-purple-50 text-purple-700 ring-purple-200" },
};

function FeedForm({
  initial,
  onClose,
  onSave,
}: {
  initial: NewsFeed;
  onClose: () => void;
  onSave: (f: NewsFeed) => void;
}) {
  const [f, setF] = React.useState<NewsFeed>(initial);
  const { toast } = useToast();
  const isNew = !initial.id;
  const set = <K extends keyof NewsFeed>(k: K, v: NewsFeed[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "เพิ่มฟีดประกาศใหม่" : `แก้ไขประกาศ — ${initial.title}`}</DialogTitle>
          <DialogDescription>เพิ่ม/ลบ/แก้ไขรายการประกาศที่แสดงบนหน้าเว็บสมาชิก</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Field label="ประเภทข่าวสาร / กิจกรรม">
            <Select value={f.type} onValueChange={(v) => set("type", v as NewsFeed["type"])}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                {(Object.keys(TYPE_META) as NewsFeed["type"][]).map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      {React.createElement(TYPE_META[t].icon, { className: "size-3.5" })}
                      {TYPE_META[t].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="หัวข้อประกาศ / ข่าวสาร">
            <Input
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="เช่น อัตราจ่ายหวย 15 นาที ออกรางวัลทุก 15 นาที 24 ชม."
              className={inputCls}
            />
          </Field>
          <Field label="รายละเอียดเนื้อหา">
            <Textarea
              value={f.body}
              onChange={(e) => set("body", e.target.value)}
              className={cn(inputCls, "min-h-20 rounded-xl")}
            />
          </Field>
          <Field label="ลิงก์ปลายทาง (ไม่บังคับ)">
            <Input
              value={f.link_url}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder="/promotions หรือ /lottery-list"
              className={inputCls}
            />
          </Field>
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5">
            <span className="text-sm font-medium text-neutral-700">เปิดแสดงบนหน้าแรกสมาชิก</span>
            <Switch checked={f.is_active} onCheckedChange={(v) => set("is_active", v)} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn
            className="rounded-full"
            disabled={!f.title.trim()}
            onClick={() => {
              onSave(f);
              toast({ title: isNew ? "เพิ่มประกาศแล้ว" : "บันทึกประกาศแล้ว", description: f.title });
              onClose();
            }}
          >
            บันทึก
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FeedsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"OVERVIEW" | "POPULAR" | "TRENDING" | "ANNOUNCEMENTS">("OVERVIEW");
  const [markets, setMarkets] = React.useState<LiveMarket[]>([]);
  const [newsFeeds, setNewsFeeds] = React.useState<NewsFeed[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [_isSaving, setIsSaving] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [form, setForm] = React.useState<{ initial: NewsFeed } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<NewsFeed | null>(null);

  // Load Markets and Announcements
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live markets
      const mktRes = await fetch("/api/admin/data?resource=markets");
      const mktJson = await mktRes.json();
      if (mktJson.success && Array.isArray(mktJson.data)) {
        const mapped = mktJson.data.map((m: any) => {
          const fallback = MARKETS.find((x) => x.code === m.code);
          return {
            id: m.id,
            name: m.name || fallback?.name || m.code,
            code: m.code,
            category: m.category || fallback?.kind || "OTHER",
            color: fallback?.color || "#166534",
            logo_url: m.logo_url ?? fallback?.logo_url ?? null,
            image_url: m.image_url ?? fallback?.image_url ?? null,
            draw_time: m.draw_time || fallback?.draw_time || "18:00",
            close_minutes_before: m.close_minutes_before ?? fallback?.close_minutes ?? 20,
            show_in_popular: Boolean(m.show_in_popular),
            show_in_trending: Boolean(m.show_in_trending),
            is_open: m.is_open ?? true,
            is_active: m.is_active ?? true,
          };
        });
        setMarkets(mapped);
      }

      // 2. Fetch Announcements
      const contentRes = await fetch("/api/admin/data?resource=content");
      const contentJson = await contentRes.json();
      if (contentJson.success && Array.isArray(contentJson.data?.announcements)) {
        setNewsFeeds(
          contentJson.data.announcements.map((a: any, idx: number) => ({
            id: String(a.id),
            title: a.title || "ประกาศจากระบบ",
            body: a.content || "",
            type: "system" as const,
            link_url: a.link_url || "",
            is_active: Boolean(a.is_active),
            display_order: Number(a.display_order || idx + 1),
            created_at: a.created_at ? new Date(a.created_at).toLocaleDateString("th-TH") : "—",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load feed data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Popular (หวยยอดนิยม)
  const handleTogglePopular = async (m: LiveMarket, val: boolean) => {
    setMarkets((prev) => prev.map((item) => (item.id === m.id ? { ...item, show_in_popular: val } : item)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_market",
          payload: {
            id: m.id,
            show_in_popular: val,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: val ? "เพิ่มในหวยยอดนิยมแล้ว" : "นำออกจากหวยยอดนิยมแล้ว",
          description: `${m.name} (${m.code}) แสดงผลบนหน้าแรกผู้ใช้ทันที`,
        });
      } else {
        throw new Error(json.error);
      }
    } catch (e: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: e.message || "ไม่สามารถอัปเดตได้", variant: "destructive" });
      setMarkets((prev) => prev.map((item) => (item.id === m.id ? { ...item, show_in_popular: !val } : item)));
    }
  };

  // Toggle Trending (หวยมาแรง)
  const handleToggleTrending = async (m: LiveMarket, val: boolean) => {
    setMarkets((prev) => prev.map((item) => (item.id === m.id ? { ...item, show_in_trending: val } : item)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_market",
          payload: {
            id: m.id,
            show_in_trending: val,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: val ? "เพิ่มในหวยมาแรงแล้ว" : "นำออกจากหวยมาแรงแล้ว",
          description: `${m.name} (${m.code}) แสดงผลในส่วนมาแรงบนหน้าแรก`,
        });
      } else {
        throw new Error(json.error);
      }
    } catch (e: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: e.message || "ไม่สามารถอัปเดตได้", variant: "destructive" });
      setMarkets((prev) => prev.map((item) => (item.id === m.id ? { ...item, show_in_trending: !val } : item)));
    }
  };

  // Announcement Handlers
  const handleSaveAnnouncement = async (f: NewsFeed) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_announcement",
          payload: {
            id: f.id,
            title: f.title,
            content: f.body,
            display_order: f.display_order,
            is_active: f.is_active,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกประกาศสำเร็จ", description: f.title });
        loadData();
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (f: NewsFeed) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_announcement",
          payload: { id: f.id },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "ลบประกาศแล้ว", description: f.title });
        loadData();
      } else {
        toast({ title: "ลบล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ลบล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleAnnouncement = async (f: NewsFeed, active: boolean) => {
    setNewsFeeds((rws) => rws.map((x) => (x.id === f.id ? { ...x, is_active: active } : x)));
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_announcement",
          payload: { id: f.id, is_active: active },
        }),
      });
      toast({ title: active ? "แสดงประกาศแล้ว" : "ซ่อนประกาศแล้ว", description: f.title });
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกสถานะได้", variant: "destructive" });
    }
  };

  const moveAnnouncement = async (id: string, dir: -1 | 1) => {
    const arr = [...newsFeeds].sort((a, b) => a.display_order - b.display_order);
    const i = arr.findIndex((r) => r.id === id);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const updated = arr.map((r, k) => ({ ...r, display_order: k + 1 }));
    setNewsFeeds(updated);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_announcement",
          payload: { id: arr[j].id, display_order: arr[j].display_order },
        }),
      });
    } catch {
      // no-op
    }
  };

  const popularMarkets = markets.filter((m) => m.show_in_popular);
  const trendingMarkets = markets.filter((m) => m.show_in_trending);
  const activeAnnouncements = newsFeeds.filter((n) => n.is_active);

  const filteredMarkets = markets.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการฟีดและหน้าแรก (Feeds & Showcase)"
        description="ศูนย์ควบคุมรายการที่ถูกฟีดไปแสดงบนหน้าแรกของผู้ใช้ — ทั้งหวยยอดนิยม, หวยมาแรง และข่าวสารประกาศ"
      >
        <div className="flex items-center gap-2">
          <Btn variant="outline" className="rounded-full" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} /> รีเฟรช
          </Btn>
          <Btn
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setForm({ initial: { ...EMPTY_FEED, display_order: newsFeeds.length + 1 } })}
          >
            <Plus className="size-4" /> เพิ่มประกาศใหม่
          </Btn>
        </div>
      </PageHeader>

      {/* KPI Showcase Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Popular Card */}
        <div
          onClick={() => setActiveTab("POPULAR")}
          className="group cursor-pointer relative overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50/70 via-white to-purple-50/40 p-5 shadow-xs transition-all hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <Star className="size-5 fill-white" />
            </span>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
              หน้าแรก แถวบน
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{popularMarkets.length} <span className="text-sm font-medium text-neutral-500">ตลาด</span></p>
            <p className="text-xs font-semibold text-violet-800">หวยยอดนิยม (Popular Carousel)</p>
          </div>
          <p className="mt-2 line-clamp-1 text-[11px] text-neutral-500">
            {popularMarkets.map((m) => m.name).join(", ") || "ไม่มีตลาดที่เลือก"}
          </p>
        </div>

        {/* Trending Card */}
        <div
          onClick={() => setActiveTab("TRENDING")}
          className="group cursor-pointer relative overflow-hidden rounded-2xl border border-rose-100 bg-linear-to-br from-rose-50/70 via-white to-orange-50/40 p-5 shadow-xs transition-all hover:border-rose-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Flame className="size-5 fill-white" />
            </span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              หน้าแรก แถวกลาง
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{trendingMarkets.length} <span className="text-sm font-medium text-neutral-500">ตลาด</span></p>
            <p className="text-xs font-semibold text-rose-800">หวยมาแรง (Trending Feed)</p>
          </div>
          <p className="mt-2 line-clamp-1 text-[11px] text-neutral-500">
            {trendingMarkets.map((m) => m.name).join(", ") || "ไม่มีตลาดที่เลือก"}
          </p>
        </div>

        {/* Announcements Card */}
        <div
          onClick={() => setActiveTab("ANNOUNCEMENTS")}
          className="group cursor-pointer relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50/70 via-white to-teal-50/40 p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Megaphone className="size-5 fill-white" />
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              ประกาศสไลด์
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{activeAnnouncements.length} <span className="text-sm font-medium text-neutral-500">รายการ</span></p>
            <p className="text-xs font-semibold text-emerald-800">ประกาศ & ฟีดระบบ (Announcements)</p>
          </div>
          <p className="mt-2 line-clamp-1 text-[11px] text-neutral-500">
            {activeAnnouncements.map((a) => a.title).join(", ") || "ไม่มีประกาศที่เปิดแสดง"}
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-neutral-100 p-1">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === "OVERVIEW" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Eye className="size-3.5" /> ภาพรวมหน้าแรก (Live View)
          </button>
          <button
            onClick={() => setActiveTab("POPULAR")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === "POPULAR" ? "bg-white text-violet-700 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Star className="size-3.5 fill-violet-500 text-violet-500" /> หวยยอดนิยม ({popularMarkets.length})
          </button>
          <button
            onClick={() => setActiveTab("TRENDING")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === "TRENDING" ? "bg-white text-rose-700 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Flame className="size-3.5 fill-rose-500 text-rose-500" /> หวยมาแรง ({trendingMarkets.length})
          </button>
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === "ANNOUNCEMENTS" ? "bg-white text-emerald-700 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Megaphone className="size-3.5 text-emerald-600" /> ประกาศข่าวสาร ({newsFeeds.length})
          </button>
        </div>

        {/* Search when on lists */}
        {(activeTab === "POPULAR" || activeTab === "TRENDING") && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตลาดหวย หรือรหัส..."
              className={cn(inputCls, "h-9 pl-8 text-xs")}
            />
          </div>
        )}
      </div>

      {/* ── TAB 1: OVERVIEW (LIVE PREVIEW) ── */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="flex items-center gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/50 p-4 text-brand-900">
            <Sparkles className="size-5 shrink-0 text-brand-600" />
            <div className="text-xs">
              <p className="font-bold">รายการที่คุณติ๊กเปิดจะถูกนำไปแสดงบนหน้าแรกของผู้ใช้ทันทีแบบ Real-time</p>
              <p className="text-brand-700">สามารถคลิกเปิด/ปิดได้จากทั้งหน้านี้ หรือคลิกที่แท็บ "หวยยอดนิยม" / "หวยมาแรง" เพื่อจัดการรายการทั้งหมด</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Section A: กำลังแสดงในหวยยอดนิยม */}
            <Panel className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <Star className="size-4 fill-violet-600" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">กำลังโชว์ใน "หวยยอดนิยม"</h3>
                      <p className="text-[11px] text-neutral-500">แถบเลื่อนแนวนอนบนหน้าแรก ({popularMarkets.length} ตลาด)</p>
                    </div>
                  </div>
                  <Btn size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setActiveTab("POPULAR")}>
                    ตั้งค่าทั้งหมด
                  </Btn>
                </div>

                {popularMarkets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    ยังไม่มีตลาดที่เลือกแสดงในหวยยอดนิยม
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {popularMarkets.map((m) => {
                      const logo = m.logo_url || m.image_url;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 p-2.5 transition-all hover:border-violet-200 hover:bg-violet-50/30"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <MarketLogo
                              logoUrl={m.logo_url}
                              imageUrl={m.image_url}
                              name={m.name}
                              code={m.code}
                              color={m.color}
                              size="md"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-neutral-900">{m.name}</p>
                              <p className="text-[10px] font-semibold text-neutral-400">{m.code}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTogglePopular(m, false)}
                            title="นำออกจากยอดนิยม"
                            className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>

            {/* Section B: กำลังแสดงในหวยมาแรง */}
            <Panel className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                      <Flame className="size-4 fill-rose-600" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">กำลังโชว์ใน "หวยมาแรง"</h3>
                      <p className="text-[11px] text-neutral-500">การ์ดโปรโมตตรงกลางหน้าแรก ({trendingMarkets.length} ตลาด)</p>
                    </div>
                  </div>
                  <Btn size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setActiveTab("TRENDING")}>
                    ตั้งค่าทั้งหมด
                  </Btn>
                </div>

                {trendingMarkets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    ยังไม่มีตลาดที่เลือกแสดงในหวยมาแรง
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {trendingMarkets.map((m) => {
                      const logo = m.logo_url || m.image_url;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 transition-all hover:border-rose-200 hover:bg-rose-50/30"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MarketLogo
                              logoUrl={m.logo_url}
                              imageUrl={m.image_url}
                              name={m.name}
                              code={m.code}
                              color={m.color}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-xs font-bold text-neutral-900">{m.name}</p>
                                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-black text-white">HOT</span>
                              </div>
                              <p className="text-[11px] text-neutral-400">{m.code} · ออกผล {m.draw_time || "18:00"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleTrending(m, false)}
                            title="นำออกจากมาแรง"
                            className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>
          </div>

          {/* Section C: Announcements Preview */}
          <Panel className="p-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Megaphone className="size-4 text-emerald-700" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">ประกาศและข่าวสารบนหน้าแรก</h3>
                  <p className="text-[11px] text-neutral-500">ฟีดประกาศที่เปิดแสดงอยู่ ({activeAnnouncements.length} รายการ)</p>
                </div>
              </div>
              <Btn size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setActiveTab("ANNOUNCEMENTS")}>
                จัดการประกาศ
              </Btn>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeAnnouncements.map((a) => (
                <div key={a.id} className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                      ลำดับ #{a.display_order}
                    </span>
                    <span className="text-[10px] text-neutral-400">{a.created_at}</span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-neutral-900">{a.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[11px] text-neutral-500">{a.body}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ── TAB 2: POPULAR LOTTERIES MANAGER ── */}
      {activeTab === "POPULAR" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">ควบคุมหวยยอดนิยม (Popular Carousel)</h3>
              <p className="text-xs text-neutral-500">เลือกเปิดสวิตช์เพื่อนำตลาดหวยไปแสดงในแถวหวยยอดนิยมบนหน้าแรกของสมาชิก</p>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
              กำลังแสดง {popularMarkets.length} จาก {markets.length} ตลาด
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((m) => {
              const logo = m.logo_url || m.image_url;
              return (
                <Panel key={m.id} className={cn("flex flex-col justify-between p-4 transition-all", m.show_in_popular && "ring-1 ring-violet-300 bg-violet-50/20")}>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <MarketLogo
                          logoUrl={m.logo_url}
                          imageUrl={m.image_url}
                          name={m.name}
                          code={m.code}
                          color={m.color}
                          size="lg"
                        />
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{m.name}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{m.code}</span>
                            <span className="text-[11px] text-neutral-400">ปิดรับก่อน {m.close_minutes_before} นาที</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs font-medium text-neutral-600">แสดงในหวยยอดนิยม</span>
                    <Switch
                      checked={m.show_in_popular}
                      onCheckedChange={(val) => handleTogglePopular(m, val)}
                      aria-label="เปิดปิดหวยยอดนิยม"
                    />
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: TRENDING LOTTERIES MANAGER ── */}
      {activeTab === "TRENDING" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">ควบคุมหวยมาแรง (Trending Section)</h3>
              <p className="text-xs text-neutral-500">เลือกเปิดสวิตช์เพื่อนำตลาดหวยไปแสดงในการ์ด "มาแรง" บนหน้าแรกของสมาชิก</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
              กำลังแสดง {trendingMarkets.length} จาก {markets.length} ตลาด
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((m) => {
              const logo = m.logo_url || m.image_url;
              return (
                <Panel key={m.id} className={cn("flex flex-col justify-between p-4 transition-all", m.show_in_trending && "ring-1 ring-rose-300 bg-rose-50/20")}>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <MarketLogo
                          logoUrl={m.logo_url}
                          imageUrl={m.image_url}
                          name={m.name}
                          code={m.code}
                          color={m.color}
                          size="lg"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm text-neutral-900">{m.name}</p>
                            {m.show_in_trending && (
                              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[8px] font-black text-white">HOT</span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{m.code}</span>
                            <span className="text-[11px] text-neutral-400">เวลา {m.draw_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs font-medium text-neutral-600">แสดงในหวยมาแรง</span>
                    <Switch
                      checked={m.show_in_trending}
                      onCheckedChange={(val) => handleToggleTrending(m, val)}
                      aria-label="เปิดปิดหวยมาแรง"
                    />
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: ANNOUNCEMENTS MANAGER (PRESERVED & ENHANCED) ── */}
      {activeTab === "ANNOUNCEMENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">จัดการประกาศและข่าวสารหน้าเว็บ</h3>
              <p className="text-xs text-neutral-500">ลำดับการแสดงผล, เนื้อหา และเปิด/ปิดการเผยแพร่</p>
            </div>
            <Btn
              size="sm"
              className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setForm({ initial: { ...EMPTY_FEED, display_order: newsFeeds.length + 1 } })}
            >
              <Plus className="size-3.5" /> เพิ่มประกาศ
            </Btn>
          </div>

          {newsFeeds.length === 0 ? (
            <Panel><EmptyState title="ยังไม่มีประกาศในระบบ" /></Panel>
          ) : (
            <div className="space-y-2.5">
              {[...newsFeeds]
                .sort((a, b) => a.display_order - b.display_order)
                .map((f, idx, arr) => {
                  const meta = TYPE_META[f.type] || TYPE_META.system;
                  return (
                    <Panel key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 sm:w-56">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveAnnouncement(f.id, -1)}
                            disabled={idx === 0}
                            className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                            aria-label="ย้ายขึ้น"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            onClick={() => moveAnnouncement(f.id, 1)}
                            disabled={idx === arr.length - 1}
                            className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                            aria-label="ย้ายลง"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                          #{f.display_order}
                        </span>
                        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset", meta.cls)}>
                          <meta.icon className="size-3" /> {meta.label}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-neutral-900">{f.title}</p>
                          {f.link_url && (
                            <a href="#" className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-brand-600 hover:underline">
                              <ExternalLink className="size-3" /> {f.link_url}
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{f.body}</p>
                        <p className="mt-1 text-[11px] text-neutral-400">สร้างเมื่อ {f.created_at}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 sm:justify-end">
                        <div className="mr-1 flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5">
                          <Switch
                            checked={f.is_active}
                            onCheckedChange={(v) => handleToggleAnnouncement(f, v)}
                            aria-label="แสดง/ซ่อนประกาศ"
                          />
                        </div>
                        <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => setForm({ initial: f })}>
                          <Pencil className="size-3.5" /> แก้ไข
                        </Btn>
                        <Btn size="sm" variant="outline" className="h-8 rounded-full border-rose-200 px-3 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(f)}>
                          <Trash2 className="size-3.5" /> ลบ
                        </Btn>
                      </div>
                    </Panel>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      {form && (
        <FeedForm
          initial={form.initial}
          onClose={() => setForm(null)}
          onSave={handleSaveAnnouncement}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          open
          danger
          title="ลบประกาศ?"
          desc={`ยืนยันการลบ "${confirmDel.title}" — ย้อนกลับไม่ได้`}
          confirmLabel="ลบถาวร"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => handleDeleteAnnouncement(confirmDel)}
        />
      )}
    </div>
  );
}
