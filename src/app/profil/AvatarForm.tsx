"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAvatar, removeAvatar } from "./avatar";

async function toSquare(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const c = document.createElement("canvas");
  c.width = c.height = 400;
  c.getContext("2d")!.drawImage(
    img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400
  );
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.85)
  );
}

export default function AvatarForm({ current, nom }: { current: string | null; nom: string }) {
  const router = useRouter();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b = await toSquare(f);
      setBlob(b);
      setPreview(URL.createObjectURL(b));
      setError("");
      setMsg("");
    } catch {
      setError("Image illisible. Essayez une autre photo.");
    }
  }

  async function save() {
    if (!blob) return;
    setPending(true);
    const fd = new FormData();
    fd.set("avatar", blob, "avatar.jpg");
    const r = await uploadAvatar(fd);
    setPending(false);
    if ("error" in r && r.error) return setError(r.error);
    setError("");
    setBlob(null);
    setMsg(r.ok ?? "");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Supprimer votre photo de profil ?")) return;
    setPending(true);
    await removeAvatar();
    setPending(false);
    setPreview(null);
    setBlob(null);
    setMsg("Photo supprimée.");
    router.refresh();
  }

  return (
    <div className="space-y-3 bg-white p-4">
      <h2 className="font-semibold">Photo de profil</h2>

      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo de profil"
            className="h-24 w-24 rounded-full border-2 border-white object-cover shadow-md" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-teal-700 to-teal-400 text-3xl font-semibold text-white shadow-md">
            {nom.charAt(0).toUpperCase()}
          </span>
        )}
        <label className="cursor-pointer rounded-2xl border border-stone-400 px-4 py-2 text-sm font-medium">
          Choisir une photo
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {msg && <p className="text-sm text-green-800">{msg}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={!blob || pending}
          className="flex-1 bg-stone-900 py-3 font-medium text-white disabled:opacity-50">
          {pending ? "Envoi…" : "Enregistrer la photo"}
        </button>
        {current && !blob && (
          <button onClick={remove} disabled={pending}
            className="rounded-2xl border border-red-700 px-4 text-sm font-medium text-red-700">
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
          }
