import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/pending")({ component: Page });
function Page() {
  const { logout } = useAuth();
  return (
    <AuthLayout title="Awaiting approval" subtitle="An admin will activate your account soon.">
      <button onClick={() => logout()} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow">Sign out</button>
    </AuthLayout>
  );
}
