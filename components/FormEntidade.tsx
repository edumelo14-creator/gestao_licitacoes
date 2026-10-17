"use client";

import { useActionState, useState } from "react";
import type { Estado } from "@/app/(app)/actions";
import { formatarCnpj } from "@/lib/cnpj";

type Opcao = { value: string; label: string };
export type Campo =
  | { name: string; label: string; tipo: "texto" | "cnpj" | "textarea"; valor?: string | null; obrigatorio?: boolean; placeholder?: string; largura?: "metade" | "inteira" }
  | { name: string; label: string; tipo: "select"; valor?: string | null; obrigatorio?: boolean; opcoes?: Opcao[]; grupos?: { label: string; opcoes: Opcao[] }[]; largura?: "metade" | "inteira" };

function CampoCnpj({ name, valor, obrigatorio }: { name: string; valor?: string | null; obrigatorio?: boolean }) {
  const [v, setV] = useState(formatarCnpj(valor ?? ""));
  return (
    <input
      id={name} name={name} className="campo font-mono" inputMode="numeric" required={obrigatorio}
      placeholder="00.000.000/0000-00" value={v} onChange={(e) => setV(formatarCnpj(e.target.value))}
    />
  );
}

export default function FormEntidade({
  action, campos, ocultos = {}, rotuloBotao = "Salvar", cancelarHref,
}: {
  action: (s: Estado, fd: FormData) => Promise<Estado>;
  campos: Campo[];
  ocultos?: Record<string, string>;
  rotuloBotao?: string;
  cancelarHref?: string;
}) {
  const [estado, enviar, pendente] = useActionState(action, {});
  return (
    <form action={enviar} className="cartao p-6">
      {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campos.map((c) => (
          <div key={c.name} className={c.largura === "metade" ? "" : "md:col-span-2"}>
            <label className="rotulo" htmlFor={c.name}>
              {c.label}{c.obrigatorio && <span className="text-alerta"> *</span>}
            </label>
            {c.tipo === "cnpj" ? (
              <CampoCnpj name={c.name} valor={c.valor} obrigatorio={c.obrigatorio} />
            ) : c.tipo === "textarea" ? (
              <textarea id={c.name} name={c.name} rows={3} className="campo" defaultValue={c.valor ?? ""} required={c.obrigatorio} placeholder={c.placeholder} />
            ) : c.tipo === "select" ? (
              <select id={c.name} name={c.name} className="campo" defaultValue={c.valor ?? ""} required={c.obrigatorio}>
                <option value="">Selecione…</option>
                {c.opcoes?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                {c.grupos?.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.opcoes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </optgroup>
                ))}
              </select>
            ) : (
              <input id={c.name} name={c.name} className="campo" defaultValue={c.valor ?? ""} required={c.obrigatorio} placeholder={c.placeholder} />
            )}
          </div>
        ))}
      </div>
      {estado.erro && <p className="mt-4 rounded-md bg-alerta/5 px-3 py-2 text-sm text-alerta">{estado.erro}</p>}
      <div className="mt-6 flex gap-2">
        <button type="submit" className="btn-primario" disabled={pendente}>{pendente ? "Salvando…" : rotuloBotao}</button>
        {cancelarHref && <a href={cancelarHref} className="btn-secundario">Cancelar</a>}
      </div>
    </form>
  );
}
