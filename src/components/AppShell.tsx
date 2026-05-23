import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Wallet, Calendar, Network, Image as ImageIcon,
  Shield, Bell, UserCircle, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canManageUsers } from "@/lib/roles";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/contributions", label: "Contributions", icon: Wallet },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/family-tree", label: "Family Tree", icon: Network },
  { to: "/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "My Profile", icon: UserCircle },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const SidebarInner = (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-lg">M</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-sidebar-foreground leading-tight">Mariki</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Family Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {canManageUsers(profile?.role) && (
          <Link
            to="/admin/users"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Shield className="h-4 w-4" />
            Admin Users
          </Link>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile?.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          <p className="mt-1 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {profile?.role.replace("_", " ")}
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">{SidebarInner}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{SidebarInner}</div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/60 backdrop-blur">
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-accent/20">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display font-bold">Mariki Portal</span>
          <div className="w-9" />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
