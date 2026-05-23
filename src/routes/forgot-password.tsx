import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout, ConfigBanner, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await resetPassword(email); setSent(true); }
    catch (e: any) { setError(e.message ?? "Could not send reset email"); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link.">
      {!configured && <ConfigBanner />}
      {sent ? (
        <div className="text-center space-y-3">
          <p className="text-sm">Check <strong>{email}</strong> for a reset link.</p>
          <Link to="/login" className="inline-block text-sm text-primary hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button disabled={loading || !configured} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
