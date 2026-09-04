"use client";

import * as React from "react";
import { DatabaseBackup, Download, FileJson, FileSpreadsheet, RefreshCw, HardDrive, Clock, ShieldCheck } from "lucide-react";
import { Panel, Btn, PageHeader, ConfirmDialog, TableWrap, Th, Td } from "../primitives";
import { useToast } from "@/hooks/use-toast";
import { DB_TABLE_STATS, BACKUP_LOGS, fmtNum, type BackupLog } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

const EXPORT_SETS: { name: string; table: string; rows: number; formats: ("csv" | "json")[] }[] = [
  { name: "สมาชิกทั้งหมด", table: "profiles", rows: 4892, formats: ["csv", "json"] },
  { name: "ธุรกรรมการเงิน", table: "transactions", rows: 89210, formats: ["csv"] },
  { name: "โพยทั้งหมด", table: "bets", rows: 128450, formats: ["csv"] },
  { name: "ผลรางวัลย้อนหลัง", table: "lottery_results", rows: 3410, formats: ["csv", "json"] },
  { name: "ตั้งค่าระบบ", table: "settings", rows: 86, formats: ["json"] },
];

function toCsv(headers: string[]): string {
  return headers.join(",");
}

export function DataManagementPage() {
  const { toast } = useToast();
  const [tables, setTables] = React.useState(DB_TABLE_STATS);
  const [backups, setBackups] = React.useState<BackupLog[]>(BACKUP_LOGS);
  const [refreshing, setRefreshing] = React.useState(false);
  const [confirmBackup, setConfirmBackup] = React.useState(false);

  const totalRows = tables.reduce((a, t) => a + t.rows, 0);
  const totalMb = tables.reduce((a, t) => a + t.size_mb, 0);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTables((prev) => prev.map((t) => ({ ...t, rows: t.rows + Math.floor(Math.random() * 12) })));
      setRefreshing(false);
      toast({ title: "รีเฟรชสถิติตารางแล้ว" });
    }, 600);
  };

  const doExport = (name: string, format: "csv" | "json", rows: number) => {
    if (format === "csv") {
      const csv = toCsv(["export", name, `rows=${rows}`, `date=${new Date().toLocaleDateString("th-TH")}`]);
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thlotto-${name}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast({ title: `ส่งออก${format.toUpperCase()}แล้ว`, description: `${name} · ${fmtNum(rows)} แถว` });
    setBackups((p) => [
      { id: `bp-${Date.now()}`, type: format, scope: name, file_size: `${(rows / 1000).toFixed(1)} MB`, rows_exported: rows, by: "เจ้าของเว็บ", at: "วันนี้" },
      ...p,
    ]);
  };

  const doBackup = () => {
    setBackups((p) => [
      { id: `bp-${Date.now()}`, type: "database", scope: "สำรองทั้งระบบ", file_size: `${(totalMb + 30).toFixed(1)} MB`, rows_exported: totalRows, by: "เจ้าของเว็บ", at: "วันนี้" },
      ...p,
    ]);
    toast({ title: "สำรองฐานข้อมูลแล้ว", description: `สำรองข้อมูล ${fmtNum(totalRows)} แถว เรียบร้อย · ระบบจะแจ้งเตือนเมื่อเสร็จ` });
  };

  const groups = [...new Set(tables.map((t) => t.group))];

  return (
    <div className="space-y-4">
      <PageHeader
        title="สำรองและจัดการข้อมูล"
        description="จัดการสำรองฐานข้อมูล ส่งออกข้อมูล และตรวจสอบสถิติตาราง"
      >
        <Btn variant="outline" className="rounded-full" onClick={refresh} disabled={refreshing}>
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} /> รีเฟรช
        </Btn>
        <Btn className="rounded-full" onClick={() => setConfirmBackup(true)}>
          <DatabaseBackup className="size-4" /> สำรองทันที
        </Btn>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"><HardDrive className="size-5" /></div>
          <div>
            <p className="text-xs text-neutral-500">ขนาดข้อมูลรวม</p>
            <p className="text-lg font-bold text-neutral-900">{totalMb.toFixed(1)} MB</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-600"><DatabaseBackup className="size-5" /></div>
          <div>
            <p className="text-xs text-neutral-500">แถวข้อมูลรวม ({tables.length} ตาราง)</p>
            <p className="text-lg font-bold text-neutral-900">{fmtNum(totalRows)}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Clock className="size-5" /></div>
          <div>
            <p className="text-xs text-neutral-500">สำรองล่าสุด (อัตโนมัติ 04:00)</p>
            <p className="text-lg font-bold text-neutral-900">{backups[0]?.at ?? "—"}</p>
          </div>
        </Panel>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        {/* Export */}
        <Panel className="min-w-0 lg:col-span-2">
          <div className="border-b border-neutral-100 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Download className="size-4 text-brand-600" /> ส่งออกข้อมูล
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">ดาวน์โหลดไฟล์รายกลุ่มข้อมูล</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {EXPORT_SETS.map((e) => (
              <div key={e.table} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{e.name}</p>
                  <p className="font-mono text-[11px] text-neutral-400">{e.table} · {fmtNum(e.rows)} แถว</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {e.formats.includes("csv") ? (
                    <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => doExport(e.name, "csv", e.rows)}>
                      <FileSpreadsheet className="size-3.5 text-brand-600" /> ไฟล์ตาราง
                    </Btn>
                  ) : null}
                  {e.formats.includes("json") ? (
                    <Btn size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={() => doExport(e.name, "json", e.rows)}>
                      <FileJson className="size-3.5 text-sky-600" /> ไฟล์ข้อมูล
                    </Btn>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Table stats */}
        <Panel className="min-w-0 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <ShieldCheck className="size-4 text-brand-600" /> สถิติตารางฐานข้อมูล
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">จำนวนแถวและขนาดของแต่ละตารางในระบบ</p>
            </div>
          </div>
          <TableWrap className="min-w-[560px]">
            <thead>
              <tr>
                <Th>ตาราง</Th>
                <Th>กลุ่ม</Th>
                <Th className="text-right">แถว</Th>
                <Th className="text-right">ขนาด</Th>
                <Th className="text-right">สัดส่วน</Th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.table} className="transition-colors hover:bg-neutral-50/60">
                  <Td className="font-mono text-xs font-semibold text-neutral-900">{t.table}</Td>
                  <Td>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">{t.group}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-right font-mono text-xs">{fmtNum(t.rows)}</Td>
                  <Td className="whitespace-nowrap text-right font-mono text-xs">{t.size_mb.toFixed(1)} MB</Td>
                  <Td className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, (t.size_mb / totalMb) * 100)}%` }} />
                      </div>
                      <span className="w-9 text-right text-[10px] text-neutral-400">{((t.size_mb / totalMb) * 100).toFixed(1)}%</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      </div>

      {/* Backup history */}
      <Panel>
        <div className="border-b border-neutral-100 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <DatabaseBackup className="size-4 text-brand-600" /> ประวัติการสำรองข้อมูล
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">ระบบสำรองอัตโนมัติทุกวันเวลา 04:00 น.</p>
        </div>
        <TableWrap className="min-w-[680px]">
          <thead>
            <tr>
              <Th>ประเภท</Th>
              <Th>ขอบเขต</Th>
              <Th className="text-right">แถว</Th>
              <Th className="text-right">ขนาดไฟล์</Th>
              <Th>โดย</Th>
              <Th>เวลา</Th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-neutral-50/60">
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
                      b.type === "database" ? "bg-neutral-900 text-white ring-neutral-900" : b.type === "csv" ? "bg-brand-50 text-brand-700 ring-brand-200" : "bg-sky-50 text-sky-700 ring-sky-200"
                    )}
                  >
                    {b.type === "database" ? <DatabaseBackup className="size-3" /> : b.type === "csv" ? <FileSpreadsheet className="size-3" /> : <FileJson className="size-3" />}
                    {b.type === "database" ? "ฐานข้อมูล" : b.type === "csv" ? "ตาราง" : "ข้อมูล"}
                  </span>
                </Td>
                <Td className="max-w-[240px]">
                  <p className="truncate text-sm text-neutral-800">{b.scope}</p>
                  {groups.length > 0 ? null : null}
                </Td>
                <Td className="whitespace-nowrap text-right font-mono text-xs">{fmtNum(b.rows_exported)}</Td>
                <Td className="whitespace-nowrap text-right font-mono text-xs">{b.file_size}</Td>
                <Td className="whitespace-nowrap text-xs">{b.by}</Td>
                <Td className="whitespace-nowrap text-xs text-neutral-500">{b.at}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      {confirmBackup ? (
        <ConfirmDialog
          open
          title="สำรองฐานข้อมูลทันที?"
          desc={`สำรองข้อมูลทั้งหมด ${fmtNum(totalRows)} แถว (${totalMb.toFixed(1)} MB) · ระบบจะแจ้งเตือนเมื่อเสร็จ`}
          confirmLabel="เริ่มสำรอง"
          onOpenChange={setConfirmBackup}
          onConfirm={doBackup}
        />
      ) : null}
    </div>
  );
}
