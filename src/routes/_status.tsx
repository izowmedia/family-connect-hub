import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./login";

function statusPage(title: string, msg: string) {
  return function Page() {
    const { logout } = useAuth();
    return (
      <AuthLayout title={title} subtitle={msg}>
        <button onClick={() => logout()} className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow">
          Sign out
        </button>
      </AuthLayout>
    );
  };
}

export const PendingRoute = createFileRoute("/pending")({ component: statusPage("Awaiting approval", "An admin will activate your account soon. You'll receive an email when approved.") });
export const BlockedRoute = createFileRoute("/blocked")({ component: statusPage("Account blocked", "Your account has been disabled. Please contact a family admin.") });
export const UnauthorizedRoute = createFileRoute("/unauthorized")({ component: statusPage("No access", "You don't have permission to view that page.") });
