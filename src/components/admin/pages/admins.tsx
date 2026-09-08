import * as React from "react";
import { Plus, Pencil, ShieldCheck, KeyRound, Ban, RotateCcw, Trash2, Loader2, Lock } from "lucide-react";
import { Panel, Btn, StatusBadge, Avatar, PageHeader, TableWrap, Th, Td, Field, inputCls, EmptyState, ConfirmDialog } from "../primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAdminNav } from "../store";
import { PERMISSION_KEYS, type AdminUser } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

function AdminForm({ initial, onClose, onSave }: { initial: AdminUser; onClose: () => void; onSave: (a: AdminUser, password?: string) => void }) {
  const [f, setF] = React.useState<AdminUser>(initial);
  const [pw, setPw] = React.useState("");
  const isNew = !initial.id;
  const isSuper = f.role === "super";

  const togglePerm = (key: string) => {
    if (isSuper) return;
    setF((p) => ({ ...p, permissions: p.permissions.includes(key) ? p.permissions.filter((k) => k !== key) : [...p.permissions, key] }));
  };

  const handleFormSubmit = () => {
    if (!f.phone?.trim()) {
      alert("กรุณาระบุเบอร์โทรศัพท์ อีเมล หรือชื่อผู้ใช้สำหรับเข้าใช้งาน");
      return;
    }
    if (isNew && (!pw || pw.length < 4)) {
      alert("กรุณากำหนดรหัสผ่านหรือ PIN อย่างน้อย 4 หลัก");
      return;
    }
    onSave(f, pw);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "เพิ่มผู้ดูแลระบบ" : `แก้ไขผู้ดูแล — ${initial.full_name}`}</DialogTitle>
          <DialogDescription>บัญชีผู้ดูแลระบบและสิทธิ์การเข้าถึงทั้งหมด</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">ข้อมูลส่วนตัว</p>
          <Field label="ชื่อ-นามสกุล"><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เบอร์โทร / อีเมล / Username"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0812345678 หรือ email/user" className={inputCls} /></Field>
            <Field label={isNew ? "รหัสผ่าน / PIN (อย่างน้อย 4 หลัก)" : "รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)"}>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="รหัสผ่าน หรือ PIN 4 หลัก" className={inputCls} />
            </Field>
          </div>
          <Field label="ระดับผู้ดูแล">
            <div className="flex gap-2">
              {(["super", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setF((p) => ({ ...p, role: r, permissions: r === "super" ? PERMISSION_KEYS.map((k) => k.key) : p.permissions }))}
                  className={cn(
                    "flex-1 rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                    f.role === r ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  )}
                >
                  {r === "super" ? "ผู้ดูแลสูงสุด (ทุกสิทธิ์)" : "ผู้ดูแล (เลือกสิทธิ์)"}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                สิทธิ์ที่เลือก <span className={cn("ml-1 font-bold", isSuper ? "text-neutral-400" : "text-brand-600")}>({isSuper ? 15 : f.permissions.length}/15)</span>
              </p>
              {!isSuper && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setF((p) => ({ ...p, permissions: PERMISSION_KEYS.map((k) => k.key) }))}
                    className="text-[11px] font-semibold text-brand-600 hover:underline"
                  >
                    เลือกทั้งหมด
                  </button>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={() => setF((p) => ({ ...p, permissions: [] }))}
                    className="text-[11px] font-semibold text-neutral-400 hover:underline"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              )}
            </div>
            {isSuper ? (
              <p className="rounded-2xl bg-neutral-50 px-3.5 py-3 text-xs text-neutral-500">ผู้ดูแลสูงสุดมีสิทธิ์ทุกอย่างอัตโนมัติ และสามารถเพิ่ม/ลดสิทธิ์ของผู้ดูแลคนอื่นได้</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PERMISSION_KEYS.map((p) => (
                  <label
                    key={p.key}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-2xl border p-2.5 transition-colors",
                      f.permissions.includes(p.key) ? "border-brand-200 bg-brand-50/60" : "border-neutral-100 hover:bg-neutral-50"
                    )}
                  >
                    <Checkbox
                      checked={f.permissions.includes(p.key)}
                      onCheckedChange={() => togglePerm(p.key)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-neutral-800">{p.label}</span>
                      <span className="block truncate text-[11px] text-neutral-400">เมนู: {p.page}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose}>ยกเลิก</Btn>
          <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={handleFormSubmit}>บันทึกข้อมูลจริง</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordResetDialog({ admin, onClose, onSuccess }: { admin: AdminUser; onClose: () => void; onSuccess: () => void }) {
  const [newPassword, setNewPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (newPassword.length < 4) {
      toast({ title: "รหัสผ่านสั้นเกินไป", description: "รหัสผ่านใหม่หรือ PIN ต้องมีความยาวอย่างน้อย 4 หลัก", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_admin_user",
          payload: { id: admin.id, password: newPassword },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "เปลี่ยนรหัสผ่านสำเร็จ", description: `อัปเดตรหัสผ่านใหม่สำหรับ ${admin.full_name} (${admin.phone}) ในระบบเรียบร้อยแล้ว` });
        onSuccess();
        onClose();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>รีเซ็ตรหัสผ่าน — {admin.full_name}</DialogTitle>
          <DialogDescription>กำหนดรหัสผ่านใหม่สำหรับบัญชีแอดมินเบอร์ {admin.phone}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Field label="รหัสผ่านใหม่ หรือ PIN (อย่างน้อย 4 หลัก)">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่ หรือ PIN 4 หลักที่นี่..."
              className={inputCls}
            />
          </Field>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Btn variant="outline" className="rounded-full" onClick={onClose} disabled={saving}>ยกเลิก</Btn>
          <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <KeyRound className="mr-1.5 size-4" />}
            บันทึกรหัสผ่านใหม่
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminsPage() {
  const { currentAdmin } = useAdminNav();
  const { toast } = useToast();
  const [rows, setRows] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<{ initial: AdminUser } | null>(null);
  const [pwModal, setPwModal] = React.useState<AdminUser | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<AdminUser | null>(null);

  const isSuperAdmin = currentAdmin?.admin_role === "super_admin" || currentAdmin?.is_super;

  const emptyAdmin: AdminUser = { id: "", full_name: "", phone: "", role: "admin", status: "active", permissions: ["deposits", "withdrawals", "members", "bets"], avatar_color: "#0d9488" };

  const fetchAdmins = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?resource=admins");
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.admins)) {
        const mapped: AdminUser[] = json.data.admins.map((a: any) => {
          let perms: string[] = [];
          if (a.admin_role === "super_admin") {
            perms = PERMISSION_KEYS.map((k) => k.key);
          } else if (Array.isArray(a.admin_permissions) && a.admin_permissions.length > 0) {
            perms = a.admin_permissions.includes("*") ? PERMISSION_KEYS.map((k) => k.key) : a.admin_permissions;
          } else {
            perms = ["deposits", "withdrawals", "members", "bets"];
          }

          return {
            id: a.id,
            full_name: a.full_name || "แอดมิน",
            phone: a.phone || "-",
            role: (a.admin_role === "super_admin" ? "super" : "admin") as "super" | "admin",
            status: (a.status as AdminUser["status"]) || "active",
            permissions: perms,
            avatar_color: a.admin_role === "super_admin" ? "#d97706" : "#0d9488",
            avatar_url: a.avatar_url || null,
          };
        });
        setRows(mapped);
      }
    } catch (e) {
      console.error("Failed to load admins:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleSaveAdmin = async (a: AdminUser, password?: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "ไม่มีสิทธิ์ดำเนินการ",
        description: "เฉพาะบัญชี Super Admin เท่านั้นที่สามารถสร้างหรือกำหนดบทบาทแอดมินได้",
        variant: "destructive",
      });
      return;
    }
    const isNew = !a.id;
    try {
      const action = isNew ? "create_admin_user" : "update_admin_user";
      const payload = isNew
        ? {
            full_name: a.full_name,
            phone: a.phone,
            password: password || undefined,
            admin_role: a.role === "super" ? "super_admin" : "admin",
            permissions: a.role === "super" ? ["*"] : a.permissions,
          }
        : {
            id: a.id,
            full_name: a.full_name,
            phone: a.phone,
            password: password && password.length >= 6 ? password : undefined,
            admin_role: a.role === "super" ? "super_admin" : "admin",
            permissions: a.role === "super" ? ["*"] : a.permissions,
            status: a.status,
          };

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: isNew ? "เพิ่มผู้ดูแลระบบสำเร็จ" : "บันทึกข้อมูลและสิทธิ์แอดมินแล้ว",
          description: `${a.full_name} · สิทธิ์: ${a.role === "super" ? "ทุกสิทธิ์ (Super Admin)" : `${a.permissions.length} สิทธิ์ที่เลือก`}`,
        });
        fetchAdmins();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const handleRevokeAdmin = async (a: AdminUser) => {
    if (!isSuperAdmin) {
      toast({ title: "ไม่มีสิทธิ์", description: "เฉพาะ Super Admin เท่านั้นที่สามารถถอดสิทธิ์แอดมินได้", variant: "destructive" });
      return;
    }
    if (a.id === currentAdmin?.id) {
      toast({ title: "ไม่สามารถดำเนินการได้", description: "ไม่สามารถถอดสิทธิ์บัญชีของตนเองได้", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_admin_user",
          payload: { id: a.id },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "ถอดสิทธิ์ผู้ดูแลระบบแล้ว",
          description: `${a.full_name} ถูกลดระดับกลับเป็นสมาชิกทั่วไปเรียบร้อยแล้ว`,
        });
        setConfirmDel(null);
        fetchAdmins();
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: json.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "เชื่อมต่อล้มเหลว", description: e.message, variant: "destructive" });
    }
  };

  const toggleSuspend = async (a: AdminUser) => {
    if (!isSuperAdmin) {
      toast({ title: "ไม่มีสิทธิ์", description: "เฉพาะ Super Admin เท่านั้นที่สามารถระงับแอดมินได้", variant: "destructive" });
      return;
    }
    if (a.id === currentAdmin?.id) {
      toast({ title: "ไม่สามารถดำเนินการได้", description: "ไม่สามารถระงับบัญชีของตนเองได้", variant: "destructive" });
      return;
    }
    const next = a.status === "active" ? "inactive" : "active";
    setRows((p) => p.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_admin_user",
          payload: { id: a.id, status: next },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: next === "inactive" ? "ระงับแอดมินแล้ว" : "ปลดระงับแอดมินแล้ว",
          description: `${a.full_name} · ${next === "inactive" ? "ไม่สามารถล็อกอินได้ชั่วคราว" : "กลับมาใช้งานได้ปกติ"}`,
        });
      }
    } catch (e: any) {
      toast({ title: "อัปเดตล้มเหลว", description: e.message, variant: "destructive" });
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="ผู้ดูแลระบบ"
        description={
          isSuperAdmin
            ? `บัญชีผู้ดูแลระบบจริงในฐานข้อมูล · ทั้งหมด ${rows.length} คน · ล็อกอินในฐานะ Super Admin (${currentAdmin?.full_name}) มีสิทธิ์สร้างและจัดการบทบาทแอดมินได้`
            : `บัญชีผู้ดูแลระบบจริงในฐานข้อมูล · ทั้งหมด ${rows.length} คน · ล็อกอินในฐานะ Admin (${currentAdmin?.full_name}) โหมดดูข้อมูลเท่านั้น (ไม่สามารถสร้างหรือแก้ไขแอดมินได้)`
        }
      >
        {isSuperAdmin ? (
          <Btn className="rounded-full bg-brand-600 hover:bg-brand-700" onClick={() => setForm({ initial: emptyAdmin })}>
            <Plus className="size-4" /> เพิ่มแอดมิน
          </Btn>
        ) : null}
      </PageHeader>

      {/* KPI Mini-Dashboard (PC Ergonomic Header) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel className="p-4 bg-linear-to-br from-white to-neutral-50/50">
          <p className="text-[11px] font-medium text-neutral-400">ผู้ดูแลระบบทั้งหมด</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-neutral-900">{rows.length}</p>
            <span className="text-xs font-semibold text-neutral-500">บัญชี</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">บัญชีแอดมินในฐานข้อมูล</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-amber-50/30 border-amber-100">
          <p className="text-[11px] font-medium text-amber-700">ซูเปอร์แอดมิน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-amber-600">{rows.filter((r) => r.role === "super").length}</p>
            <span className="text-xs font-bold text-amber-600">สิทธิ์สูงสุด</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600/80">สามารถจัดการบทบาทได้</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-emerald-50/30 border-emerald-100">
          <p className="text-[11px] font-medium text-emerald-700">สถานะพร้อมใช้งาน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-emerald-600">{rows.filter((r) => r.status === "active").length}</p>
            <span className="text-xs font-bold text-emerald-600">
              {rows.length > 0 ? Math.round((rows.filter((r) => r.status === "active").length / rows.length) * 100) : 0}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600/80">เข้าใช้งานระบบได้ปกติ</p>
        </Panel>

        <Panel className="p-4 bg-linear-to-br from-white to-rose-50/30 border-rose-100">
          <p className="text-[11px] font-medium text-rose-700">ระงับการใช้งาน</p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <p className="text-2xl font-black tracking-tight text-rose-600">{rows.filter((r) => r.status !== "active").length}</p>
            <span className="text-xs font-semibold text-rose-600">บัญชี</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80">ถูกล็อกหรือระงับสิทธิ์</p>
        </Panel>
      </div>

      <Panel>
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-brand-600" />
            <span className="text-sm text-neutral-500">กำลังโหลดรายชื่อผู้ดูแลระบบ...</span>
          </div>
        ) : (
          <TableWrap>
            <thead>
              <tr><Th>แอดมิน</Th><Th>เบอร์ / การเข้าสู่ระบบ</Th><Th>ระดับ</Th><Th>สถานะ</Th><Th>สิทธิ์การใช้งาน</Th><Th className="text-right">จัดการ</Th></tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-neutral-50/70">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.full_name} color={a.avatar_color} imageUrl={a.avatar_url} className="size-9" />
                      <div className="min-w-0">
                        <span className="whitespace-nowrap font-medium text-neutral-800">{a.full_name}</span>
                        {a.id === currentAdmin?.id ? (
                          <span className="ml-2 inline-flex rounded-full bg-brand-50 px-2 py-0.2 text-[10px] font-bold text-brand-700">คุณ</span>
                        ) : null}
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs">{a.phone}</Td>
                  <Td><StatusBadge status={a.role} /></Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td>
                    <div className="flex max-w-72 flex-wrap items-center gap-1">
                      {a.role === "super" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white"><ShieldCheck className="size-3" /> ทุกสิทธิ์ (15/15)</span>
                      ) : (
                        <>
                          {a.permissions.slice(0, 4).map((k) => (
                            <span key={k} className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                              {PERMISSION_KEYS.find((p) => p.key === k)?.label ?? k}
                            </span>
                          ))}
                          {a.permissions.length > 4 ? (
                            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">+{a.permissions.length - 4}</span>
                          ) : null}
                          {a.permissions.length === 0 ? <span className="text-xs text-neutral-300">ไม่มีสิทธิ์</span> : null}
                        </>
                      )}
                    </div>
                  </Td>
                  <Td className="text-right">
                    {isSuperAdmin ? (
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="outline" size="sm" className="h-8 whitespace-nowrap rounded-full px-2.5" onClick={() => setForm({ initial: a })}>
                          <Pencil className="size-3.5" /> แก้ไข
                        </Btn>
                        <Btn variant="outline" size="sm" className="h-8 whitespace-nowrap rounded-full px-2.5" title="รีเซ็ตรหัสผ่าน" onClick={() => setPwModal(a)}>
                          <KeyRound className="size-3.5" /> รหัสผ่าน
                        </Btn>
                        <Btn
                          variant="outline"
                          size="sm"
                          className={cn("h-8 whitespace-nowrap rounded-full px-2.5", a.status === "active" ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-brand-200 text-brand-700 hover:bg-brand-50")}
                          title={a.status === "active" ? "ระงับแอดมิน" : "ปลดระงับ"}
                          onClick={() => toggleSuspend(a)}
                          disabled={a.id === currentAdmin?.id}
                        >
                          {a.status === "active" ? <Ban className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                          {a.status === "active" ? "ระงับ" : "ปลด"}
                        </Btn>
                        {a.id !== currentAdmin?.id ? (
                          <Btn
                            variant="outline"
                            size="sm"
                            className="h-8 whitespace-nowrap rounded-full px-2 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                            title="ถอดสิทธิ์แอดมิน"
                            onClick={() => setConfirmDel(a)}
                          >
                            <Trash2 className="size-3.5" />
                          </Btn>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                          <Lock className="size-3 text-neutral-300" /> ดูเท่านั้น
                        </span>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
        {!loading && rows.length === 0 ? <EmptyState title="ยังไม่มีผู้ดูแลระบบ" /> : null}
      </Panel>

      {form ? <AdminForm initial={form.initial} onClose={() => setForm(null)} onSave={handleSaveAdmin} /> : null}
      {pwModal ? <PasswordResetDialog admin={pwModal} onClose={() => setPwModal(null)} onSuccess={fetchAdmins} /> : null}
      {confirmDel ? (
        <ConfirmDialog
          open
          title="ยืนยันการถอดสิทธิ์ผู้ดูแลระบบ"
          desc={`ต้องการลดระดับสิทธิ์ของ ${confirmDel.full_name} (${confirmDel.phone}) กลับเป็นสมาชิกทั่วไปใช่หรือไม่? บัญชีนี้จะไม่สามารถเข้าแผงควบคุมแอดมินได้อีก`}
          confirmLabel="ถอดสิทธิ์แอดมิน"
          danger
          onClose={() => setConfirmDel(null)}
          onConfirm={() => handleRevokeAdmin(confirmDel)}
        />
      ) : null}
    </div>
  );
}
