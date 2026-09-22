"use client";

import * as React from "react";
import { Copy, Check, X, Download, Ticket } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, SearchInput, TableWrap, Th, Td, EmptyState, Field, inputCls, PageHeader, RealtimeDot } from "../primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fmtTHB, fmtDT, bankOf, type WithdrawReq, type Member } from "@/data/admin-mock";
import { useAdminCounts, useAdminNav } from "../store";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
  const [note, setNote] = React.useState(req?.admin_note ?? "");
  const [showPromoDetail, setShowPromoDetail] = React.useState(false);
  const { toast } = useToast();

  if (!req) return null;

  const handleAction = (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !note.trim()) {
      toast({ title: "กรุณาระบุเหตุผล", description: "ต้องใส่เหตุผลก่อนปฏิเสธรายการถอน", variant: "destructive" });
      return;
    }
    onSubmit(req.id, status, note.trim() || (status === "APPROVED" ? "อนุมัติการถอนเงิน" : "ปฏิเสธรายการ"));
    onClose();
  };

  const hasPromo = Boolean(req.wallet?.has_promo || req.promo);
  const isTurnoverMet = req.wallet ? req.wallet.is_turnover_met : (!req.promo_hold || req.promo_hold <= 0);
  const remainingTurnover = req.wallet?.remaining_turnover ?? req.promo_hold ?? 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ข้อมูลการถอน</DialogTitle>
          <DialogDescription>ตรวจสอบบัญชีปลายทางและเงื่อนไขโปรโมชั่นก่อนอนุมัติ</DialogDescription>
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
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">ยอดถอน: </span>
              <span className="text-xl font-black text-rose-600">{fmtTHB(req.amount)}</span>
            </div>

            {/* Turnover & Promo Status Box */}
            {!hasPromo ? (
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-neutral-100/90 px-3 py-2 text-xs">
                <span className="text-neutral-500 font-medium">ยอดโปรที่ยังค้าง:</span>
                <span className="font-semibold text-neutral-700">ไม่มี (ไม่ได้รับโปร)</span>
              </div>
            ) : !isTurnoverMet ? (
              <div className="mt-2.5 space-y-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-inset ring-amber-300">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <Ticket className="size-3.5 text-amber-600" /> โปรโมชั่น: {req.promo?.title || "โปรโมชั่น"}
                  </span>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">ยังไม่ครบเทิร์น</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">ยอดโปรที่ยังค้าง:</span>
                  <span className="font-bold text-rose-600 font-mono">ค้างอีก {fmtTHB(remainingTurnover)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-amber-200/70 pt-1.5 text-[11px] text-amber-800/80">
                  <span>ทำเทิร์นแล้ว: {fmtTHB(req.wallet?.turnover_completed || 0)} / {fmtTHB(req.wallet?.turnover_required || 0)}</span>
                  <button
                    type="button"
                    onClick={() => setShowPromoDetail(!showPromoDetail)}
                    className="font-semibold underline hover:text-amber-950"
                  >
                    {showPromoDetail ? "ซ่อนเงื่อนไข" : "ดูเงื่อนไขโปร"}
                  </button>
                </div>
                {showPromoDetail && req.promo ? (
                  <div className="mt-1 space-y-0.5 rounded-lg bg-white/80 p-2 text-[11px] text-neutral-700 shadow-xs">
                    <p className="font-semibold text-neutral-800">{req.promo.title}</p>
                    <p>• โบนัส: {req.promo.bonus_rate}%</p>
                    <p>• เทิร์นโอเวอร์: {req.promo.turnover_multiplier} เท่า</p>
                    <p>• ถอนได้สูงสุด: {fmtTHB(req.promo.max_withdrawal)}</p>
                    <p>• เกมที่เล่นได้: {req.promo.allowed_game || "ทุกประเภท"}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-2.5 space-y-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 ring-1 ring-inset ring-emerald-300">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Ticket className="size-3.5 text-emerald-600" /> โปรโมชั่น: {req.promo?.title || "โปรโมชั่น"}
                  </span>
                  <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">ครบเทิร์นแล้ว</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">ยอดโปรที่ยังค้าง:</span>
                  <span className="font-bold text-emerald-700">ไม่มี (ยอดแทงครบแล้ว)</span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200/70 pt-1.5 text-[11px] text-emerald-800/80">
                  <span>ทำเทิร์นครบ {fmtTHB(req.wallet?.turnover_completed || 0)} บาท</span>
                  {req.promo ? (
                    <button
                      type="button"
                      onClick={() => setShowPromoDetail(!showPromoDetail)}
                      className="font-semibold underline hover:text-emerald-950"
                    >
                      {showPromoDetail ? "ซ่อนเงื่อนไข" : "ดูเงื่อนไข"}
                    </button>
                  ) : null}
                </div>
                {showPromoDetail && req.promo ? (
                  <div className="mt-1 space-y-0.5 rounded-lg bg-white/80 p-2 text-[11px] text-neutral-700 shadow-xs">
                    <p className="font-semibold text-neutral-800">{req.promo.title}</p>
                    <p>• โบนัส: {req.promo.bonus_rate}%</p>
                    <p>• เทิร์นโอเวอร์: {req.promo.turnover_multiplier} เท่า</p>
                    <p>• ถอนได้สูงสุด: {fmtTHB(req.promo.max_withdrawal)}</p>
                    <p>• เกมที่เล่นได้: {req.promo.allowed_game || "ทุกประเภท"}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {req.approved_at || req.approver_name ? (
            <div className="border-t border-neutral-200 pt-2.5 text-xs text-neutral-600 flex items-center justify-between">
              <span>ผู้อนุมัติ:</span>
              <span className="font-semibold text-neutral-800">{req.approver_name || "แอดมิน"}</span>
            </div>
          ) : null}
        </div>

        <Field label="หมายเหตุจากแอดมิน (จำเป็นเมื่อปฏิเสธ)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น อนุมัติการถอนเงินเรียบร้อย / เหตุผลการปฏิเสธ" className={cn(inputCls, "min-h-20 rounded-xl")} />
        </Field>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ปิด</Btn>
          {(req.status || "").toUpperCase() === "PENDING" ? (
            <>
              <Btn variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleAction("REJECTED")}><X className="size-4" /> ปฏิเสธ</Btn>
              <Btn className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction("APPROVED")}><Check className="size-4" /> อนุมัติ</Btn>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WithdrawalsPage() {
  const { toast } = useToast();
  const { fetchCounts, markRequestRead } = useAdminCounts();
  const { currentAdmin, selectedRequestId, clearSelectedRequest } = useAdminNav();
  const [rows, setRows] = React.useState<WithdrawReq[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [modal, setModal] = React.useState<{ req: WithdrawReq; mode: "view" | "approve" | "reject" } | null>(null);

  const openModal = React.useCallback((req: WithdrawReq, mode: "view" | "approve" | "reject") => {
    setModal({ req, mode });
    markRequestRead(req.id, "withdrawals");
  }, [markRequestRead]);

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
          status: ((w.status || "PENDING").toUpperCase()) as WithdrawReq["status"],
          bank_code: w.profiles?.bank_name || "KBANK",
          bank_account_number: w.profiles?.bank_account_number || "-",
          bank_account_name: w.profiles?.bank_account_name || "-",
          admin_note: w.admin_note,
          approved_at: w.approved_at,
          approver_name: w.approver_name || (w.approved_by ? "แอดมิน" : null),
          promo_hold: w.wallet?.remaining_turnover ?? null,
          wallet: w.wallet || null,
          promo: w.promo || null,
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

    const channel = supabase
      .channel("realtime:admin_withdrawals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdraw_requests" },
        () => {
          fetchWithdrawals();
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWithdrawals, fetchCounts]);

  React.useEffect(() => {
    if (selectedRequestId && rows.length > 0) {
      const target = rows.find((r) => r.id === selectedRequestId);
      if (target) {
        setTab("ALL");
        setModal({ req: target, mode: "view" });
        markRequestRead(target.id, "withdrawals");
        clearSelectedRequest();
      }
    }
  }, [selectedRequestId, rows, markRequestRead, clearSelectedRequest]);

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
    const adminName = currentAdmin?.full_name || "แอดมิน";
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status, admin_note: note, approved_at: new Date().toISOString(), approver_name: adminName } : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_withdrawal", 
          payload: { 
            id, 
            status, 
            admin_note: note,
            admin_id: currentAdmin?.id 
          } 
        }),
      });
      
      if (res.status === 504) {
        toast({ title: "ระบบกำลังประมวลผล", description: "รายการกำลังถูกประมวลผลในเบื้องหลังเนื่องจากมีข้อมูลจำนวนมาก กรุณารอสักครู่และรีเฟรชหน้าจอ", duration: 5000 });
        setTimeout(() => { fetchWithdrawals(); fetchCounts(); }, 3000);
        return;
      }
      
      if (!res.ok && res.status !== 200) {
        const text = await res.text().catch(() => "");
        if (text.includes("<!DOCTYPE")) {
          throw new Error(`Server returned HTML error (${res.status})`);
        }
      }

      const json = await res.json();
      if (json.success) {
        toast({ title: status === "APPROVED" ? "อนุมัติรายการสำเร็จ" : "ปฏิเสธรายการแล้ว", description: `อัปเดตสถานะ Supabase เรียบร้อย โดย ${adminName}` });
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

  const pendingAmount = rows.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0);
  const approvedAmount = rows.filter((r) => r.status === "APPROVED").reduce((s, r) => s + r.amount, 0);
  const todayYmd = new Date().toISOString().slice(0, 10);
  const todayPaid = rows.filter((r) => r.status === "APPROVED" && (r.created_at || "").startsWith(todayYmd));
  const todayPaidAmount = todayPaid.reduce((s, r) => s + r.amount, 0);
  const todayPaidCount = todayPaid.length;
  const successRate = rows.length > 0 ? Math.round((counts.APPROVED / (counts.APPROVED + counts.REJECTED || 1)) * 100) : 100;

  return (
    <div className="space-y-4">
      <PageHeader title="รายการถอนเงิน" description="ตารางคำขอถอนเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ">
        <RealtimeDot />
        <Btn variant="outline" className="rounded-full" onClick={exportCsv}><Download className="size-4" /> ส่งออกไฟล์</Btn>
      </PageHeader>

      {/* PC Mini-Dashboard KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Panel className="border-amber-200/60 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">รออนุมัติ</span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-800">{counts.PENDING} รายการ</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-amber-900">{fmtTHB(pendingAmount)}</p>
          <p className="mt-1 text-[11px] text-amber-700/80">ตรวจสอบเลขบัญชีก่อนอนุมัติ</p>
        </Panel>
        <Panel className="border-rose-200/60 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">อนุมัติแล้ววันนี้</span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-black text-rose-800">{todayPaidCount} รายการ</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-rose-900">{fmtTHB(todayPaidAmount)}</p>
          <p className="mt-1 text-[11px] text-rose-700/80">ยอดอนุมัติจ่ายวันนี้</p>
        </Panel>
        <Panel className="border-brand-200/60 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-700">ยอดถอนสะสมรวม</span>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-black text-brand-800">{counts.APPROVED} รายการ</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-brand-950">{fmtTHB(approvedAmount)}</p>
          <p className="mt-1 text-[11px] text-brand-700/80">ยอดถอนทั้งหมดที่อนุมัติ</p>
        </Panel>
        <Panel className="border-sky-200/60 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700">อัตราสำเร็จ</span>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-800">{successRate}%</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-sky-900">{counts.APPROVED} / {rows.length}</p>
          <p className="mt-1 text-[11px] text-sky-700/80">ปฏิเสธ {counts.REJECTED} รายการ (คืนเครดิต)</p>
        </Panel>
      </div>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-full bg-neutral-100 p-1">
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
        <TableWrap className="min-w-[860px]">
          <thead>
            <tr>
              <Th>วันที่</Th>
              <Th>สมาชิก</Th>
              <Th className="text-right">ยอดถอน</Th>
              <Th className="text-center">สถานะ</Th>
              <Th>ธนาคาร & เลขบัญชี</Th>
              <Th>ชื่อบัญชี</Th>
              <Th>ผู้อนุมัติ</Th>
              <Th className="text-right">จัดการรายการ</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isPending = (r.status || "").toUpperCase() === "PENDING";
              return (
                <tr key={r.id} className="transition-colors hover:bg-neutral-50/70">
                  <Td className="whitespace-nowrap text-xs text-neutral-600 font-mono">{fmtDT(r.created_at)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={r.member.full_name} imageUrl={r.member.avatar_url} className="size-8 shrink-0" />
                      <div>
                        <p className="whitespace-nowrap font-semibold text-neutral-900">{r.member.full_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="rounded-full bg-neutral-100 px-1.5 py-0.2 text-[10px] font-bold text-neutral-500 font-mono">{r.member.member_id}</span>
                          <span className="text-[11px] text-neutral-400 font-mono">{r.member.phone}</span>
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <span className="text-base font-black text-rose-600 font-mono tracking-tight">{fmtTHB(r.amount)}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <BankBadge code={r.bank_code} />
                      <div className="flex items-center gap-1">
                        <span className="whitespace-nowrap font-mono text-xs font-semibold text-neutral-800">{r.bank_account_number}</span>
                        <CopyBtn text={r.bank_account_number} label="เลขบัญชี" />
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-xs font-medium text-neutral-700">{r.bank_account_name}</Td>
                  <Td className="whitespace-nowrap text-xs text-neutral-500">
                    <div>
                      <span>{r.approver_name ?? <span className="text-neutral-300">—</span>}</span>
                      {r.admin_note ? (
                        <p className="max-w-36 truncate text-[10px] text-neutral-400" title={r.admin_note}>{r.admin_note}</p>
                      ) : null}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isPending ? (
                        <>
                          <Btn
                            size="sm"
                            className="h-8 gap-1.5 rounded-full bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                            title="กดอนุมัติคำขอถอนเงินให้สมาชิก"
                            onClick={() => openModal(r, "approve")}
                          >
                            <Check className="size-3.5" /> อนุมัติ
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 rounded-full border-rose-200 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            title="ปฏิเสธคำขอถอนเงินและคืนเครดิต"
                            onClick={() => openModal(r, "reject")}
                          >
                            <X className="size-3.5" /> ปฏิเสธ
                          </Btn>
                          <Btn
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1 rounded-full px-2 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                            title="ดูรายละเอียดบัญชีและข้อมูลสมาชิก"
                            onClick={() => openModal(r, "view")}
                          >
                            <Copy className="size-3.5" /> บัญชี
                          </Btn>
                        </>
                      ) : (
                        <Btn
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                          title="ดูรายละเอียดการทำรายการ"
                          onClick={() => openModal(r, "view")}
                        >
                          <Copy className="size-3.5" /> ดูข้อมูล
                        </Btn>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
        {filtered.length === 0 ? <EmptyState title="ไม่พบรายการถอนในหมวดนี้" /> : null}
      </Panel>

      {modal ? <DetailModal key={modal.req.id} req={modal.req} mode={modal.mode} onClose={() => setModal(null)} onSubmit={update} /> : null}
    </div>
  );
}
