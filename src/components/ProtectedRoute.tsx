import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/roles";

interface Props {
  children: React.ReactNode;
  allowed?: Role[];
  requireVerified?: boolean;
}

export function ProtectedRoute({ children, allowed, requireVerified = false }: Props) {
  const { user, profile, loading, configured } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!configured) {
      navigate({ to: "/setup" });
      return;
    }
    if (!user) {
      navigate({ to: "/login", search: { redirect: pathname } });
      return;
    }
    if (requireVerified && !user.emailVerified) {
      navigate({ to: "/verify-email" });
      return;
    }
    if (profile && profile.status === "blocked") {
      navigate({ to: "/blocked" });
      return;
    }
    if (profile && profile.status === "pending") {
      navigate({ to: "/pending" });
      return;
    }
    if (allowed && profile && !allowed.includes(profile.role)) {
      navigate({ to: "/unauthorized" });
      return;
    }
    setChecked(true);
  }, [loading, user, profile, configured, allowed, requireVerified, navigate, pathname]);

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}
