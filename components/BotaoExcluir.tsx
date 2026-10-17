"use client";

import { useActionState } from "react";
import type { Estado } from "@/app/(app)/actions";

export default function BotaoExcluir({
  action, ocultos, mensagem,
}: {
  action: (s: Estado, fd: FormData) => Promise<Estado>;
  ocultos: Record<string, string>;
  mensagem: string;
}) {
  const [estado, enviar, pendente] = useActionState(action, {});
  return (
    <form
      action={enviar}
      onSubmit={(e) => { if (!confirm(mensagem)) e.preventDefault(); }}
      className="flex flex-col items-end gap-1"
    >
      {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button type="submit" className="btn-perigo" disabled={pendente}>{pendente ? "Excluindo…" : "Excluir"}</button>
      {estado.erro && <p className="max-w-xs text-right text-xs text-alerta">{estado.erro}</p>}
    </form>
  );
}
