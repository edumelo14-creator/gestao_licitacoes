"use client";

import { useEffect } from "react";

export default function Modal({
  aberto, onFechar, titulo, largura = "max-w-3xl", children,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  largura?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = overflow; };
  }, [aberto, onFechar]);

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/40 p-4 pt-[8vh]" onMouseDown={onFechar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className={`w-full ${largura} rounded-lg bg-papel shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-linha px-5 py-3">
          <h2 className="font-semibold">{titulo}</h2>
          <button type="button" onClick={onFechar} className="rounded p-1 text-tinta/50 hover:bg-black/5 hover:text-tinta" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
