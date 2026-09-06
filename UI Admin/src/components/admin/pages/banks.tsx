"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Copy, Star, Landmark, ArrowUp, ArrowDown, ShieldCheck } from "lucide-react";
import { Panel, Btn, PageHeader, Field, inputCls, EmptyState, ConfirmDialog, BankSelector, ToggleRow } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BANK_DISPLAYS, BANKS, bankOf, type BankAccountBook } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EMPTY_ACC: BankAccountBook = {
  id: "", bank_code: "kbank", account_no: "", account_name: "", branch: "",
  qr_code_url: "", account_type: "deposit", is_default: false, is_active: true,
};

function AccountForm({ initial, onClose, onSave }: { initial: BankAccountBook; onClose: () => void; onSave: (a: BankAccountBook) => void }) {
  const [f, setF] = React.useState(initial);
  const { toast } = useToast();
  const isNew = !initial.id;
  const set = <K extends keyof BankAccountBook>(k: K, v: BankAccountBook[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "เพิ่มบัญชีธนาคาร" : `แก้ไขบัญชี — ${initial.account_no}`}</DialogTitle>
          <DialogDescription>
            {isNew ? "เพิ่มบัญชีธนาคารใหม่" : "แก้ไขบัญชีธนาคาร"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="เลือกธนาคาร">
              <BankSelector value={f.bank_code} onChange={(v) => set("bank_code", v)} />
            </Field>
            <Field label="ประเภทบัญชี">
              <Select value={f.account_type} onValueChange={(v) => set("account_type", v as BankAccountBook["account_type"])}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="deposit">บัญชีรับเงิน (ฝาก)</SelectItem>
                  <SelectItem value="withdraw">บัญชีโอนเงิน (ถอน)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="เลขที่บัญชี">
            <Input value={f.account_no} onChange={(e) => set("account_no", e.target.value.replace(/[^\d-]/g, ""))} placeholder="1234567890" className={cn(inputCls, "font-mono")} />
          </Field>
          <Field label="ชื่อบัญชี">
            <Input value={f.account_name} onChange={(e) => set("account_name", e.target.value)} placeholder="บริษัท ทีเอช ล็อตโต้ จำกัด" className={inputCls} />
          </Field>
          <Field label="สาขาธนาคาร">
            <Input value={f.branch} onChange={(e) => set("branch", e.target.value)} placeholder="สาขาสีลม" className={inputCls} />
          </Field>
          <Field label="ลิงก์รูป QR Code พร้อมเพย์ (ไม่บังคับ)">
            <Input value={f.qr_code_url} onChange={(e) => set("qr_code_url", e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <div className="rounded-2xl border border-neutral-100 px-3">
            <ToggleRow label="ตั้งเป็นบัญชีหลัก" desc="แสดงเป็นบัญชีแรกในหน้าฝาก/ถอนของสมาชิก" checked={f.is_default} onCheckedChange={(v) => set("is_default", v)} />
            <ToggleRow label="เปิดใช้งานบัญชีนี้" desc="สลับสถานะการใช้งานบัญชี" checked={f.is_active} onCheckedChange={(v) => set("is_active", v)} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn
            className="rounded-full"
            disabled={!f.account_no.trim() || !f.account_name.trim()}
            onClick={() => {
              onSave(f);
              toast({ title: isNew ? "เพิ่มบัญชีแล้ว" : "บันทึกบัญชีแล้ว", description: `${bankOf(f.bank_code).name} · ${f.account_no}` });
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

export function BanksPage() {
  const { toast } = useToast();
  const [displays, setDisplays] = React.useState<{ code: string; is_active: boolean; display_order: number }[]>([]);
  const [accounts, setAccounts] = React.useState<BankAccountBook[]>([]);
  const [form, setForm] = React.useState<{ initial: BankAccountBook } | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<BankAccountBook | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/data?resource=content")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.banks) && res.data.banks.length > 0) {
          setDisplays(
            res.data.banks.map((b: any, idx: number) => ({
              code: (b.code || "").toLowerCase(),
              is_active: Boolean(b.is_active),
              display_order: idx + 1,
            }))
          );
        }
        if (res.success && Array.isArray(res.data?.settings) && res.data.settings.length > 0) {
          const dict: Record<string, string> = {};
          res.data.settings.forEach((s: any) => {
            if (s.key) dict[s.key] = s.value;
          });
          if (dict.company_bank_account_number) {
            setAccounts([
              {
                id: "sb-company-1",
                bank_code: (dict.company_bank_code || "kbank").toLowerCase(),
                account_no: dict.company_bank_account_number || "",
                account_name: dict.company_bank_account_name || dict.bank_account_name || "บริษัท ทีเอช ล็อตโต้ จำกัด",
                branch: "สำนักงานใหญ่",
                qr_code_url: dict.bank_qr_url || "",
                account_type: "deposit" as const,
                is_default: true,
                is_active: true,
              },
            ]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const sortedDisp = [...displays].sort((a, b) => a.display_order - b.display_order);

  const moveDisp = (code: string, dir: -1 | 1) => {
    setDisplays((prev) => {
      const arr = [...prev].sort((a, b) => a.display_order - b.display_order);
      const i = arr.findIndex((r) => r.code === code);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr.map((r, k) => ({ ...r, display_order: k + 1 }));
    });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast({ title: `คัดลอก${label}แล้ว`, description: text });
  };

  const setDefault = (acc: BankAccountBook) => {
    setAccounts((prev) => prev.map((a) => (a.bank_code === acc.bank_code && a.account_type === acc.account_type ? { ...a, is_default: a.id === acc.id } : a)));
    toast({ title: "ตั้งบัญชีหลักแล้ว", description: `${bankOf(acc.bank_code).name} · ${acc.account_no}` });
  };

  const handleToggleBank = async (code: string, active: boolean) => {
    setDisplays((prev) => prev.map((x) => (x.code === code ? { ...x, is_active: active } : x)));
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_bank",
          payload: { code: code.toUpperCase(), is_active: active },
        }),
      });
      toast({ title: active ? `เปิดใช้ ${code.toUpperCase()}` : `ปิดใช้ ${code.toUpperCase()}`, description: "อัปเดตสถานะธนาคารในระบบเรียบร้อย" });
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกสถานะได้", variant: "destructive" });
    }
  };

  const handleSaveAccount = async (a: BankAccountBook) => {
    setAccounts((prev) => {
      let next = prev.some((x) => x.id === a.id) ? prev.map((x) => (x.id === a.id ? a : x)) : [...prev, { ...a, id: `bk-${Date.now()}` }];
      if (a.is_default) {
        next = next.map((x) => (x.id !== a.id && x.bank_code === a.bank_code && x.account_type === a.account_type ? { ...x, is_default: false } : x));
      }
      return next;
    });

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_update_settings",
          payload: {
            settings: [
              { key: "company_bank_code", value: a.bank_code },
              { key: "company_bank_account_number", value: a.account_no },
              { key: "company_bank_account_name", value: a.account_name },
              { key: "bank_account_name", value: a.account_name },
              ...(a.qr_code_url ? [{ key: "bank_qr_url", value: a.qr_code_url }] : []),
            ],
          },
        }),
      });
      toast({ title: "บันทึกบัญชีธนาคารแล้ว", description: `${bankOf(a.bank_code).name} · ${a.account_no}` });
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกลงระบบได้", variant: "destructive" });
    }
    setForm(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="ธนาคาร"
        description={`ตารางธนาคาร · ธนาคารที่รองรับ ${displays.filter((d) => d.is_active).length}/${displays.length} · บัญชีรับ-โอนเงิน ${accounts.length} บัญชี`}
      >
        <Btn className="rounded-full" onClick={() => setForm({ initial: EMPTY_ACC })}>
          <Plus className="size-4" /> เพิ่มบัญชีธนาคาร
        </Btn>
      </PageHeader>

      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
            <Landmark className="size-4" /> ธนาคารที่รองรับ — เปิด/ปิด + ลำดับการแสดงผล
          </p>
          <span className="text-[11px] text-neutral-400">สลับการใช้งานและจัดลำดับธนาคารได้</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedDisp.map((d, idx) => {
            const b = bankOf(d.code);
            return (
              <div key={d.code} className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveDisp(d.code, -1)} disabled={idx === 0} className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30" aria-label="ย้ายขึ้น">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button onClick={() => moveDisp(d.code, 1)} disabled={idx === sortedDisp.length - 1} className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30" aria-label="ย้ายลง">
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="size-9 shrink-0 rounded-xl object-contain bg-white p-1 ring-1 ring-neutral-200/80 shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: b.color }}>
                    {b.short}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{b.name}</p>
                  <p className="text-[11px] text-neutral-400">ลำดับ {d.display_order}</p>
                </div>
                <Switch
                  checked={d.is_active}
                  onCheckedChange={(v) => handleToggleBank(d.code, v)}
                  aria-label={`เปิด/ปิด ${b.name}`}
                />
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <ShieldCheck className="size-4 text-brand-600" /> บัญชีรับเงิน / บัญชีโอนเงินของแอดมิน
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">รวม {accounts.length} บัญชี · ฝาก {accounts.filter((a) => a.account_type === "deposit").length} · ถอน {accounts.filter((a) => a.account_type === "withdraw").length}</p>
          </div>
        </div>
        {accounts.length === 0 ? <EmptyState title="ยังไม่มีบัญชีธนาคาร" /> : (
          <div className="divide-y divide-neutral-100">
            {accounts.map((a) => {
              const b = bankOf(a.bank_code);
              return (
                <div key={a.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-neutral-50/60 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="size-11 shrink-0 rounded-2xl object-contain bg-white p-1.5 ring-1 ring-neutral-200/80 shadow-xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black tracking-tight text-white" style={{ backgroundColor: b.color }}>
                        {b.short.slice(0, 3)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-mono text-sm font-bold text-neutral-900">{a.account_no}</p>
                        <button onClick={() => copy(a.account_no, "เลขบัญชี")} className="flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-brand-600" aria-label="คัดลอกเลขบัญชี">
                          <Copy className="size-3" />
                        </button>
                        {a.is_default ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                            <Star className="size-2.5" /> บัญชีหลัก
                          </span>
                        ) : null}
                        <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset", a.account_type === "deposit" ? "bg-brand-50 text-brand-700 ring-brand-200" : "bg-sky-50 text-sky-700 ring-sky-200")}>
                          {a.account_type === "deposit" ? "รับเงิน (ฝาก)" : "โอนเงิน (ถอน)"}
                        </span>
                        {!a.is_active ? <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">ปิดใช้งาน</span> : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{a.account_name} · {a.branch}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => copy(a.account_name, "ชื่อบัญชี")}>
                      คัดลอกชื่อ
                    </Btn>
                    {!a.is_default ? (
                      <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => setDefault(a)}>
                        <Star className="size-3.5" /> ตั้งหลัก
                      </Btn>
                    ) : null}
                    <Btn size="icon" variant="outline" className="size-8 rounded-full" onClick={() => setForm({ initial: a })} aria-label="แก้ไข">
                      <Pencil className="size-3.5" />
                    </Btn>
                    <Btn size="icon" variant="outline" className="size-8 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(a)} aria-label="ลบ">
                      <Trash2 className="size-3.5" />
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {form ? (
        <AccountForm
          initial={form.initial}
          onClose={() => setForm(null)}
          onSave={handleSaveAccount}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          open
          danger
          title="ลบบัญชีธนาคาร?"
          desc={`ยืนยันการลบ ${bankOf(confirmDel.bank_code).name} · ${confirmDel.account_no} · ย้อนกลับไม่ได้`}
          confirmLabel="ลบถาวร"
          onOpenChange={() => setConfirmDel(null)}
          onConfirm={() => {
            setAccounts((prev) => prev.filter((x) => x.id !== confirmDel.id));
            toast({ title: "ลบบัญชีแล้ว", description: `${bankOf(confirmDel.bank_code).name} · ${confirmDel.account_no}` });
          }}
        />
      ) : null}
    </div>
  );
}
