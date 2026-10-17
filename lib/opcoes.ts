import type { SupabaseClient } from "@supabase/supabase-js";

/** Fornecedores agrupados por empresa, para <select> com <optgroup>. */
export async function gruposFornecedores(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("empresas")
    .select("nome, fornecedores(id, nome)")
    .order("nome")
    .order("nome", { referencedTable: "fornecedores" });
  return (data ?? [])
    .filter((e) => e.fornecedores.length > 0)
    .map((e) => ({ label: e.nome, opcoes: e.fornecedores.map((f) => ({ value: f.id, label: f.nome })) }));
}
