"use client";

import * as React from "react";
import { Search, Eye, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Panel, Btn, PageHeader, TableWrap, Th, Td, StatusBadge, EmptyState, Avatar, MarketLogo } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MARKETS, type GlobalBet, fmtTHB, mktShort } from "@/data/admin-mock";
import { LottoBall } from "./instant";
import { cn } from "@/lib/utils";

// Format bet type to friendly Thai without touching DB or data types
export function formatBetTypeThai(type: string): string {
  if (!type) return "-";
  const raw = type.trim();
  const upper = raw.toUpperCase();

  const mapping: Record<string, string> = {
    "2TOP": "2 ตัวบน",
    "2BOTTOM": "2 ตัวล่าง",
    "3TOP": "3 ตัวบน",
    "3TOAD": "3 ตัวโต๊ด",
    "3TODE": "3 ตัวโต๊ด",
    "3FRONT": "3 ตัวหน้า",
    "3BOTTOM": "3 ตัวล่าง",
    "3BACK": "3 ตัวท้าย",
    "4TOP": "4 ตัวบน",
    "6STRAIGHT": "6 ตัวตรง",
    "RUN_UP": "วิ่งบน",
    "RUN_DOWN": "วิ่งล่าง",
    "RUN_TOP": "วิ่งบน",
    "RUN_BOTTOM": "วิ่งล่าง",
    "PIN_TOP": "ปักหลักบน",
    "PIN_BOTTOM": "ปักหลักล่าง",
  };

  if (mapping[upper]) return mapping[upper];

  // If already Thai like "2ตัวบน", format with space "2 ตัวบน"
  if (/^[2346]ตัว/.test(raw)) {
    return raw.replace(/^([2346])ตัว/, "$1 ตัว");
  }
  return raw;
}

// Split created_at into separate Time (top) and Date (bottom)
export function formatDateTimeSplit(val: string): { time: string; date: string } {
  if (!val) return { time: "-", date: "" };

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const date = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
    return { time, date };
  }

  // Fallback if string is like "04/09/2569 11:20:15"
  const parts = val.trim().split(/[ ,]+/);
  if (parts.length >= 2) {
    if (parts[0].includes("/") || parts[0].includes("-")) {
      return { date: parts[0], time: parts[1] };
    }
  }
  return { time: val, date: "" };
}

export function BetsPage() {
  const [rows, setRows] = React.useState<GlobalBet[]>([]);
  const [markets, setMarkets] = React.useState<any[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [marketFilter, setMarketFilter] = React.useState<string>("ALL");
  const [q, setQ] = React.useState<string>("");
  const [selectedBet, setSelectedBet] = React.useState<GlobalBet | null>(null);

  // Live Supabase Sync
  React.useEffect(() => {
    fetch("/api/admin/data?resource=markets")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMarkets(res.data);
        }
      })
      .catch(() => {});

    fetch("/api/admin/data?resource=bets&limit=100")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped: GlobalBet[] = res.data.map((b: any) => {
            const memberId = b.profiles?.member_id || (b.user_id ? b.user_id.substring(0, 8).toUpperCase() : "MB-GUEST");
            const memberName = b.profiles?.full_name || b.profiles?.username || ("สมาชิก #" + memberId);
            const memberPhone = b.profiles?.phone || "-";
            const memberAvatar = b.profiles?.avatar_url || null;
            const marketName = b.lottery_markets?.name || "หวย";
            const marketCode = b.lottery_markets?.code || b.lottery_code || "MKT";
            const marketColor = b.lottery_markets?.color || "#059669";
            const marketLogo = b.lottery_markets?.logo_url || null;
            return {
              id: b.id,
              bet_no: "TK-" + (b.id.substring(0, 8).toUpperCase()),
              member_id: memberId,
              member_name: memberName,
              member_phone: memberPhone,
              member_avatar: memberAvatar,
              market_code: marketCode,
              market_name: marketName,
              market_color: marketColor,
              market_logo: marketLogo,
              draw_date: b.draw_date ? new Date(b.draw_date).toLocaleDateString("th-TH") : "-",
              bet_type: b.bet_type || "2BOTTOM",
              numbers: b.numbers || "00",
              amount: parseFloat(b.amount) || 0,
              payout_rate: parseFloat(b.payout_rate) || 90,
              payout_amount: parseFloat(b.actual_payout ?? b.payout_amount) || 0,
              status: (b.status ? b.status.toUpperCase() : "PENDING") as any,
              is_paid: Boolean(b.is_paid),
              created_at: b.created_at || new Date().toISOString(),
            };
          });
          setRows(mapped);
        }
      })
      .catch((e) => console.error("Could not fetch live bets:", e));
  }, []);

  const filtered = rows
    .filter((r) => statusFilter === "ALL" || r.status === statusFilter)
    .filter((r) => marketFilter === "ALL" || r.market_code === marketFilter)
    .filter(
      (r) =>
        !q.trim() ||
        r.bet_no.toLowerCase().includes(q.trim().toLowerCase()) ||
        r.member_name.includes(q.trim()) ||
        r.member_phone.includes(q.trim()) ||
        r.numbers.includes(q.trim())
    );

  const totalBetAmount = filtered.reduce((acc, r) => acc + r.amount, 0);
  const totalPayout = filtered.reduce((acc, r) => acc + r.payout_amount, 0);
  const wonCount = filtered.filter((r) => r.status === "WON").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="รายการแทงหวย"
        description="ศูนย์รวมโพยหวยทั้งระบบ (public.bets) · ตรวจสอบและค้นหาโพยหวยของสมาชิกทุกตลาด"
      />

      {/* KPI Mini-bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Panel className="p-3.5">
          <p className="text-xs text-neutral-400">โพยทั้งหมดในรายการ</p>
          <p className="text-lg font-bold text-neutral-900">{filtered.length} โพย</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="text-xs text-neutral-400">ยอดแทงรวม</p>
          <p className="text-lg font-bold text-brand-600">{fmtTHB(totalBetAmount)}</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="text-xs text-neutral-400">ยอดจ่ายรางวัลรวม</p>
          <p className="text-lg font-bold text-rose-600">{fmtTHB(totalPayout)}</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="text-xs text-neutral-400">โพยที่ถูกรางวัล</p>
          <p className="text-lg font-bold text-neutral-900">{wonCount} โพย</p>
        </Panel>
      </div>

      {/* Filters & Search */}
      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="h-9 w-52 rounded-xl border-neutral-200 text-xs">
                <SelectValue placeholder="เลือกตลาดหวย" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl">
                <SelectItem value="ALL">ทุกตลาด ({markets.length || 37} ตลาด)</SelectItem>
                {markets.map((m) => (
                  <SelectItem key={m.id} value={m.code}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-xl bg-neutral-100 p-1">
              {[
                { id: "ALL", label: "ทั้งหมด" },
                { id: "PENDING", label: "รอดำเนินการ" },
                { id: "WON", label: "ถูกรางวัล" },
                { id: "LOST", label: "ไม่ถูกรางวัล" },
                { id: "CANCELLED", label: "ยกเลิก" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap",
                    statusFilter === t.id ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-72">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาเลขที่โพย, สมาชิก, เบอร์, เลขแทง..."
              className="h-9 rounded-full border-neutral-200 bg-white text-xs"
            />
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel>
        <TableWrap className="min-w-[960px]">
          <thead>
            <tr>
              <Th>เวลาแทง</Th>
              <Th>ตลาดหวย / รหัสโพย</Th>
              <Th>สมาชิก</Th>
              <Th>ประเภท</Th>
              <Th>ตัวเลข</Th>
              <Th className="text-right">ยอดแทง</Th>
              <Th className="text-right">อัตราจ่าย</Th>
              <Th className="text-right">เงินรางวัล</Th>
              <Th>สถานะ</Th>
              <Th className="text-right">ดูโพย</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const dt = formatDateTimeSplit(b.created_at);
              return (
                <tr key={b.id} className="transition-colors hover:bg-neutral-50/70">
                  {/* เวลาแทง: เวลาอยู่ด้านบนวันที่ ใน badge สีแดง ตัวเลขสีขาว */}
                  <Td className="whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white shadow-xs">
                        {dt.time}
                      </span>
                      {dt.date ? (
                        <span className="pl-0.5 font-mono text-[11px] font-medium text-neutral-400">
                          {dt.date}
                        </span>
                      ) : null}
                    </div>
                  </Td>

                  {/* ตลาดหวย / รหัสโพย: โลโก้หวย + ชื่อหวยด้านบน + รหัสโพยด้านล่าง */}
                  <Td>
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <MarketLogo
                        logoUrl={b.market_logo}
                        name={b.market_name}
                        code={b.market_code}
                        color={b.market_color}
                        size="md"
                      />
                      <div>
                        <p className="font-bold text-neutral-900 leading-tight">{b.market_name}</p>
                        <p className="font-mono text-[11px] font-bold text-neutral-400 mt-0.5">{b.bet_no}</p>
                      </div>
                    </div>
                  </Td>

                  {/* สมาชิก: แสดงโปรไฟล์ Avatar */}
                  <Td>
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <Avatar
                        name={b.member_name}
                        imageUrl={b.member_avatar}
                        className="size-9 text-xs shrink-0 ring-1 ring-neutral-200"
                      />
                      <div>
                        <p className="font-semibold text-neutral-900 leading-tight">{b.member_name}</p>
                        <p className="font-mono text-[11px] text-neutral-400 mt-0.5">{b.member_phone}</p>
                      </div>
                    </div>
                  </Td>

                  {/* ประเภท: แสดงผลภาษาไทย 2 ตัวบน, 2 ตัวล่าง, ฯลฯ */}
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700">
                      {formatBetTypeThai(b.bet_type)}
                    </span>
                  </Td>

                  {/* ตัวเลข: LottoBall ลูกละ 1 ตัวเลขตามมาตรฐาน */}
                  <Td>
                    <div className="flex items-center gap-1">
                      {String(b.numbers ?? "")
                        .split("")
                        .map((digit, idx) => (
                          <LottoBall key={idx} digit={digit} size="md" />
                        ))}
                    </div>
                  </Td>

                  {/* ยอดแทง */}
                  <Td className="whitespace-nowrap text-right font-mono text-xs font-bold text-neutral-900">
                    {fmtTHB(b.amount)}
                  </Td>

                  {/* อัตราจ่าย */}
                  <Td className="whitespace-nowrap text-right font-mono text-xs text-neutral-500">
                    ×{b.payout_rate}
                  </Td>

                  {/* เงินรางวัล */}
                  <Td className="whitespace-nowrap text-right font-mono text-xs font-bold">
                    {b.payout_amount > 0 ? (
                      <span className="text-brand-600">+{fmtTHB(b.payout_amount)}</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </Td>

                  {/* สถานะ */}
                  <Td>
                    <StatusBadge status={b.status} />
                  </Td>

                  {/* ดูโพย */}
                  <Td className="text-right">
                    <Btn
                      variant="outline"
                      size="sm"
                      className="size-8 rounded-full p-0"
                      title="ดูรายละเอียดโพย"
                      onClick={() => setSelectedBet(b)}
                    >
                      <Eye className="size-3.5" />
                    </Btn>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
        {filtered.length === 0 ? <EmptyState title="ไม่พบรายการแทงตามเงื่อนไขที่เลือก" /> : null}
      </Panel>

      {/* Ticket Details Modal */}
      {selectedBet ? (
        <Dialog open onOpenChange={(o) => !o && setSelectedBet(null)}>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="size-5 text-brand-600" />
                รายละเอียดโพย {selectedBet.bet_no}
              </DialogTitle>
              <DialogDescription>
                งวดวันที่ {selectedBet.draw_date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 text-xs">
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">สมาชิกผู้แทง:</span>
                <div className="flex items-center gap-2">
                  <Avatar name={selectedBet.member_name} imageUrl={selectedBet.member_avatar} className="size-6 text-[10px]" />
                  <span className="font-semibold text-neutral-900">{selectedBet.member_name} ({selectedBet.member_phone})</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ตลาดหวย:</span>
                <div className="flex items-center gap-2">
                  <MarketLogo
                    logoUrl={selectedBet.market_logo}
                    name={selectedBet.market_name}
                    code={selectedBet.market_code}
                    color={selectedBet.market_color}
                    size="sm"
                  />
                  <span className="font-bold text-neutral-900">{selectedBet.market_name}</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ประเภทการแทง:</span>
                <span className="font-bold text-neutral-800">{formatBetTypeThai(selectedBet.bet_type)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ตัวเลขที่แทง:</span>
                <div className="flex items-center gap-1">
                  {String(selectedBet.numbers ?? "")
                    .split("")
                    .map((digit, idx) => (
                      <LottoBall key={idx} digit={digit} size="md" />
                    ))}
                </div>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ยอดเงินที่แทง:</span>
                <span className="font-mono text-sm font-bold text-neutral-900">{fmtTHB(selectedBet.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">อัตราจ่ายที่ตกลง:</span>
                <span className="font-mono text-neutral-700">บาทละ {selectedBet.payout_rate} บาท</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">สถานะโพย:</span>
                <StatusBadge status={selectedBet.status} />
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-neutral-500">เงินรางวัลที่ได้รับ:</span>
                <span className="font-mono text-base font-black text-brand-600">
                  {selectedBet.payout_amount > 0 ? fmtTHB(selectedBet.payout_amount) : "฿0"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Btn className="w-full rounded-full" onClick={() => setSelectedBet(null)}>
                ปิดหน้าต่าง
              </Btn>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
