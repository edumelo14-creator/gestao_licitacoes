import { notFound } from "next/navigation";
import Ramo from "@/components/Ramo";
import { obterSessao } from "@/lib/sessao";
import { obterItens } from "@/lib/itens";
import TabelaItens from "@/components/TabelaItens";

export default async function VerLicitacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const { data } = await supabase
    .from("licitacoes")
    .select("numero, descricao, fornecedores(id, nome, empresas(id, nome))")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const itens = await obterItens(supabase, id);
  const f = data.fornecedores as unknown as { id: string; nome: string; empresas: { id: string; nome: string } };
  return (
    <>
    <Ramo
      tipo="Licitação"
      nome={<><span className="font-mono">{data.numero}</span> <span className="text-tinta/60">— {data.descricao}</span></>}
      caminho={[
        { href: `/ver/empresa/${f.empresas.id}`, label: f.empresas.nome },
        { href: `/ver/fornecedor/${f.id}`, label: f.nome },
      ]}
    />
    <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-tinta/50">Itens / Produtos</h2>
    <TabelaItens itens={itens} licitacaoId={id} />
    </>
  );
}
