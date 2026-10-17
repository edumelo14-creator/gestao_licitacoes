import Link from "next/link";
import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import BotaoExcluir from "@/components/BotaoExcluir";
import { obterSessao } from "@/lib/sessao";
import { formatarCnpj } from "@/lib/cnpj";
import { excluirEmpresa, salvarEmpresa } from "../../actions";

export default async function Empresa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const { data: e } = await supabase
    .from("empresas")
    .select("id, cnpj, nome, endereco, fornecedores(id, cnpj, nome, endereco, licitacoes(count))")
    .eq("id", id)
    .order("nome", { referencedTable: "fornecedores" })
    .maybeSingle();
  if (!e) notFound();

  return (
    <>
      <Cabecalho
        trilha={[{ href: "/empresas", label: "Empresas" }]}
        titulo={e.nome}
        subtitulo={<span className="font-mono">{formatarCnpj(e.cnpj)}</span>}
        acoes={<BotaoExcluir action={excluirEmpresa} ocultos={{ id: e.id }} mensagem={`Excluir a empresa "${e.nome}"?`} />}
      />
      <FormEntidade
        action={salvarEmpresa} ocultos={{ id: e.id }}
        campos={[
          { name: "nome", label: "Nome / Razão social", tipo: "texto", obrigatorio: true, valor: e.nome },
          { name: "cnpj", label: "CNPJ", tipo: "cnpj", obrigatorio: true, valor: e.cnpj, largura: "metade" },
          { name: "endereco", label: "Endereço", tipo: "textarea", valor: e.endereco },
        ]}
      />

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta/50">Fornecedores (prefeituras)</h2>
        <Link href={`/fornecedores/nova?empresa=${e.id}`} className="btn-secundario">+ Novo fornecedor</Link>
      </div>
      <div className="cartao overflow-hidden">
        {e.fornecedores.length > 0 ? (
          <table className="tabela">
            <thead><tr><th>Nome</th><th>CNPJ</th><th>Endereço</th><th className="text-right">Licitações</th></tr></thead>
            <tbody>
              {e.fornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-papel/60">
                  <td><Link href={`/fornecedores/${f.id}`} className="font-medium text-marca hover:underline">{f.nome}</Link></td>
                  <td className="font-mono text-xs">{formatarCnpj(f.cnpj)}</td>
                  <td className="text-tinta/70">{f.endereco}</td>
                  <td className="text-right font-mono">{(f.licitacoes as unknown as { count: number }[])[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">Nenhum fornecedor vinculado a esta empresa.</p>}
      </div>
    </>
  );
}
