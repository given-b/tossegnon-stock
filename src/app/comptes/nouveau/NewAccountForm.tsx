"use client";

import { useState } from "react";
import { createAccount } from "../actions";

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

export default function NewAccountForm() {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    if (!blob) {
      setError("Ajoutez la photo du compte TikTok.");
      return;
    }
    setPending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("photo", blob, "photo.jpg");
    const res = await createAccount(fd);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  const input = "w-full border border-stone-300 px-3 py-3 text-base";

  return (
    <form onSubmit={onSubmit} className="bg-white border border-stone-300 p-4 space-y-3">
      <input name="gmail" type="email" required placeholder="Adresse Gmail"
        autoCapitalize="none" autoCorrect="off" className={input} />
      <input name="password" type="text" required placeholder="Mot de passe du Gmail"
        autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
        className={input} />
      <input name="tiktok" type="url" required placeholder="Lien du compte TikTok (https://...)"
        autoCapitalize="none" className={input} />

      <div>
        <label className="block text-sm text-stone-600 mb-1">Photo du compte TikTok</label>
        <input type="file" accept="image/*" onChange={onFile} className="w-full text-sm" />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="mt-2 h-40 w-40 object-cover border border-stone-300" />
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending}
        className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer la fiche"}
      </button>
    </form>
  );
}
