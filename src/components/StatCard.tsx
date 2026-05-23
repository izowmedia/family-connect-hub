import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, icon, accent = "primary",
}: { label: string; value: ReactNode; icon: ReactNode; accent?: "primary" | "accent" | "emerald" | "amber" }) {
  const accentClass = {
    primary: "from-primary/30 to-primary/0 text-primary",
    accent: "from-accent/30 to-accent/0 text-accent",
    emerald: "from-emerald-500/30 to-emerald-500/0 text-emerald-400",
    amber: "from-amber-500/30 to-amber-500/0 text-amber-400",
  }[accent];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 shadow-card transition-transform hover:-translate-y-0.5">
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-60", accentClass)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-display font-bold">{value}</p>
        </div>
        <div className={cn("rounded-xl p-2.5 bg-background/40", accentClass)}>{icon}</div>
      </div>
    </div>
  );
}
