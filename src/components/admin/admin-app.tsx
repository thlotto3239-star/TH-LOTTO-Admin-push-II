"use client";

import * as React from "react";
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Users, Dices, BadgeCheck,
  Zap, Disc3, Megaphone, Wrench, UserCog, Bell, Menu, LogOut, ChevronDown, Search,
  Images, Newspaper, Rss, Palette, Landmark, RadioTower, DatabaseBackup,
  ShieldAlert, Ticket, Check,
} from "lucide-react";
import { useAdminNav, KNOWN_ADMINS, PAGE_META, type PageId } from "./store";
import { Btn, Avatar } from "./primitives";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DashboardPage } from "./pages/dashboard";
import { DepositsPage } from "./pages/deposits";
import { WithdrawalsPage } from "./pages/withdrawals";
import { MembersPage } from "./pages/members";
import { MemberDetailPage } from "./pages/member-detail";
import { MarketsPage } from "./pages/markets";
import { RestrictedNumbersPage } from "./pages/restricted";
import { BetsPage } from "./pages/bets";
import { ResultsPage } from "./pages/results";
import { InstantOverviewPage } from "./pages/instant";
import { WheelPage } from "./pages/wheel";
import { PromotionsPage } from "./pages/promotions";
import { SettingsPage } from "./pages/settings";
import { AdminsPage } from "./pages/admins";
import { SlidersPage } from "./pages/sliders";
import { ArticlesPage } from "./pages/articles";
import { FeedsPage } from "./pages/feeds";
import { AppearancePage } from "./pages/appearance";
import { BanksPage } from "./pages/banks";
import { BroadcastPage } from "./pages/broadcast";
import { DataManagementPage } from "./pages/data-management";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useAdminCounts, type AdminNotificationItem } from "./store";

// ─── Navigation (19 หน้าตามเช็คลิสต์เมนูเต็ม) ─────────────────────────────────
const NAV: { group: string; items: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: (n: { dep: number; wth: number; kyc: number; res: number }) => number }[] }[] = [
  {
    group: "ภาพรวม",
    items: [{ id: "dashboard", label: "แผงควบคุม", icon: LayoutDashboard }],
  },
  {
    group: "การเงิน",
    items: [
      { id: "deposits", label: "รายการฝากเงิน", icon: ArrowDownToLine, badge: (n) => n.dep },
      { id: "withdrawals", label: "รายการถอนเงิน", icon: ArrowUpFromLine, badge: (n) => n.wth },
    ],
  },
  {
    group: "สมาชิก",
    items: [{ id: "members", label: "จัดการสมาชิก", icon: Users, badge: (n) => n.kyc }],
  },
  {
    group: "หวย",
    items: [
      { id: "markets", label: "ตลาดหวย", icon: Dices },
      { id: "restricted", label: "จัดการเลขอั้น", icon: ShieldAlert },
      { id: "bets", label: "รายการแทงหวย", icon: Ticket },
      { id: "results", label: "ออกผลรางวัล", icon: BadgeCheck, badge: (n) => n.res },
    ],
  },
  {
    group: "หวยหนึ่งนาที",
    items: [{ id: "instant-overview", label: "ภาพรวมหนึ่งนาที", icon: Zap }],
  },
  {
    group: "เกม",
    items: [{ id: "wheel", label: "วงล้อโชคดี", icon: Disc3 }],
  },
  {
    group: "คอนเทนต์",
    items: [
      { id: "sliders", label: "สไลเดอร์", icon: Images },
      { id: "promotions", label: "โปรโมชั่น", icon: Megaphone },
      { id: "articles", label: "บทความ", icon: Newspaper },
      { id: "feeds", label: "จัดการฟีด", icon: Rss },
    ],
  },
  {
    group: "ระบบ",
    items: [
      { id: "settings", label: "ตั้งค่าระบบ", icon: Wrench },
      { id: "appearance", label: "รูปลักษณ์", icon: Palette },
      { id: "banks", label: "ธนาคาร", icon: Landmark },
      { id: "broadcast", label: "ส่งแจ้งเตือน", icon: RadioTower },
      { id: "data-management", label: "สำรองและจัดการข้อมูล", icon: DatabaseBackup },
      { id: "admins", label: "ผู้ดูแลระบบ", icon: UserCog },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { page, navigate } = useAdminNav();
  const { dep, wth, kyc, res } = useAdminCounts();
  const counts = { dep, wth, kyc, res };
  const go = (id: PageId) => { navigate(id); onNavigate?.(); };
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map((g) => (
        <div key={g.group} className="mb-2">
          <p className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            {g.group}
          </p>
          {g.items.map((item) => {
            const active = page === item.id || (page === "member-detail" && item.id === "members");
            const badge = item.badge?.(counts) ?? 0;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-200"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon className={cn("size-4", active ? "text-white" : "text-neutral-400")} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-bold shadow-xs",
                      active
                        ? "bg-white text-rose-600 ring-2 ring-rose-200"
                        : "bg-rose-500 text-white ring-2 ring-white"
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-4">
      <img src="/logo.svg" alt="TH-LOTTO" className="size-9 rounded-full object-cover ring-1 ring-neutral-200" />
      {!compact ? (
        <div>
          <p className="text-sm font-bold tracking-tight text-neutral-900">TH-LOTTO</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">แผงควบคุมแอดมิน เวอร์ชัน 1.4.0</p>
        </div>
      ) : null}
    </div>
  );
}

function NotificationBell() {
  const { toast } = useToast();
  const { navigate } = useAdminNav();
  const { notifications, unread_notifications, markNotificationRead, markAllNotificationsRead } = useAdminCounts();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const handleOpenItem = (n: AdminNotificationItem) => {
    markNotificationRead(n.id);
    setOpen(false);

    if (n.target_page) {
      navigate(n.target_page as PageId);
      toast({
        title: "เปิดหน้าที่เกี่ยวข้อง",
        description: `กำลังนำคุณไปยังหน้า "${PAGE_META[n.target_page as PageId]?.title || n.target_page}"`,
      });
    }
  };

  if (!mounted) return <div className="size-10" aria-hidden />;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex size-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="size-5" />
          {unread_notifications > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
              {unread_notifications}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 rounded-3xl p-0 shadow-xl ring-1 ring-neutral-200/70">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-neutral-900">การแจ้งเตือนระบบ</p>
            <p className="text-[11px] text-neutral-400">ยังไม่อ่าน {unread_notifications} รายการ</p>
          </div>
          <Btn
            variant="ghost"
            size="sm"
            className="h-7 rounded-full text-xs text-brand-600 hover:bg-brand-50"
            onClick={() => {
              markAllNotificationsRead();
              toast({ title: "อ่านทั้งหมดแล้ว", description: "ทำเครื่องหมายอ่านแล้วทุกรายการ" });
            }}
          >
            อ่านทั้งหมด
          </Btn>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">ไม่มีการแจ้งเตือน</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleOpenItem(n)}
                className={cn(
                  "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                  !n.read ? "bg-brand-50/40" : "opacity-85"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    n.type === "warning" ? "bg-amber-400" : n.type === "success" ? "bg-brand-500" : "bg-sky-400",
                    !n.read && "ring-2 ring-rose-400 ring-offset-1"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-semibold", !n.read ? "text-neutral-900" : "text-neutral-700")}>
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-neutral-400">{n.date}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{n.message}</p>
                  {n.target_page ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-brand-600 group-hover:underline">
                      <span>ไปยัง {PAGE_META[n.target_page as PageId]?.title || n.target_page}</span>
                      <span aria-hidden>→</span>
                    </div>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AdminUserSwitcher({ onLogout }: { onLogout?: () => void }) {
  const { currentAdmin, setCurrentAdmin } = useAdminNav();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const roleLabel = currentAdmin.admin_role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex w-full items-center gap-2.5 rounded-full border border-neutral-200 bg-white p-1.5 pr-3 text-left transition-colors hover:bg-neutral-50"
          title="สลับบัญชีเพื่อทดสอบสิทธิ์ (Super Admin vs Admin)"
        >
          <Avatar
            name={currentAdmin.full_name}
            imageUrl={currentAdmin.avatar_url}
            className={cn(
              "size-8 text-xs shrink-0",
              currentAdmin.admin_role === "super_admin" ? "bg-amber-600 text-white" : "bg-teal-600 text-white"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-neutral-800">{currentAdmin.full_name}</p>
            <p className="truncate text-[10px] text-neutral-400">{roleLabel}</p>
          </div>
          <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 rounded-2xl p-2 shadow-xl ring-1 ring-neutral-200">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          สลับบัญชีแอดมิน (ทดสอบสิทธิ์)
        </p>
        <div className="space-y-1">
          {KNOWN_ADMINS.map((adm) => {
            const isSelected = adm.id === currentAdmin.id;
            return (
              <button
                key={adm.id}
                onClick={() => {
                  setCurrentAdmin(adm);
                  setOpen(false);
                  toast({
                    title: `สลับเป็น ${adm.full_name}`,
                    description: `ระดับสิทธิ์: ${adm.admin_role === "super_admin" ? "Super Admin (จัดการสิทธิ์และเพิ่มแอดมินได้)" : "Admin (ธรรมดา — ไม่เห็นปุ่มสร้างแอดมิน)"}`,
                  });
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                  isSelected ? "bg-brand-50 text-brand-700 font-bold" : "text-neutral-700 hover:bg-neutral-100"
                )}
              >
                <Avatar
                  name={adm.full_name}
                  imageUrl={adm.avatar_url}
                  className={cn(
                    "size-7 text-[10px] shrink-0",
                    adm.admin_role === "super_admin" ? "bg-amber-600 text-white" : "bg-teal-600 text-white"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{adm.full_name}</p>
                  <p className="truncate text-[10px] text-neutral-400">
                    {adm.admin_role === "super_admin" ? "Super Admin (เต็มสิทธิ์)" : "Admin (ธรรมดา)"}
                  </p>
                </div>
                {isSelected ? <Check className="size-3.5 text-brand-600 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
        <div className="mt-2 border-t border-neutral-100 pt-1.5">
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="size-3.5" />
            ออกจากระบบ
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdminApp({ onLogout }: { onLogout?: () => void } = {}) {
  const { page } = useAdminNav();
  const { fetchCounts } = useAdminCounts();
  const [mobileNav, setMobileNav] = React.useState(false);
  const meta = PAGE_META[page];

  React.useEffect(() => {
    fetchCounts();
    const timer = setInterval(fetchCounts, 15000);

    // Auto-sync real results from ThaiLottoAPI & schedule settlements
    const syncResults = async () => {
      try {
        await fetch("/api/admin/sync-results", { method: "POST" });
      } catch {
        // silent background sync
      }
    };
    syncResults();
    const syncTimer = setInterval(syncResults, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
    };
  }, [fetchCounts]);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "deposits": return <DepositsPage />;
      case "withdrawals": return <WithdrawalsPage />;
      case "members": return <MembersPage />;
      case "member-detail": return <MemberDetailPage />;
      case "markets": return <MarketsPage />;
      case "restricted": return <RestrictedNumbersPage />;
      case "bets": return <BetsPage />;
      case "results": return <ResultsPage />;
      case "instant-overview": return <InstantOverviewPage />;
      case "wheel": return <WheelPage />;
      case "promotions": return <PromotionsPage />;
      case "sliders": return <SlidersPage />;
      case "articles": return <ArticlesPage />;
      case "feeds": return <FeedsPage />;
      case "settings": return <SettingsPage />;
      case "appearance": return <AppearancePage />;
      case "banks": return <BanksPage />;
      case "broadcast": return <BroadcastPage />;
      case "data-management": return <DataManagementPage />;
      case "admins": return <AdminsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
        <Brand />
        <SidebarNav />
        <div className="border-t border-neutral-100 p-3">
          <AdminUserSwitcher onLogout={onLogout} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/95 backdrop-blur-md transform-gpu px-4 sm:px-6">
          <Sheet open={mobileNav} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <button className="flex size-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 lg:hidden" aria-label="เปิดเมนู">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 rounded-r-3xl border-neutral-200 p-0">
              <SheetHeader className="border-b border-neutral-100 p-0">
                <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
                <Brand />
              </SheetHeader>
              <SidebarNav onNavigate={() => setMobileNav(false)} />
              <div className="border-t border-neutral-100 p-3">
                <AdminUserSwitcher onLogout={onLogout} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">{meta.group}</p>
            <h1 className="truncate text-base font-bold text-neutral-900 sm:text-lg">{meta.title}</h1>
          </div>

          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              placeholder="ค้นหาในแผงควบคุม..."
              className="h-10 w-56 rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:w-72 focus:border-brand-400 focus:bg-white"
            />
          </div>

          <NotificationBell />

          <div className="w-48 hidden sm:block">
            <AdminUserSwitcher onLogout={onLogout} />
          </div>
        </header>

        {/* Page content */}
        <main key={page} className="flex-1 px-4 py-6 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderPage()}
        </main>

        <footer className="mt-auto border-t border-neutral-100 px-6 py-4">
          <p className="text-center text-xs text-neutral-400">
            TH-LOTTO · แผงควบคุมแอดมิน เวอร์ชัน 1.4.0 · ต้นแบบหน้าจอสำหรับทีมแอดมิน (ครบ 19 หน้าตามเช็คลิสต์)
          </p>
        </footer>
      </div>
    </div>
  );
}
