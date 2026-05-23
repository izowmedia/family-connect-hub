// Cloudinary unsigned upload helper.
// Configure: create an UNSIGNED upload preset in your Cloudinary console
// (Settings → Upload → Add upload preset → Signing mode: Unsigned).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "REPLACE_CLOUD_NAME";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "REPLACE_PRESET";

export const isCloudinaryConfigured = !CLOUD_NAME.startsWith("REPLACE");

export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string; resourceType: string }> {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  return { url: data.secure_url as string, publicId: data.public_id as string, resourceType };
}
