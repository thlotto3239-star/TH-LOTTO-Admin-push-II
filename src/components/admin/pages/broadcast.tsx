"use client";

import * as React from "react";
import {
  Send, Radio, Trash2, Users, User, Info, AlertTriangle, CheckCircle2,
  Eye, Bell, Megaphone, Smartphone, Monitor, Sparkles, ExternalLink, Plus
} from "lucide-react";
import {
  Panel, Btn, PageHeader, Field, inputCls, ConfirmDialog,
  TableWrap, Th, Td, SearchInput, EmptyState, Avatar
} from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { BROADCAST_HISTORY, MEMBERS, fmtNum, type BroadcastMsg } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const TYPE_UI: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; chip: string; dot: string; border: string }> = {
  info: { label: "ข่าวสารทั่วไป", icon: Info, chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500", border: "border-sky-300" },
  warning: { label: "แจ้งเตือนระบบ", icon: AlertTriangle, chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", border: "border-amber-300" },
  success: { label: "กิจกรรม / โปรโมชั่น", icon: CheckCircle2, chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", border: "border-emerald-300" },
};

export const getTypeUI = (t?: string) => {
  if (!t) return TYPE_UI.info;
  const key = String(t).toLowerCase();
  if (TYPE_UI[key]) return TYPE_UI[key];
  if (key.includes("warn") || key.includes("alert") || key.includes("urgent")) return TYPE_UI.warning;
  if (key.includes("success") || key.includes("promo") || key.includes("win")) return TYPE_UI.success;
  return TYPE_UI.info;
};

export function BroadcastPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"compose" | "marquee">("compose");
  const [audience, setAudience] = React.useState<"all" | "individual">("all");
  const [channel, setChannel] = React.useState<"inapp" | "popup">("inapp");
  const [type, setType] = React.useState<BroadcastMsg["type"]>("info");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [actionUrl, setActionUrl] = React.useState("");
  const [memberQ, setMemberQ] = React.useState("");
  const [picked, setPicked] = React.useState<{ id: string; name: string; phone: string } | null>(null);
  const [realMembers, setRealMembers] = React.useState<{ id: string; full_name: string; phone: string }[]>([]);
  const [history, setHistory] = React.useState<BroadcastMsg[]>([]);
  const [confirmSend, setConfirmSend] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<BroadcastMsg | null>(null);

  // Marquee running ticker state
  const [marqueeList, setMarqueeList] = React.useState<{ id: string; text: string; is_active: boolean }[]>([]);
  const [newMarqueeText, setNewMarqueeText] = React.useState("");

  const loadHistory = React.useCallback(() => {
    fetch("/api/admin/data?resource=broadcast-history")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setHistory(
            res.data.map((n: any) => {
              const rawType = String(n.type || "info").toLowerCase();
              const mappedType: BroadcastMsg["type"] =
                rawType.includes("warn") || rawType.includes("alert") ? "warning" :
                rawType.includes("success") || rawType.includes("promo") ? "success" : "info";
              return {
                id: n.id,
                title: n.title || "ประกาศ",
                body: n.body || "",
                type: mappedType,
                audience: "all",
                recipient: "สมาชิกในระบบ",
                sent_by: "เจ้าของเว็บ",
                sent_at: n.created_at ? new Date(n.created_at).toLocaleDateString("th-TH") : "วันนี้",
                reached: 1,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  const loadMarquee = React.useCallback(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.announcements)) {
          setMarqueeList(
            res.data.announcements.map((a: any) => ({
              id: String(a.id),
              text: a.content || a.title || "",
              is_active: Boolean(a.is_active),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadHistory();
    loadMarquee();
    fetch("/api/admin/data?resource=members")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setRealMembers(
            res.data.map((m: any) => ({
              id: m.id,
              full_name: m.full_name || "ไม่ระบุชื่อ",
              phone: m.phone || "-",
            }))
          );
        }
      })
      .catch(() => {});
  }, [loadHistory, loadMarquee]);

  const memberHits = memberQ.trim()
    ? (realMembers.length > 0 ? realMembers : MEMBERS)
        .filter((m) => m.full_name.includes(memberQ.trim()) || m.phone.includes(memberQ.trim()))
        .slice(0, 5)
    : [];

  const canSend = title.trim().length > 0 && body.trim().length > 0 && (audience === "all" || picked !== null);

  const send = async () => {
    const channelLabel = channel === "inapp" ? "In-App กระดิ่ง" : "Pop-up หน้าแรก";
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "send_broadcast",
            payload: {
              title: title.trim(),
              body: body.trim(),
              type,
              channel,
              action_url: actionUrl.trim() || undefined,
              audience,
              user_id: picked?.id,
            },
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast({ title: "ส่งประกาศเรียบร้อย", description: `${channelLabel} · ${TYPE_UI[type].label} · ถึง ${json.count || 1} คน` });
          loadHistory();
      } else {
        toast({ title: "ส่งประกาศล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ส่งประกาศล้มเหลว", description: err.message, variant: "destructive" });
    }
    setTitle("");
    setBody("");
    setActionUrl("");
    setPicked(null);
    setMemberQ("");
  };

  const handleAddMarquee = async () => {
    if (!newMarqueeText.trim()) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_announcement",
          payload: {
            title: newMarqueeText.trim(),
            content: newMarqueeText.trim(),
            is_active: true,
            display_order: marqueeList.length + 1,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "เพิ่มแถบตัววิ่งสำเร็จ", description: newMarqueeText.trim() });
        setNewMarqueeText("");
        loadMarquee();
      }
    } catch (err: any) {
      toast({ title: "เพิ่มล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMarquee = async (id: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_announcement",
          payload: { id },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "ลบตัววิ่งแล้ว" });
        loadMarquee();
      }
    } catch (err: any) {
      toast({ title: "ลบล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="ศูนย์กระจายข่าวสาร & แจ้งเตือน"
        description="Omnichannel Notification Hub · บริหารจัดการข้อความแจ้งเตือนกระดิ่ง ป๊อปอัปหน้าแรก และแถบตัววิ่ง"
      >
        <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 p-1 border border-neutral-200/80">
          <button
            onClick={() => setActiveTab("compose")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
              activeTab === "compose"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <Bell className="size-3.5" /> เขียนประกาศ & พรีวิว
          </button>
          <button
            onClick={() => setActiveTab("marquee")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
              activeTab === "marquee"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <Megaphone className="size-3.5 text-brand-600" /> แถบตัววิ่งหน้าเว็บ ({marqueeList.length})
          </button>
        </div>
      </PageHeader>

      {/* KPI Mini-Dashboard (PC Ergonomic Header) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">ส่งประกาศสะสม</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-neutral-900">{history.length}</p>
            <span className="text-xs font-semibold text-neutral-500">ครั้ง</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">ข้อความแจ้งเตือนทั้งหมด</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-sky-50/30 border-sky-100">
          <p className="text-[11px] font-medium text-sky-700">ข่าวสารทั่วไป</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-sky-600">
              {history.filter((h) => h.type === "info").length}
            </p>
            <span className="text-xs font-bold text-sky-600">ประกาศ</span>
          </div>
          <p className="mt-1 text-[11px] text-sky-600/80">ข้อมูลแนะนำและการบริการ</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-amber-50/30 border-amber-100">
          <p className="text-[11px] font-medium text-amber-700">แจ้งเตือนระบบ</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-amber-600">
              {history.filter((h) => h.type === "warning").length}
            </p>
            <span className="text-xs font-bold text-amber-600">แจ้งด่วน</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600/80">ปิดปรับปรุง/ระบบธนาคาร</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-emerald-50/30 border-emerald-100">
          <p className="text-[11px] font-medium text-emerald-700">กิจกรรมและโปรโมชั่น</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-emerald-600">
              {history.filter((h) => h.type === "success").length}
            </p>
            <span className="text-xs font-bold text-emerald-600">สิทธิพิเศษ</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/80">กิจกรรมแจกเครดิต/รางวัล</p>
        </Panel>
      </div>

      {activeTab === "compose" ? (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* LEFT COLUMN: Interactive PC Landscape Live Visualizer (5 Cols) */}
          <div className="min-w-0 lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                <Smartphone className="size-4 text-brand-600" /> พรีวิวเสมือนจริงบนอุปกรณ์สมาชิก
              </span>
              <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                {channel === "inapp" ? "📱 In-App Notification" : "📢 Popup Modal"}
              </span>
            </div>

            <Panel className="relative overflow-hidden border-neutral-200/90 bg-neutral-900 text-white p-4 shadow-xl min-h-[460px] flex flex-col justify-between rounded-3xl">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-3 border-b border-neutral-850">
                <span>09:41</span>
                <span className="font-semibold text-neutral-200">TH-LOTTO App</span>
                <span>5G · 100%</span>
              </div>

              {/* Dynamic Preview Area */}
              <div className="my-auto py-4">
                {channel === "inapp" ? (
                  /* In-App Notification Toast Simulation */
                  <div className="mx-auto max-w-sm rounded-2xl bg-neutral-800/95 p-4 border border-neutral-700 shadow-2xl backdrop-blur-md transition-all">
                    <div className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl", TYPE_UI[type].chip)}>
                        {React.createElement(TYPE_UI[type].icon, { className: "size-5" })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white truncate">{title || "หัวข้อการแจ้งเตือน"}</p>
                          <span className="text-[10px] text-neutral-400">ตอนนี้</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-300 break-words line-clamp-3">
                          {body || "ข้อความที่พิมพ์จะปรากฏให้สมาชิกเห็นทันทีที่ส่ง..."}
                        </p>
                        {actionUrl ? (
                          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-brand-400">
                            <span>ลิงก์: {actionUrl}</span>
                            <ExternalLink className="size-3" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Popup Modal Preview */
                  <div className="mx-auto max-w-xs rounded-3xl bg-white p-5 text-neutral-900 shadow-2xl border border-neutral-200">
                    <div className="flex flex-col items-center text-center">
                      <span className={cn("mb-3 flex size-14 items-center justify-center rounded-2xl shadow-inner", TYPE_UI[type].chip)}>
                        {React.createElement(TYPE_UI[type].icon, { className: "size-8" })}
                      </span>
                      <span className={cn("mb-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase", TYPE_UI[type].chip)}>
                        {TYPE_UI[type].label}
                      </span>
                      <h4 className="text-base font-black text-neutral-900 mt-1">{title || "หัวข้อป๊อปอัปแจ้งเตือน"}</h4>
                      <p className="mt-2 text-xs text-neutral-500 leading-relaxed max-h-32 overflow-y-auto">
                        {body || "รายละเอียดประกาศฉบับเต็ม สมาชิกจะต้องกดปุ่มเพื่อปิดหรือรับทราบ..."}
                      </p>
                      <button className="mt-4 w-full rounded-full bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700">
                        {actionUrl ? "ดูรายละเอียดโปรโมชั่น" : "รับทราบ"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Footer note */}
              <div className="rounded-xl bg-neutral-800/80 p-2.5 text-center text-[11px] text-neutral-400 border border-neutral-750">
                {audience === "all" ? "🌐 สมาชิกทุกคน (4,892 คน) จะได้รับการแจ้งเตือนนี้" : `👤 แจ้งเฉพาะสมาชิก: ${picked?.name || "ยังไม่ได้เลือก"}`}
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN: Form Controls (7 Cols) */}
          <Panel className="min-w-0 p-5 lg:col-span-7">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              <Radio className="size-4 text-brand-600" /> ตั้งค่าการส่งและเนื้อหาประกาศ
            </p>

            <div className="grid gap-4">
              {/* Channel & Audience row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ช่องทางแสดงผล">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "inapp", label: "กระดิ่งแจ้งเตือน", icon: Bell },
                      { id: "popup", label: "ป๊อปอัปหน้าแรก", icon: Megaphone },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChannel(c.id as any)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all",
                          channel === c.id
                            ? "border-brand-500 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        <c.icon className="size-3.5" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="กลุ่มเป้าหมาย">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAudience("all")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all",
                        audience === "all"
                          ? "border-brand-500 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      <Users className="size-3.5" /> สมาชิกทุกคน
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudience("individual")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all",
                        audience === "individual"
                          ? "border-brand-500 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      <User className="size-3.5" /> รายบุคคล
                    </button>
                  </div>
                </Field>
              </div>

              {/* Member picker if individual */}
              {audience === "individual" ? (
                <div className="relative">
                  <Field label="ค้นหาและเลือกสมาชิก">
                    {picked ? (
                      <div className="flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={picked.name} className="size-8" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{picked.name}</p>
                            <p className="text-[11px] text-neutral-500">{picked.phone}</p>
                          </div>
                        </div>
                        <Btn size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => setPicked(null)}>
                          เปลี่ยนคน
                        </Btn>
                      </div>
                    ) : (
                      <SearchInput value={memberQ} onChange={setMemberQ} placeholder="พิมพ์ชื่อหรือเบอร์โทรศัพท์..." />
                    )}
                  </Field>
                  {!picked && memberHits.length > 0 ? (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                      {memberHits.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setPicked({ id: m.id, name: m.full_name, phone: m.phone });
                            setMemberQ("");
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors"
                        >
                          <Avatar name={m.full_name} className="size-7 text-xs" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-800">{m.full_name}</p>
                            <p className="text-[11px] text-neutral-400">{m.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Type Category */}
              <Field label="ประเภทประกาศ">
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TYPE_UI) as BroadcastMsg["type"][]).map((t) => {
                    const ui = TYPE_UI[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-all",
                          type === t
                            ? "border-brand-500 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        <ui.icon className="size-4" />
                        {ui.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Title & Body */}
              <div className="space-y-1">
                <Field label="หัวข้อประกาศ">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น แจ้งปิดปรับปรุงระบบชั่วคราว หรือ งวด 16 ต.ค. เปิดรับแทงแล้ว"
                    maxLength={70}
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                  />
                </Field>
                <p className="text-right text-[10px] text-neutral-400">{title.length}/70</p>
              </div>

              <div className="space-y-1">
                <Field label="เนื้อหาข้อความฉบับเต็ม">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="พิมพ์รายละเอียดที่ต้องการแจ้งสมาชิกให้ครบถ้วน..."
                    rows={4}
                    maxLength={300}
                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none placeholder:text-neutral-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                  />
                </Field>
                <p className="text-right text-[10px] text-neutral-400">{body.length}/300</p>
              </div>

              <Field label="ลิงก์ปลายทางเมื่อคลิก (ไม่บังคับ)">
                <input
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="เช่น /promotions, /instant-lottery หรือ https://line.me/..."
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-300 focus:border-brand-500"
                />
              </Field>

              <Btn
                className="w-full rounded-full py-3 text-sm font-bold shadow-md shadow-brand-500/20"
                disabled={!canSend}
                onClick={() => setConfirmSend(true)}
              >
                <Send className="size-4" /> ตรวจสอบและส่งประกาศ
              </Btn>
            </div>
          </Panel>
        </div>
      ) : (
        /* MARQUEE RUNNING TICKER TAB */
        <Panel className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Megaphone className="size-4 text-brand-600" /> จัดการแถบข้อความวิ่งหน้าเว็บ (Marquee Ticker)
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                ข้อความจะวิ่งวนต่อเนื่องบนแถบด้านบนของเว็บสมาชิกแบบเรียลไทม์
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newMarqueeText}
                onChange={(e) => setNewMarqueeText(e.target.value)}
                placeholder="พิมพ์ข้อความวิ่งใหม่..."
                className="h-9 w-64 rounded-xl border border-neutral-200 px-3 text-xs outline-none focus:border-brand-500"
              />
              <Btn size="sm" className="rounded-xl px-3 font-semibold" onClick={handleAddMarquee}>
                <Plus className="size-3.5" /> เพิ่มข้อความวิ่ง
              </Btn>
            </div>
          </div>

          {/* Marquee Live Banner Simulation */}
          <div className="overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-900 flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shrink-0">
              <Sparkles className="size-3" /> ประกาศด่วน
            </span>
            <div className="overflow-hidden whitespace-nowrap text-xs font-semibold">
              <div className="inline-block animate-marquee">
                {marqueeList.length > 0
                  ? marqueeList.filter((m) => m.is_active).map((m) => m.text).join(" • • • ")
                  : "ยินดีต้อนรับสู่ TH-LOTTO เว็บหวยออนไลน์อันดับ 1 จ่ายเต็มไม่มีอั้น"}
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
            {marqueeList.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">ยังไม่มีแถบข้อความวิ่ง</div>
            ) : (
              marqueeList.map((m, idx) => (
                <div key={m.id} className="flex items-center justify-between p-3.5 hover:bg-neutral-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-neutral-800">{m.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      กำลังวิ่ง
                    </span>
                    <button
                      onClick={() => handleDeleteMarquee(m.id)}
                      className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      {/* History Panel */}
      <Panel className="min-w-0">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Eye className="size-4 text-brand-600" /> ประวัติการส่งประกาศภายในระบบ
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">ล่าสุด {history.length} รายการที่ส่งถึงสมาชิก</p>
          </div>
        </div>
        {history.length === 0 ? (
          <EmptyState title="ยังไม่มีประวัติการส่ง" />
        ) : (
          <TableWrap className="min-w-[640px]">
            <thead>
              <tr>
                <Th>ข้อความ</Th>
                <Th>ประเภท</Th>
                <Th>ผู้รับ</Th>
                <Th>ส่งโดย</Th>
                <Th>เวลา</Th>
                <Th className="text-right">ถึง</Th>
                <Th className="text-center">ลบ</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const ui = getTypeUI(h.type);
                return (
                  <tr key={h.id} className="transition-colors hover:bg-neutral-50/60">
                    <Td className="max-w-[240px]">
                      <p className="truncate font-semibold text-neutral-900">{h.title}</p>
                      <p className="line-clamp-1 text-xs text-neutral-400">{h.body}</p>
                    </Td>
                    <Td>
                      <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset", ui.chip)}>
                        <ui.icon className="size-3" /> {ui.label}
                      </span>
                    </Td>
                    <Td className="max-w-[180px]">
                      <p className="truncate text-xs font-medium text-neutral-700">
                        {h.audience === "all" ? "ทั้งหมด 🌐" : "รายบุคคล 👤"}
                      </p>
                      <p className="truncate text-[11px] text-neutral-400">{h.recipient}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-xs font-medium text-neutral-600">{h.sent_by}</Td>
                    <Td className="whitespace-nowrap text-xs text-neutral-500">{h.sent_at}</Td>
                    <Td className="whitespace-nowrap text-right text-xs font-bold text-neutral-700">{fmtNum(h.reached)}</Td>
                    <Td className="text-center">
                      <Btn
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-full text-rose-500 hover:bg-rose-50"
                        onClick={() => setConfirmDel(h)}
                        aria-label="ลบการแจ้งเตือน"
                      >
                        <Trash2 className="size-3.5" />
                      </Btn>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      {/* Landscape Widescreen Confirm Dialog */}
      {confirmSend ? (
        <ConfirmDialog
          open
          title="ยืนยันการส่งประกาศภายในระบบ?"
          desc={`${audience === "all" ? "ส่งถึงสมาชิกทั้งหมดบนหน้าเว็บ" : `ส่งถึง ${picked?.name}`} · ช่องทาง ${channel === "inapp" ? "In-App กระดิ่ง" : "Pop-up หน้าแรก"} · ประเภท ${getTypeUI(type).label} — ข้อความจะปรากฏบนเว็บสมาชิกทันที`}
          confirmLabel="ส่งประกาศทันที"
          onOpenChange={setConfirmSend}
          onConfirm={send}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบประวัติการส่ง?"
          desc={`ต้องการลบ "${confirmDel.title}" หรือไม่`}
          confirmLabel="ลบ"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => {
            setHistory((p) => p.filter((x) => x.id !== confirmDel.id));
            toast({ title: "ลบแล้ว", description: confirmDel.title });
          }}
        />
      ) : null}
    </div>
  );
}
