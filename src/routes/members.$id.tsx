import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserProfile } from "@/contexts/AuthContext";

export const Route = createFileRoute("/members/$id")({ component: Page });

function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MemberDetail />
      </AppShell>
    </ProtectedRoute>
  );
}

function MemberDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [m, setM] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) setM({ uid: snap.id, ...(snap.data() as Omit<UserProfile, "uid">) });
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!m) return <p>Member not found.</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate({ to: "/members" })} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
        ← Back to members
      </button>
      <div className="rounded-2xl border border-border bg-gradient-surface p-8 shadow-card">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {m.photoURL ? (
            <img src={m.photoURL} alt="" className="h-28 w-28 rounded-2xl object-cover ring-2 ring-primary/40" />
          ) : (
            <div className="h-28 w-28 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-4xl shadow-glow">
              {m.displayName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold">{m.displayName}</h1>
            <p className="text-sm text-muted-foreground">{m.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary">{ROLE_LABELS[m.role]}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/20 text-accent">{m.status}</span>
            </div>
          </div>
        </div>
        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Info label="Phone" value={m.phone ?? "—"} />
          <Info label="Date of birth" value={m.dob ?? "—"} />
        </dl>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
