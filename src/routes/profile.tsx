import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Page });

function Page() {
  return (
    <ProtectedRoute>
      <AppShell><ProfileEditor /></AppShell>
    </ProtectedRoute>
  );
}

function ProfileEditor() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [dob, setDob] = useState(profile?.dob ?? "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!profile) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateDoc(doc(db, "users", profile.uid), { displayName: name, phone, dob, photoURL });
    await refreshProfile();
    setMsg("Profile saved.");
    setSaving(false);
    setTimeout(() => setMsg(""), 2500);
  };

  const onFile = async (f: File) => {
    setUploading(true);
    try { const { url } = await uploadToCloudinary(f); setPhotoURL(url); }
    catch (e: any) { setMsg(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Keep your details up to date.</p>
      </header>

      <form onSubmit={save} className="rounded-2xl border border-border bg-card/60 p-6 space-y-5">
        <div className="flex items-center gap-5">
          {photoURL ? (
            <img src={photoURL} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/40" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
              {name.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent/10 text-sm">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/*" hidden disabled={uploading || !isCloudinaryConfigured}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
          </label>
        </div>

        <Field label="Display name" value={name} onChange={setName} />
        <Field label="Email" value={profile.email} onChange={() => {}} disabled />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+254…" />
        <Field label="Date of birth" type="date" value={dob} onChange={setDob} />

        {msg && <p className="text-sm text-primary">{msg}</p>}
        <button disabled={saving} className="px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-input/40 border border-border focus:border-primary outline-none text-sm disabled:opacity-60" />
    </label>
  );
}
