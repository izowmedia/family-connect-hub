import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/verify-email")({ component: VerifyEmail });

function VerifyEmail() {
  const { user, resendVerification, logout } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    const i = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) navigate({ to: "/" });
    }, 4000);
    return () => clearInterval(i);
  }, [user, navigate]);

  return (
    <AuthLayout title="Verify your email" subtitle={`We sent a verification link to ${user?.email ?? ""}.`}>
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">After clicking the link, this page will redirect automatically.</p>
        {msg && <p className="text-primary">{msg}</p>}
        <button
          onClick={async () => { await resendVerification(); setMsg("Verification email re-sent."); }}
          className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow"
        >
          Resend email
        </button>
        <button onClick={() => logout().then(() => navigate({ to: "/login" }))} className="w-full py-2 text-muted-foreground hover:text-foreground text-sm">
          Sign out
        </button>
      </div>
    </AuthLayout>
  );
}
