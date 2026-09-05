"use client";

import * as React from "react";
import { ArrowLeft, Phone, CalendarDays, Wallet, Dices, Trophy, Gem, Landmark, Copy, Check, Loader2, Plus, Minus } from "lucide-react";
import { Panel, Btn, StatusBadge, BankBadge, Avatar, TableWrap, Th, Td, EmptyState, Field, inputCls } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdminNav } from "../store";
import { fmtTHB, fmtD, type Member } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const TX_TYPE_LABEL: Record<string, string> = {
  DEPOSIT: "ฝาก", WITHDRAW: "ถอน", WIN: "ชนะรางวัล", BET: "แทงโพย",
  BONUS: "โบนัส", COMMISSION: "ค่าแนะนำ", PAYOUT: "จ่ายรางวัล",
  ADMIN_ADJUST_ADD: "แอดมินเพิ่มยอด", ADMIN_ADJUST_SUB: "แอดมินลดยอด",
  REFUND_WITHDRAW: "คืนเงินยกเลิกถอน",
};

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

function Stat({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3.5">
      <div className={cn("flex size-10 items-center justify-center rounded-full", tone)}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-neutral-500">{label}</p>
        <p className="truncate text-base font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

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

export function MemberDetailPage() {
  const { selectedMemberId, navigate } = useAdminNav();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [adjustWalletOpen, setAdjustWalletOpen] = React.useState(false);
  const [data, setData] = React.useState<{
    profile: any;
    wallet: any;
    bets: any[];
    transactions: any[];
    deposits: any[];
    withdrawals: any[];
    logins: any[];
  } | null>(null);

  const handleAdjustWallet = async (id: string, delta: number, note: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_wallet",
          payload: { user_id: id, delta, note },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: delta > 0 ? "เพิ่มยอดกระเป๋าสำเร็จ" : "ลดยอดกระเป๋าสำเร็จ",
          description: `${fmtTHB(Math.abs(delta))} · ${note}`,
        });
        fetchDetail(id);
      } else {
        toast({ title: "ปรับยอดล้มเหลว", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const fetchDetail = React.useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data?resource=member-detail&id=${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast({ title: "ไม่พบข้อมูลสมาชิก", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "โหลดข้อมูลล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (selectedMemberId) {
      fetchDetail(selectedMemberId);
    } else {
      setLoading(false);
    }
  }, [selectedMemberId, fetchDetail]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-brand-600" />
        <p className="text-sm text-neutral-500">กำลังดึงข้อมูลสมาชิกจริงจากระบบ...</p>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="space-y-4">
        <Btn variant="ghost" size="sm" className="rounded-full text-neutral-500" onClick={() => navigate("members")}>
          <ArrowLeft className="size-4" /> กลับหน้าสมาชิกทั้งหมด
        </Btn>
        <Panel className="p-8 text-center">
          <EmptyState title="ไม่พบข้อมูลสมาชิก" desc="กรุณาเลือกสมาชิกจากหน้ารายชื่อสมาชิก" />
        </Panel>
      </div>
    );
  }

  const { profile, wallet, bets = [], transactions = [], deposits = [], withdrawals = [], logins = [] } = data;

  const totalBets = bets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalWon = bets
    .filter((b) => b.status === "WON")
    .reduce((sum, b) => sum + Number(b.actual_payout || 0), 0);

  const member: Member = {
    id: profile.id,
    member_id: profile.member_id || profile.id.slice(0, 8).toUpperCase(),
    full_name: profile.full_name || "ไม่ระบุชื่อ",
    phone: profile.phone || "-",
    bank_code: normalizeBank(profile.bank_name),
    bank_account_number: profile.bank_account_number || "-",
    bank_account_name: profile.bank_account_name || profile.full_name || "-",
    avatar_url: profile.avatar_url || null,
    vip_level: typeof profile.vip_level === "number" ? profile.vip_level : (profile.vip_level && profile.vip_level !== "MEMBER" ? parseInt(profile.vip_level, 10) || 0 : 0),
    status: (profile.status as Member["status"]) || "active",
    balance: Number(wallet?.balance || 0),
    commission_balance: Number(wallet?.commission_balance || 0),
    total_bets: totalBets,
    total_won: totalWon,
    created_at: profile.created_at || new Date().toISOString(),
  };

  const vipDisplay = member.vip_level > 0 ? `วีไอพี ${member.vip_level}` : "สมาชิกทั่วไป";

  const copyId = async () => {
    try { await navigator.clipboard.writeText(member.member_id); } catch { /* no-op */ }
    setCopied(true);
    toast({ title: "คัดลอกรหัสสมาชิกแล้ว" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <Btn variant="ghost" size="sm" className="rounded-full text-neutral-500" onClick={() => navigate("members")}>
        <ArrowLeft className="size-4" /> กลับหน้าสมาชิกทั้งหมด
      </Btn>

      {/* Header card */}
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={member.full_name} imageUrl={member.avatar_url} className="size-14 text-xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">{member.full_name}</h1>
                <button onClick={copyId} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-bold text-neutral-500 transition-colors hover:bg-neutral-200">
                  {member.member_id}
                  {copied ? <Check className="size-3 text-brand-600" /> : <Copy className="size-3" />}
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-1"><Phone className="size-3.5" /> {member.phone}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> สมัคร {fmtD(member.created_at)}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={member.status} />
                <span className="inline-flex items-center whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                  {vipDisplay}
                </span>
                <Btn
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-full text-xs text-brand-700 border-brand-200 hover:bg-brand-50"
                  onClick={() => setAdjustWalletOpen(true)}
                >
                  <Wallet className="size-3.5 mr-1" /> ปรับยอดกระเป๋า
                </Btn>
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Wallet} label="ยอดเงิน" value={fmtTHB(member.balance)} tone="bg-brand-50 text-brand-600" />
            <Stat icon={Dices} label="แทงรวม" value={fmtTHB(member.total_bets)} tone="bg-amber-50 text-amber-600" />
            <Stat icon={Trophy} label="ชนะรวม" value={fmtTHB(member.total_won)} tone="bg-sky-50 text-sky-600" />
            <Stat icon={Gem} label="ค่าแนะนำ" value={fmtTHB(member.commission_balance)} tone="bg-violet-50 text-violet-600" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-100 px-4 py-3">
          <Landmark className="size-4 text-neutral-400" />
          <BankBadge code={member.bank_code} />
          <span className="font-mono text-sm text-neutral-700">{member.bank_account_number}</span>
          <span className="text-sm text-neutral-400">· {member.bank_account_name}</span>
        </div>
      </Panel>

      {/* 5 Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-full bg-neutral-100 p-1">
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ภาพรวม</TabsTrigger>
          <TabsTrigger value="bets" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ประวัติแทง ({bets.length})</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ธุรกรรม ({transactions.length})</TabsTrigger>
          <TabsTrigger value="deposits" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ฝาก/ถอน ({deposits.length + withdrawals.length})</TabsTrigger>
          <TabsTrigger value="logins" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">ล็อกอิน ({logins.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="p-5">
              <h3 className="mb-3 text-sm font-bold text-neutral-900">ข้อมูลโปรไฟล์จริง</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <span className="text-neutral-400">รหัสสมาชิก</span><span className="font-mono text-neutral-800">{member.member_id}</span>
                <span className="text-neutral-400">ชื่อ-นามสกุล</span><span className="text-neutral-800">{member.full_name}</span>
                <span className="text-neutral-400">เบอร์โทร</span><span className="font-mono text-neutral-800">{member.phone}</span>
                <span className="text-neutral-400">สถานะบัญชี</span><span><StatusBadge status={member.status} /></span>
                <span className="text-neutral-400">ระดับวีไอพี</span><span className="font-semibold text-amber-600">{vipDisplay}</span>
                <span className="text-neutral-400">วันที่สมัคร</span><span className="text-neutral-800">{fmtD(member.created_at)}</span>
              </div>
            </Panel>
            <Panel className="p-5">
              <h3 className="mb-3 text-sm font-bold text-neutral-900">ยอดกระเป๋าปัจจุบัน</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-50 p-4 ring-1 ring-inset ring-brand-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-700">ยอดเงินหลัก</p>
                    <p className="mt-1 text-2xl font-black text-brand-700">{fmtTHB(member.balance)}</p>
                  </div>
                  <Btn size="sm" className="rounded-full bg-brand-600 hover:bg-brand-700 text-xs text-white" onClick={() => setAdjustWalletOpen(true)}>
                    <Wallet className="size-3.5 mr-1" /> ปรับยอด
                  </Btn>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-inset ring-violet-100">
                  <p className="text-xs text-violet-700">ค่าแนะนำ</p>
                  <p className="mt-1 text-2xl font-black text-violet-700">{fmtTHB(member.commission_balance)}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs text-neutral-500">แทงรวม</p>
                  <p className="mt-1 text-xl font-bold text-neutral-900">{fmtTHB(member.total_bets)}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs text-neutral-500">ชนะรวม</p>
                  <p className="mt-1 text-xl font-bold text-neutral-900">{fmtTHB(member.total_won)}</p>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 2: bets */}
        <TabsContent value="bets" className="mt-4">
          <Panel>
            {bets.length === 0 ? (
              <EmptyState title="ยังไม่มีประวัติแทงโพย" desc="สมาชิกยังไม่มีรายการเดิมพันหวยในระบบ" />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>วันที่</Th><Th>ตลาด</Th><Th>งวดวันที่</Th><Th>เลขที่แทง</Th><Th>ประเภท</Th>
                    <Th className="text-right">ยอดแทง</Th><Th className="text-right">อัตราจ่าย</Th><Th className="text-right">ยอดรางวัล</Th><Th>สถานะ</Th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((b: any) => {
                    const mkt = b.lottery_markets;
                    const payout = Number(b.actual_payout || 0);
                    return (
                      <tr key={b.id} className="transition-colors hover:bg-neutral-50/70">
                        <Td className="whitespace-nowrap text-xs">{fmtD(b.created_at)}</Td>
                        <Td>
                          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-800">
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: mkt?.color || "#10b981" }} />
                            {mkt?.name || b.market_id?.slice(0, 8)}
                          </span>
                        </Td>
                        <Td className="whitespace-nowrap text-xs">{b.draw_date || "-"}</Td>
                        <Td className="font-mono font-bold text-neutral-800">{b.numbers}</Td>
                        <Td className="whitespace-nowrap text-xs">{b.bet_type}</Td>
                        <Td className="whitespace-nowrap text-right font-semibold">{fmtTHB(b.amount)}</Td>
                        <Td className="whitespace-nowrap text-right text-xs text-neutral-500">×{b.payout_rate || 0}</Td>
                        <Td className={cn("whitespace-nowrap text-right font-bold", payout > 0 ? "text-brand-600" : "text-neutral-400")}>
                          {payout > 0 ? fmtTHB(payout) : "—"}
                        </Td>
                        <Td><StatusBadge status={b.status} /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            )}
          </Panel>
        </TabsContent>

        {/* Tab 3: transactions */}
        <TabsContent value="transactions" className="mt-4">
          <Panel>
            {transactions.length === 0 ? (
              <EmptyState title="ยังไม่มีประวัติธุรกรรม" desc="ยังไม่มีรายการปรับยอดหรือโบนัส" />
            ) : (
              <TableWrap>
                <thead>
                  <tr><Th>วันที่</Th><Th>ประเภท</Th><Th className="text-right">ยอด</Th><Th className="text-right">ยอดคงเหลือ</Th><Th>หมายเหตุ</Th></tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => {
                    const amt = Number(t.amount || 0);
                    const isPositive = !["WITHDRAW", "BET", "ADMIN_ADJUST_SUB"].includes(t.type);
                    return (
                      <tr key={t.id} className="transition-colors hover:bg-neutral-50/70">
                        <Td className="whitespace-nowrap text-xs">{fmtD(t.created_at)}</Td>
                        <Td>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", isPositive ? "bg-brand-50 text-brand-700" : "bg-rose-50 text-rose-700")}>
                            {TX_TYPE_LABEL[t.type] ?? t.type}
                          </span>
                        </Td>
                        <Td className={cn("whitespace-nowrap text-right font-bold", isPositive ? "text-brand-600" : "text-rose-600")}>
                          {isPositive ? "+" : "−"}{fmtTHB(Math.abs(amt))}
                        </Td>
                        <Td className="whitespace-nowrap text-right font-mono text-xs text-neutral-500">
                          {t.balance_after ? fmtTHB(t.balance_after) : "—"}
                        </Td>
                        <Td className="text-xs text-neutral-500">{t.note || "-"}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            )}
          </Panel>
        </TabsContent>

        {/* Tab 4: deposits/withdraws */}
        <TabsContent value="deposits" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <p className="border-b border-neutral-100 px-4 py-3 text-sm font-bold text-brand-700">
                ฝาก <span className="ml-1 text-[11px] font-medium text-neutral-400">deposit_requests ({deposits.length})</span>
              </p>
              {deposits.length === 0 ? (
                <EmptyState title="ยังไม่มีรายการฝาก" />
              ) : (
                <TableWrap className="min-w-[420px]">
                  <thead>
                    <tr><Th>วันที่</Th><Th className="text-right">ยอด</Th><Th>สถานะ</Th><Th>หมายเหตุแอดมิน</Th></tr>
                  </thead>
                  <tbody>
                    {deposits.map((d: any) => (
                      <tr key={d.id} className="transition-colors hover:bg-neutral-50/70">
                        <Td className="whitespace-nowrap text-xs">{fmtD(d.created_at)}</Td>
                        <Td className="whitespace-nowrap text-right font-bold text-brand-600">+{fmtTHB(d.amount)}</Td>
                        <Td><StatusBadge status={d.status} /></Td>
                        <Td className="text-xs text-neutral-500">{d.admin_note ?? <span className="text-neutral-300">—</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </Panel>
            <Panel>
              <p className="border-b border-neutral-100 px-4 py-3 text-sm font-bold text-rose-700">
                ถอน <span className="ml-1 text-[11px] font-medium text-neutral-400">withdraw_requests ({withdrawals.length})</span>
              </p>
              {withdrawals.length === 0 ? (
                <EmptyState title="ยังไม่มีรายการถอน" />
              ) : (
                <TableWrap className="min-w-[520px]">
                  <thead>
                    <tr><Th>วันที่</Th><Th className="text-right">ยอด</Th><Th>สถานะ</Th><Th>หมายเหตุ</Th></tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w: any) => (
                      <tr key={w.id} className="transition-colors hover:bg-neutral-50/70">
                        <Td className="whitespace-nowrap text-xs">{fmtD(w.created_at)}</Td>
                        <Td className="whitespace-nowrap text-right font-bold text-rose-600">−{fmtTHB(w.amount)}</Td>
                        <Td><StatusBadge status={w.status} /></Td>
                        <Td className="text-xs text-neutral-500">{w.admin_note ?? <span className="text-neutral-300">—</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 5: logins */}
        <TabsContent value="logins" className="mt-4">
          <Panel>
            {logins.length === 0 ? (
              <EmptyState title="ไม่มีประวัติการล็อกอิน" desc="ยังไม่มีบันทึก login_attempts ของเบอร์นี้" />
            ) : (
              <TableWrap>
                <thead>
                  <tr><Th>วันเวลา</Th><Th>IP Address</Th><Th>ผลลัพธ์</Th></tr>
                </thead>
                <tbody>
                  {logins.map((l: any) => (
                    <tr key={l.id} className="transition-colors hover:bg-neutral-50/70">
                      <Td className="whitespace-nowrap text-xs">{fmtD(l.attempted_at)}</Td>
                      <Td className="font-mono text-xs">{l.ip_address || "-"}</Td>
                      <Td>
                        {l.success ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">✅ สำเร็จ</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">❌ ไม่สำเร็จ</span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Panel>
        </TabsContent>
      </Tabs>

      {adjustWalletOpen ? (
        <WalletModal
          member={member}
          onClose={() => setAdjustWalletOpen(false)}
          onAdjust={handleAdjustWallet}
        />
      ) : null}
    </div>
  );
}
