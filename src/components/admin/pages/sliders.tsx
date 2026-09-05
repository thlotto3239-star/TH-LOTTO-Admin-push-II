"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, ChevronUp, ChevronDown, Image as ImageIcon, Link2, ExternalLink } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ConfirmDialog } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { type Slider } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EMPTY_SLIDE: Slider = {
  id: "", title: "", image_url: "", link_url: "", display_order: 0, is_active: true, created_at: "",
};

function SliderForm({
  initial, onClose, onSave,
}: { initial: Slider; onClose: () => void; onSave: (s: Slider) => void }) {
  const [f, setF] = React.useState<Slider>(initial);
  const { toast } = useToast();
  const isNew = !initial.id;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "เพิ่มสไลด์ใหม่" : `แก้ไขสไลด์ — ${initial.title}`}</DialogTitle>
          <DialogDescription>
            {isNew ? "ตั้งค่าภาพแบนเนอร์และลิงก์ปลายทางเพื่อแสดงบนหน้าแรก" : "แก้ไขภาพแบนเนอร์และลิงก์ปลายทาง"}
          </DialogDescription>
        </DialogHeader>

        {/* 2-Column Responsive Layout for PC */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Column 1: รูปภาพและพรีวิว */}
          <div className="space-y-3">
            <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-inner">
              {f.image_url ? (
                <img src={f.image_url} alt={f.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-300">
                  <ImageIcon className="size-10" />
                  <span className="text-xs font-medium">พรีวิวรูปสไลด์ (1920×600)</span>
                </div>
              )}
              <span className="absolute bottom-3 left-3 right-3 truncate rounded-full bg-neutral-900/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                {f.title || "หัวข้อสไลด์จะแสดงที่นี่"}
              </span>
            </div>
            <Field label="ลิงก์รูปภาพแบนเนอร์ (URL)">
              <Input value={f.image_url} onChange={(e) => setF((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://... (URL รูปภาพ)" className={inputCls} />
            </Field>
          </div>

          {/* Column 2: ข้อมูลสไลด์ & การแสดงผล */}
          <div className="space-y-3">
            <Field label="หัวข้อสไลด์แบนเนอร์">
              <Input value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} placeholder="เช่น โบนัสสมัครใหม่รับ 100%" className={inputCls} />
            </Field>
            <Field label="ลิงก์ปลายทางเมื่อคลิกสไลด์">
              <Input value={f.link_url} onChange={(e) => setF((p) => ({ ...p, link_url: e.target.value }))} placeholder="/promotions/welcome" className={inputCls} />
            </Field>
            <Field label="ลำดับการแสดงผล">
              <Input type="number" min={1} value={f.display_order} onChange={(e) => setF((p) => ({ ...p, display_order: Number(e.target.value) }))} className={inputCls} />
            </Field>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-3.5 ring-1 ring-neutral-200/80">
              <div>
                <p className="text-xs font-semibold text-neutral-800">สถานะเปิดใช้งาน</p>
                <p className="text-[11px] text-neutral-400">เปิดเพื่อให้แบนเนอร์แสดงบนหน้าแรกทันที</p>
              </div>
              <Switch checked={f.is_active} onCheckedChange={(v) => setF((p) => ({ ...p, is_active: v }))} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn
            className="rounded-full"
            disabled={!f.title.trim()}
            onClick={() => {
              onSave(f);
              toast({ title: isNew ? "เพิ่มสไลด์แล้ว" : "บันทึกสไลด์แล้ว", description: f.title });
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

export function SlidersPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Slider[]>([]);
  const [form, setForm] = React.useState<{ initial: Slider } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<Slider | null>(null);
  const dragId = React.useRef<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const loadSliders = React.useCallback(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.sliders)) {
          setRows(
            res.data.sliders.map((s: any) => ({
              id: String(s.id),
              title: s.title || "",
              image_url: s.image_url || "",
              link_url: s.link_url || s.link || "",
              display_order: Number(s.display_order || 1),
              is_active: Boolean(s.is_active),
              created_at: s.created_at || s.updated_at || "",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadSliders();
  }, [loadSliders]);

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  const saveReorder = async (arr: Slider[]) => {
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder_sliders",
          payload: { items: arr.map((r, k) => ({ id: r.id, display_order: k + 1 })) },
        }),
      });
    } catch {
      // no-op
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    setRows((prev) => {
      const arr = [...prev].sort((a, b) => a.display_order - b.display_order);
      const i = arr.findIndex((r) => r.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      const updated = arr.map((r, k) => ({ ...r, display_order: k + 1 }));
      saveReorder(updated);
      return updated;
    });
    toast({ title: dir === -1 ? "ย้ายขึ้นแล้ว" : "ย้ายลงแล้ว", description: "บันทึกลำดับใหม่ลงฐานข้อมูลเรียบร้อย" });
  };

  const dropOn = (targetId: string) => {
    const fromId = dragId.current;
    setDragOverId(null);
    dragId.current = null;
    if (!fromId || fromId === targetId) return;
    setRows((prev) => {
      const arr = [...prev].sort((a, b) => a.display_order - b.display_order);
      const from = arr.findIndex((r) => r.id === fromId);
      const to = arr.findIndex((r) => r.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      const updated = arr.map((r, k) => ({ ...r, display_order: k + 1 }));
      saveReorder(updated);
      return updated;
    });
    toast({ title: "จัดเรียงสไลด์แล้ว", description: "บันทึกลำดับใหม่ลงฐานข้อมูลเรียบร้อย" });
  };

  const handleToggle = async (s: Slider, active: boolean) => {
    setRows((rws) => rws.map((x) => (x.id === s.id ? { ...x, is_active: active } : x)));
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_slider",
          payload: { ...s, is_active: active },
        }),
      });
      toast({ title: active ? "เปิดสไลด์แล้ว" : "ปิดสไลด์แล้ว", description: "อัปเดตสถานะสไลด์ในระบบเรียบร้อย" });
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกสถานะได้", variant: "destructive" });
    }
  };

  const handleSaveForm = async (s: Slider) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_slider",
          payload: s,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกสไลด์สำเร็จ", description: `${s.title} บันทึกลงระบบแล้ว` });
        loadSliders();
      } else {
        toast({ title: "บันทึกล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "บันทึกล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (s: Slider) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_slider",
          payload: { id: s.id },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "ลบสไลด์แล้ว", description: s.title });
        loadSliders();
      } else {
        toast({ title: "ลบล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ลบล้มเหลว", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="สไลเดอร์"
        description={`ตารางสไลด์ · ทั้งหมด ${rows.length} สไลด์ · เปิดใช้งาน ${rows.filter((r) => r.is_active).length} สไลด์ · ลากเรียงลำดับได้`}
      >
        <Btn className="rounded-full" onClick={() => setForm({ initial: { ...EMPTY_SLIDE, display_order: rows.length + 1 } })}>
          <Plus className="size-4" /> เพิ่มสไลด์
        </Btn>
      </PageHeader>

      {sorted.length === 0 ? <Panel><EmptyState title="ยังไม่มีสไลด์ — กดปุ่มเพิ่มสไลด์เพื่อสร้าง" /></Panel> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s, idx) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => (dragId.current = s.id)}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(s.id); }}
              onDragLeave={() => setDragOverId((p) => (p === s.id ? null : p))}
              onDrop={() => dropOn(s.id)}
              className={cn(
                "group cursor-grab overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow active:cursor-grabbing hover:shadow-md",
                dragOverId === s.id && "ring-2 ring-brand-400 ring-offset-2"
              )}
            >
              <div className="relative h-36 w-full overflow-hidden bg-neutral-50">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800">
                    <ImageIcon className="size-8 text-white/70" />
                  </div>
                )}
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-800">
                  <GripVertical className="size-3" /> ลำดับ {s.display_order}
                </span>
                {!s.is_active ? (
                  <span className="absolute right-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-bold text-white">ปิดแสดง</span>
                ) : null}
                <span className="absolute bottom-2 left-3 right-3 truncate rounded-full bg-neutral-900/60 px-3 py-1 text-xs font-medium text-white">
                  {s.title}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Link2 className="size-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate font-mono">{s.link_url || "—"}</span>
                  {s.link_url ? <ExternalLink className="size-3 shrink-0 text-neutral-400" /> : null}
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">สร้างเมื่อ {s.created_at}</p>
                <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-100 pt-3">
                  <Btn variant="ghost" size="icon" className="size-8 rounded-full" disabled={idx === 0} onClick={() => move(s.id, -1)} aria-label="ย้ายขึ้น">
                    <ChevronUp className="size-4" />
                  </Btn>
                  <Btn variant="ghost" size="icon" className="size-8 rounded-full" disabled={idx === sorted.length - 1} onClick={() => move(s.id, 1)} aria-label="ย้ายลง">
                    <ChevronDown className="size-4" />
                  </Btn>
                  <div className="ml-1 flex items-center gap-2">
                    <Switch checked={s.is_active} onCheckedChange={(v) => handleToggle(s, v)} aria-label="เปิด/ปิดสไลด์" />
                  </div>
                  <Btn size="sm" variant="outline" className="ml-auto h-8 rounded-full px-3" onClick={() => setForm({ initial: s })}>
                    <Pencil className="size-3.5" /> แก้ไข
                  </Btn>
                  <Btn size="sm" variant="outline" className="h-8 rounded-full border-rose-200 px-3 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(s)}>
                    <Trash2 className="size-3.5" /> ลบ
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form ? (
        <SliderForm
          initial={form.initial}
          onClose={() => setForm(null)}
          onSave={handleSaveForm}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบสไลด์?"
          desc={`ยืนยันการลบ "${confirmDel.title}" · ย้อนกลับไม่ได้`}
          confirmLabel="ลบถาวร"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => handleDelete(confirmDel)}
        />
      ) : null}
    </div>
  );
}
