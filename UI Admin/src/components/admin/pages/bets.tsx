"use client";

import * as React from "react";
import { Search, Eye, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Panel, Btn, PageHeader, TableWrap, Th, Td, StatusBadge, EmptyState, fmtTHB } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GLOBAL_BETS, MARKETS, type GlobalBet } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

export function BetsPage() {
  const [rows, setRows] = React.useState<GlobalBet[]>(GLOBAL_BETS);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [marketFilter, setMarketFilter] = React.useState<string>("ALL");
  const [q, setQ] = React.useState<string>("");
  const [selectedBet, setSelectedBet] = React.useState<GlobalBet | null>(null);

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
          <p className="text-xs text-neutral-400">โพยที่ถูกรางวัล</p>
          <p className="text-lg font-bold text-amber-600">{wonCount} โพย</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="text-xs text-neutral-400">ยอดจ่ายรางวัลรวม</p>
          <p className="text-lg font-bold text-rose-600">{fmtTHB(totalPayout)}</p>
        </Panel>
      </div>

      {/* Filters */}
      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="h-9 w-48 rounded-xl border-neutral-200 text-xs">
                <SelectValue placeholder="เลือกตลาดหวย" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl">
                <SelectItem value="ALL">ทุกตลาด (21 ตลาด)</SelectItem>
                {MARKETS.map((m) => (
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
        <TableWrap className="min-w-[920px]">
          <thead>
            <tr>
              <Th>เวลาแทง</Th>
              <Th>รหัสโพย</Th>
              <Th>สมาชิก</Th>
              <Th>ตลาดหวย</Th>
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
            {filtered.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-neutral-50/70">
                <Td className="whitespace-nowrap text-xs text-neutral-500">{b.created_at}</Td>
                <Td className="whitespace-nowrap font-mono text-xs font-bold text-neutral-800">{b.bet_no}</Td>
                <Td>
                  <div>
                    <p className="font-medium text-neutral-900">{b.member_name}</p>
                    <p className="font-mono text-[11px] text-neutral-400">{b.member_phone}</p>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="size-2 rounded-full" style={{ backgroundColor: b.market_color }} />
                    <span className="text-xs font-semibold">{b.market_name}</span>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-xs">{b.bet_type}</Td>
                <Td>
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-bold text-neutral-800">
                    {b.numbers}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-right font-mono text-xs font-bold text-neutral-900">
                  {fmtTHB(b.amount)}
                </Td>
                <Td className="whitespace-nowrap text-right font-mono text-xs text-neutral-500">
                  ×{b.payout_rate}
                </Td>
                <Td className="whitespace-nowrap text-right font-mono text-xs font-bold">
                  {b.payout_amount > 0 ? (
                    <span className="text-brand-600">+{fmtTHB(b.payout_amount)}</span>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </Td>
                <Td>
                  <StatusBadge status={b.status} />
                </Td>
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
            ))}
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
                งวดวันที่ {selectedBet.draw_date} · บันทึกเมื่อ {selectedBet.created_at}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 text-xs">
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">สมาชิกผู้แทง:</span>
                <span className="font-semibold text-neutral-900">{selectedBet.member_name} ({selectedBet.member_phone})</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ตลาดหวย:</span>
                <span className="font-semibold" style={{ color: selectedBet.market_color }}>{selectedBet.market_name}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ประเภทการแทง:</span>
                <span className="font-medium text-neutral-800">{selectedBet.bet_type}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                <span className="text-neutral-500">ตัวเลขที่แทง:</span>
                <span className="font-mono text-sm font-black text-neutral-900">{selectedBet.numbers}</span>
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
