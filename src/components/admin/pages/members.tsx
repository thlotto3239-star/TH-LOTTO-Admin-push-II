"use client";

import * as React from "react";
import { Eye, Pencil, Wallet, Plus, Minus, Download } from "lucide-react";
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

// ─── Edit modal (RPC: admin_update_member) ───────────────────────────────────
function EditModal({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (m: Member) => void }) {
  const [form, setForm] = React.useState<Member>(member);
  const { toast } = useToast();
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสมาชิก</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลสมาชิกรหัส {member.member_id}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="ชื่อ-นามสกุล"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inputCls} /></Field>
          <Field label="เบอร์โทร"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></Field>
          <Field label="ธนาคาร"><BankSelector value={form.bank_code} onChange={(v) => set("bank_code", v)} /></Field>
          <Field label="เลขบัญชี"><Input value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)} className={inputCls} /></Field>
          <Field label="ชื่อบัญชี"><Input value={form.bank_account_name} onChange={(e) => set("bank_account_name", e.target.value)} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="สถานะ">
              <Select value={form.status} onValueChange={(v) => set("status", v as Member["status"])}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  <SelectItem value="suspended">ถูกระงับ</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="ระดับวีไอพี">
              <Select value={String(form.vip_level)} onValueChange={(v) => set("vip_level", Number(v))}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {[0, 1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>วีไอพี {n}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full" onClick={() => { onSave(form); toast({ title: "บันทึกข้อมูลสมาชิกแล้ว", description: `RPC admin_update_member (${form.member_id})` }); onClose(); }}>บันทึก</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Wallet modal (RPC: admin_adjust_wallet) ─────────────────────────────────
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

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>ปรับยอดกระเป๋า</DialogTitle>
          <DialogDescription>ปรับยอดกระเป๋าเงินของ {member.full_name}</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl bg-brand-50 p-4 text-center ring-1 ring-inset ring-brand-100">
          <p className="text-xs text-brand-700">ยอดปัจจุบัน</p>
          <p className="text-3xl font-black tracking-tight text-brand-700">{fmtTHB(member.balance)}</p>
        </div>
        <Field label="จำนวนเงิน (บาท)">
          <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} />
        </Field>
        <Field label="หมายเหตุ"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เหตุผลการปรับยอด" className={inputCls} /></Field>
        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => doAdjust(-1)}><Minus className="size-4" /> ลด</Btn>
          <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={() => doAdjust(1)}><Plus className="size-4" /> เพิ่ม</Btn>
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

  return (
    <div className="space-y-4">
      <PageHeader title="จัดการสมาชิก" description={`ข้อมูลสมาชิกและกระเป๋าเงินจริง · ทั้งหมด ${rows.length} คน · 20 คนต่อหน้า`}>
        <Btn variant="outline" className="rounded-full" onClick={exportCsv}><Download className="size-4" /> ส่งออก CSV</Btn>
      </PageHeader>

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
        <TableWrap className="min-w-[1400px]">
          <thead>
            <tr>
              <Th>สมาชิก</Th><Th>รหัสสมาชิก</Th><Th>เบอร์โทร</Th><Th>ธนาคาร / เลขบัญชี</Th><Th>ชื่อบัญชี</Th>
              <Th>วีไอพี</Th><Th>สถานะ</Th><Th className="text-right">ยอดเงิน</Th><Th className="text-right">ค่าแนะนำ</Th>
              <Th className="text-right">แทงรวม</Th><Th className="text-right">ชนะรวม</Th><Th>วันที่สมัคร</Th><Th className="sticky right-0 z-10 bg-neutral-100 text-right">จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {view.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-neutral-50/70">
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={m.full_name} imageUrl={m.avatar_url} className="size-9" />
                    <span className="whitespace-nowrap font-medium text-neutral-800">{m.full_name}</span>
                  </div>
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
                  </div>
                </Td>
              </tr>
            ))}
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
