import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import { obterSessao } from "@/lib/sessao";
import { gruposFornecedores } from "@/lib/opcoes";
import { salvarLicitacao } from "../../actions";

export default async function NovaLicitacao({ searchParams }: { searchParams: Promise<{ fornecedor?: string }> }) {
  const { fornecedor } = await searchParams;
  const { supabase } = await obterSessao();
  const grupos = await gruposFornecedores(supabase);

  if (!grupos.length) {
    return (
      <>
        <Cabecalho trilha={[{ href: "/licitacoes", label: "Licitações" }]} titulo="Nova licitação" />
        <div className="cartao p-6 text-sm">Cadastre primeiro um <Link href="/fornecedores/nova" className="text-marca hover:underline">fornecedor (prefeitura)</Link>.</div>
      </>
    );
  }
  return (
    <>
      <Cabecalho trilha={[{ href: "/licitacoes", label: "Licitações" }]} titulo="Nova licitação" />
      <FormEntidade
        action={salvarLicitacao} cancelarHref={fornecedor ? `/fornecedores/${fornecedor}` : "/licitacoes"}
        campos={[
          { name: "fornecedor_id", label: "Fornecedor (prefeitura)", tipo: "select", obrigatorio: true, valor: fornecedor, grupos },
          { name: "numero", label: "Número", tipo: "texto", obrigatorio: true, placeholder: "ex.: PE 012/2026", largura: "metade" },
          { name: "descricao", label: "Descrição", tipo: "textarea", obrigatorio: true },
        ]}
      />
    </>
  );
}
