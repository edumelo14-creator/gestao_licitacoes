import Link from "next/link";
import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import BotaoExcluir from "@/components/BotaoExcluir";
import { obterSessao } from "@/lib/sessao";
import { formatarCnpj } from "@/lib/cnpj";
import { excluirFornecedor, salvarFornecedor } from "../../actions";

export default async function Fornecedor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const [{ data: f }, { data: empresas }] = await Promise.all([
    supabase
      .from("fornecedores")
      .select("id, empresa_id, cnpj, nome, endereco, empresas(id, nome), licitacoes(id, numero, descricao)")
      .eq("id", id)
      .order("numero", { referencedTable: "licitacoes" })
      .maybeSingle(),
    supabase.from("empresas").select("id, nome").order("nome"),
  ]);
  if (!f) notFound();
  const emp = f.empresas as unknown as { id: string; nome: string };

  return (
    <>
      <Cabecalho
        trilha={[{ href: "/empresas", label: "Empresas" }, { href: `/empresas/${emp.id}`, label: emp.nome }]}
        titulo={f.nome}
        subtitulo={<span className="font-mono">{formatarCnpj(f.cnpj)}</span>}
        acoes={<BotaoExcluir action={excluirFornecedor} ocultos={{ id: f.id, empresa_id: f.empresa_id }} mensagem={`Excluir o fornecedor "${f.nome}"?`} />}
      />
      <FormEntidade
        action={salvarFornecedor} ocultos={{ id: f.id }}
        campos={[
          { name: "empresa_id", label: "Empresa", tipo: "select", obrigatorio: true, valor: f.empresa_id, opcoes: (empresas ?? []).map((e) => ({ value: e.id, label: e.nome })) },
          { name: "nome", label: "Nome", tipo: "texto", obrigatorio: true, valor: f.nome },
          { name: "cnpj", label: "CNPJ", tipo: "cnpj", obrigatorio: true, valor: f.cnpj, largura: "metade" },
          { name: "endereco", label: "Endereço", tipo: "textarea", valor: f.endereco },
        ]}
      />

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta/50">Licitações</h2>
        <Link href={`/licitacoes/nova?fornecedor=${f.id}`} className="btn-secundario">+ Nova licitação</Link>
      </div>
      <div className="cartao overflow-hidden">
        {f.licitacoes.length > 0 ? (
          <table className="tabela">
            <thead><tr><th className="w-40">Número</th><th>Descrição</th></tr></thead>
            <tbody>
              {f.licitacoes.map((l) => (
                <tr key={l.id} className="hover:bg-papel/60">
                  <td className="font-mono"><Link href={`/licitacoes/${l.id}`} className="text-marca hover:underline">{l.numero}</Link></td>
                  <td>{l.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">Nenhuma licitação para este fornecedor.</p>}
      </div>
    </>
  );
}
