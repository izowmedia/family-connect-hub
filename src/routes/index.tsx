import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs, orderBy, query, limit } from "firebase/firestore";
import { Users, Calendar, Wallet, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({ component: Page });

function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Dashboard />
      </AppShell>
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ members: 0, events: 0, contributions: 0, total: 0 });
  const [recent, setRecent] = useState<Array<{ id: string; name: string; amount: number; purpose: string; date?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, e, c] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "events")),
          getDocs(collection(db, "contributions")),
        ]);
        const total = c.docs.reduce((s, d) => s + Number((d.data() as any).amount || 0), 0);
        setStats({ members: u.data().count, events: e.data().count, contributions: c.size, total });

        const r = await getDocs(query(collection(db, "contributions"), orderBy("createdAt", "desc"), limit(5)));
        setRecent(r.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="h-3 w-3" /> Umoja Wetu Ni Nguvu Yetu</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold">Karibu, {profile?.displayName?.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across the Mariki family.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={loading ? "…" : stats.members} icon={<Users className="h-5 w-5" />} accent="primary" />
        <StatCard label="Events" value={loading ? "…" : stats.events} icon={<Calendar className="h-5 w-5" />} accent="accent" />
        <StatCard label="Contributions" value={loading ? "…" : stats.contributions} icon={<Wallet className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Total Raised (KES)" value={loading ? "…" : stats.total.toLocaleString()} icon={<Sparkles className="h-5 w-5" />} accent="amber" />
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Recent contributions</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contributions logged yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.purpose}</p>
                </div>
                <span className="font-display font-semibold text-primary">KES {Number(r.amount).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
