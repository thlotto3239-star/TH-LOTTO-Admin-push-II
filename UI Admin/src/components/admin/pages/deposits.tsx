"use client";

import * as React from "react";
import { Eye, Check, X, Download, Ticket } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, SearchInput, TableWrap, Th, Td, EmptyState, Field, inputCls, PageHeader, RealtimeDot } from "../primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fmtTHB, fmtDT, type DepositReq, PROMO_DETAILS } from "@/data/admin-mock";
import { useAdminCounts, useAdminNav } from "../store";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

// ─── Slip preview (image modal) ──────────────────────────────────────────────
function SlipModal({ req, onClose }: { req: DepositReq | null; onClose: () => void }) {
  if (!req) return null;
  const t = new Date(req.created_at);
  const promo: any = req.promo || (req.promo_code ? (PROMO_DETAILS as any)[req.promo_code] : null);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สลิปการโอนเงิน</DialogTitle>
          <DialogDescription>ตรวจสอบสลิปและเงื่อนไขโปรโมชั่นก่อนอนุมัติ</DialogDescription>
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

            {/* Promotion terms & conditions badge */}
            {promo ? (
              <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-950">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Ticket className="size-4 text-emerald-600 shrink-0" />
                    <span>โปรโมชั่น: {promo.title || promo.name || req.promo_code}</span>
                  </span>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    +{promo.bonus_rate || 50}%
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-emerald-900 border-t border-emerald-200/70 pt-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">โบนัสที่ได้รับ:</span>
                    <span className="font-bold">+{fmtTHB((req.amount * Number(promo.bonus_rate || 50)) / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">เงื่อนไขยอดเทิร์น:</span>
                    <span className="font-bold">{promo.turnover_multiplier || 8} เท่า ({fmtTHB(req.amount * Number(promo.turnover_multiplier || 8))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">ถอนได้สูงสุด:</span>
                    <span className="font-bold">{promo.max_withdrawal ? fmtTHB(Number(promo.max_withdrawal)) : "ไม่จำกัด"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">เกมที่ร่วมรายการ:</span>
                    <span className="font-bold">{promo.allowed_game || "ทุกประเภท"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-neutral-100/90 px-3 py-2 text-xs text-neutral-600">
                <span className="text-neutral-500 font-medium">เงื่อนไขโปรโมชั่น:</span>
                <span className="font-semibold text-neutral-700">ฝากปกติ (ไม่ได้รับโปร / ไม่ติดเทิร์น)</span>
              </div>
            )}

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
  const promo: any = req?.promo || (req?.promo_code ? (PROMO_DETAILS as any)[req.promo_code] : null);

  React.useEffect(() => setNote(""), [req, mode]);

  if (!req) return null;
  const isApprove = mode === "approve";

  const submit = () => {
    if (!isApprove && !note.trim()) {
      toast({ title: "กรุณาระบุเหตุผล", description: "ต้องใส่เหตุผลก่อนปฏิเสธรายการ", variant: "destructive" });
      return;
    }
    onSubmit(req.id, note.trim() || (isApprove ? "อนุมัติรายการฝาก" : "ปฏิเสธรายการฝาก"));
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
            <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200 text-emerald-950">
              <p className="flex items-center justify-between text-sm font-semibold text-emerald-800">
                <span className="flex items-center gap-1.5"><Ticket className="size-4 text-emerald-600" /> โปรโมชั่น: {promo.title || promo.name || req.promo_code}</span>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">+{promo.bonus_rate || 50}%</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-emerald-900 border-t border-emerald-200/70 pt-2">
                <span>โบนัส: +{promo.bonus_rate || 50}% (+{fmtTHB((req.amount * Number(promo.bonus_rate || 50)) / 100)})</span>
                <span>ต้องทำยอด: {promo.turnover_multiplier || 8} เท่า</span>
                <span>ยอดเทิร์น: {fmtTHB(req.amount * Number(promo.turnover_multiplier || 8))}</span>
                <span>ถอนได้สูงสุด: {promo.max_withdrawal ? fmtTHB(Number(promo.max_withdrawal)) : "ไม่จำกัด"}</span>
                <span className="col-span-2">เกมที่ร่วมรายการ: {promo.allowed_game || "ทุกประเภท"}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-100/90 px-3 py-2 text-xs text-neutral-600 flex justify-between">
              <span>เงื่อนไขโปรโมชั่น:</span>
              <span className="font-semibold text-neutral-700">ฝากปกติ (ไม่ได้รับโปร / ไม่ติดเทิร์น)</span>
            </div>
          )}
        </div>

        <Field label={`หมายเหตุ ${isApprove ? "(ไม่บังคับ)" : "(จำเป็น)"}`}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={isApprove ? "หมายเหตุถึงสมาชิก (ถ้ามี)" : "เช่น สลิปไม่ชัด กรุณาส่งใหม่"} className={cn(inputCls, "min-h-20 rounded-xl")} />
        </Field>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          {isApprove ? (
            <Btn className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submit}><Check className="size-4" /> อนุมัติ</Btn>
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
  const { fetchCounts, markRequestRead } = useAdminCounts();
  const { currentAdmin, selectedRequestId, clearSelectedRequest } = useAdminNav();
  const [rows, setRows] = React.useState<DepositReq[]>([]);
  const [tab, setTab] = React.useState("ALL");
  const [q, setQ] = React.useState("");
  const [slip, setSlip] = React.useState<DepositReq | null>(null);
  const [action, setAction] = React.useState<{ req: DepositReq; mode: "approve" | "reject" } | null>(null);

  const openSlip = React.useCallback((req: DepositReq) => {
    setSlip(req);
    markRequestRead(req.id, "deposits");
  }, [markRequestRead]);

  const openAction = React.useCallback((req: DepositReq, mode: "approve" | "reject") => {
    setAction({ req, mode });
    markRequestRead(req.id, "deposits");
  }, [markRequestRead]);

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
          promo: d.promo || null,
          slip_url: d.slip_url,
          admin_note: d.admin_note,
          approved_at: d.approved_at,
          approver_name: d.approver_name || (d.approved_by ? "แอดมิน" : null),
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

    const channel = supabase
      .channel("realtime:admin_deposits")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposit_requests" },
        () => {
          fetchDeposits();
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDeposits, fetchCounts]);

  React.useEffect(() => {
    if (selectedRequestId && rows.length > 0) {
      const target = rows.find((r) => r.id === selectedRequestId);
      if (target) {
        setTab("ALL");
        setSlip(target);
        markRequestRead(target.id, "deposits");
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
      return (
        r.member.full_name.toLowerCase().includes(s) ||
        r.member.phone.includes(s) ||
        r.member.member_id.toLowerCase().includes(s)
      );
    });

  const update = async (id: string, status: "APPROVED" | "REJECTED", note: string) => {
    const adminName = currentAdmin?.full_name || "แอดมิน";
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status, admin_note: note, approved_at: new Date().toISOString(), approver_name: adminName } : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_deposit", 
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
        setTimeout(() => { fetchDeposits(); fetchCounts(); }, 3000);
        return;
      }
      
      if (!res.ok && res.status !== 200) {
        // Fallback for other non-200 html pages
        const text = await res.text().catch(() => "");
        if (text.includes("<!DOCTYPE")) {
          throw new Error(`Server returned HTML error (${res.status})`);
        }
      }

      const json = await res.json();
      if (json.success) {
        toast({ title: status === "APPROVED" ? "อนุมัติรายการฝากแล้ว" : "ปฏิเสธรายการแล้ว", description: `อัปเดตสถานะ Supabase เรียบร้อย โดย ${adminName}` });
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

  const pendingAmount = rows.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0);
  const approvedAmount = rows.filter((r) => r.status === "APPROVED").reduce((s, r) => s + r.amount, 0);
  const todayYmd = new Date().toISOString().slice(0, 10);
  const todayApproved = rows.filter((r) => r.status === "APPROVED" && (r.created_at || "").startsWith(todayYmd));
  const todayAmount = todayApproved.reduce((s, r) => s + r.amount, 0);
  const todayCount = todayApproved.length;
  const approvalRate = rows.length > 0 ? Math.round((counts.APPROVED / rows.length) * 100) : 100;

  return (
    <div className="space-y-4">
      <PageHeader title="รายการฝากเงิน" description="ตารางคำขอฝากเงิน · เชื่อมต่อข้อมูลสดอัตโนมัติ">
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
          <p className="mt-1 text-[11px] text-amber-700/80">ตรวจสลิปก่อนกดยืนยัน</p>
        </Panel>
        <Panel className="border-emerald-200/60 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">อนุมัติแล้ววันนี้</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-800">{todayCount} รายการ</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-emerald-900">{fmtTHB(todayAmount)}</p>
          <p className="mt-1 text-[11px] text-emerald-700/80">เครดิตเข้ากระเป๋าสมาชิกแล้ว</p>
        </Panel>
        <Panel className="border-brand-200/60 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-700">ยอดฝากรวมสำเร็จ</span>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-black text-brand-800">{counts.APPROVED} รายการ</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-brand-950">{fmtTHB(approvedAmount)}</p>
          <p className="mt-1 text-[11px] text-brand-700/80">ยอดเงินหมุนเวียนจริง</p>
        </Panel>
        <Panel className="border-sky-200/60 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700">อัตราการอนุมัติ</span>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-800">{approvalRate}%</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-sky-900">{counts.APPROVED} / {rows.length}</p>
          <p className="mt-1 text-[11px] text-sky-700/80">ปฏิเสธ {counts.REJECTED} รายการ</p>
        </Panel>
      </div>

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
        <TableWrap className="min-w-[860px]">
          <thead>
            <tr>
              <Th>วันที่</Th>
              <Th>สมาชิก</Th>
              <Th className="text-right">ยอดฝาก</Th>
              <Th className="text-center">สถานะ</Th>
              <Th>โปรโมชั่น</Th>
              <Th>ธนาคาร & บัญชี</Th>
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
                    <span className="text-base font-black text-brand-600 font-mono tracking-tight">{fmtTHB(r.amount)}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td>
                    {r.promo_code ? (
                      <div className="min-w-0">
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200">{r.promo_code}</span>
                        <p className="mt-0.5 max-w-36 truncate text-[11px] text-neutral-500" title={PROMO_DETAILS[r.promo_code]?.name}>{PROMO_DETAILS[r.promo_code]?.name ?? "—"}</p>
                      </div>
                    ) : <span className="text-neutral-300">—</span>}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <BankBadge code={r.member.bank_code} />
                      <span className="whitespace-nowrap font-mono text-xs font-semibold text-neutral-800">{r.member.bank_account_number}</span>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-neutral-500">
                    <div>
                      <span>{r.approver_name ?? <span className="text-neutral-300">—</span>}</span>
                      {r.approved_at ? <p className="text-[10px] text-neutral-400 font-mono">{fmtDT(r.approved_at)}</p> : null}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Btn
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 rounded-full px-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                        title="ดูสลิปการโอนเงิน"
                        onClick={() => openSlip(r)}
                      >
                        <Eye className="size-3.5 text-brand-600" /> สลิป
                      </Btn>
                      {isPending ? (
                        <>
                          <Btn
                            size="sm"
                            className="h-8 gap-1 rounded-full bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                            title="อนุมัติรายการฝากเงินเข้ากระเป๋าสมาชิก"
                            onClick={() => openAction(r, "approve")}
                          >
                            <Check className="size-3.5" /> อนุมัติ
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 rounded-full border-rose-200 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            title="ปฏิเสธรายการฝาก"
                            onClick={() => openAction(r, "reject")}
                          >
                            <X className="size-3.5" /> ปฏิเสธ
                          </Btn>
                        </>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              );
            })}
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
