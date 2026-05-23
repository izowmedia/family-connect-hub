import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import type { UserProfile } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/lib/roles";

export const Route = createFileRoute("/members")({ component: Page });

function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MembersList />
      </AppShell>
    </ProtectedRoute>
  );
}

function MembersList() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) })));
      setLoading(false);
    })();
  }, []);

  const filtered = members.filter((m) =>
    [m.displayName, m.email].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Family Members</h1>
          <p className="text-sm text-muted-foreground">All registered members of the Mariki family.</p>
        </div>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…"
          className="px-3 py-2 rounded-lg bg-input/40 border border-border focus:border-primary outline-none text-sm w-full md:w-72"
        />
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Link key={m.uid} to="/members/$id" params={{ id: m.uid }}
              className="group rounded-2xl border border-border bg-gradient-surface p-5 shadow-card hover:shadow-glow transition-shadow">
              <div className="flex items-center gap-4">
                {m.photoURL ? (
                  <img src={m.photoURL} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                    {m.displayName?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{m.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  <span className="mt-1 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {ROLE_LABELS[m.role]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
