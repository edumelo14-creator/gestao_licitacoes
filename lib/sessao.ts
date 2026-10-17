import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Perfil = {
  id: string;
  email: string;
  nome: string | null;
  is_admin: boolean;
  ativo: boolean;
};

export const obterSessao = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, email, nome, is_admin, ativo")
    .eq("id", user.id)
    .single<Perfil>();
  return { supabase, user, perfil };
});

export type ArvoreEmpresa = {
  id: string;
  nome: string;
  fornecedores: {
    id: string;
    nome: string;
    licitacoes: { id: string; numero: string; descricao: string }[];
  }[];
};

export async function obterArvore(): Promise<ArvoreEmpresa[]> {
  const { supabase } = await obterSessao();
  const { data } = await supabase
    .from("empresas")
    .select("id, nome, fornecedores(id, nome, licitacoes(id, numero, descricao))")
    .order("nome")
    .order("nome", { referencedTable: "fornecedores" })
    .order("numero", { referencedTable: "fornecedores.licitacoes" });
  return (data as ArvoreEmpresa[]) ?? [];
}
