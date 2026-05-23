import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { canManageEvents } from "@/lib/roles";

export const Route = createFileRoute("/events")({ component: Page });

interface Ev { id: string; title: string; date: string; description: string; createdAt?: any }

function Page() {
  return (
    <ProtectedRoute>
      <AppShell><EventsPage /></AppShell>
    </ProtectedRoute>
  );
}

function EventsPage() {
  const { profile } = useAuth();
  const canManage = canManageEvents(profile?.role);
  const [items, setItems] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", date: "", description: "" });

  const load = async () => {
    const snap = await getDocs(query(collection(db, "events"), orderBy("date", "asc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    await addDoc(collection(db, "events"), { ...form, createdAt: serverTimestamp() });
    setForm({ title: "", date: "", description: "" });
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((i) => i.date >= today);
  const past = items.filter((i) => i.date < today);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">Family Events</h1>
        <p className="text-sm text-muted-foreground">Upcoming gatherings, milestones, and reminders.</p>
      </header>

      {canManage && (
        <form onSubmit={add} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input required placeholder="Event title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
            <input required type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
            <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow"><Plus className="h-4 w-4" /> Add event</button>
          </div>
          <textarea rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
        </form>
      )}

      <Section title="Upcoming" items={upcoming} canManage={canManage} onDelete={async (id) => { await deleteDoc(doc(db, "events", id)); load(); }} />
      <Section title="Past" items={past} canManage={canManage} onDelete={async (id) => { await deleteDoc(doc(db, "events", id)); load(); }} muted />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
}

function Section({ title, items, canManage, onDelete, muted }: { title: string; items: Ev[]; canManage: boolean; onDelete: (id: string) => void; muted?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((e) => (
          <div key={e.id} className={`rounded-2xl border border-border ${muted ? "bg-card/30 opacity-80" : "bg-gradient-surface"} p-5 shadow-card`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0"><Calendar className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{e.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
                </div>
              </div>
              {canManage && (
                <button onClick={() => onDelete(e.id)} className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
