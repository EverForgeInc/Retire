"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarRange,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MoreHorizontal,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/timeline", label: "Timeline & Leave Plan", icon: CalendarRange },
  { href: "/va", label: "VA Claims", icon: ShieldAlert },
  { href: "/income", label: "Income Planner", icon: CircleDollarSign },
  { href: "/locations", label: "Location Comparison", icon: MapPinned },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/timeline", label: "Timeline", icon: CalendarRange },
  { href: "/settings", label: "More", icon: MoreHorizontal },
];

export function AppShell({
  children,
  title,
  subtitle,
  progress,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  progress?: { percent: number; complete: number; total: number; days: number; retirementDate: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside
        className="desktop-sidebar flex min-h-screen flex-col text-white"
        style={{ background: "linear-gradient(180deg, var(--navy-950), var(--navy-900))" }}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-300/30">
              <ClipboardList className="h-5 w-5 text-blue-200" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">Military Retirement</div>
              <div className="text-xs text-slate-300">Planner</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-200 hover:bg-white/5",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {progress && (
          <div className="mx-3 mb-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-xs uppercase tracking-wide text-slate-300">Retirement date</div>
            <div className="mt-1 text-sm font-semibold">{formatDate(progress.retirementDate)}</div>
            <div className="mt-3 text-2xl font-semibold">{progress.days}</div>
            <div className="text-xs text-slate-300">Days to retirement</div>
            <div className="mt-4 text-xs text-slate-300">Overall progress</div>
            <Progress value={progress.percent} className="mt-2 w-full gap-0 **:data-[slot=progress-track]:bg-white/15" />
            <div className="mt-2 text-xs text-slate-300">
              {progress.percent}% ({progress.complete} of {progress.total} tasks)
            </div>
          </div>
        )}

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start text-slate-200 hover:bg-white/5 hover:text-white",
            )}
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Help & Resources
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-white/5 hover:text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-source-serif)] text-2xl font-semibold text-slate-900">
                {title}
              </h1>
              {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/reminders"
                aria-label="Reminders"
                className={buttonVariants({ variant: "outline", size: "icon" })}
              >
                <Bell className="h-4 w-4" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex")}>
                  Member account
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/onboarding")}>Update profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/audit")}>Audit history</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/admin")}>Admin tools</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="main-scroll px-4 py-6 md:px-8">{children}</main>

        <p className="px-4 pb-6 text-xs text-muted-foreground md:px-8">
          Military Retirement Planner is not an official Department of Defense or U.S. government system.
        </p>
      </div>

      <nav className="mobile-nav" aria-label="Mobile">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px]",
                active ? "text-blue-600" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
