import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Trash2, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { canManageContributions } from "@/lib/roles";

export const Route = createFileRoute("/contributions")({ component: Page });

interface Contribution { id: string; name: string; amount: number; purpose: string; date: string; createdAt?: any }

function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Contributions />
      </AppShell>
    </ProtectedRoute>
  );
}

function Contributions() {
  const { profile } = useAuth();
  const canManage = canManageContributions(profile?.role);
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", amount: "", purpose: "", date: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const snap = await getDocs(query(collection(db, "contributions"), orderBy("createdAt", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    setSaving(true);
    await addDoc(collection(db, "contributions"), {
      name: form.name, amount: Number(form.amount), purpose: form.purpose, date: form.date,
      createdAt: serverTimestamp(), createdBy: profile?.uid,
    });
    setForm({ name: "", amount: "", purpose: "", date: new Date().toISOString().slice(0,10) });
    await load();
    setSaving(false);
  };

  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Contributions</h1>
          <p className="text-sm text-muted-foreground">Track family contributions and totals.</p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-primary px-6 py-3 shadow-glow">
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/80">Total raised</p>
          <p className="text-2xl font-display font-bold text-primary-foreground">KES {total.toLocaleString()}</p>
        </div>
      </header>

      {canManage && (
        <form onSubmit={add} className="rounded-2xl border border-border bg-card/60 p-5 grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input required placeholder="Member name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="sm:col-span-1 px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
          <input required type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
          <input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value})} className="sm:col-span-2 px-3 py-2 rounded-lg bg-input/40 border border-border text-sm" />
          <button disabled={saving} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50">
            <Plus className="h-4 w-4" /> {saving ? "Saving…" : "Add"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        {loading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> :
        items.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No contributions yet.</p> :
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {canManage && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-accent/5">
                <td className="px-4 py-3 font-medium">{i.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.purpose || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.date}</td>
                <td className="px-4 py-3 text-right font-display font-semibold text-primary">KES {Number(i.amount).toLocaleString()}</td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={async () => { await deleteDoc(doc(db, "contributions", i.id)); load(); }} className="p-1.5 rounded hover:bg-destructive/20 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
