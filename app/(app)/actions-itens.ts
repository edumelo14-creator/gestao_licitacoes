"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { arred2, parseNumero } from "@/lib/numeros";

export type Estado = { erro?: string; ok?: string };
const txt = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

async function exigirAdmin() {
  const s = await obterSessao();
  if (!s.perfil?.ativo || !s.perfil?.is_admin) throw new Error("Apenas administradores.");
  return s;
}

function erroBanco(msg: string, code?: string) {
  if (code === "23505") return "Já existe um produto com este código.";
  if (code === "23503") return "Registro vinculado a outro cadastro.";
  if (code === "42501") return "Você não tem permissão para esta operação.";
  return msg;
}

/* ---------------- Produtos (cadastro global) ---------------- */

export async function salvarProduto(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  const original = txt(fd, "original");
  const codigo = txt(fd, "codigo");
  const descricao = txt(fd, "descricao");
  if (!codigo) return { erro: "Informe o código." };
  if (!descricao) return { erro: "Informe a descrição." };

  const { error } = original
    ? await supabase.from("produtos").update({ codigo, descricao }).eq("codigo", original)
    : await supabase.from("produtos").insert({ codigo, descricao });
  if (error) return { erro: erroBanco(error.message, error.code) };
  revalidatePath("/cadastros/produtos");
  redirect("/cadastros/produtos");
}

export async function excluirProduto(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from("produtos").delete().eq("codigo", txt(fd, "codigo"));
  if (error) {
    return { erro: error.code === "23503" ? "Produto em uso em alguma licitação — não pode ser excluído." : erroBanco(error.message, error.code) };
  }
  revalidatePath("/cadastros/produtos");
  redirect("/cadastros/produtos");
}

export type LinhaProduto = { codigo: string; descricao: string };

export async function importarProdutos(linhas: LinhaProduto[]): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  const validas = linhas
    .map((l) => ({ codigo: String(l.codigo ?? "").trim(), descricao: String(l.descricao ?? "").trim() }))
    .filter((l) => l.codigo && l.descricao);
  if (!validas.length) return { erro: "Nenhuma linha válida (código e descrição são obrigatórios)." };
  const unicos = Array.from(new Map(validas.map((l) => [l.codigo, l])).values());
  const { error } = await supabase.from("produtos").upsert(unicos, { onConflict: "codigo" });
  if (error) return { erro: erroBanco(error.message, error.code) };
  revalidatePath("/cadastros/produtos");
  return { ok: `${unicos.length} produto(s) importado(s)/atualizado(s).` };
}

/* ---------------- Itens da licitação ---------------- */

function lerItem(fd: FormData) {
  const quantidade = parseNumero(txt(fd, "quantidade"));
  const valor_unitario = parseNumero(txt(fd, "valor_unitario"));
  const totalInf = parseNumero(txt(fd, "valor_total"));
  return {
    lote: txt(fd, "lote") || null,
    produto_codigo: txt(fd, "produto_codigo"),
    quantidade,
    valor_unitario,
    valor_total: Number.isFinite(totalInf) ? arred2(totalInf) : arred2(quantidade * valor_unitario),
    nota_base: txt(fd, "nota_base") || null,
    observacao: txt(fd, "observacao") || null,
  };
}

function validarItem(i: ReturnType<typeof lerItem>): string | null {
  if (!i.produto_codigo) return "Selecione o produto.";
  if (!Number.isFinite(i.quantidade) || i.quantidade < 0) return "Quantidade inválida.";
  if (!Number.isFinite(i.valor_unitario) || i.valor_unitario < 0) return "Valor unitário inválido.";
  if (!Number.isFinite(i.valor_total) || i.valor_total < 0) return "Valor total inválido.";
  return null;
}

export async function salvarItem(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  const id = txt(fd, "id");
  const licitacao_id = txt(fd, "licitacao_id");
  const item = lerItem(fd);
  const erro = validarItem(item);
  if (erro) return { erro };

  const { error } = id
    ? await supabase.from("licitacao_itens").update(item).eq("id", id)
    : await supabase.from("licitacao_itens").insert({ ...item, licitacao_id });
  if (error) return { erro: error.code === "23503" ? "Código de produto não encontrado no cadastro." : erroBanco(error.message, error.code) };

  revalidatePath(`/cadastros/licitacoes/${licitacao_id}`);
  revalidatePath(`/ver/licitacao/${licitacao_id}`);
  const voltar = txt(fd, "voltar");
  if (id) redirect(voltar.startsWith("/") && !voltar.startsWith("//") ? `${voltar}#itens` : `/cadastros/licitacoes/${licitacao_id}#itens`);
  return { ok: "Item incluído." };
}

export async function excluirItem(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  const licitacao_id = txt(fd, "licitacao_id");
  const { error } = await supabase.from("licitacao_itens").delete().eq("id", txt(fd, "id"));
  if (error) return { erro: erroBanco(error.message, error.code) };
  revalidatePath(`/cadastros/licitacoes/${licitacao_id}`);
  revalidatePath(`/ver/licitacao/${licitacao_id}`);
  return {};
}

export type LinhaItem = {
  lote?: string | null;
  codigo: string;
  descricao?: string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number | null;
  nota_base?: string | null;
  observacao?: string | null;
};

export async function importarItens(licitacao_id: string, linhas: LinhaItem[]): Promise<Estado> {
  const { supabase } = await exigirAdmin();
  if (!linhas.length) return { erro: "Nenhuma linha para importar." };

  // cria no cadastro global os produtos que vieram com descrição e ainda não existem
  const comDescricao = linhas
    .filter((l) => l.codigo && l.descricao)
    .map((l) => ({ codigo: String(l.codigo).trim(), descricao: String(l.descricao).trim() }));
  if (comDescricao.length) {
    const unicos = Array.from(new Map(comDescricao.map((p) => [p.codigo, p])).values());
    const { error } = await supabase.from("produtos").upsert(unicos, { onConflict: "codigo", ignoreDuplicates: true });
    if (error) return { erro: "Erro ao criar produtos: " + erroBanco(error.message, error.code) };
  }

  const itens = [];
  for (const [i, l] of linhas.entries()) {
    const quantidade = parseNumero(l.quantidade);
    const valor_unitario = parseNumero(l.valor_unitario);
    const totalInf = parseNumero(l.valor_total);
    const item = {
      licitacao_id,
      lote: l.lote ? String(l.lote).trim() : null,
      produto_codigo: String(l.codigo ?? "").trim(),
      quantidade,
      valor_unitario,
      valor_total: Number.isFinite(totalInf) ? arred2(totalInf) : arred2(quantidade * valor_unitario),
      nota_base: l.nota_base ? String(l.nota_base).trim() : null,
      observacao: l.observacao ? String(l.observacao).trim() : null,
    };
    const erro = validarItem(item);
    if (erro) return { erro: `Linha ${i + 1}: ${erro}` };
    itens.push(item);
  }

  const { error } = await supabase.from("licitacao_itens").insert(itens);
  if (error) {
    return { erro: error.code === "23503" ? "Há códigos de produto que não existem no cadastro (inclua a coluna Descrição para criá-los)." : erroBanco(error.message, error.code) };
  }
  revalidatePath(`/cadastros/licitacoes/${licitacao_id}`);
  revalidatePath(`/ver/licitacao/${licitacao_id}`);
  return { ok: `${itens.length} item(ns) importado(s).` };
}
