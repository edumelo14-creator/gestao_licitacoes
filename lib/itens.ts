import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemLinha } from "@/components/TabelaItens";

export async function obterItens(supabase: SupabaseClient, licitacaoId: string): Promise<ItemLinha[]> {
  const { data } = await supabase
    .from("licitacao_itens")
    .select("id, lote, produto_codigo, quantidade, valor_unitario, valor_total, nota_base, observacao, produtos(descricao)")
    .eq("licitacao_id", licitacaoId)
    .order("created_at");
  const itens = (data as unknown as ItemLinha[]) ?? [];
  // ordena por lote (numérico quando possível); itens sem lote ficam no fim, na ordem de inclusão
  return itens
    .map((i, n) => ({ i, n }))
    .sort((a, b) => {
      if (a.i.lote && b.i.lote) return a.i.lote.localeCompare(b.i.lote, "pt-BR", { numeric: true }) || a.n - b.n;
      if (a.i.lote) return -1;
      if (b.i.lote) return 1;
      return a.n - b.n;
    })
    .map((x) => x.i);
}
