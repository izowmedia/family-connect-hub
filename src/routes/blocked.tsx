import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/blocked")({ component: Page });
function Page() {
  const { logout } = useAuth();
  return (
    <AuthLayout title="Account blocked" subtitle="Your account has been disabled. Please contact a family admin.">
      <button onClick={() => logout()} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow">Sign out</button>
    </AuthLayout>
  );
}
