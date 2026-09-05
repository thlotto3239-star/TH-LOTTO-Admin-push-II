"use client";

import * as React from "react";
import { Eye, Check, X, Download, Ticket } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, SearchInput, TableWrap, Th, Td, EmptyState, Field, inputCls, PageHeader, RealtimeDot } from "../primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PROMO_DETAILS, fmtTHB, fmtDT, type DepositReq } from "@/data/admin-mock";
import { useAdminCounts } from "../store";
import { cn } from "@/lib/utils";

// ─── Slip preview (image modal) ──────────────────────────────────────────────
function SlipModal({ req, onClose }: { req: DepositReq | null; onClose: () => void }) {
  if (!req) return null;
  const t = new Date(req.created_at);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>สลิปการโอนเงิน</DialogTitle>
          <DialogDescription>ตรวจสอบสลิปก่อนอนุมัติรายการฝาก</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-white">
            <p className="text-xs opacity-80">สลิปโอนเงิน · {fmtDT(req.created_at)}</p>
            <p className="text-2xl font-black tracking-tight">{fmtTHB(req.amount)}</p>
          </div>
          <div className="space-y-2.5 px-4 py-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-neutral-400">จากบัญชี</span><span className="text-right font-medium text-neutral-800">{req.member.bank_account_name}</span></div>
            <div className="flex justify-between gap-3"><span className="text-neutral-400">เลขบัญชีผู้โอน</span><span className="font-mono text-neutral-800">{req.member.bank_account_number}</span></div>
            <div className="flex justify-between gap-3"><span className="text-neutral-400">ธนาคาร</span><BankBadge code={req.member.bank_code} /></div>
            <div className="flex justify-between gap-3"><span className="text-neutral-400">เวลาโอน</span><span className="font-medium text-neutral-800">{String(t.getHours()).padStart(2, "0")}:{String(t.getMinutes()).padStart(2, "0")} น.</span></div>
            <div className="flex justify-between gap-3"><span className="text-neutral-400">รหัสอ้างอิง</span><span className="font-mono text-xs text-neutral-500">FT{t.getTime().toString().slice(-9)}</span></div>
            {req.slip_url ? (
              <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={req.slip_url} alt="สลิปโอนเงินจริง" className="max-h-80 w-full object-contain" />
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-6">
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <span key={i} className={cn("size-2 rounded-[2px]", (i * 7 + req.amount) % 3 === 0 ? "bg-neutral-800" : "bg-transparent")} />
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-[10px] text-neutral-400">{req.slip_url ? "สลิปจริงจาก Supabase Storage" : "ไม่มีภาพสลิปแนบมา"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Approve / Reject modal ──────────────────────────────────────────────────
function ActionModal({
  req, mode, onClose, onSubmit,
}: {
  req: DepositReq | null;
  mode: "approve" | "reject";
  onClose: () => void;
  onSubmit: (id: string, note: string) => void;
}) {
  const [note, setNote] = React.useState("");
  const { toast } = useToast();
  const promo = req?.promo_code ? PROMO_DETAILS[req.promo_code] : null;

  React.useEffect(() => setNote(""), [req, mode]);

  if (!req) return null;
  const isApprove = mode === "approve";

  const submit = () => {
    if (!isApprove && !note.trim()) {
      toast({ title: "กรุณาระบุเหตุผล", description: "ต้องใส่เหตุผลก่อนปฏิเสธรายการ", variant: "destructive" });
      return;
    }
    onSubmit(req.id, note.trim() || "อนุมัติรายการฝาก");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isApprove ? "ยืนยันการอนุมัติฝาก" : "ปฏิเสธรายการฝาก"}</DialogTitle>
          <DialogDescription>
            {isApprove ? "ตรวจสอบข้อมูลสมาชิกและยอดเงินก่อนอนุมัติ" : "ระบุเหตุผลที่ปฏิเสธ (สมาชิกจะเห็นข้อความนี้)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 text-sm">
          <p className="font-semibold text-neutral-800">ข้อมูลสมาชิก</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-neutral-400">ชื่อ</span><span className="font-medium text-neutral-800">{req.member.full_name}</span>
            <span className="text-neutral-400">รหัสสมาชิก</span><span className="font-mono text-neutral-800">{req.member.member_id}</span>
            <span className="text-neutral-400">เบอร์</span><span className="text-neutral-800">{req.member.phone}</span>
            <span className="text-neutral-400">ธนาคาร</span><BankBadge code={req.member.bank_code} />
            <span className="text-neutral-400">เลขบัญชี</span><span className="font-mono text-neutral-800">{req.member.bank_account_number}</span>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <span className="text-neutral-400">ยอดเงิน: </span>
            <span className="text-xl font-black text-brand-600">{fmtTHB(req.amount)}</span>
          </div>
          {promo ? (
            <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-inset ring-brand-100">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-800"><Ticket className="size-4" /> โปรโมชั่น: {promo.name} ({promo.code})</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-brand-900/80">
                <span>โบนัส {promo.bonus_rate}%</span>
                <span>bonus_amount: {fmtTHB(promo.bonus_amount)}</span>
                <span>ฝากขั้นต่ำ {fmtTHB(promo.min_deposit)}</span>
                <span>ถอนสูงสุด {fmtTHB(promo.max_withdrawal)}</span>
                <span>ต้องทำยอด {promo.turnover_multiplier} เท่า</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">ไม่มีโปรโมชั่น</p>
          )}
        </div>

        <Field label={`หมายเหตุ ${isApprove ? "(ไม่บังคับ)" : "(จำเป็น)"}`}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={isApprove ? "หมายเหตุถึงสมาชิก (ถ้ามี)" : "เช่น สลิปไม่ชัด กรุณาส่งใหม่"} className={cn(inputCls, "min-h-20 rounded-xl")} />
        </Field>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          {isApprove ? (
            <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={submit}><Check className="size-4" /> อนุมัติ</Btn>
          ) : (
            <Btn className="rounded-full bg-rose-600 hover:bg-rose-700" onClick={submit}><X className="size-4" /> ปฏิเสธ</Btn>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function DepositsPage() {
  const { toast } = useToast();
  const { fetchCounts } = useAdminCounts();
  const [rows, setRows] = React.useState<DepositReq[]>([]);
  const [tab, setTab] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [slip, setSlip] = React.useState<DepositReq | null>(null);
  const [action, setAction] = React.useState<{ req: DepositReq; mode: "approve" | "reject" } | null>(null);

  const fetchDeposits = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?resource=deposits");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: DepositReq[] = json.data.map((d: any) => ({
          id: d.id,
          created_at: d.created_at,
          amount: Number(d.amount),
          status: d.status as DepositReq["status"],
          promo_code: d.promo_code,
          slip_url: d.slip_url,
          admin_note: d.admin_note,
          approved_at: d.approved_at,
          approver_name: d.approved_by ? "Admin" : null,
          member: {
            full_name: d.profiles?.full_name || "ไม่ระบุชื่อ",
            member_id: d.profiles?.member_id || (d.user_id ? d.user_id.slice(0, 8) : "MB-000"),
            phone: d.profiles?.phone || "-",
            bank_code: d.profiles?.bank_name || "KBANK",
            bank_account_number: d.profiles?.bank_account_number || "-",
            bank_account_name: d.profiles?.bank_account_name || d.profiles?.full_name || "-",
            avatar_url: d.profiles?.avatar_url || null,
          },
        }));
        setRows(mapped);
      }
    } catch (e) {
      console.error("Failed to load deposits:", e);
    }
  }, []);

  React.useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const counts = {
    PENDING: rows.filter((r) => r.status === "PENDING").length,
    APPROVED: rows.filter((r) => r.status === "APPROVED").length,
    REJECTED: rows.filter((r) => r.status === "REJECTED").length,
  };

  const filtered = rows
    .filter((r) => tab === "ALL" || r.status === tab)
    .filter((r) => {
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return (
        r.member.full_name.toLowerCase().includes(s) ||
        r.member.phone.includes(s) ||
        r.member.member_id.toLowerCase().includes(s)
      );
    });

  const update = async (id: string, status: "APPROVED" | "REJECTED", note: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status, admin_note: note, approved_at: new Date().toISOString(), approver_name: "Owner" } : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_deposit", payload: { id, status, admin_note: note } }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: status === "APPROVED" ? "อนุมัติรายการฝากแล้ว" : "ปฏิเสธรายการแล้ว", description: `อัปเดตสถานะ Supabase เรียบร้อย` });
        fetchDeposits();
        fetchCounts();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เกิดข้อผิดพลาดในการเชื่อมต่อ", description: e.message, variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const header = ["วันที่", "ชื่อ", "รหัสสมาชิก", "เบอร์", "ยอด", "โปร", "สถานะ", "ผู้ดำเนินการ", "วันที่อนุมัติ", "หมายเหตุ"];
    const lines = filtered.map((r) => [
      fmtDT(r.created_at), r.member.full_name, r.member.member_id, r.member.phone,
      r.amount, r.promo_code ?? "-", r.status, r.approver_name ?? "-",
      r.approved_at ? fmtDT(r.approved_at) : "-", (r.admin_note ?? "-").replace(/[\n,]/g, " "),
    ].map((v) => `"${v}"`).join(","));
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `deposits-${tab.toLowerCase()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "ส่งออก CSV แล้ว", description: `${filtered.length} รายการ` });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="รายการฝากเงิน" description="ตารางคำขอฝากเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ">
        <RealtimeDot />
        <Btn variant="outline" className="rounded-full" onClick={exportCsv}><Download className="size-4" /> ส่งออกไฟล์</Btn>
      </PageHeader>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="max-w-full overflow-x-auto rounded-full bg-neutral-100 p-1">
              <TabsTrigger value="PENDING" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">รออนุมัติ ({counts.PENDING})</TabsTrigger>
              <TabsTrigger value="APPROVED" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">อนุมัติแล้ว ({counts.APPROVED})</TabsTrigger>
              <TabsTrigger value="REJECTED" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ปฏิเสธ ({counts.REJECTED})</TabsTrigger>
              <TabsTrigger value="ALL" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ทั้งหมด</TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchInput value={q} onChange={setQ} placeholder="ค้นหา ชื่อ / เบอร์ / รหัสสมาชิก" className="lg:w-72" />
        </div>
      </Panel>

      <Panel>
        <TableWrap className="min-w-[980px]">
          <thead>
            <tr>
              <Th>วันที่</Th><Th>สมาชิก</Th><Th>เบอร์</Th><Th>ธนาคาร</Th><Th>เลขบัญชี</Th>
              <Th className="text-right">ยอดฝาก</Th><Th>โปรโมชั่น</Th><Th>สถานะ</Th><Th>ผู้อนุมัติ</Th><Th>วันที่อนุมัติ</Th><Th className="sticky right-0 z-10 bg-neutral-100 text-right">จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-neutral-50/70">
                <Td className="whitespace-nowrap text-xs">{fmtDT(r.created_at)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={r.member.full_name} imageUrl={r.member.avatar_url} className="size-8" />
                    <div>
                      <p className="whitespace-nowrap font-medium text-neutral-800">{r.member.full_name}</p>
                      <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">{r.member.member_id}</span>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap font-mono text-xs">{r.member.phone}</Td>
                <Td><BankBadge code={r.member.bank_code} /></Td>
                <Td className="whitespace-nowrap font-mono text-xs">{r.member.bank_account_number}</Td>
                <Td className="whitespace-nowrap text-right font-bold text-brand-600">{fmtTHB(r.amount)}</Td>
                <Td>{r.promo_code ? (
                  <div className="min-w-0">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200">{r.promo_code}</span>
                    <p className="mt-0.5 max-w-36 truncate text-[11px] text-neutral-500" title={PROMO_DETAILS[r.promo_code]?.name}>{PROMO_DETAILS[r.promo_code]?.name ?? "—"}</p>
                  </div>
                ) : <span className="text-neutral-300">—</span>}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="whitespace-nowrap text-xs">{r.approver_name ?? <span className="text-neutral-300">—</span>}</Td>
                <Td className="whitespace-nowrap text-xs">{r.approved_at ? fmtDT(r.approved_at) : <span className="text-neutral-300">—</span>}</Td>
                <Td className="sticky right-0 z-10 bg-white">
                  <div className="flex items-center justify-end gap-1">
                    <Btn variant="outline" size="sm" className="size-8 rounded-full p-0" title="ดูสลิป" aria-label="ดูสลิป" onClick={() => setSlip(r)}><Eye className="size-4" /></Btn>
                    {r.status === "PENDING" ? (
                      <>
                        <Btn size="sm" className="size-8 rounded-full bg-brand-600 p-0 hover:bg-brand-700" title="อนุมัติ" aria-label="อนุมัติ" onClick={() => setAction({ req: r, mode: "approve" })}><Check className="size-4" /></Btn>
                        <Btn size="sm" variant="outline" className="size-8 rounded-full border-rose-200 p-0 text-rose-600 hover:bg-rose-50" title="ปฏิเสธ" aria-label="ปฏิเสธ" onClick={() => setAction({ req: r, mode: "reject" })}><X className="size-4" /></Btn>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {filtered.length === 0 ? <EmptyState title="ไม่พบรายการฝากในหมวดนี้" /> : null}
      </Panel>

      {slip ? <SlipModal req={slip} onClose={() => setSlip(null)} /> : null}
      {action ? (
        <ActionModal req={action.req} mode={action.mode} onClose={() => setAction(null)} onSubmit={(id, note) => update(id, action.mode === "approve" ? "APPROVED" : "REJECTED", note)} />
      ) : null}
    </div>
  );
}
