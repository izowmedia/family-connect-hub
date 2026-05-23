import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout, ConfigBanner, Divider, Field } from "./login";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const { signup, loginWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try { await signup(email, password, name); navigate({ to: "/verify-email" }); }
    catch (e: any) { setError(e.message ?? "Sign up failed"); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Join the family" subtitle="Create your Mariki Portal account">
      {!configured && <ConfigBanner />}
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={loading || !configured} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <Divider />
      <button onClick={() => loginWithGoogle().then(() => navigate({ to: "/" }))} disabled={!configured}
        className="w-full py-2.5 rounded-lg border border-border bg-card hover:bg-accent/10 font-medium disabled:opacity-50">
        Continue with Google
      </button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
