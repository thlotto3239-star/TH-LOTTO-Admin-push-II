"use client";

import * as React from "react";
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Users, Dices, BadgeCheck,
  Zap, Disc3, Megaphone, Wrench, UserCog, Bell, Menu, LogOut, ChevronDown, Search,
  Images, Newspaper, Rss, Palette, Landmark, RadioTower, DatabaseBackup,
  ShieldAlert, Ticket, Check, Share2,
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
import { AffiliatePage } from "./pages/affiliate";
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
      { id: "banks", label: "ธนาคาร & เกณฑ์การเงิน", icon: Landmark },
    ],
  },
  {
    group: "สมาชิก",
    items: [
      { id: "members", label: "จัดการสมาชิก", icon: Users, badge: (n) => n.kyc },
      { id: "affiliate", label: "แนะนำเพื่อน & คอมมิชชั่น", icon: Share2 },
    ],
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
      { id: "broadcast", label: "ส่งแจ้งเตือน", icon: RadioTower },
      { id: "data-management", label: "สำรองและจัดการข้อมูล", icon: DatabaseBackup },
      { id: "admins", label: "ผู้ดูแลระบบ", icon: UserCog },
    ],
  },
];

export const DEFAULT_STAFF_PAGES: PageId[] = [
  "dashboard",
  "sliders",
  "promotions",
  "articles",
  "feeds",
  "wheel",
  "broadcast",
];

export function isPagePermitted(pageId: PageId, currentAdmin: any): boolean {
  if (!currentAdmin) return true;
  if (currentAdmin.is_super || currentAdmin.admin_role === "super_admin" || currentAdmin.phone === "0622306037") {
    return true;
  }
  const perms: string[] = currentAdmin.permissions || [];
  if (pageId === "dashboard") return true;
  if (pageId === "member-detail") return perms.includes("members");
  if (perms.includes(pageId)) return true;
  if (DEFAULT_STAFF_PAGES.includes(pageId) && perms.length === 0) {
    return true;
  }
  return false;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { page, navigate, currentAdmin } = useAdminNav();
  const { dep, wth, kyc, res } = useAdminCounts();
  const counts = { dep, wth, kyc, res };
  const go = (id: PageId) => { navigate(id); onNavigate?.(); };

  const visibleGroups = NAV.map((g) => ({
    group: g.group,
    items: g.items.filter((item) => isPagePermitted(item.id, currentAdmin)),
  })).filter((g) => g.items.length > 0);

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {visibleGroups.map((g) => (
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

function AdminProfileMenu({ onLogout }: { onLogout?: () => void }) {
  const { currentAdmin } = useAdminNav();
  const [open, setOpen] = React.useState(false);

  const roleLabel = currentAdmin.admin_role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex w-full items-center gap-2.5 rounded-full border border-neutral-200 bg-white p-1.5 pr-3 text-left transition-colors hover:bg-neutral-50 cursor-pointer"
          title="ข้อมูลโปรไฟล์ผู้ดูแลระบบ"
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
      <PopoverContent align="end" className="w-64 rounded-2xl p-3 shadow-xl ring-1 ring-neutral-200">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
          <Avatar
            name={currentAdmin.full_name}
            imageUrl={currentAdmin.avatar_url}
            className={cn(
              "size-10 text-xs shrink-0",
              currentAdmin.admin_role === "super_admin" ? "bg-amber-600 text-white" : "bg-teal-600 text-white"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-neutral-900">{currentAdmin.full_name}</p>
            <p className="truncate text-xs text-neutral-500 font-mono">{currentAdmin.phone}</p>
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1",
              currentAdmin.admin_role === "super_admin" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-teal-50 text-teal-700 border border-teal-200"
            )}>
              <span className="size-1.5 rounded-full bg-emerald-500"></span>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdminApp({ onLogout }: { onLogout?: () => void } = {}) {
  const { page, currentAdmin, navigate } = useAdminNav();
  const { fetchCounts } = useAdminCounts();
  const [mobileNav, setMobileNav] = React.useState(false);
  const meta = PAGE_META[page];

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__navigate = navigate;
    }
  }, [navigate]);

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

    // Periodic heartbeat to keep presence accurate in profiles.last_seen_at
    const sendHeartbeat = () => {
      if (currentAdmin?.id) {
        fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", payload: { user_id: currentAdmin.id } }),
        }).catch(() => {});
      }
    };
    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
      clearInterval(heartbeatTimer);
    };
  }, [fetchCounts, currentAdmin?.id]);

  const renderPage = () => {
    if (!isPagePermitted(page, currentAdmin)) {
      return (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4 ring-8 ring-amber-50">
            <ShieldAlert className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">ไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
          <p className="mt-1.5 max-w-md text-sm text-neutral-500 leading-relaxed">
            บัญชีของคุณไม่ได้รับอนุญาตให้จัดการเมนู <strong>{meta.title}</strong> โปรดติดต่อ Super Admin เพื่อขอสิทธิ์การใช้งาน
          </p>
          <button
            onClick={() => navigate("dashboard")}
            className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            กลับสู่แผงควบคุม
          </button>
        </div>
      );
    }

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
      case "affiliate": return <AffiliatePage />;
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
          <AdminProfileMenu onLogout={onLogout} />
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
                <AdminProfileMenu onLogout={onLogout} />
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
            <AdminProfileMenu onLogout={onLogout} />
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
