"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { criarProdutoRapido } from "@/app/(app)/actions-itens";

type Produto = { codigo: string; descricao: string };

/** Campo de busca no cadastro global de produtos. Envia apenas o código (input hidden). */
export default function BuscaProduto({
  name = "produto_codigo", inicial, chaveReset,
}: {
  name?: string;
  inicial?: Produto | null;
  chaveReset?: unknown;
}) {
  const supabase = useRef(createClient()).current;
  const [sel, setSel] = useState<Produto | null>(inicial ?? null);
  const [termo, setTermo] = useState("");
  const [lista, setLista] = useState<Produto[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const [buscou, setBuscou] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar() {
    const d = termo.trim();
    if (!d) return;
    setCriando(true); setErro("");
    const r = await criarProdutoRapido(d);
    setCriando(false);
    if (r.produto) escolher(r.produto);
    else setErro(r.erro ?? "Não foi possível cadastrar o produto.");
  }

  useEffect(() => { setSel(inicial ?? null); setTermo(""); }, [chaveReset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = termo.trim();
    setBuscou(false);
    if (!t) { setLista([]); return; }
    const h = setTimeout(async () => {
      const limpo = t.replace(/[%,()]/g, "");
      const { data } = await supabase
        .from("produtos")
        .select("codigo, descricao")
        .or(`codigo.ilike.%${limpo}%,descricao.ilike.%${limpo}%`)
        .order("codigo")
        .limit(20);
      setLista(data ?? []);
      setAtivo(0);
      setBuscou(true);
    }, 200);
    return () => clearTimeout(h);
  }, [termo, supabase]);

  function escolher(p: Produto) {
    setSel(p); setTermo(""); setLista([]); setAberto(false); setErro("");
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={sel?.codigo ?? ""} />
      {sel ? (
        <div className="campo flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">
            <span className="font-mono font-medium">{sel.codigo}</span>
            <span className="text-tinta/60"> — {sel.descricao}</span>
          </span>
          <button type="button" onClick={() => setSel(null)} className="shrink-0 text-xs text-marca hover:underline">trocar</button>
        </div>
      ) : (
        <input
          className="campo" placeholder="Digite código ou descrição…" value={termo}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setAtivo((a) => Math.min(a + 1, lista.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter") {
              e.preventDefault();
              if (lista[ativo]) escolher(lista[ativo]);
              else if (buscou && termo.trim()) cadastrar();
            }
          }}
        />
      )}
      {!sel && aberto && termo.trim() && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-linha bg-white shadow-lg">
          {buscou && lista.length === 0 && (
            <li className="px-3 py-2 text-sm text-tinta/50">Nenhum produto encontrado.</li>
          )}
          {lista.map((p, i) => (
            <li key={p.codigo}>
              <button
                type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(p)}
                className={`block w-full px-3 py-2 text-left text-sm ${i === ativo ? "bg-marca-clara" : "hover:bg-papel"}`}
              >
                <span className="font-mono font-medium">{p.codigo}</span>
                <span className="text-tinta/60"> — {p.descricao}</span>
              </button>
            </li>
          ))}
          {buscou && (
            <li className="border-t border-linha">
              <button
                type="button" disabled={criando} onMouseDown={(e) => e.preventDefault()} onClick={cadastrar}
                className="block w-full px-3 py-2 text-left text-sm font-medium text-marca hover:bg-marca-clara disabled:opacity-60"
              >
                {criando ? "Cadastrando…" : <>+ Cadastrar produto “{termo.trim()}” <span className="font-normal text-tinta/50">(código automático)</span></>}
              </button>
            </li>
          )}
        </ul>
      )}
      {erro && <p className="mt-1 text-xs text-alerta">{erro}</p>}
    </div>
  );
}
