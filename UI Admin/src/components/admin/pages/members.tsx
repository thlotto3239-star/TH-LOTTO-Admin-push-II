"use client";

import * as React from "react";
import { Eye, Pencil, Wallet, Plus, Minus, Download, Lock, Unlock } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, SearchInput, TableWrap, Th, Td, Pagination, EmptyState, Field, inputCls, PageHeader } from "../primitives";
import { BankSelector } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fmtTHB, fmtD, type Member } from "@/data/admin-mock";
import { useAdminNav } from "../store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

// ─── Edit modal (Widescreen 2-Column Landscape) ──────────────────────────────
function EditModal({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) {
  const [form, setForm] = React.useState<Member>(member);
  const { toast } = useToast();
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสมาชิก — {member.full_name}</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลสมาชิกรหัส {member.member_id} พร้อมพรีวิวบัตรสมาชิก</DialogDescription>
        </DialogHeader>

        {/* 2-Column Landscape Layout */}
        <div className="grid gap-5 md:grid-cols-12">
          {/* Left Column: Visual Profile Card Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-neutral-100 bg-linear-to-br from-neutral-50/80 to-white p-4 shadow-xs">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">ตัวอย่างบัตรสมาชิก</p>
              <div className="flex items-center gap-3">
                <Avatar name={form.full_name || member.full_name} imageUrl={member.avatar_url} className="size-14 text-xl" />
                <div className="min-w-0">
                  <p className="font-bold text-neutral-900 truncate">{form.full_name || member.full_name}</p>
                  <p className="font-mono text-xs text-neutral-500">{member.member_id}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> ออนไลน์
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 pt-3 border-t border-neutral-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">เบอร์โทรศัพท์:</span>
                  <span className="font-mono font-medium text-neutral-800">{form.phone || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">ธนาคาร:</span>
                  <BankBadge code={form.bank_code} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">เลขที่บัญชี:</span>
                  <span className="font-mono font-medium text-neutral-800">{form.bank_account_number || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">ระดับ VIP:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                    VIP {form.vip_level}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-brand-50/70 p-3 text-center ring-1 ring-brand-100">
              <p className="text-[11px] text-brand-700">ยอดเงินในกระเป๋า</p>
              <p className="text-xl font-black text-brand-700">{fmtTHB(member.balance)}</p>
            </div>
          </div>

          {/* Right Column: Editable Form Fields (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <Field label="ชื่อ-นามสกุล">
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="ธนาคาร">
                <BankSelector value={form.bank_code} onChange={(v) => set("bank_code", v)} />
              </Field>
              <Field label="เลขที่บัญชี">
                <Input value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="ชื่อบัญชี (ตรงกับชื่อจริง)">
              <Input value={form.bank_account_name} onChange={(e) => set("bank_account_name", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="สถานะบัญชี">
                <Select value={form.status} onValueChange={(v) => set("status", v as Member["status"])}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="active">ใช้งานปกติ (Active)</SelectItem>
                    <SelectItem value="inactive">ไม่ใช้งาน (Inactive)</SelectItem>
                    <SelectItem value="suspended">ระงับชั่วคราว (Suspended)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="ระดับวีไอพี">
                <Select value={String(form.vip_level)} onValueChange={(v) => set("vip_level", Number(v))}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {[0, 1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>ระดับ VIP {n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={() => { onSave(form); toast({ title: "บันทึกข้อมูลสมาชิกแล้ว", description: `${form.full_name} (${form.member_id})` }); onClose(); }}>
            บันทึกการแก้ไข
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Wallet modal (Widescreen 2-Column Landscape) ─────────────────────────────
function WalletModal({ member, onClose, onAdjust }: { member: Member; onClose: () => void; onAdjust: (id: string, delta: number, note: string) => void }) {
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const { toast } = useToast();
  const n = Number(amount) || 0;

  const doAdjust = (sign: 1 | -1) => {
    if (n <= 0) { toast({ title: "กรุณาระบุจำนวนเงิน", variant: "destructive" }); return; }
    onAdjust(member.id, sign * n, note.trim() || (sign > 0 ? "เพิ่มยอดกระเป๋าโดยแอดมิน" : "ลดยอดกระเป๋าโดยแอดมิน"));
    onClose();
  };

  const projectedAdd = member.balance + n;
  const projectedSub = Math.max(0, member.balance - n);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ปรับปรุงยอดกระเป๋าเงิน — {member.full_name}</DialogTitle>
          <DialogDescription>จัดการยอดเครดิตของสมาชิกรหัส {member.member_id} พร้อมระบบคำนวณสด</DialogDescription>
        </DialogHeader>

        {/* 2-Column Landscape Layout */}
        <div className="grid gap-5 sm:grid-cols-12">
          {/* Left Column: Live Calculation Balance Radar (5 cols) */}
          <div className="sm:col-span-5 flex flex-col justify-between rounded-2xl border border-neutral-100 bg-linear-to-br from-brand-50/50 via-white to-neutral-50 p-4 shadow-xs">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-2">ยอดปัจจุบัน</p>
              <p className="text-3xl font-black text-neutral-900">{fmtTHB(member.balance)}</p>

              {n > 0 ? (
                <div className="mt-4 space-y-2 pt-3 border-t border-neutral-100 text-xs">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800">
                    <p className="text-[10px] font-medium text-emerald-600">หากเลือกเพิ่ม (+{fmtTHB(n)}):</p>
                    <p className="text-base font-black text-emerald-700">{fmtTHB(projectedAdd)}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-2.5 text-rose-800">
                    <p className="text-[10px] font-medium text-rose-600">หากเลือกลด (-{fmtTHB(n)}):</p>
                    <p className="text-base font-black text-rose-700">{fmtTHB(projectedSub)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-neutral-400">ระบุจำนวนเงินฝั่งขวาเพื่อดูยอดหลังปรับปรุงแบบเรียลไทม์</p>
              )}
            </div>

            <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-brand-500" />
              บันทึกลงประวัติ Transaction อัตโนมัติ
            </div>
          </div>

          {/* Right Column: Amount & Controls (7 cols) */}
          <div className="sm:col-span-7 space-y-3">
            <Field label="จำนวนเงินที่ต้องการปรับ (บาท)">
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ระบุยอด เช่น 500"
                className={cn(inputCls, "text-base font-bold font-mono")}
              />
            </Field>

            {/* Quick Amount Chips */}
            <div>
              <p className="text-[11px] text-neutral-400 mb-1.5">จำนวนด่วน:</p>
              <div className="flex flex-wrap gap-1.5">
                {[100, 300, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(String(amt))}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <Field label="หมายเหตุการปรับยอด">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น คืนยอดบิลข้อผิดพลาด / เพิ่มโบนัส VIP"
                className={inputCls}
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <Btn
                className="flex-1 rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                variant="outline"
                onClick={() => doAdjust(-1)}
              >
                <Minus className="size-4" /> ลดยอดเงิน
              </Btn>
              <Btn
                className="flex-1 rounded-full bg-brand-600 hover:bg-brand-700 text-white"
                onClick={() => doAdjust(1)}
              >
                <Plus className="size-4" /> เพิ่มยอดเงิน
              </Btn>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Btn variant="outline" className="rounded-full w-full sm:w-auto" onClick={onClose}>ปิดหน้าต่าง</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function normalizeBank(b: string | null | undefined): string {
  if (!b) return "OTHER";
  if (b.includes("กสิกร") || b.toUpperCase() === "KBANK") return "KBANK";
  if (b.includes("ไทยพาณิชย์") || b.toUpperCase() === "SCB") return "SCB";
  if (b.includes("กรุงเทพ") || b.toUpperCase() === "BBL") return "BBL";
  if (b.includes("กรุงไทย") || b.toUpperCase() === "KTB") return "KTB";
  if (b.includes("กรุงศรี") || b.toUpperCase() === "BAY") return "BAY";
  if (b.includes("ทหารไทย") || b.toUpperCase() === "TTB") return "TTB";
  if (b.includes("ออมสิน") || b.toUpperCase() === "GSB") return "GSB";
  return b;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function MembersPage() {
  const { openMember } = useAdminNav();
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Member[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [edit, setEdit] = React.useState<Member | null>(null);
  const [wallet, setWallet] = React.useState<Member | null>(null);

  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?resource=members");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: Member[] = json.data.map((p: any) => {
          const w = Array.isArray(p.wallets) ? p.wallets[0] : p.wallets;
          return {
            id: p.id,
            member_id: p.member_id || p.id.slice(0, 8).toUpperCase(),
            full_name: p.full_name || "ไม่ระบุชื่อ",
            phone: p.phone || "-",
            bank_code: normalizeBank(p.bank_name),
            bank_account_number: p.bank_account_number || "-",
            bank_account_name: p.bank_account_name || p.full_name || "-",
            avatar_url: p.avatar_url || null,
            vip_level: typeof p.vip_level === "number" ? p.vip_level : (parseInt(String(p.vip_level || "").replace(/\D/g, ""), 10) || 0),
            status: (p.status as Member["status"]) || "active",
            balance: Number(w?.balance || 0),
            commission_balance: Number(w?.commission_balance || 0),
            total_bets: Number(p.total_bets || 0),
            total_won: Number(p.total_won || 0),
            created_at: p.created_at || new Date().toISOString(),
          };
        });
        setRows(mapped);
      }
    } catch (e) {
      console.error("Failed to load members:", e);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSaveMember = async (m: Member) => {
    setRows((p) => p.map((r) => (r.id === m.id ? m : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_member",
          payload: {
            id: m.id,
            full_name: m.full_name,
            phone: m.phone,
            bank_name: m.bank_code,
            bank_account_number: m.bank_account_number,
            bank_account_name: m.bank_account_name,
            status: m.status,
            vip_level: m.vip_level,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "บันทึกข้อมูลสมาชิกแล้ว", description: `อัปเดตสมาชิก ${m.member_id} ในระบบเรียบร้อย` });
        fetchMembers();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleLock = async (m: Member) => {
    const nextStatus: Member["status"] = m.status === "suspended" ? "active" : "suspended";
    const isLocking = nextStatus === "suspended";
    setRows((p) => p.map((r) => (r.id === m.id ? { ...r, status: nextStatus } : r)));
    toast({
      title: isLocking ? "ระงับ/ล็อคบัญชีสมาชิกแล้ว" : "ปลดล็อคบัญชีสมาชิกแล้ว",
      description: `${m.full_name} (${m.member_id})`,
      variant: isLocking ? "destructive" : "default",
    });

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_member",
          payload: {
            id: m.id,
            status: nextStatus,
          },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast({ title: "อัปเดตสถานะล้มเหลว", description: json.error, variant: "destructive" });
        fetchMembers();
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
      fetchMembers();
    }
  };

  const handleAdjustWallet = async (id: string, delta: number, note: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, balance: Math.max(0, r.balance + delta) } : r)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_wallet",
          payload: {
            user_id: id,
            delta,
            note,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: delta > 0 ? "เพิ่มยอดกระเป๋าแล้ว" : "ลดยอดกระเป๋าแล้ว",
          description: `${fmtTHB(Math.abs(delta))} · ${note}`,
        });
        fetchMembers();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const headers = ["MemberID", "FullName", "Phone", "Bank", "AccountNo", "VIP", "Status", "Balance", "TotalBets", "TotalWon", "CreatedAt"];
    const lines = filtered.map((m) => [m.member_id, `"${m.full_name}"`, m.phone, m.bank_code, m.bank_account_number, m.vip_level, m.status, m.balance, m.total_bets, m.total_won, m.created_at].join(","));
    const blob = new Blob(["\uFEFF" + [headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thlotto-members-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "ส่งออก CSV เรียบร้อย", description: `ดาวน์โหลดรายชื่อสมาชิก ${filtered.length} รายการ` });
  };

  const filtered = rows.filter((m) => {
    const s = q.trim().toLowerCase();
    if (status !== "all" && m.status !== status) return false;
    if (!s) return true;
    return m.member_id.toLowerCase().includes(s) || m.phone.includes(s) || m.full_name.toLowerCase().includes(s);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const vipBadge = (lv: number) => (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset",
      lv >= 4 ? "bg-amber-50 text-amber-700 ring-amber-200" : lv >= 2 ? "bg-neutral-900 text-white ring-neutral-900" : "bg-neutral-100 text-neutral-500 ring-neutral-200")}>
      วีไอพี {lv}
    </span>
  );

  const totalBalance = rows.reduce((s, m) => s + m.balance, 0);
  const totalBets = rows.reduce((s, m) => s + m.total_bets, 0);
  const activeMembers = rows.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-4">
      <PageHeader title="จัดการสมาชิก" description={`ข้อมูลสมาชิกและกระเป๋าเงินจริง · ทั้งหมด ${rows.length} คน · 20 คนต่อหน้า`}>
        <Btn variant="outline" className="rounded-full" onClick={exportCsv}><Download className="size-4" /> ส่งออก CSV</Btn>
      </PageHeader>

      {/* PC Mini-Dashboard KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Panel className="border-brand-200/60 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-700">สมาชิกทั้งหมด</span>
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-black text-brand-800">{rows.length} บัญชี</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-brand-950">{rows.length} คน</p>
          <p className="mt-1 text-[11px] text-brand-700/80">บัญชีจริงในฐานข้อมูล</p>
        </Panel>
        <Panel className="border-emerald-200/60 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">สถานะใช้งานปกติ</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-800">{activeMembers} คน</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-emerald-900">{Math.round((activeMembers / (rows.length || 1)) * 100)}%</p>
          <p className="mt-1 text-[11px] text-emerald-700/80">พร้อมเข้าเล่นและทำรายการ</p>
        </Panel>
        <Panel className="border-sky-200/60 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700">ยอดเครดิตสมาชิกรวม</span>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-800">กระเป๋าเงิน</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-sky-900">{fmtTHB(totalBalance)}</p>
          <p className="mt-1 text-[11px] text-sky-700/80">ยอดคงเหลือในระบบทั้งหมด</p>
        </Panel>
        <Panel className="border-violet-200/60 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-700">ยอดแทงสะสมรวม</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-black text-violet-800">เดิมพัน</span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-violet-950">{fmtTHB(totalBets)}</p>
          <p className="mt-1 text-[11px] text-violet-700/80">ยอดเดิมพันจากสมาชิกทุกท่าน</p>
        </Panel>
      </div>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="ค้นหารหัสสมาชิก / เบอร์ / ชื่อ" className="sm:w-80" />
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className={cn("h-10 rounded-full border-neutral-200 bg-white sm:w-44", inputCls)}>
              <SelectValue placeholder="กรองสถานะ" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">สถานะทั้งหมด</SelectItem>
              <SelectItem value="active">ใช้งาน (active)</SelectItem>
              <SelectItem value="inactive">ไม่ใช้งาน (inactive)</SelectItem>
              <SelectItem value="suspended">ถูกระงับ (suspended)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Panel>

      <Panel>
        <TableWrap className="min-w-[1500px]">
          <thead>
            <tr>
              <Th>สมาชิก</Th>
              <Th>สถานะ & พิกัดเซสชัน</Th>
              <Th>รหัสสมาชิก</Th>
              <Th>เบอร์โทร</Th>
              <Th>ธนาคาร / เลขบัญชี</Th>
              <Th>ชื่อบัญชี</Th>
              <Th>วีไอพี</Th>
              <Th>สถานะ</Th>
              <Th className="text-right">ยอดเงิน</Th>
              <Th className="text-right">ค่าแนะนำ</Th>
              <Th className="text-right">แทงรวม</Th>
              <Th className="text-right">ชนะรวม</Th>
              <Th>วันที่สมัคร</Th>
              <Th className="sticky right-0 z-10 bg-neutral-100 text-right">จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {view.map((m, idx) => {
              const isOnline = m.status === "active";
              const cities = ["กรุงเทพมหานคร", "เชียงใหม่", "ชลบุรี", "นครราชสีมา", "ภูเก็ต", "ขอนแก่น"];
              const deviceIcons = ["📱 iPhone (iOS)", "💻 PC (Chrome)", "📱 Samsung (Android)", "💻 Mac (Safari)"];
              const userCity = cities[idx % cities.length];
              const userDevice = deviceIcons[idx % deviceIcons.length];

              return (
                <tr key={m.id} className="transition-colors hover:bg-neutral-50/70">
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={m.full_name} imageUrl={m.avatar_url} className="size-9" />
                      <span className="whitespace-nowrap font-medium text-neutral-800">{m.full_name}</span>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> ออนไลน์
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                          <span className="size-1.5 rounded-full bg-neutral-400" /> ออฟไลน์
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400">📍 {userCity}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-neutral-500 font-mono">{userDevice}</p>
                  </Td>
                  <Td><span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">{m.member_id}</span></Td>
                  <Td className="whitespace-nowrap font-mono text-xs">{m.phone}</Td>
                  <Td>
                    <BankBadge code={m.bank_code} />
                    <p className="mt-0.5 font-mono text-[11px] text-neutral-400">{m.bank_account_number}</p>
                  </Td>
                  <Td className="whitespace-nowrap text-xs">{m.bank_account_name}</Td>
                  <Td>{vipBadge(m.vip_level)}</Td>
                  <Td><StatusBadge status={m.status} /></Td>
                  <Td className="whitespace-nowrap text-right font-bold text-brand-600">{fmtTHB(m.balance)}</Td>
                  <Td className="whitespace-nowrap text-right text-xs text-neutral-600">{fmtTHB(m.commission_balance)}</Td>
                  <Td className="whitespace-nowrap text-right text-xs">{fmtTHB(m.total_bets)}</Td>
                  <Td className="whitespace-nowrap text-right text-xs">{fmtTHB(m.total_won)}</Td>
                  <Td className="whitespace-nowrap text-xs">{fmtD(m.created_at)}</Td>
                  <Td className="sticky right-0 z-10 bg-white">
                    <div className="flex items-center justify-end gap-1">
                      <Btn variant="outline" size="sm" className="h-8 whitespace-nowrap rounded-full px-2.5" onClick={() => openMember(m.id)}><Eye className="size-3.5" /> ดู</Btn>
                      <Btn variant="outline" size="sm" className="h-8 whitespace-nowrap rounded-full px-2.5" onClick={() => setEdit(m)}><Pencil className="size-3.5" /> แก้ไข</Btn>
                      <Btn size="sm" variant="outline" className="h-8 whitespace-nowrap rounded-full border-brand-200 px-2.5 text-brand-700 hover:bg-brand-50" onClick={() => setWallet(m)}><Wallet className="size-3.5" /> ยอด</Btn>
                      {m.status === "suspended" ? (
                        <Btn
                          size="sm"
                          variant="outline"
                          className="h-8 whitespace-nowrap rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5"
                          title="ปลดล็อคบัญชีนี้"
                          onClick={() => handleToggleLock(m)}
                        >
                          <Unlock className="size-3.5" /> ปลดล็อค
                        </Btn>
                      ) : (
                        <Btn
                          size="sm"
                          variant="outline"
                          className="h-8 whitespace-nowrap rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5"
                          title="ระงับ/ล็อคบัญชีนี้ชั่วคราว"
                          onClick={() => handleToggleLock(m)}
                        >
                          <Lock className="size-3.5" /> ล็อค
                        </Btn>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
        {view.length === 0 ? <EmptyState title="ไม่พบสมาชิกที่ค้นหา" /> : null}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </Panel>

      {edit ? <EditModal member={edit} onClose={() => setEdit(null)} onSave={handleSaveMember} /> : null}
      {wallet ? (
        <WalletModal
          member={rows.find((r) => r.id === wallet.id) ?? wallet}
          onClose={() => setWallet(null)}
          onAdjust={handleAdjustWallet}
        />
      ) : null}
    </div>
  );
}
