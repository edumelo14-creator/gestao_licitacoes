import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";
import { formatarCnpj } from "@/lib/cnpj";

export default async function Fornecedores() {
  const { supabase } = await obterSessao();
  const { data } = await supabase.from("fornecedores").select("id, cnpj, nome, endereco, empresas(id, nome), licitacoes(count)").order("nome");
  return (
    <>
      <Cabecalho trilha={[{ href: "/cadastros", label: "Cadastros" }]} titulo="Fornecedores" subtitulo="Prefeituras, cada uma vinculada a uma empresa." acoes={<Link href="/cadastros/fornecedores/nova" className="btn-primario">Novo fornecedor</Link>} />
      <div className="cartao overflow-hidden">
        {data && data.length > 0 ? (
          <table className="tabela">
            <thead><tr><th>Nome</th><th>CNPJ</th><th>Empresa</th><th className="text-right">Licitações</th></tr></thead>
            <tbody>
              {data.map((f) => {
                const emp = f.empresas as unknown as { id: string; nome: string } | null;
                return (
                  <tr key={f.id} className="hover:bg-papel/60">
                    <td><Link href={`/cadastros/fornecedores/${f.id}`} className="font-medium text-marca hover:underline">{f.nome}</Link></td>
                    <td className="font-mono text-xs">{formatarCnpj(f.cnpj)}</td>
                    <td>{emp && <Link href={`/cadastros/empresas/${emp.id}`} className="hover:underline">{emp.nome}</Link>}</td>
                    <td className="text-right font-mono">{(f.licitacoes as unknown as { count: number }[])[0]?.count ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">Nenhum fornecedor cadastrado.</p>}
      </div>
    </>
  );
}
