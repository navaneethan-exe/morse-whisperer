import { type ReactNode, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Radio, History as HistoryIcon, Volume2, Settings, LogIn, LogOut, Menu, X, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Translator", icon: Home, requireAuth: false },
  { to: "/history", label: "History", icon: HistoryIcon, requireAuth: true },
  { to: "/sound", label: "Sound", icon: Volume2, requireAuth: false },
  { to: "/preferences", label: "Preferences", icon: Settings, requireAuth: false },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();

  const requestAuth = (reason?: string) => { setAuthReason(reason); setAuthOpen(true); };

  const renderNavLink = (item: (typeof navItems)[number], compact = false) => {
    const Icon = item.icon;
    const active = location.pathname === item.to;
    const blocked = item.requireAuth && !user;
    const className = cn(
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
      "hover:bg-sidebar-accent/60 hover:translate-x-0.5",
      active && "bg-gradient-primary text-primary-foreground shadow-glow hover:translate-x-0",
      !active && "text-sidebar-foreground/80",
    );
    if (blocked) {
      return (
        <button key={item.to} onClick={() => requestAuth("Login required to access your history.")}
          className={cn(className, "w-full text-left")}>
          <Icon className="h-5 w-5 shrink-0" />
          {!compact && <span>{item.label}</span>}
        </button>
      );
    }
    return (
      <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={className}>
        <Icon className="h-5 w-5 shrink-0" />
        {!compact && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border glass-strong transition-[width] duration-300 lg:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold gradient-text">MorseLab</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">translator</span>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((i) => renderNavLink(i, collapsed))}
        </nav>
        <div className="space-y-2 border-t border-sidebar-border p-3">
          {user ? (
            <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start gap-3 rounded-xl">
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="truncate">Sign out</span>}
            </Button>
          ) : (
            <Button onClick={() => requestAuth()} className="w-full justify-start gap-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <LogIn className="h-5 w-5" />
              {!collapsed && <span>Sign in</span>}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)} className="w-full justify-center">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 glass px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Radio className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold gradient-text">MorseLab</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-14 z-20 border-b border-border/50 glass-strong p-3 lg:hidden animate-fade-in-up">
          <nav className="space-y-1">{navItems.map((i) => renderNavLink(i))}</nav>
          <div className="mt-3 border-t border-border/50 pt-3">
            {user ? (
              <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start gap-3"><LogOut className="h-5 w-5" />Sign out</Button>
            ) : (
              <Button onClick={() => requestAuth()} className="w-full justify-start gap-3 bg-gradient-primary text-primary-foreground"><LogIn className="h-5 w-5" />Sign in</Button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={cn(
        "min-h-screen transition-[padding] duration-300",
        "pb-24 lg:pb-8", // bottom nav spacing on mobile
        collapsed ? "lg:pl-[72px]" : "lg:pl-64",
      )}>
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 glass-strong border-t border-border/50 lg:hidden">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            const blocked = item.requireAuth && !user;
            const cls = cn(
              "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-muted-foreground",
            );
            if (blocked) {
              return (
                <button key={item.to} onClick={() => requestAuth("Login required to access your history.")} className={cls}>
                  <Icon className="h-5 w-5" />{item.label}
                </button>
              );
            }
            return (
              <Link key={item.to} to={item.to} className={cls}>
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_var(--accent)]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason={authReason} />
    </div>
  );
}