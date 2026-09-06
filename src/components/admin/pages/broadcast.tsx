"use client";

import * as React from "react";
import { Send, Radio, Trash2, Users, User, Info, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, ConfirmDialog, TableWrap, Th, Td, SearchInput, EmptyState } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { BROADCAST_HISTORY, MEMBERS, fmtNum, type BroadcastMsg } from "@/data/admin-mock";
import { cn } from "@/lib/utils";
import { Avatar } from "../primitives";

const TYPE_UI: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; chip: string; dot: string }> = {
  info: { label: "ข่าวสารทั่วไป", icon: Info, chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-400" },
  warning: { label: "แจ้งเตือนระบบ", icon: AlertTriangle, chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  success: { label: "กิจกรรม / โปรโมชั่น", icon: CheckCircle2, chip: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-400" },
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
  const [audience, setAudience] = React.useState<"all" | "individual">("all");
  const [channel, setChannel] = React.useState<"inapp" | "popup" | "banner">("inapp");
  const [type, setType] = React.useState<BroadcastMsg["type"]>("info");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [memberQ, setMemberQ] = React.useState("");
  const [picked, setPicked] = React.useState<{ id: string; name: string; phone: string } | null>(null);
  const [realMembers, setRealMembers] = React.useState<{ id: string; full_name: string; phone: string }[]>([]);
  const [history, setHistory] = React.useState<BroadcastMsg[]>([]);
  const [confirmSend, setConfirmSend] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<BroadcastMsg | null>(null);

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

  React.useEffect(() => {
    loadHistory();
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
  }, [loadHistory]);

  const memberHits = memberQ.trim()
    ? (realMembers.length > 0 ? realMembers : MEMBERS)
        .filter((m) => m.full_name.includes(memberQ.trim()) || m.phone.includes(memberQ.trim()))
        .slice(0, 5)
    : [];

  const canSend = title.trim().length > 0 && body.trim().length > 0 && (audience === "all" || picked !== null);

  const send = async () => {
    const channelLabel = channel === "inapp" ? "In-App กระดิ่ง" : channel === "popup" ? "Pop-up หน้าเว็บ" : "แบนเนอร์วิ่ง";
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
            audience,
            user_id: picked?.id,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "ส่งประกาศภายในระบบสำเร็จ", description: `${channelLabel} · ${TYPE_UI[type].label} · ถึง ${json.count || 1} คน` });
        loadHistory();
      } else {
        toast({ title: "ส่งประกาศล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ส่งประกาศล้มเหลว", description: err.message, variant: "destructive" });
    }
    setTitle("");
    setBody("");
    setPicked(null);
    setMemberQ("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="ประกาศภายในระบบ"
        description={`ส่งการแจ้งเตือนและประกาศไปยังเว็บสมาชิกโดยตรง (In-App) · ส่งแล้ว ${history.length} ครั้ง`}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Compose */}
        <Panel className="min-w-0 p-5 lg:col-span-2">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
            <Radio className="size-4" /> เขียนประกาศภายในระบบ
          </p>

          <div className="grid gap-4">
            {/* Channel */}
            <Field label="ช่องทางแสดงผล (ระบบสมาชิก)">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "inapp", label: "กระดิ่งแจ้งเตือน" },
                  { id: "popup", label: "ป๊อปอัปหน้าแรก" },
                  { id: "banner", label: "แถบวิ่งประกาศ" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id as any)}
                    className={cn(
                      "rounded-2xl border px-2 py-2 text-[11px] font-medium transition-all",
                      channel === c.id ? "border-brand-500 bg-brand-50 text-brand-700 font-bold" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Audience */}
            <Field label="ผู้รับประกาศ">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setAudience("all")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-all",
                    audience === "all" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                  )}
                >
                  <Users className="size-4" /> สมาชิกทั้งหมด
                </button>
                <button
                  onClick={() => setAudience("individual")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-all",
                    audience === "individual" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                  )}
                >
                  <User className="size-4" /> รายบุคคล
                </button>
              </div>
            </Field>

            {/* Member picker */}
            {audience === "individual" ? (
              <div className="relative">
                <Field label="เลือกสมาชิก">
                  {picked ? (
                    <div className="flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/50 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={picked.name} className="size-8" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{picked.name}</p>
                          <p className="text-[11px] text-neutral-500">{picked.phone}</p>
                        </div>
                      </div>
                      <Btn size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => setPicked(null)}>เปลี่ยน</Btn>
                    </div>
                  ) : (
                    <SearchInput value={memberQ} onChange={setMemberQ} placeholder="ค้นหาชื่อ/เบอร์โทร..." />
                  )}
                </Field>
                {!picked && memberHits.length > 0 ? (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                    {memberHits.map((m) => (
                      <button key={m.id} onClick={() => { setPicked({ id: m.id, name: m.full_name, phone: m.phone }); setMemberQ(""); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50">
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

            {/* Type */}
            <Field label="ประเภทการแจ้งเตือน">
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(TYPE_UI) as BroadcastMsg["type"][]).map((t) => {
                  const ui = TYPE_UI[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 text-[11px] font-medium transition-all",
                        type === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      <ui.icon className="size-4" />
                      {ui.label}
                      <span className="text-[10px] text-neutral-500">{t === "info" ? "ทั่วไป" : t === "warning" ? "เตือนภัย" : "สำเร็จ"}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="หัวข้อ">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น งวด 16 ต.ค. เปิดรับแล้ว"
                maxLength={60}
                className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-300 focus:border-brand-400"
              />
              <p className="text-right text-[10px] text-neutral-400">{title.length}/60</p>
            </Field>

            <Field label="ข้อความ">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="พิมพ์ข้อความที่จะส่งถึงสมาชิก..."
                maxLength={200}
                className="min-h-24 rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none placeholder:text-neutral-300 focus:border-brand-400"
              />
              <p className="text-right text-[10px] text-neutral-400">{body.length}/200</p>
            </Field>

            {/* Preview */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">พรีวิวแจ้งเตือน</p>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-100">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", getTypeUI(type).dot)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">{title || "หัวข้อการแจ้งเตือน"}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{body || "ข้อความจะแสดงที่นี่..."}</p>
                </div>
              </div>
            </div>

            <Btn className="w-full rounded-full" disabled={!canSend} onClick={() => setConfirmSend(true)}>
              <Send className="size-4" /> ส่งการแจ้งเตือน
            </Btn>
          </div>
        </Panel>

        {/* History */}
        <Panel className="min-w-0 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Eye className="size-4 text-brand-600" /> ประวัติการส่ง
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">ล่าสุด {history.length} รายการ</p>
            </div>
          </div>
          {history.length === 0 ? <EmptyState title="ยังไม่มีประวัติการส่ง" /> : (
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
                      <Td className="max-w-[220px]">
                        <p className="truncate font-semibold text-neutral-900">{h.title}</p>
                        <p className="line-clamp-1 text-xs text-neutral-400">{h.body}</p>
                      </Td>
                      <Td>
                        <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset", ui.chip)}>
                          <ui.icon className="size-3" /> {ui.label}
                        </span>
                      </Td>
                      <Td className="max-w-[180px]">
                        <p className="truncate text-xs font-medium text-neutral-700">{h.audience === "all" ? "ทั้งหมด 🌐" : "รายบุคคล 👤"}</p>
                        <p className="truncate text-[11px] text-neutral-400">{h.recipient}</p>
                      </Td>
                      <Td className="whitespace-nowrap text-xs">{h.sent_by}</Td>
                      <Td className="whitespace-nowrap text-xs text-neutral-500">{h.sent_at}</Td>
                      <Td className="whitespace-nowrap text-right text-xs font-bold text-neutral-700">{fmtNum(h.reached)}</Td>
                      <Td className="text-center">
                        <Btn size="icon" variant="ghost" className="size-8 rounded-full text-rose-500 hover:bg-rose-50" onClick={() => setConfirmDel(h)} aria-label="ลบการแจ้งเตือน">
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
      </div>

      {confirmSend ? (
        <ConfirmDialog
          open
          title="ส่งประกาศภายในระบบ?"
          desc={`${audience === "all" ? `ส่งประกาศถึงสมาชิกทั้งหมด 4,892 คนบนหน้าเว็บ` : `ส่งถึง ${picked?.name}`} · ประเภท ${getTypeUI(type).label} — ข้อความจะปรากฏบนเว็บสมาชิกทันที`}
          confirmLabel="ส่งประกาศเลย"
          onOpenChange={setConfirmSend}
          onConfirm={send}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบประวัติการส่ง?"
          desc={`ลบ "${confirmDel.title}" · ย้อนกลับไม่ได้`}
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
