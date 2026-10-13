"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { hbtn, inputClass } from "./ui";

/**
 * Downscale an uploaded photo to WebP so it fits in localStorage (≈5 MB for the whole demo).
 * A real deployment would upload to object storage and keep only the URL.
 */
export function compressImage(file: File, max = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/webp", 0.75));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Add a photo by pasting a link or uploading a file. */
export default function ImageInput({ onAdd, multiple = true, max }: { onAdd: (src: string) => void; multiple?: boolean; max?: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const addUrl = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) return toast.error("Paste a full image link starting with https://");
    onAdd(v);
    setUrl("");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="Paste image link (https://…)"
          className={`${inputClass} pl-9`}
        />
      </div>
      <button type="button" onClick={addUrl} className={hbtn.outline}>
        Add link
      </button>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={hbtn.outline}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Upload
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, max ?? 10);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          try {
            for (const f of files) onAdd(await compressImage(f));
          } catch {
            toast.error("That file couldn't be read as an image.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
