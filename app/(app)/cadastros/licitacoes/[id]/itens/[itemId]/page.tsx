import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormItem from "@/components/FormItem";
import { obterSessao } from "@/lib/sessao";
import { paraInput } from "@/lib/numeros";

export default async function EditarItem({
  params, searchParams,
}: { params: Promise<{ id: string; itemId: string }>; searchParams: Promise<{ voltar?: string }> }) {
  const { id, itemId } = await params;
  const { voltar: v } = await searchParams;
  const voltar = v && v.startsWith("/") && !v.startsWith("//") ? v : undefined;
  const { supabase } = await obterSessao();
  const { data: i } = await supabase
    .from("licitacao_itens")
    .select("id, lote, produto_codigo, quantidade, valor_unitario, valor_total, nota_base, observacao, produtos(codigo, descricao), licitacoes(numero)")
    .eq("id", itemId).eq("licitacao_id", id).maybeSingle();
  if (!i) notFound();
  const lic = i.licitacoes as unknown as { numero: string };
  return (
    <>
      <Cabecalho
        trilha={[{ href: "/cadastros", label: "Cadastros" }, { href: `/cadastros/licitacoes/${id}`, label: `Licitação ${lic.numero}` }]}
        titulo="Editar item"
      />
      <FormItem
        licitacaoId={id} voltar={voltar} cancelarHref={`${voltar ?? `/cadastros/licitacoes/${id}`}#itens`}
        inicial={{
          id: i.id,
          lote: i.lote ?? "",
          produto: i.produtos as unknown as { codigo: string; descricao: string },
          quantidade: paraInput(i.quantidade),
          valor_unitario: paraInput(i.valor_unitario),
          valor_total: paraInput(i.valor_total),
          nota_base: i.nota_base ?? "",
          observacao: i.observacao ?? "",
        }}
      />
    </>
  );
}
