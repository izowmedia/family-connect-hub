import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/setup")({ component: Page });
function Page() {
  return (
    <AuthLayout title="Setup required" subtitle="Add your Firebase credentials to continue.">
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Create a Firebase project, enable Email/Password and Google sign-in, then fill in the values in
          <code className="mx-1 px-1.5 py-0.5 rounded bg-muted/60">src/lib/firebase.ts</code>
          or via <code className="mx-1 px-1.5 py-0.5 rounded bg-muted/60">VITE_FIREBASE_*</code> env vars.
        </p>
        <p className="text-muted-foreground">See the README for full setup instructions.</p>
        <Link to="/login" className="block text-center py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow">Continue to sign in</Link>
      </div>
    </AuthLayout>
  );
}
