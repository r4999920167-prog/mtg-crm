import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Wallet,
  BadgeRussianRuble,
  Send,
  Wrench,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { PerplexityAttribution } from "./PerplexityAttribution";

const nav = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/clients", label: "Клиенты", icon: Users },
  { href: "/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/orders", label: "Заказ-наряды", icon: FileText },
  { href: "/finance", label: "Финансы", icon: Wallet },
  { href: "/salary", label: "Зарплаты", icon: BadgeRussianRuble },
  { href: "/services", label: "Услуги", icon: Wrench },
  { href: "/employees", label: "Сотрудники", icon: UserCog },
  { href: "/messages", label: "Рассылка", icon: Send },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 flex flex-col
          bg-sidebar text-sidebar-foreground border-r border-sidebar-border
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MTG</span>
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Makaroff Tuning</div>
            <div className="text-xs text-muted-foreground">CRM System</div>
          </div>
          <button
            className="lg:hidden ml-auto p-1"
            onClick={() => setMobileOpen(false)}
            data-testid="close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer
                    transition-colors duration-150
                    ${isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }
                  `}
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <PerplexityAttribution />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} data-testid="open-sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-semibold text-sm">MTG CRM</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
