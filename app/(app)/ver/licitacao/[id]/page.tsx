import { notFound } from "next/navigation";
import Ramo from "@/components/Ramo";
import { obterSessao } from "@/lib/sessao";
import { obterItens } from "@/lib/itens";
import TabelaItens from "@/components/TabelaItens";
import ItensAcoes from "@/components/ItensAcoes";

export default async function VerLicitacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, perfil } = await obterSessao();
  const { data } = await supabase
    .from("licitacoes")
    .select("numero, descricao, fornecedores(id, nome, empresas(id, nome))")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const itens = await obterItens(supabase, id);
  const f = data.fornecedores as unknown as { id: string; nome: string; empresas: { id: string; nome: string } };
  const admin = !!perfil?.is_admin;

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

      <section id="itens" className="mt-10 scroll-mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta/50">Itens / Produtos</h2>
          {admin && <ItensAcoes licitacaoId={id} />}
        </div>
        <TabelaItens itens={itens} licitacaoId={id} editavel={admin} />
      </section>
    </>
  );
}
