"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Eye, Search, Newspaper, Bold, Italic, Underline, List, Heading2 } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ConfirmDialog, TableWrap, Th, Td, Pagination, StatusBadge, SearchInput } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ARTICLES, ARTICLE_CATEGORIES, fmtNum, type Article } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EMPTY_ARTICLE: Article = {
  id: "", title: "", category: "คู่มือ", excerpt: "", content: "",
  image_url: "", author: "ทีมงาน TH-LOTTO", views: 0, is_published: false, published_at: "—",
};

const PER_PAGE = 4;

function ArticleForm({
  initial, onClose, onSave,
}: { initial: Article; onClose: () => void; onSave: (a: Article) => void }) {
  const [f, setF] = React.useState<Article>(initial);
  const { toast } = useToast();
  const isNew = !initial.id;
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setF((p) => ({ ...p, [k]: v }));

  const wrap = (before: string, after: string) => {
    set("content", `${f.content}${before}ข้อความ${after}`);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "เขียนบทความใหม่" : `แก้ไขบทความ — ${initial.title}`}</DialogTitle>
          <DialogDescription>
            {isNew ? "กรอกข้อมูลและเนื้อหาบทความเพื่อเผยแพร่บนหน้าเว็บ" : "แก้ไขข้อมูลและเนื้อหาบทความ"}
          </DialogDescription>
        </DialogHeader>

        {/* 2-Column Responsive Layout for PC */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Column 1: ข้อมูลบทความ */}
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">ข้อมูลบทความ</p>
              <Field label="หัวข้อบทความ">
                <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="เช่น วิธีเล่นหวยออนไลน์สำหรับมือใหม่" className={inputCls} />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="หมวดหมู่บทความ">
                  <Select value={f.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="ชื่อผู้เขียน / แอดมิน">
                  <Input value={f.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
                </Field>
              </div>

              <Field label="ลิงก์รูปภาพหน้าปก (URL)">
                <Input value={f.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://... (ปล่อยว่าง = ไม่มีรูป)" className={inputCls} />
              </Field>

              <Field label="คำโปรย / สรุปเนื้อหาย่อ">
                <Textarea value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="สรุปเนื้อหาบทความสั้น ๆ..." className={cn(inputCls, "min-h-20 rounded-xl")} />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-3.5">
              <div>
                <p className="text-xs font-semibold text-neutral-800">สถานะเผยแพร่</p>
                <p className="text-[11px] text-neutral-400">เปิดเพื่อแสดงบทความสู่หน้าเว็บสมาชิกทันที</p>
              </div>
              <Switch checked={f.is_published} onCheckedChange={(v) => set("is_published", v)} />
            </div>
          </div>

          {/* Column 2: เนื้อหาบทความ */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 p-4 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">เนื้อหาบทความ</span>
              <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-0.5 shadow-xs">
                {[
                  { icon: Heading2, label: "หัวข้อ", act: () => wrap("\n## ", "\n") },
                  { icon: Bold, label: "ตัวหนา", act: () => wrap("**", "**") },
                  { icon: Italic, label: "ตัวเอียง", act: () => wrap("*", "*") },
                  { icon: Underline, label: "ขีดเส้นใต้", act: () => wrap("<u>", "</u>") },
                  { icon: List, label: "รายการ", act: () => wrap("\n- ", "") },
                ].map((t) => (
                  <button key={t.label} type="button" title={t.label} onClick={t.act} className="flex size-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
                    <t.icon className="size-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              value={f.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="พิมพ์เนื้อหาบทความที่นี่..."
              className={cn(inputCls, "min-h-64 flex-1 rounded-xl bg-white font-mono text-xs leading-relaxed")}
            />
            <p className="mt-2 text-right text-[11px] text-neutral-400">{f.content.length.toLocaleString()} ตัวอักษร</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn
            className="rounded-full"
            disabled={!f.title.trim() || !f.content.trim()}
            onClick={() => {
              onSave({ ...f, published_at: f.is_published && f.published_at === "—" ? "วันนี้" : f.published_at });
              toast({ title: isNew ? "เขียนบทความแล้ว" : "บันทึกบทความแล้ว", description: f.title });
              onClose();
            }}
          >
            {f.is_published ? "บันทึก + เผยแพร่" : "บันทึกฉบับร่าง"}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArticlesPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Article[]>(ARTICLES);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [form, setForm] = React.useState<{ initial: Article } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<Article | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.articles?.length > 0) {
          setRows(
            res.data.articles.map((a: any) => ({
              id: String(a.id),
              title: a.title || "",
              slug: String(a.id),
              category: a.category || "ข่าวสาร",
              content: a.content || "",
              image_url: a.image_url || "",
              views: 0,
              is_published: Boolean(a.is_published),
              published_at: a.created_at ? new Date(a.created_at).toLocaleDateString("th-TH") : "—",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filtered = rows.filter(
    (r) =>
      (cat === "all" || r.category === cat) &&
      (q.trim() === "" || r.title.toLowerCase().includes(q.toLowerCase()) || r.excerpt.includes(q))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      <PageHeader
        title="บทความ"
        description={`ตารางบทความ · ทั้งหมด ${rows.length} บทความ · เผยแพร่แล้ว ${rows.filter((r) => r.is_published).length} · ฉบับร่าง ${rows.filter((r) => !r.is_published).length}`}
      >
        <Btn className="rounded-full" onClick={() => setForm({ initial: EMPTY_ARTICLE })}>
          <Plus className="size-4" /> เขียนบทความ
        </Btn>
      </PageHeader>

      <Panel className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="ค้นหาบทความ..." className="sm:w-72" />
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["all", ...ARTICLE_CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => { setCat(c); setPage(1); }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  cat === c ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {c === "all" ? "ทั้งหมด" : c}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {shown.length === 0 ? <Panel><EmptyState title="ไม่พบบทความที่ค้นหา" /></Panel> : (
        <Panel>
          <TableWrap className="min-w-[860px]">
            <thead>
              <tr>
                <Th>บทความ</Th>
                <Th>หมวดหมู่</Th>
                <Th>ผู้เขียน</Th>
                <Th className="text-right">ยอดเข้าชม</Th>
                <Th>สถานะ</Th>
                <Th>วันเผยแพร่</Th>
                <Th>เผยแพร่</Th>
                <Th className="sticky right-0 bg-neutral-50/90 text-center">การจัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-neutral-50/60">
                  <Td className="max-w-[300px]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                        {a.image_url ? <img src={a.image_url} alt="" className="size-10 object-cover" /> : <Newspaper className="size-4 text-neutral-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">{a.title}</p>
                        <p className="line-clamp-1 text-xs text-neutral-400">{a.excerpt}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">{a.category}</span></Td>
                  <Td className="whitespace-nowrap text-xs">{a.author}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <span className="inline-flex items-center gap-1 text-xs"><Eye className="size-3.5 text-neutral-400" /> {fmtNum(a.views)}</span>
                  </Td>
                  <Td><StatusBadge status={a.is_published ? "active" : "inactive"} /></Td>
                  <Td className="whitespace-nowrap text-xs">{a.published_at}</Td>
                  <Td>
                    <Switch
                      checked={a.is_published}
                      onCheckedChange={(v) => {
                        setRows((rws) => rws.map((x) => (x.id === a.id ? { ...x, is_published: v, published_at: v && x.published_at === "—" ? "วันนี้" : x.published_at } : x)));
                        toast({ title: v ? "เผยแพร่บทความแล้ว" : "ซ่อนบทความแล้ว", description: "อัปเดตสถานะเรียบร้อย" });
                      }}
                    />
                  </Td>
                  <Td className="sticky right-0 bg-white text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Btn size="icon" variant="outline" className="size-8 rounded-full" onClick={() => setForm({ initial: a })} aria-label="แก้ไข">
                        <Pencil className="size-3.5" />
                      </Btn>
                      <Btn size="icon" variant="outline" className="size-8 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(a)} aria-label="ลบ">
                        <Trash2 className="size-3.5" />
                      </Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div className="border-t border-neutral-100">
            <Pagination page={page} pages={pages} onChange={setPage} />
          </div>
        </Panel>
      )}

      {form ? (
        <ArticleForm
          initial={form.initial}
          onClose={() => setForm(null)}
          onSave={(a) =>
            setRows((rws) =>
              rws.some((x) => x.id === a.id) ? rws.map((x) => (x.id === a.id ? a : x)) : [{ ...a, id: `ar-${Date.now()}` }, ...rws]
            )
          }
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบบทความ?"
          desc={`ยืนยันการลบ "${confirmDel.title}" · ย้อนกลับไม่ได้`}
          confirmLabel="ลบถาวร"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => {
            setRows((rws) => rws.filter((x) => x.id !== confirmDel.id));
            toast({ title: "ลบบทความแล้ว", description: confirmDel.title });
          }}
        />
      ) : null}
    </div>
  );
}
