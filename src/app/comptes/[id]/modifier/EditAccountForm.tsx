"use client";

import { useState } from "react";
import { updateAccount } from "./actions";

async function compress(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.8)
  );
}

export default function EditAccountForm({
  id, gmail, tiktok, photoUrl, left,
}: {
  id: string;
  gmail: string;
  tiktok: string;
  photoUrl: string | null;
  left: number | null; // null = illimité (super admin)
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b = await compress(f);
      setBlob(b);
      setPreview(URL.createObjectURL(b));
      setError("");
    } catch {
      setError("Image illisible. Essayez une autre photo.");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (left !== null) {
      const ok = window.confirm(
        `Cette modification sera comptée. Il vous restera ${left - 1} modification(s) pour cette fiche. Continuer ?`
      );
      if (!ok) return;
    }
    setPending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    if (blob) fd.set("photo", blob, "photo.jpg");
    else fd.delete("photo");
    const res = await updateAccount(id, fd);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  const input = "w-full border border-stone-300 px-3 py-3 text-base";

  return (
    <form onSubmit={onSubmit} className="bg-white space-y-3 p-4">
      <input name="gmail" type="email" required defaultValue={gmail}
        autoCapitalize="none" autoCorrect="off" className={input} />
      <input name="password" type="text" placeholder="Nouveau mot de passe (vide = inchangé)"
        autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
        className={input} />
      <input name="tiktok" type="url" required defaultValue={tiktok}
        autoCapitalize="none" className={input} />

      <div>
        <label className="mb-1 block text-sm text-stone-600">Photo (vide = inchangée)</label>
        <input type="file" accept="image/*" onChange={onFile} className="w-full text-sm" />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo" className="mt-2 h-40 w-40 rounded-2xl border border-stone-300 object-cover" />
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending}
        className="w-full bg-stone-900 py-3 font-medium text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
