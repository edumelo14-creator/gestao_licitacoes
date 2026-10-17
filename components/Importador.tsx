"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import readXlsxFile from "read-excel-file";
import { createClient } from "@/lib/supabase/client";
import { arred2, fmtMoeda, fmtQtd, fmtUnit, parseNumero } from "@/lib/numeros";
import { importarItens, importarProdutos, type LinhaItem } from "@/app/(app)/actions-itens";

type Modo = "itens" | "produtos";

const ALIASES: Record<string, string[]> = {
  lote: ["lote", "nlote", "numerolote", "numerodolote", "lt"],
  codigo: ["codigo", "cod", "codproduto", "codigoproduto", "codigodoproduto"],
  descricao: ["descricao", "desc", "descricaoproduto", "nome"],
  quantidade: ["quantidade", "qtd", "qtde", "quant"],
  valor_unitario: ["valorunitario", "vlunitario", "vlunit", "unitario", "precounitario", "preco", "valorunit"],
  valor_total: ["valortotal", "vltotal", "total"],
  nota_base: ["notabase", "nota", "nf", "nfe", "numeronota", "numeronotabase", "nnota"],
  observacao: ["observacao", "obs", "observacoes"],
};

const norm = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function mapearCabecalho(cab: unknown[]) {
  const idx: Record<string, number> = {};
  cab.forEach((c, i) => {
    const n = norm(c);
    for (const [campo, nomes] of Object.entries(ALIASES)) {
      if (idx[campo] === undefined && nomes.includes(n)) idx[campo] = i;
    }
  });
  return idx;
}

function lerCsv(texto: string): string[][] {
  const primeira = texto.split(/\r?\n/)[0] ?? "";
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let campo = "", linha: string[] = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = "";
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((x) => String(x).trim() !== ""));
}

type Previa = LinhaItem & { status: "ok" | "novo" | "erro"; motivo?: string };

const MODELO: Record<Modo, string> = {
  itens: "Lote;Codigo;Descricao;Quantidade;Valor Unitario;Valor Total;Nota Base;Observacao\n1;1001;Arroz tipo 1 5kg;100;25,90;2590,00;12345;\n",
  produtos: "Codigo;Descricao\n;Arroz tipo 1 5kg\n;Feijão carioca 1kg\n",
};

export default function Importador({ modo, licitacaoId, embutido = false }: { modo: Modo; licitacaoId?: string; embutido?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [aberto, setAberto] = useState(embutido);
  const [previa, setPrevia] = useState<Previa[]>([]);
  const [msg, setMsg] = useState<{ erro?: string; ok?: string }>({});
  const [enviando, setEnviando] = useState(false);

  async function lerArquivo(f: File) {
    setMsg({}); setPrevia([]);
    let rows: unknown[][];
    try {
      rows = /\.(xlsx|xlsm)$/i.test(f.name) ? ((await readXlsxFile(f)) as unknown[][]) : lerCsv(await f.text());
    } catch {
      setMsg({ erro: "Não foi possível ler o arquivo. Use .xlsx ou .csv." });
      return;
    }
    if (rows.length < 2) { setMsg({ erro: "O arquivo precisa ter um cabeçalho e ao menos uma linha." }); return; }
    const idx = mapearCabecalho(rows[0]);
    const obrig = modo === "itens" ? ["quantidade", "valor_unitario"] : ["descricao"];
    if (modo === "itens" && idx.codigo === undefined && idx.descricao === undefined) {
      setMsg({ erro: "A planilha precisa da coluna Código ou da coluna Descrição." });
      return;
    }
    const faltando = obrig.filter((c) => idx[c] === undefined);
    if (faltando.length) {
      setMsg({ erro: `Colunas não encontradas no cabeçalho: ${faltando.join(", ")}. Baixe o modelo para ver os nomes.` });
      return;
    }
    const pega = (r: unknown[], c: string) => (idx[c] === undefined ? undefined : r[idx[c]]);
    const linhas: Previa[] = rows.slice(1).map((r) => {
      const codigo = String(pega(r, "codigo") ?? "").trim();
      const descricao = String(pega(r, "descricao") ?? "").trim();
      if (modo === "produtos") {
        return { codigo, descricao, quantidade: 0, valor_unitario: 0, status: descricao ? (codigo ? "ok" : "novo") : "erro", motivo: descricao ? (codigo ? undefined : "Código automático") : "Descrição obrigatória" };
      }
      const quantidade = parseNumero(pega(r, "quantidade"));
      const valor_unitario = parseNumero(pega(r, "valor_unitario"));
      const vt = parseNumero(pega(r, "valor_total"));
      const valor_total = Number.isFinite(vt) ? arred2(vt) : arred2(quantidade * valor_unitario);
      let motivo: string | undefined;
      if (!codigo && !descricao) motivo = "Sem código e sem descrição";
      else if (!Number.isFinite(quantidade)) motivo = "Quantidade inválida";
      else if (!Number.isFinite(valor_unitario)) motivo = "Valor unitário inválido";
      return {
        lote: String(pega(r, "lote") ?? "").trim() || null,
        codigo, descricao, quantidade, valor_unitario, valor_total,
        nota_base: String(pega(r, "nota_base") ?? "").trim() || null,
        observacao: String(pega(r, "observacao") ?? "").trim() || null,
        status: motivo ? "erro" : "ok", motivo,
      };
    });

    if (modo === "itens") {
      const supabase = createClient();
      const codigos = Array.from(new Set(linhas.filter((l) => l.status === "ok" && l.codigo).map((l) => l.codigo!)));
      const existentes = new Set<string>();
      for (let i = 0; i < codigos.length; i += 200) {
        const { data } = await supabase.from("produtos").select("codigo").in("codigo", codigos.slice(i, i + 200));
        data?.forEach((p) => existentes.add(p.codigo));
      }
      for (const l of linhas) {
        if (l.status !== "ok") continue;
        if (!l.codigo) { l.status = "novo"; l.motivo = "Sem código — usa/cria o produto pela descrição"; continue; }
        if (existentes.has(l.codigo)) continue;
        if (l.descricao) { l.status = "novo"; l.motivo = "Produto será criado no cadastro"; }
        else { l.status = "erro"; l.motivo = "Código não existe no cadastro (sem descrição para criar)"; }
      }
    }
    setPrevia(linhas);
  }

  const erros = previa.filter((l) => l.status === "erro").length;
  const validas = previa.filter((l) => l.status !== "erro");

  async function confirmar() {
    setEnviando(true); setMsg({});
    const r = modo === "itens"
      ? await importarItens(licitacaoId!, validas.map(({ status: _s, motivo: _m, ...l }) => l))
      : await importarProdutos(validas.map((l) => ({ codigo: l.codigo || undefined, descricao: l.descricao ?? "" })));
    setEnviando(false);
    setMsg(r);
    if (r.ok) { setPrevia([]); if (inputRef.current) inputRef.current.value = ""; router.refresh(); }
  }

  const modeloHref = "data:text/csv;charset=utf-8," + encodeURIComponent("﻿" + MODELO[modo]);

  if (!aberto) {
    return <button type="button" className="btn-secundario" onClick={() => setAberto(true)}>Importar planilha</button>;
  }

  return (
    <div className={embutido ? "w-full" : "cartao w-full p-5"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Importar {modo === "itens" ? "itens" : "produtos"}</h3>
          <p className="text-xs text-tinta/60">
            Arquivo .xlsx ou .csv com cabeçalho na 1ª linha.{" "}
            {modo === "itens"
              ? "Obrigatórias: Quantidade, Valor Unitário e Código ou Descrição. Sem código, o produto é localizado pela descrição (ou criado com código automático). Opcionais: Lote, Valor Total, Nota Base, Observação."
              : "Coluna Descrição obrigatória. Código opcional: vazio = código automático; se informado e já existir, atualiza a descrição."}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={modeloHref} download={`modelo-${modo}.csv`} className="btn-secundario">Baixar modelo</a>
          {!embutido && <button type="button" className="btn-secundario" onClick={() => { setAberto(false); setPrevia([]); setMsg({}); }}>Fechar</button>}
        </div>
      </div>

      <input
        ref={inputRef} type="file" accept=".xlsx,.xlsm,.csv,text/csv"
        className="mt-4 block text-sm file:mr-3 file:rounded-md file:border file:border-linha file:bg-white file:px-3 file:py-1.5 file:text-sm"
        onChange={(e) => e.target.files?.[0] && lerArquivo(e.target.files[0])}
      />

      {msg.erro && <p className="mt-4 rounded-md bg-alerta/5 px-3 py-2 text-sm text-alerta">{msg.erro}</p>}
      {msg.ok && <p className="mt-4 rounded-md bg-marca-clara px-3 py-2 text-sm text-marca-escura">{msg.ok}</p>}

      {previa.length > 0 && (
        <>
          <div className="mt-4 max-h-80 overflow-auto rounded-md border border-linha">
            <table className="tabela">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {modo === "itens" && <th>Lote</th>}
                  <th>Código</th><th>Descrição</th>
                  {modo === "itens" && <><th className="text-right">Qtd.</th><th className="text-right">Unitário</th><th className="text-right">Total</th><th>Nota</th></>}
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {previa.map((l, i) => (
                  <tr key={i} className={l.status === "erro" ? "bg-alerta/5" : ""}>
                    {modo === "itens" && <td className="font-mono">{l.lote}</td>}
                    <td className="font-mono">{l.codigo}</td>
                    <td className="text-tinta/70">{l.descricao}</td>
                    {modo === "itens" && (
                      <>
                        <td className="text-right font-mono">{Number.isFinite(l.quantidade) ? fmtQtd(l.quantidade) : "—"}</td>
                        <td className="text-right font-mono">{Number.isFinite(l.valor_unitario) ? fmtUnit(l.valor_unitario) : "—"}</td>
                        <td className="text-right font-mono">{Number.isFinite(l.valor_total ?? NaN) ? fmtMoeda(l.valor_total) : "—"}</td>
                        <td className="font-mono">{l.nota_base}</td>
                      </>
                    )}
                    <td className={`text-xs ${l.status === "erro" ? "text-alerta" : l.status === "novo" ? "text-amber-700" : "text-marca"}`}>
                      {l.status === "ok" ? "OK" : l.motivo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primario" disabled={enviando || validas.length === 0} onClick={confirmar}>
              {enviando ? "Importando…" : `Importar ${validas.length} linha(s)`}
            </button>
            {erros > 0 && <span className="text-sm text-alerta">{erros} linha(s) com erro serão ignoradas.</span>}
          </div>
        </>
      )}
    </div>
  );
}
