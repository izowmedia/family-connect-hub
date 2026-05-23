import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Shield, CheckCircle2, Ban, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth, type UserProfile } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_ORDER, type Role } from "@/lib/roles";

export const Route = createFileRoute("/admin/users")({ component: Page });

function Page() {
  return (
    <ProtectedRoute allowed={["super_admin", "admin"]}>
      <AppShell><AdminUsers /></AppShell>
    </ProtectedRoute>
  );
}

function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (uid: string, patch: Partial<UserProfile>) => {
    await updateDoc(doc(db, "users", uid), patch as any);
    load();
  };
  const remove = async (uid: string) => {
    if (!confirm("Delete this user profile? (Note: the Firebase Auth account must be removed separately by a super admin.)")) return;
    await deleteDoc(doc(db, "users", uid));
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center"><Shield className="h-5 w-5" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">Approve members, set roles, and manage access.</p>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        {loading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelf = u.uid === profile?.uid;
                return (
                  <tr key={u.uid} className="hover:bg-accent/5">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => update(u.uid, { role: e.target.value as Role })}
                        className="px-2 py-1.5 rounded-lg bg-input/40 border border-border text-sm disabled:opacity-50"
                      >
                        {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                        u.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-destructive/20 text-destructive"
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status !== "active" && (
                          <button onClick={() => update(u.uid, { status: "active" })} title="Approve"
                            className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-4 w-4" /></button>
                        )}
                        {u.status !== "blocked" && !isSelf && (
                          <button onClick={() => update(u.uid, { status: "blocked" })} title="Block"
                            className="p-1.5 rounded hover:bg-amber-500/20 text-amber-400"><Ban className="h-4 w-4" /></button>
                        )}
                        {!isSelf && (
                          <button onClick={() => remove(u.uid)} title="Delete"
                            className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
