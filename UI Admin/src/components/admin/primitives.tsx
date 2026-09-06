"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Inbox, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Rounded pill button (ปุ่มขอบมน) ─────────────────────────────────────────
type BtnProps = React.ComponentProps<typeof Button>;
export function Btn({ className, variant, size, ...props }: BtnProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      {...props}
    />
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-neutral-200 bg-white", className)}>
      {children}
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "amber" | "rose" | "neutral" | "sky";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    neutral: "bg-neutral-100 text-neutral-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-neutral-500 sm:text-sm">{label}</p>
          <p className="mt-1 truncate text-lg font-bold tracking-tight text-neutral-900 sm:mt-1.5 sm:text-2xl">
            {value}
          </p>
          {sub ? <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-400 sm:text-xs">{sub}</p> : null}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full sm:size-11", tones[tone])}>
          <Icon className="size-4 sm:size-5" />
        </div>
      </div>
    </Panel>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "รอดำเนินการ", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  approved: { label: "อนุมัติแล้ว", cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  rejected: { label: "ปฏิเสธ", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
  active: { label: "ใช้งาน", cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  inactive: { label: "ไม่ใช้งาน", cls: "bg-neutral-100 text-neutral-500 ring-neutral-200" },
  suspended: { label: "ถูกระงับ", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
  won: { label: "ถูกรางวัล", cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  lost: { label: "ไม่ถูกรางวัล", cls: "bg-neutral-100 text-neutral-500 ring-neutral-200" },
  cancelled: { label: "ยกเลิก", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
  open: { label: "เปิดรับ", cls: "bg-brand-50 text-brand-700 ring-brand-200" },
  closed: { label: "ปิดรับแล้ว", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  awarding: { label: "รอออกผล", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  drawing: { label: "กำลังออกผล", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  settled: { label: "ออกผลแล้ว", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  block: { label: "ปิดรับ", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
  reduce: { label: "ลดอัตรา", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  super: { label: "ผู้ดูแลสูงสุด", cls: "bg-neutral-900 text-white ring-neutral-900" },
  admin: { label: "ผู้ดูแล", cls: "bg-brand-50 text-brand-700 ring-brand-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const b = BADGE_MAP[status.toLowerCase()] ?? {
    label: status,
    cls: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        b.cls
      )}
    >
      {b.label}
    </span>
  );
}

// ─── Search input ────────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = "ค้นหา...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-full border-neutral-200 bg-white pl-10 h-10"
      />
    </div>
  );
}

// ─── Table helpers ───────────────────────────────────────────────────────────
export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full min-w-[720px] text-sm", className)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-neutral-200 bg-neutral-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 first:rounded-tl-xl last:rounded-tr-xl",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-neutral-100 px-4 py-3.5 align-middle text-neutral-700", className)}>
      {children}
    </td>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-xs text-neutral-500">
        หน้า {page} จาก {pages}
      </span>
      <div className="flex items-center gap-1.5">
        <Btn variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-8 rounded-full px-3">
          <ChevronLeft className="size-4" /> ก่อนหน้า
        </Btn>
        <Btn variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)} className="h-8 rounded-full px-3">
          ถัดไป <ChevronRight className="size-4" />
        </Btn>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({
  title = "ไม่พบข้อมูล",
  desc,
}: {
  title?: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100">
        <Inbox className="size-6 text-neutral-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        {desc ? <p className="mt-1 text-xs text-neutral-400">{desc}</p> : null}
      </div>
    </div>
  );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  desc,
  confirmLabel = "ยืนยัน",
  confirmText,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onOpenChange?: (o: boolean) => void;
  title: string;
  desc?: string;
  confirmLabel?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
}) {
  const handleOpenChange = (o: boolean) => {
    if (onOpenChange) onOpenChange(o);
    if (!o && onClose) onClose();
  };
  const finalConfirmLabel = confirmText || confirmLabel;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <div className={cn("mb-1 flex size-11 items-center justify-center rounded-full", danger ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-600")}>
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{desc ?? "โปรดตรวจสอบและยืนยันการทำรายการ"}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Btn>
          <Btn
            className={cn("rounded-full", danger ? "bg-rose-600 hover:bg-rose-700" : "")}
            onClick={() => {
              onConfirm();
              handleOpenChange(false);
            }}
          >
            {finalConfirmLabel}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Toggle switch row ───────────────────────────────────────────────────────
import { Switch } from "@/components/ui/switch";
export function ToggleRow({
  label,
  desc,
  checked,
  onCheckedChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {desc ? <p className="mt-0.5 text-xs text-neutral-400">{desc}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─── Form field ──────────────────────────────────────────────────────────────
import { Label } from "@/components/ui/label";
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm text-neutral-600">{label}</Label>
      {children}
    </div>
  );
}

export const inputCls =
  "rounded-xl border-neutral-200 bg-white focus-visible:ring-brand-500/30 h-10";

// ─── Avatar (profile image with initial circle fallback) ─────────────────────
const AVATAR_COLORS = ["#0d9488", "#e11d48", "#7c3aed", "#f59e0b", "#287e0b", "#2563eb", "#dc2626", "#0891b2"];
export function Avatar({
  name,
  color,
  imageUrl,
  className,
}: {
  name: string;
  color?: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const initial = name.trim().charAt(0) || "?";
  const idx = name.length % AVATAR_COLORS.length;

  if (imageUrl && !imgFailed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgFailed(true)}
        className={cn("size-9 shrink-0 rounded-full object-cover ring-1 ring-neutral-200", className)}
      />
    );
  }

  return (
    <div
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", className)}
      style={{ backgroundColor: color ?? AVATAR_COLORS[idx] }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

// ─── MarketLogo (โลโก้ตลาดหวยจริง พร้อม fallback ตัวย่อสี) ─────────────────
export function MarketLogo({
  logoUrl,
  imageUrl,
  name,
  code,
  color,
  className,
  size = "md",
}: {
  logoUrl?: string | null;
  imageUrl?: string | null;
  name?: string;
  code?: string;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const [failed, setFailed] = React.useState(false);
  const src = !failed ? (logoUrl || imageUrl) : null;

  const dim =
    size === "sm"
      ? "size-7 rounded-lg text-[9px]"
      : size === "lg"
      ? "size-11 rounded-2xl text-xs"
      : size === "xl"
      ? "size-14 rounded-2xl text-base"
      : "size-9 rounded-xl text-[10px]";

  const shortName = code ? code.slice(0, 3) : name ? name.slice(0, 2) : "หวย";

  if (src) {
    return (
      <img
        src={src}
        alt={name || code || "ตลาดหวย"}
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 object-cover bg-white ring-1 ring-neutral-200/80 shadow-sm p-0.5",
          dim,
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center font-black text-white shadow-sm ring-1 ring-black/5",
        dim,
        className
      )}
      style={{ backgroundColor: color || "#1b5e20" }}
      aria-hidden
    >
      {shortName}
    </span>
  );
}

// ─── BankBadge (โลโก้ + ชื่อธนาคาร) ──────────────────────────────────────────
import { bankOf, BANKS as BANKS_LIST } from "@/data/admin-mock";
export function BankBadge({ code, className }: { code: string; className?: string }) {
  const b = bankOf(code);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {b.logo_url ? (
        <img
          src={b.logo_url}
          alt={b.name}
          className="size-6 shrink-0 rounded-md object-contain bg-white ring-1 ring-neutral-200/70 p-0.5"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-black tracking-tight text-white"
          style={{ backgroundColor: b.color }}
        >
          {b.short.slice(0, 2)}
        </span>
      )}
      <span className="text-sm font-medium text-neutral-700">{b.name}</span>
    </span>
  );
}

// ─── BankSelector (dropdown เลือกธนาคาร 10 ธนาคาร) ───────────────────────────
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
export function BankSelector({
  value,
  onChange,
  placeholder = "เลือกธนาคาร",
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", inputCls)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        {BANKS_LIST.map((b) => (
          <SelectItem key={b.code} value={b.code}>
            <span className="flex items-center gap-2">
              {b.logo_url ? (
                <img
                  src={b.logo_url}
                  alt={b.name}
                  className="size-5 shrink-0 rounded object-contain bg-white ring-1 ring-neutral-200/70 p-0.5"
                />
              ) : (
                <span
                  className="flex size-5 items-center justify-center rounded text-[8px] font-black text-white"
                  style={{ backgroundColor: b.color }}
                >
                  {b.short.slice(0, 2)}
                </span>
              )}
              {b.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Solid circular ColorPickerInput ─────────────────────────────────────────
export function ColorPickerInput({
  value,
  onChange,
  className,
  size = "md",
  ariaLabel = "เลือกสี",
}: {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}) {
  const sizeMap = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  };
  return (
    <label
      className={cn(
        "group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-200/80 shadow-xs ring-2 ring-white transition-all hover:scale-105 hover:shadow-md active:scale-95",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: value || "#059669" }}
      title={`สี: ${value}`}
    >
      <input
        type="color"
        value={value || "#059669"}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        aria-label={ariaLabel}
      />
    </label>
  );
}

// ─── Realtime indicator ──────────────────────────────────────────────────────
export function RealtimeDot({ label = "อัปเดตสด" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
      </span>
      {label}
    </span>
  );
}

