import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Upload, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { canUploadMedia } from "@/lib/roles";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const Route = createFileRoute("/gallery")({ component: Page });

interface Media { id: string; url: string; resourceType: string; caption?: string; createdAt?: any }

function Page() {
  return (
    <ProtectedRoute>
      <AppShell><Gallery /></AppShell>
    </ProtectedRoute>
  );
}

function Gallery() {
  const { profile } = useAuth();
  const canUpload = canUploadMedia(profile?.role);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const snap = await getDocs(query(collection(db, "media"), orderBy("createdAt", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleFile = async (file: File) => {
    setError(""); setUploading(true);
    try {
      const { url, resourceType } = await uploadToCloudinary(file);
      await addDoc(collection(db, "media"), { url, resourceType, createdAt: serverTimestamp(), uploadedBy: profile?.uid });
      load();
    } catch (e: any) { setError(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Gallery</h1>
          <p className="text-sm text-muted-foreground">Family moments, captured.</p>
        </div>
        {canUpload && (
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload media"}
            <input type="file" accept="image/*,video/*" hidden disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </label>
        )}
      </header>

      {!isCloudinaryConfigured && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
          Cloudinary not configured. Set <code>VITE_CLOUDINARY_CLOUD_NAME</code> and <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to enable uploads.
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
        items.length === 0 ? <p className="text-sm text-muted-foreground">No media uploaded yet.</p> :
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((m) => (
            <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-card">
              {m.resourceType === "video" ? (
                <video src={m.url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              )}
              {canUpload && (
                <button onClick={async () => { await deleteDoc(doc(db, "media", m.id)); load(); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
