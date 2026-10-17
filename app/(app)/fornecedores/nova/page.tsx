import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import { obterSessao } from "@/lib/sessao";
import { salvarFornecedor } from "../../actions";

export default async function NovoFornecedor({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  const { empresa } = await searchParams;
  const { supabase } = await obterSessao();
  const { data: empresas } = await supabase.from("empresas").select("id, nome").order("nome");

  if (!empresas?.length) {
    return (
      <>
        <Cabecalho trilha={[{ href: "/fornecedores", label: "Fornecedores" }]} titulo="Novo fornecedor" />
        <div className="cartao p-6 text-sm">Cadastre primeiro uma <Link href="/empresas/nova" className="text-marca hover:underline">empresa</Link>.</div>
      </>
    );
  }
  return (
    <>
      <Cabecalho trilha={[{ href: "/fornecedores", label: "Fornecedores" }]} titulo="Novo fornecedor (prefeitura)" />
      <FormEntidade
        action={salvarFornecedor} cancelarHref={empresa ? `/empresas/${empresa}` : "/fornecedores"}
        campos={[
          { name: "empresa_id", label: "Empresa", tipo: "select", obrigatorio: true, valor: empresa, opcoes: empresas.map((e) => ({ value: e.id, label: e.nome })) },
          { name: "nome", label: "Nome (ex.: Prefeitura Municipal de …)", tipo: "texto", obrigatorio: true },
          { name: "cnpj", label: "CNPJ", tipo: "cnpj", obrigatorio: true, largura: "metade" },
          { name: "endereco", label: "Endereço", tipo: "textarea" },
        ]}
      />
    </>
  );
}
