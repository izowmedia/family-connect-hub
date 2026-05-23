import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Bell, Cake, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import type { UserProfile } from "@/contexts/AuthContext";

export const Route = createFileRoute("/notifications")({ component: Page });

interface Reminder { kind: "birthday" | "event"; title: string; date: string; subtitle?: string }

function Page() {
  return (
    <ProtectedRoute>
      <AppShell><Notifs /></AppShell>
    </ProtectedRoute>
  );
}

function Notifs() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [usersSnap, eventsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "events")),
      ]);
      const today = new Date();
      const inDays = (d: Date) => Math.floor((d.getTime() - today.getTime()) / 86400000);

      const birthdays: Reminder[] = usersSnap.docs
        .map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }))
        .filter((u) => !!u.dob)
        .map((u) => {
          const dob = new Date(u.dob!);
          const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          if (next < today) next.setFullYear(today.getFullYear() + 1);
          return { kind: "birthday" as const, title: `${u.displayName}'s birthday`, date: next.toISOString().slice(0,10), subtitle: `in ${inDays(next)} days` };
        })
        .filter((r) => inDays(new Date(r.date)) <= 60);

      const events: Reminder[] = eventsSnap.docs
        .map((d) => d.data() as { title: string; date: string })
        .filter((e) => e.date >= today.toISOString().slice(0,10))
        .map((e) => ({ kind: "event" as const, title: e.title, date: e.date, subtitle: `in ${inDays(new Date(e.date))} days` }));

      const all = [...birthdays, ...events].sort((a, b) => a.date.localeCompare(b.date));
      setItems(all); setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center"><Bell className="h-5 w-5" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Upcoming birthdays and event reminders. Email notifications can be wired through EmailJS / Firebase Functions.</p>
        </div>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
        items.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming reminders.</p> :
        <ul className="space-y-2">
          {items.map((r, i) => (
            <li key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${r.kind === "birthday" ? "bg-amber-500/20 text-amber-400" : "bg-primary/20 text-primary"}`}>
                {r.kind === "birthday" ? <Cake className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {r.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
