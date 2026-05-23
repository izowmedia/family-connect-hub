import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/family-tree")({ component: Page });

interface Node { name: string; role?: string; children?: Node[] }

// Placeholder tree. In a future iteration this can read from Firestore.
const tree: Node = {
  name: "Mzee Mariki", role: "Patriarch",
  children: [
    { name: "John Mariki", role: "Son", children: [
      { name: "Grace M." }, { name: "Brian M." },
    ]},
    { name: "Mary Mariki", role: "Daughter", children: [
      { name: "Eve M." },
    ]},
    { name: "Peter Mariki", role: "Son" },
  ],
};

function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-display font-bold">Family Tree</h1>
            <p className="text-sm text-muted-foreground">Hierarchical view of the Mariki lineage. Placeholder data — connect Firestore relationships to populate.</p>
          </header>
          <div className="rounded-2xl border border-border bg-card/40 p-6 overflow-x-auto">
            <TreeNode node={tree} root />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

function TreeNode({ node, root = false }: { node: Node; root?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${root ? "" : "pt-6 relative"}`}>
      {!root && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-border" />}
      <div className="rounded-xl border border-primary/40 bg-gradient-surface px-4 py-2.5 shadow-card text-center min-w-[140px]">
        <p className="font-semibold text-sm">{node.name}</p>
        {node.role && <p className="text-[10px] uppercase tracking-widest text-primary">{node.role}</p>}
      </div>
      {node.children && node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="relative flex gap-6 pt-0">
            <div className="absolute top-0 left-6 right-6 h-px bg-border" />
            {node.children.map((c, i) => <TreeNode key={i} node={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
