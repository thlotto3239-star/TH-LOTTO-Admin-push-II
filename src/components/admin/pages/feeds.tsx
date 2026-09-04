"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Rss, ArrowUp, ArrowDown, ExternalLink, Trophy, Megaphone, Newspaper, AlertTriangle } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ConfirmDialog } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { NEWS_FEEDS, type NewsFeed } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EMPTY_FEED: NewsFeed = {
  id: "", title: "", body: "", type: "news", link_url: "", display_order: 0, is_active: true, created_at: "",
};

const TYPE_META: Record<NewsFeed["type"], { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  news: { label: "ข่าวสาร", icon: Newspaper, cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  winner: { label: "ผู้ชนะ", icon: Trophy, cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  promo: { label: "โปรโมชั่น", icon: Megaphone, cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  alert: { label: "แจ้งเตือน", icon: AlertTriangle, cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

function FeedForm({ initial, onClose, onSave }: { initial: NewsFeed; onClose: () => void; onSave: (f: NewsFeed) => void }) {
  const [f, setF] = React.useState<NewsFeed>(initial);
  const { toast } = useToast();
  const isNew = !initial.id;
  const set = <K extends keyof NewsFeed>(k: K, v: NewsFeed[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "เพิ่มฟีดข่าวใหม่" : `แก้ไขฟีด — ${initial.title}`}</DialogTitle>
          <DialogDescription>เพิ่ม/ลบ/แก้ไขรายการฟีดที่แสดงหน้าเว็บสมาชิก</DialogDescription>
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
          <Field label="หัวข้อข่าว / กิจกรรม">
            <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="เช่น สมาชิกถูกรางวัลที่ 1 งวด 16 สิงหา" className={inputCls} />
          </Field>
          <Field label="รายละเอียดเนื้อหา">
            <Textarea value={f.body} onChange={(e) => set("body", e.target.value)} className={cn(inputCls, "min-h-20 rounded-xl")} />
          </Field>
          <Field label="ลิงก์ปลายทาง (ไม่บังคับ)">
            <Input value={f.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="/promotions" className={inputCls} />
          </Field>
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5">
            <span className="text-sm font-medium text-neutral-700">เปิดแสดงบนหน้าเว็บสมาชิก</span>
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
              toast({ title: isNew ? "เพิ่มฟีดแล้ว" : "บันทึกฟีดแล้ว", description: f.title });
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
  const [rows, setRows] = React.useState<NewsFeed[]>(NEWS_FEEDS);
  const [form, setForm] = React.useState<{ initial: NewsFeed } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<NewsFeed | null>(null);

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  const move = (id: string, dir: -1 | 1) => {
    setRows((prev) => {
      const arr = [...prev].sort((a, b) => a.display_order - b.display_order);
      const i = arr.findIndex((r) => r.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr.map((r, k) => ({ ...r, display_order: k + 1 }));
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="จัดการฟีด"
        description={`ตารางฟีด · ทั้งหมด ${rows.length} รายการ · แสดงบนเว็บ ${rows.filter((r) => r.is_active).length} รายการ`}
      >
        <Btn className="rounded-full" onClick={() => setForm({ initial: { ...EMPTY_FEED, display_order: rows.length + 1 } })}>
          <Plus className="size-4" /> เพิ่มฟีด
        </Btn>
      </PageHeader>

      {sorted.length === 0 ? <Panel><EmptyState title="ยังไม่มีฟีดข่าว" /></Panel> : (
        <div className="space-y-2.5">
          {sorted.map((f, idx) => {
            const meta = TYPE_META[f.type];
            return (
              <Panel key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                {/* order + icon */}
                <div className="flex items-center gap-3 sm:w-56">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(f.id, -1)} disabled={idx === 0} className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30" aria-label="ย้ายขึ้น">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button onClick={() => move(f.id, 1)} disabled={idx === sorted.length - 1} className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30" aria-label="ย้ายลง">
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                    #{f.display_order}
                  </span>
                  <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset", meta.cls)}>
                    <meta.icon className="size-3" /> {meta.label}
                  </span>
                </div>

                {/* content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-neutral-900">{f.title}</p>
                    {f.link_url ? (
                      <a href="#" className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-brand-600 hover:underline">
                        <ExternalLink className="size-3" /> {f.link_url}
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{f.body}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">สร้างเมื่อ {f.created_at}</p>
                </div>

                {/* actions */}
                <div className="flex shrink-0 items-center gap-1.5 sm:justify-end">
                  <div className="mr-1 flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5">
                    <Rss className={cn("size-3.5", f.is_active ? "text-brand-600" : "text-neutral-300")} />
                    <Switch
                      checked={f.is_active}
                      onCheckedChange={(v) => {
                        setRows((rws) => rws.map((x) => (x.id === f.id ? { ...x, is_active: v } : x)));
                        toast({ title: v ? "แสดงฟีดแล้ว" : "ซ่อนฟีดแล้ว", description: f.title });
                      }}
                      aria-label="แสดง/ซ่อนฟีด"
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

      {form ? (
        <FeedForm
          initial={form.initial}
          onClose={() => setForm(null)}
          onSave={(f) =>
            setRows((rws) =>
              rws.some((x) => x.id === f.id)
                ? rws.map((x) => (x.id === f.id ? f : x))
                : [...rws, { ...f, id: `fd-${Date.now()}`, created_at: "วันนี้" }]
            )
          }
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบฟีด?"
          desc={`ยืนยันการลบ "${confirmDel.title}" — ย้อนกลับไม่ได้`}
          confirmLabel="ลบถาวร"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => {
            setRows((rws) => rws.filter((x) => x.id !== confirmDel.id).map((r, k) => ({ ...r, display_order: k + 1 })));
            toast({ title: "ลบฟีดแล้ว", description: confirmDel.title });
          }}
        />
      ) : null}
    </div>
  );
}
