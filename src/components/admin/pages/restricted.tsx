"use client";

import * as React from "react";
import { Plus, ShieldAlert, Trash2, Ban, Percent, Search, Filter } from "lucide-react";
import { Panel, Btn, PageHeader, TableWrap, Th, Td, Field, inputCls, EmptyState, ConfirmDialog, MarketLogo } from "../primitives";
import { LottoBall } from "./instant";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MARKETS,
  BET_TYPES,
  BET_TYPE_LABEL,
  fmtTHB,
  type RestrictedNumber,
  type BetType,
} from "@/data/admin-mock";
import { cn } from "@/lib/utils";

interface FormState {
  market_id: string;
  bet_type: BetType;
  number: string;
  mode: "blocked" | "half";
  payout_rate: number;
  max_amount: number;
  draw_date: string;
}

export function RestrictedNumbersPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<RestrictedNumber[]>([]);
  const [marketList, setMarketList] = React.useState<any[]>([]);
  const [marketFilter, setMarketFilter] = React.useState("ALL");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | "BLOCKED" | "HALF">("ALL");
  const [q, setQ] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<RestrictedNumber | null>(null);

  const [form, setForm] = React.useState<FormState>({
    market_id: "",
    bet_type: "3TOP",
    number: "",
    mode: "blocked",
    payout_rate: 0,
    max_amount: 0,
    draw_date: "16/09/2569",
  });

  const filtered = rows
    .filter((r) => marketFilter === "ALL" || r.market_id === marketFilter || r.market_code === marketFilter)
    .filter((r) => {
      if (typeFilter === "BLOCKED") return r.payout_rate === 0;
      if (typeFilter === "HALF") return r.payout_rate > 0;
      return true;
    })
    .filter(
      (r) =>
        !q.trim() ||
        r.number.includes(q.trim()) ||
        r.market_name.includes(q.trim()) ||
        BET_TYPE_LABEL[r.bet_type]?.includes(q.trim())
    );

  // Load Markets and Restricted Numbers
  React.useEffect(() => {
    fetch("/api/admin/data?resource=markets")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setMarketList(res.data);
          setForm((prev) => ({ ...prev, market_id: prev.market_id || res.data[0].id }));
        }
      })
      .catch((e) => console.error("Could not fetch markets for restricted numbers:", e));

    fetch("/api/admin/data?resource=restricted-numbers")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((d: any) => {
            const mkt = d.lottery_markets || (marketList.find((m: any) => m.id === d.market_id));
            return {
              id: d.id,
              market_id: d.market_id,
              market_name: mkt?.name || "หวย",
              market_code: mkt?.code || "MKT",
              market_color: mkt?.color || "#059669",
              market_logo: d.lottery_markets?.logo_url || d.lottery_markets?.image_url || mkt?.logo_url || mkt?.image_url || null,
              bet_type: d.bet_type as BetType,
              number: d.number,
              max_amount: parseFloat(d.max_amount) || 0,
              payout_rate: parseFloat(d.payout_rate) || 0,
              draw_date: d.draw_date || "16/09/2569",
              created_at: new Date(d.created_at).toLocaleString("th-TH"),
            };
          });
          setRows(mapped);
        }
      })
      .catch((e) => console.error("Could not fetch live restricted numbers:", e));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim()) return;

    const targetMkt = marketList.find((m) => m.id === form.market_id) || MARKETS[0];
    const newRecord: RestrictedNumber = {
      id: "rn_" + Date.now(),
      market_id: form.market_id || (marketList[0]?.id ?? ""),
      market_name: targetMkt?.name || "หวย",
      market_code: targetMkt.code,
      market_color: targetMkt.color,
      market_logo: targetMkt.logo_url || targetMkt.image_url || null,
      bet_type: form.bet_type,
      number: form.number.trim(),
      max_amount: Number(form.max_amount) || 0,
      payout_rate: form.mode === "blocked" ? 0 : form.payout_rate,
      draw_date: form.draw_date,
      created_at: new Date().toLocaleDateString("th-TH") + " " + new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    };

    setRows((prev) => [newRecord, ...prev]);
    toast({
      title: form.mode === "blocked" ? "บันทึกเลขอั้นแล้ว (ไม่รับแทง)" : "บันทึกเลขจ่ายครึ่งแล้ว",
      description: `${targetMkt.name} · ${BET_TYPE_LABEL[form.bet_type]} [${form.number}] บันทึกสำเร็จ`,
    });
    setIsModalOpen(false);
    setForm({
      market_id: MARKETS[0].id,
      bet_type: "3TOP",
      number: "",
      mode: "blocked",
      payout_rate: 0,
      max_amount: 0,
      draw_date: "16/09/2569",
    });

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_restricted_number",
          payload: {
            market_id: form.market_id,
            bet_type: form.bet_type,
            number: form.number.trim(),
            max_amount: Number(form.max_amount) || 0,
            payout_rate: form.mode === "blocked" ? 0 : form.payout_rate,
            draw_date: "2026-09-16",
            note: form.mode === "blocked" ? "เลขอั้น" : "เลขจ่ายครึ่ง",
          },
        }),
      });
    } catch (err) {
      console.error("Failed to sync restricted number to Supabase:", err);
    }
  };

  const handleSave = () => handleAdd({ preventDefault: () => {} } as any);

  const handleDelete = async (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "ยกเลิกเลขอั้นแล้ว", description: "ลบรายการออกจากระบบเรียบร้อย" });
    setConfirmDel(null);

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_restricted_number",
          payload: { id },
        }),
      });
    } catch (err) {
      console.error("Failed to delete restricted number on Supabase:", err);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="จัดการเลขอั้นและเลขจ่ายครึ่ง"
        description="ตารางควบคุมความเสี่ยง (public.restricted_numbers) · บล็อกเลขอั้นไม่รับแทง หรือปรับลดอัตราจ่ายตามงวด"
      >
        <Btn className="rounded-full" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" /> เพิ่มเลขอั้น / เลขจ่ายครึ่ง
        </Btn>
      </PageHeader>

      {/* Filters */}
      <Panel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="h-9 w-48 rounded-xl border-neutral-200 text-xs">
                <SelectValue placeholder="เลือกตลาดหวย" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl">
                <SelectItem value="ALL">ทุกล่าสุด ({marketList.length || 37} ตลาด)</SelectItem>
                {(marketList.length > 0 ? marketList : MARKETS).map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex rounded-xl bg-neutral-100 p-1">
              {[
                { id: "ALL", label: `ทั้งหมด (${rows.length})` },
                { id: "BLOCKED", label: `เลขอั้น/ไม่รับ (${rows.filter((r) => r.payout_rate === 0).length})` },
                { id: "HALF", label: `เลขลดอัตรา (${rows.filter((r) => r.payout_rate > 0).length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id as any)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap",
                    typeFilter === t.id ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-64">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาตัวเลขหรือตลาด..."
              className="h-9 rounded-full border-neutral-200 bg-white text-xs"
            />
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel>
        <TableWrap className="min-w-[760px]">
          <thead>
            <tr>
              <Th>ตลาดหวย</Th>
              <Th>ประเภทแทง</Th>
              <Th>ตัวเลข</Th>
              <Th>เงื่อนไขการรับแทง</Th>
              <Th className="text-right">เพดานรับสูงสุด</Th>
              <Th>งวดวันที่</Th>
              <Th>วันที่บันทึก</Th>
              <Th className="text-right">จัดการ</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-neutral-50/70">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <MarketLogo
                      logoUrl={r.market_logo}
                      name={r.market_name}
                      code={r.market_code}
                      color={r.market_color}
                      size="sm"
                    />
                    <span className="font-semibold text-neutral-900">{r.market_name}</span>
                  </div>
                </Td>
                <Td>
                  <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    {BET_TYPE_LABEL[r.bet_type] ?? r.bet_type}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {String(r.number ?? "")
                      .split("")
                      .map((digit, idx) => (
                        <LottoBall key={idx} digit={digit} size="md" />
                      ))}
                  </div>
                </Td>
                <Td>
                  {r.payout_rate === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
                      <Ban className="size-3 text-rose-600" /> เลขอั้น (ปิดรับแทง)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                      <Percent className="size-3 text-amber-600" /> จ่ายเรทลดเหลือ {r.payout_rate} บาท
                    </span>
                  )}
                </Td>
                <Td className="text-right font-mono text-xs font-semibold">
                  {r.max_amount > 0 ? fmtTHB(r.max_amount) : "ไม่จำกัดยอด"}
                </Td>
                <Td className="text-xs text-neutral-600">{r.draw_date}</Td>
                <Td className="text-xs text-neutral-400">{r.created_at}</Td>
                <Td className="text-right">
                  <Btn
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-full border-rose-200 p-0 text-rose-600 hover:bg-rose-50"
                    title="ลบเลขอั้น"
                    onClick={() => setConfirmDel(r)}
                  >
                    <Trash2 className="size-3.5" />
                  </Btn>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        {filtered.length === 0 ? <EmptyState title="ไม่พบรายการเลขอั้นตามเงื่อนไขที่เลือก" /> : null}
      </Panel>

      {/* Modal Add Restricted Number */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มเลขอั้น / เลขจ่ายครึ่งราคา</DialogTitle>
            <DialogDescription>
              กำหนดตัวเลขเพื่อป้องกันความเสี่ยงของระบบ (บันทึกลงตาราง public.restricted_numbers)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="เลือกตลาดหวย">
                <Select
                  value={form.market_id}
                  onValueChange={(v) => setForm((p) => ({ ...p, market_id: v }))}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-2xl">
                    {(marketList.length > 0 ? marketList : MARKETS).map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="ประเภทการแทง">
                <Select
                  value={form.bet_type}
                  onValueChange={(v) => setForm((p) => ({ ...p, bet_type: v as BetType }))}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {BET_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {BET_TYPE_LABEL[bt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ตัวเลขที่ต้องการกำหนด">
                <Input
                  value={form.number}
                  onChange={(e) => setForm((p) => ({ ...p, number: e.target.value.replace(/\D/g, "") }))}
                  placeholder="เช่น 915 หรือ 59"
                  className={cn(inputCls, "font-mono font-bold text-base")}
                  autoFocus
                />
              </Field>

              <Field label="งวดวันที่ (วว/ดด/ปปปป)">
                <Input
                  value={form.draw_date}
                  onChange={(e) => setForm((p) => ({ ...p, draw_date: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="รูปแบบเงื่อนไข">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, mode: "blocked", payout_rate: 0 }))}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all",
                    form.mode === "blocked"
                      ? "border-rose-500 bg-rose-50/60 text-rose-800"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  )}
                >
                  <Ban className="size-5 text-rose-600" />
                  <span className="text-xs font-bold">เลขอั้น (ไม่รับแทง)</span>
                  <span className="text-[10px] text-neutral-400">อัตราจ่าย 0 บาท / ปฏิเสธบิลทันที</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, mode: "half", payout_rate: 45 }))}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all",
                    form.mode === "half"
                      ? "border-amber-500 bg-amber-50/60 text-amber-800"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  )}
                >
                  <Percent className="size-5 text-amber-600" />
                  <span className="text-xs font-bold">เลขจ่ายครึ่ง / ลดอัตรา</span>
                  <span className="text-[10px] text-neutral-400">อนุญาตให้แทงได้ในอัตราที่ลดลง</span>
                </button>
              </div>
            </Field>

            {form.mode === "half" ? (
              <Field label="อัตราจ่ายใหม่ต่อ 1 บาท (บาท)">
                <Input
                  type="number"
                  min={1}
                  value={form.payout_rate}
                  onChange={(e) => setForm((p) => ({ ...p, payout_rate: Number(e.target.value) }))}
                  className={inputCls}
                />
              </Field>
            ) : null}

            <Field label="เพดานวงเงินรับแทงรวมสูงสุดต่อเลข (บาท)">
              <Input
                type="number"
                min={0}
                value={form.max_amount}
                onChange={(e) => setForm((p) => ({ ...p, max_amount: Number(e.target.value) }))}
                placeholder="0 = ปิดรับแทงทันที"
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                หากยอดแทงสะสมของตัวเลขนี้เกินวงเงิน ระบบจะปฏิเสธโพยส่วนเกินอัตโนมัติ
              </p>
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Btn variant="outline" className="rounded-full" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Btn>
            <Btn className="rounded-full" onClick={handleSave}>
              บันทึกเลขอั้น
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDel !== null}
        title="ยืนยันการยกเลิกเลขอั้น?"
        desc={`คุณต้องการยกเลิกการจำกัดเลข ${confirmDel?.number} ของตลาด ${confirmDel?.market_name} ใช่หรือไม่?`}
        confirmLabel="ยืนยันการยกเลิก"
        danger
        onOpenChange={(o) => !o && setConfirmDel(null)}
        onConfirm={() => confirmDel && handleDelete(confirmDel.id)}
      />
    </div>
  );
}
