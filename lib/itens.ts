import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemLinha } from "@/components/TabelaItens";

export async function obterItens(supabase: SupabaseClient, licitacaoId: string): Promise<ItemLinha[]> {
  const { data } = await supabase
    .from("licitacao_itens")
    .select("id, produto_codigo, quantidade, valor_unitario, valor_total, nota_base, observacao, produtos(descricao)")
    .eq("licitacao_id", licitacaoId)
    .order("created_at");
  return (data as unknown as ItemLinha[]) ?? [];
}
