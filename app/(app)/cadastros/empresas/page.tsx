import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";
import { formatarCnpj } from "@/lib/cnpj";

export default async function Empresas() {
  const { supabase } = await obterSessao();
  const { data } = await supabase.from("empresas").select("id, cnpj, nome, endereco, fornecedores(count)").order("nome");
  return (
    <>
      <Cabecalho trilha={[{ href: "/cadastros", label: "Cadastros" }]} titulo="Empresas" subtitulo="Empresas que entregam os produtos." acoes={<Link href="/cadastros/empresas/nova" className="btn-primario">Nova empresa</Link>} />
      <div className="cartao overflow-hidden">
        {data && data.length > 0 ? (
          <table className="tabela">
            <thead><tr><th>Nome</th><th>CNPJ</th><th>Endereço</th><th className="text-right">Fornecedores</th></tr></thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} className="hover:bg-papel/60">
                  <td><Link href={`/cadastros/empresas/${e.id}`} className="font-medium text-marca hover:underline">{e.nome}</Link></td>
                  <td className="font-mono text-xs">{formatarCnpj(e.cnpj)}</td>
                  <td className="text-tinta/70">{e.endereco}</td>
                  <td className="text-right font-mono">{(e.fornecedores as unknown as { count: number }[])[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">Nenhuma empresa cadastrada.</p>}
      </div>
    </>
  );
}
