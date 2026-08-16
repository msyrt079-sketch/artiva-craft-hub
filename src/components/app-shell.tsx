import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Truck,
  Wallet,
  Calculator,
  BarChart3,
  CalendarClock,
  Target,
  FileText,
  LogOut,
  Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import logoUrl from "@/assets/artiva-logo.jpg";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/products", label: "Products", icon: Package },
  { to: "/materials", label: "Materials", icon: Boxes },
  { to: "/money", label: "Money", icon: Wallet },
  { to: "/pricing", label: "Pricing", icon: Calculator },
  { to: "/planner", label: "Planner", icon: CalendarClock },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
              activeProps={{
                className:
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start" onClick={signOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Brand />
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="hidden items-center justify-end gap-2 px-6 pt-4 lg:flex">
          <NotificationBell />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 lg:pb-16">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2">
      <img
        src={logoUrl}
        alt="Artiva logo"
        className="size-9 rounded-xl object-cover"
      />
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold">ARTIVA</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Business
        </span>
      </span>
    </Link>
  );
}

export { Bell };
