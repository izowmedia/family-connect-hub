import { Link } from "@tanstack/react-router";

export function EmptyState({
  title, description, action,
}: { title: string; description: string; action?: { label: string; to: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      {action && (
        <Link to={action.to} className="mt-5 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
          {action.label}
        </Link>
      )}
    </div>
  );
}
