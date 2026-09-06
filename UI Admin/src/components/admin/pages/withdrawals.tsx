"use client";

import * as React from "react";
import { Copy, Check, X, Download } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, SearchInput, TableWrap, Th, Td, EmptyState, Field, inputCls, PageHeader, RealtimeDot } from "../primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fmtTHB, fmtDT, bankOf, type WithdrawReq, type Member } from "@/data/admin-mock";
import { useAdminCounts } from "../store";
import { cn } from "@/lib/utils";

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  return (
    <Btn
      variant="ghost"
      size="sm"
      className="h-7 gap-1 rounded-full px-2 text-[11px] text-neutral-500 hover:bg-neutral-100 hover:text-brand-700"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard ไม่พร้อมในบริบททดสอบ */ }
        setCopied(true);
        toast({ title: "คัดลอกแล้ว", description: `${label ?? "ข้อมูล"}: ${text}` });
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3 text-brand-600" /> : <Copy className="size-3" />}
      คัดลอก
    </Btn>
  );
}

function DetailModal({
  req, mode, onClose, onSubmit,
}: {
  req: WithdrawReq | null;
  mode: "view" | "approve" | "reject";
  onClose: () => void;
  onSubmit: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
}) {
  const [note, setNote] = React.useState("");
  const { toast } = useToast();
  React.useEffect(() => setNote(req?.admin_note ?? ""), [req]);

  if (!req) return null;

  const handleAction = (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !note.trim()) {
      toast({ title: "กรุณาระบุเหตุผล", description: "ต้องใส่เหตุผลก่อนปฏิเสธรายการถอน", variant: "destructive" });
      return;
    }
    onSubmit(req.id, status, note.trim() || (status === "APPROVED" ? "โอนเงินสำเร็จ" : "ปฏิเสธรายการ"));
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ข้อมูลการถอน</DialogTitle>
          <DialogDescription>ตรวจสอบบัญชีปลายทางก่อนโอนเงินให้สมาชิก</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-neutral-400">ชื่อ</span><span className="font-medium text-neutral-800">{req.member.full_name}</span>
            <span className="text-neutral-400">รหัสสมาชิก</span><span className="font-mono text-neutral-800">{req.member.member_id}</span>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <BankBadge code={req.bank_code} />
              <CopyBtn text={bankOf(req.bank_code).name} label="ชื่อธนาคาร" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-neutral-800">{req.bank_account_number}</span>
              <CopyBtn text={req.bank_account_number} label="เลขบัญชี" />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-neutral-700">{req.bank_account_name}</span>
              <CopyBtn text={req.bank_account_name} label="ชื่อบัญชี" />
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-3">
            <span className="text-neutral-400">ยอดถอน: </span>
            <span className="text-xl font-black text-rose-600">{fmtTHB(req.amount)}</span>
            {req.promo_hold && req.promo_hold > 0 ? (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                ยอดโปรที่ยังค้าง (ยอดแทงยังไม่ครบ): {fmtTHB(req.promo_hold)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">ยอดโปรที่ยังค้าง: ไม่มี (ยอดแทงครบแล้ว)</p>
            )}
          </div>
        </div>

        <Field label="หมายเหตุจากแอดมิน (จำเป็นเมื่อปฏิเสธ)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น โอนผ่าน PromptPay / เหตุผลการปฏิเสธ" className={cn(inputCls, "min-h-20 rounded-xl")} />
        </Field>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ปิด</Btn>
          {req.status === "PENDING" ? (
            <>
              <Btn variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleAction("REJECTED")}><X className="size-4" /> ปฏิเสธ</Btn>
              <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={() => handleAction("APPROVED")}><Check className="size-4" /> โอนแล้ว/อนุมัติ</Btn>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WithdrawalsPage() {
  const { toast } = useToast();
  const { fetchCounts } = useAdminCounts();
  const [rows, setRows] = React.useState<WithdrawReq[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [modal, setModal] = React.useState<{ req: WithdrawReq; mode: "view" | "approve" | "reject" } | null>(null);

  const fetchWithdrawals = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data?resource=withdrawals");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: WithdrawReq[] = json.data.map((w: any) => ({
          id: w.id,
          created_at: w.created_at,
          amount: Number(w.amount),
          status: w.status as WithdrawReq["status"],
          bank_code: w.profiles?.bank_name || "KBANK",
          bank_account_number: w.profiles?.bank_account_number || "-",
          bank_account_name: w.profiles?.bank_account_name || "-",
          admin_note: w.admin_note,
          approved_at: w.approved_at,
          approver_name: w.approved_by ? "Admin" : null,
          member: {
            full_name: w.profiles?.full_name || "สมาชิก",
            member_id: w.profiles?.member_id || (w.user_id ? w.user_id.slice(0, 8) : "MB"),
            phone: w.profiles?.phone || "-",
            avatar_url: w.profiles?.avatar_url || null,
          } as Member,
        }));
        setRows(mapped);
      }
    } catch (e) {
      console.error("Failed to load withdrawals:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

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
      return r.member.full_name.toLowerCase().includes(s) || r.member.phone.includes(s) || r.member.member_id.toLowerCase().includes(s);
    });

  const update = async (id: string, status: "APPROVED" | "REJECTED", note: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status, admin_note: note, approved_at: new Date().toISOString(), approver_name: "Owner" } : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_withdrawal", payload: { id, status, admin_note: note } }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: status === "APPROVED" ? "ทำเครื่องหมายโอนแล้ว" : "ปฏิเสธรายการแล้ว", description: `อัปเดตสถานะ Supabase เรียบร้อย` });
        fetchWithdrawals();
        fetchCounts();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const header = ["วันที่", "ชื่อ", "รหัสสมาชิก", "เบอร์", "ยอด", "ธนาคาร", "เลขบัญชี", "ชื่อบัญชี", "สถานะ", "ผู้ดำเนินการ", "วันที่อนุมัติ", "หมายเหตุ"];
    const lines = filtered.map((r) => [
      fmtDT(r.created_at), r.member.full_name, r.member.member_id, r.member.phone, r.amount,
      bankOf(r.bank_code).name, r.bank_account_number, r.bank_account_name, r.status,
      r.approver_name ?? "-", r.approved_at ? fmtDT(r.approved_at) : "-", (r.admin_note ?? "-").replace(/[\n,]/g, " "),
    ].map((v) => `"${v}"`).join(","));
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `withdrawals-${tab.toLowerCase()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "ส่งออก CSV แล้ว", description: `${filtered.length} รายการ` });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="รายการถอนเงิน" description="ตารางคำขอถอนเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ">
        <RealtimeDot />
        <Btn variant="outline" className="rounded-full" onClick={exportCsv}><Download className="size-4" /> ส่งออกไฟล์</Btn>
      </PageHeader>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-full bg-neutral-100 p-1">
              <TabsTrigger value="PENDING" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">รอโอน ({counts.PENDING})</TabsTrigger>
              <TabsTrigger value="APPROVED" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">โอนแล้ว ({counts.APPROVED})</TabsTrigger>
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
              <Th>วันที่</Th><Th>สมาชิก</Th><Th>เบอร์</Th><Th>ธนาคาร</Th><Th>เลขบัญชี</Th><Th>ชื่อบัญชี</Th>
              <Th className="text-right">ยอดถอน</Th><Th>สถานะ</Th><Th>ผู้อนุมัติ</Th><Th>หมายเหตุ</Th><Th className="sticky right-0 z-10 bg-neutral-100 text-right">จัดการ</Th>
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
                <Td><BankBadge code={r.bank_code} /></Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap font-mono text-xs">{r.bank_account_number}</span>
                    <CopyBtn text={r.bank_account_number} label="เลขบัญชี" />
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-xs">{r.bank_account_name}</Td>
                <Td className="whitespace-nowrap text-right font-bold text-rose-600">{fmtTHB(r.amount)}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="whitespace-nowrap text-xs">{r.approver_name ?? <span className="text-neutral-300">—</span>}</Td>
                <Td className="max-w-40 text-xs"><span className="block truncate" title={r.admin_note ?? ""}>{r.admin_note ?? <span className="text-neutral-300">—</span>}</span></Td>
                <Td className="sticky right-0 z-10 bg-white">
                  <div className="flex items-center justify-end gap-1">
                    {r.status === "PENDING" ? (
                      <>
                        <Btn size="sm" className="size-8 rounded-full bg-brand-600 p-0 hover:bg-brand-700" title="โอนแล้ว/อนุมัติ" aria-label="โอนแล้วอนุมัติ" onClick={() => setModal({ req: r, mode: "approve" })}><Check className="size-4" /></Btn>
                        <Btn size="sm" variant="outline" className="size-8 rounded-full border-rose-200 p-0 text-rose-600 hover:bg-rose-50" title="ปฏิเสธ" aria-label="ปฏิเสธ" onClick={() => setModal({ req: r, mode: "reject" })}><X className="size-4" /></Btn>
                      </>
                    ) : (
                      <Btn variant="outline" size="sm" className="size-8 rounded-full p-0" title="รายละเอียด" aria-label="รายละเอียด" onClick={() => setModal({ req: r, mode: "view" })}><Copy className="size-4" /></Btn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {filtered.length === 0 ? <EmptyState title="ไม่พบรายการถอนในหมวดนี้" /> : null}
      </Panel>

      {modal ? <DetailModal req={modal.req} mode={modal.mode} onClose={() => setModal(null)} onSubmit={update} /> : null}
    </div>
  );
}
