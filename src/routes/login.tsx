import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/" }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); navigate({ to: redirect }); }
    catch (e: any) { setError(e.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  const google = async () => {
    setError(""); setLoading(true);
    try { await loginWithGoogle(); navigate({ to: redirect }); }
    catch (e: any) { setError(e.message ?? "Google sign-in failed"); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to the Mariki Family Portal">
      {!configured && <ConfigBanner />}
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={loading || !configured} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Divider />
      <button onClick={google} disabled={loading || !configured} className="w-full py-2.5 rounded-lg border border-border bg-card hover:bg-accent/10 font-medium disabled:opacity-50">
        Continue with Google
      </button>
      <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
        <p><Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></p>
        <p>No account? <Link to="/signup" className="text-primary hover:underline">Create one</Link></p>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(0.62_0.22_275/0.25),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.5_0.25_285/0.25),transparent_50%)]" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow items-center justify-center mb-4">
            <span className="font-display font-bold text-primary-foreground text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-display font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          <p className="text-[11px] uppercase tracking-widest text-primary mt-2">Umoja Wetu Ni Nguvu Yetu</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-input/40 border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm"
      />
    </label>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function ConfigBanner() {
  return (
    <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
      Firebase is not configured yet. Edit <code>src/lib/firebase.ts</code> or set <code>VITE_FIREBASE_*</code> env vars. See README.
    </div>
  );
}
