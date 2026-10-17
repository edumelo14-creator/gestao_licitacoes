"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ArvoreEmpresa } from "@/lib/sessao";

function Seta({ aberto }: { aberto: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${aberto ? "rotate-90" : ""}`} aria-hidden>
      <path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Icone = {
  empresa: <span className="inline-block h-2 w-2 rounded-sm bg-marca" />,
  fornecedor: <span className="inline-block h-2 w-2 rounded-full border-[1.5px] border-marca" />,
  licitacao: <span className="inline-block h-1.5 w-1.5 rounded-full bg-tinta/30" />,
};

export default function Arvore({ dados }: { dados: ArvoreEmpresa[] }) {
  const pathname = usePathname();
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");

  // abre automaticamente o caminho até o item selecionado
  useEffect(() => {
    const id = pathname.split("/")[2];
    if (!id) return;
    const novos: Record<string, boolean> = {};
    for (const e of dados) {
      if (e.id === id) novos[e.id] = true;
      for (const f of e.fornecedores) {
        if (f.id === id) { novos[e.id] = true; novos[f.id] = true; }
        if (f.licitacoes.some((l) => l.id === id)) { novos[e.id] = true; novos[f.id] = true; }
      }
    }
    setAbertos((a) => ({ ...a, ...novos }));
  }, [pathname, dados]);

  const termo = busca.trim().toLowerCase();
  const filtrado = useMemo(() => {
    if (!termo) return dados;
    const bate = (s: string) => s.toLowerCase().includes(termo);
    return dados
      .map((e) => {
        if (bate(e.nome)) return e;
        const fornecedores = e.fornecedores
          .map((f) => {
            if (bate(f.nome)) return f;
            const licitacoes = f.licitacoes.filter((l) => bate(l.numero) || bate(l.descricao));
            return licitacoes.length ? { ...f, licitacoes } : null;
          })
          .filter(Boolean) as ArvoreEmpresa["fornecedores"];
        return fornecedores.length ? { ...e, fornecedores } : null;
      })
      .filter(Boolean) as ArvoreEmpresa[];
  }, [dados, termo]);

  const aberto = (id: string) => !!termo || !!abertos[id];
  const alternar = (id: string) => setAbertos((a) => ({ ...a, [id]: !a[id] }));
  const ativo = (href: string) => pathname === href;

  const linha = (href: string, ativoAgora: boolean) =>
    `flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-1 text-[13px] ${
      ativoAgora ? "bg-marca-clara font-medium text-marca-escura" : "hover:bg-black/[0.04]"
    }`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pb-2">
        <input
          className="campo py-1.5 text-[13px]" placeholder="Filtrar árvore…"
          value={busca} onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {filtrado.length === 0 && (
          <p className="px-2 py-4 text-xs text-tinta/50">
            {termo ? "Nada encontrado." : "Nenhuma empresa cadastrada ainda."}
          </p>
        )}
        <ul>
          {filtrado.map((e) => (
            <li key={e.id}>
              <div className="flex items-center">
                <button onClick={() => alternar(e.id)} className="grid h-6 w-5 place-items-center text-tinta/40 hover:text-tinta" aria-label="Expandir">
                  {e.fornecedores.length > 0 ? <Seta aberto={aberto(e.id)} /> : null}
                </button>
                <Link href={`/empresas/${e.id}`} className={linha(`/empresas/${e.id}`, ativo(`/empresas/${e.id}`))} title={e.nome}>
                  {Icone.empresa}<span className="truncate">{e.nome}</span>
                </Link>
              </div>
              {aberto(e.id) && (
                <ul className="ml-[9px] border-l border-linha pl-2">
                  {e.fornecedores.map((f) => (
                    <li key={f.id}>
                      <div className="flex items-center">
                        <button onClick={() => alternar(f.id)} className="grid h-6 w-5 place-items-center text-tinta/40 hover:text-tinta" aria-label="Expandir">
                          {f.licitacoes.length > 0 ? <Seta aberto={aberto(f.id)} /> : null}
                        </button>
                        <Link href={`/fornecedores/${f.id}`} className={linha(`/fornecedores/${f.id}`, ativo(`/fornecedores/${f.id}`))} title={f.nome}>
                          {Icone.fornecedor}<span className="truncate">{f.nome}</span>
                        </Link>
                      </div>
                      {aberto(f.id) && (
                        <ul className="ml-[9px] border-l border-linha pl-2">
                          {f.licitacoes.map((l) => (
                            <li key={l.id} className="flex items-center pl-5">
                              <Link href={`/licitacoes/${l.id}`} className={linha(`/licitacoes/${l.id}`, ativo(`/licitacoes/${l.id}`))} title={`${l.numero} — ${l.descricao}`}>
                                {Icone.licitacao}
                                <span className="shrink-0 font-mono text-[12px]">{l.numero}</span>
                                <span className="truncate text-tinta/50">{l.descricao}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
