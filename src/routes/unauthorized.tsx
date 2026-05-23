import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/unauthorized")({ component: Page });
function Page() {
  return (
    <AuthLayout title="No access" subtitle="You don't have permission to view that page.">
      <Link to="/" className="block w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow text-center">Back to dashboard</Link>
    </AuthLayout>
  );
}
