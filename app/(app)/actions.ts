"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { createAdminClient } from "@/lib/supabase/admin";
import { cnpjValido, somenteDigitos } from "@/lib/cnpj";

export type Estado = { erro?: string; ok?: string };

const txt = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function traduzirErro(msg: string, code?: string): string {
  if (code === "23505") return "Já existe um cadastro com esses dados (CNPJ ou número duplicado).";
  if (code === "23503") return "Não é possível excluir: existem registros vinculados a este cadastro.";
  if (code === "42501") return "Você não tem permissão para esta operação.";
  return msg;
}

async function exigirAtivo() {
  const s = await obterSessao();
  if (!s.perfil?.ativo) throw new Error("Usuário sem acesso liberado.");
  return s;
}

/* ---------------- Empresas ---------------- */

export async function salvarEmpresa(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const id = txt(fd, "id");
  const cnpj = somenteDigitos(txt(fd, "cnpj"));
  const nome = txt(fd, "nome");
  const endereco = txt(fd, "endereco");
  if (!nome) return { erro: "Informe o nome." };
  if (!cnpjValido(cnpj)) return { erro: "CNPJ inválido." };

  const dados = { cnpj, nome, endereco: endereco || null };
  const { data, error } = id
    ? await supabase.from("empresas").update(dados).eq("id", id).select("id").single()
    : await supabase.from("empresas").insert(dados).select("id").single();
  if (error) return { erro: traduzirErro(error.message, error.code) };

  revalidatePath("/", "layout");
  redirect(`/empresas/${data.id}`);
}

export async function excluirEmpresa(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const { error } = await supabase.from("empresas").delete().eq("id", txt(fd, "id"));
  if (error) return { erro: traduzirErro(error.message, error.code) };
  revalidatePath("/", "layout");
  redirect("/empresas");
}

/* ---------------- Fornecedores ---------------- */

export async function salvarFornecedor(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const id = txt(fd, "id");
  const empresa_id = txt(fd, "empresa_id");
  const cnpj = somenteDigitos(txt(fd, "cnpj"));
  const nome = txt(fd, "nome");
  const endereco = txt(fd, "endereco");
  if (!empresa_id) return { erro: "Selecione a empresa." };
  if (!nome) return { erro: "Informe o nome." };
  if (!cnpjValido(cnpj)) return { erro: "CNPJ inválido." };

  const dados = { empresa_id, cnpj, nome, endereco: endereco || null };
  const { data, error } = id
    ? await supabase.from("fornecedores").update(dados).eq("id", id).select("id").single()
    : await supabase.from("fornecedores").insert(dados).select("id").single();
  if (error) return { erro: traduzirErro(error.message, error.code) };

  revalidatePath("/", "layout");
  redirect(`/fornecedores/${data.id}`);
}

export async function excluirFornecedor(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const empresa = txt(fd, "empresa_id");
  const { error } = await supabase.from("fornecedores").delete().eq("id", txt(fd, "id"));
  if (error) return { erro: traduzirErro(error.message, error.code) };
  revalidatePath("/", "layout");
  redirect(empresa ? `/empresas/${empresa}` : "/fornecedores");
}

/* ---------------- Licitações ---------------- */

export async function salvarLicitacao(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const id = txt(fd, "id");
  const fornecedor_id = txt(fd, "fornecedor_id");
  const numero = txt(fd, "numero");
  const descricao = txt(fd, "descricao");
  if (!fornecedor_id) return { erro: "Selecione o fornecedor (prefeitura)." };
  if (!numero) return { erro: "Informe o número da licitação." };
  if (!descricao) return { erro: "Informe a descrição." };

  const dados = { fornecedor_id, numero, descricao };
  const { data, error } = id
    ? await supabase.from("licitacoes").update(dados).eq("id", id).select("id").single()
    : await supabase.from("licitacoes").insert(dados).select("id").single();
  if (error) return { erro: traduzirErro(error.message, error.code) };

  revalidatePath("/", "layout");
  redirect(`/licitacoes/${data.id}`);
}

export async function excluirLicitacao(_: Estado, fd: FormData): Promise<Estado> {
  const { supabase } = await exigirAtivo();
  const fornecedor = txt(fd, "fornecedor_id");
  const { error } = await supabase.from("licitacoes").delete().eq("id", txt(fd, "id"));
  if (error) return { erro: traduzirErro(error.message, error.code) };
  revalidatePath("/", "layout");
  redirect(fornecedor ? `/fornecedores/${fornecedor}` : "/licitacoes");
}

/* ---------------- Usuários (admin) ---------------- */

async function exigirAdmin() {
  const s = await exigirAtivo();
  if (!s.perfil?.is_admin) throw new Error("Apenas administradores.");
  return s;
}

export async function criarUsuario(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const nome = txt(fd, "nome");
  const email = txt(fd, "email").toLowerCase();
  const senha = txt(fd, "senha");
  const admin = fd.get("is_admin") === "on";
  if (!email) return { erro: "Informe o e-mail." };
  if (senha.length < 8) return { erro: "A senha deve ter pelo menos 8 caracteres." };

  let cliente;
  try {
    cliente = createAdminClient();
  } catch (e) {
    return { erro: (e as Error).message };
  }
  const { data, error } = await cliente.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
    app_metadata: { criado_por_admin: true },
  });
  if (error) {
    return {
      erro: /already|registered|exists/i.test(error.message)
        ? "Já existe um usuário com este e-mail."
        : error.message,
    };
  }
  if (admin && data.user) {
    await cliente.from("profiles").update({ is_admin: true, ativo: true }).eq("id", data.user.id);
  }
  revalidatePath("/usuarios");
  return { ok: `Usuário ${email} criado. Ele pode entrar com essa senha ou com o Google (mesmo e-mail).` };
}

export async function alterarUsuario(fd: FormData) {
  const { supabase, user } = await exigirAdmin();
  const id = txt(fd, "id");
  const campo = txt(fd, "campo");
  const valor = txt(fd, "valor") === "true";
  if (id === user.id) return; // não altera a si mesmo
  if (campo !== "ativo" && campo !== "is_admin") return;
  await supabase.from("profiles").update({ [campo]: valor }).eq("id", id);
  revalidatePath("/usuarios");
}

export async function sair() {
  const { supabase } = await obterSessao();
  await supabase.auth.signOut();
  redirect("/login");
}
