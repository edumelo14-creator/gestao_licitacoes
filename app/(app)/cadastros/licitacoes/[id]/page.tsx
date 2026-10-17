import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import BotaoExcluir from "@/components/BotaoExcluir";
import { obterSessao } from "@/lib/sessao";
import { gruposFornecedores } from "@/lib/opcoes";
import { obterItens } from "@/lib/itens";
import TabelaItens from "@/components/TabelaItens";
import FormItem from "@/components/FormItem";
import Importador from "@/components/Importador";
import { excluirLicitacao, salvarLicitacao } from "@/app/(app)/actions";

export default async function Licitacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const [{ data: l }, grupos, itens] = await Promise.all([
    supabase.from("licitacoes").select("id, numero, descricao, fornecedor_id, fornecedores(id, nome, empresas(id, nome))").eq("id", id).maybeSingle(),
    gruposFornecedores(supabase),
    obterItens(supabase, id),
  ]);
  if (!l) notFound();
  const f = l.fornecedores as unknown as { id: string; nome: string; empresas: { id: string; nome: string } };

  return (
    <>
      <Cabecalho
        trilha={[{ href: "/cadastros", label: "Cadastros" },
          { href: `/cadastros/empresas/${f.empresas.id}`, label: f.empresas.nome },
          { href: `/cadastros/fornecedores/${f.id}`, label: f.nome },
        ]}
        titulo={`Licitação ${l.numero}`}
        subtitulo={l.descricao}
        acoes={<BotaoExcluir action={excluirLicitacao} ocultos={{ id: l.id, fornecedor_id: l.fornecedor_id }} mensagem={`Excluir a licitação ${l.numero}?`} />}
      />
      <FormEntidade
        action={salvarLicitacao} ocultos={{ id: l.id }}
        campos={[
          { name: "fornecedor_id", label: "Fornecedor (prefeitura)", tipo: "select", obrigatorio: true, valor: l.fornecedor_id, grupos },
          { name: "numero", label: "Número", tipo: "texto", obrigatorio: true, valor: l.numero, largura: "metade" },
          { name: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true, valor: l.descricao },
        ]}
      />

      <section id="itens" className="mt-10 scroll-mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta/50">Itens / Produtos</h2>
        </div>
        <TabelaItens itens={itens} licitacaoId={l.id} editavel />
        <h3 className="mb-2 mt-6 text-sm font-semibold text-tinta/70">Incluir item</h3>
        <FormItem licitacaoId={l.id} />
        <div className="mt-4"><Importador modo="itens" licitacaoId={l.id} /></div>
      </section>
    </>
  );
}
