import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";

export default async function Licitacoes({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { supabase } = await obterSessao();
  let consulta = supabase
    .from("licitacoes")
    .select("id, numero, descricao, fornecedores(id, nome, empresas(id, nome))")
    .order("numero");
  if (q) consulta = consulta.or(`numero.ilike.%${q.replace(/[%,()]/g, "")}%,descricao.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await consulta;

  return (
    <>
      <Cabecalho trilha={[{ href: "/cadastros", label: "Cadastros" }]} titulo="Licitações" subtitulo="Separadas por número e descrição, vinculadas ao fornecedor." acoes={<Link href="/cadastros/licitacoes/nova" className="btn-primario">Nova licitação</Link>} />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por número ou descrição…" className="campo max-w-sm" />
        <button className="btn-secundario">Buscar</button>
      </form>
      <div className="cartao overflow-hidden">
        {data && data.length > 0 ? (
          <table className="tabela">
            <thead><tr><th>Número</th><th>Descrição</th><th>Prefeitura</th><th>Empresa</th></tr></thead>
            <tbody>
              {data.map((l) => {
                const f = l.fornecedores as unknown as { id: string; nome: string; empresas: { id: string; nome: string } } | null;
                return (
                  <tr key={l.id} className="hover:bg-papel/60">
                    <td className="font-mono"><Link href={`/cadastros/licitacoes/${l.id}`} className="text-marca hover:underline">{l.numero}</Link></td>
                    <td>{l.descricao}</td>
                    <td>{f && <Link href={`/cadastros/fornecedores/${f.id}`} className="hover:underline">{f.nome}</Link>}</td>
                    <td className="text-tinta/60">{f?.empresas?.nome}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">Nenhuma licitação encontrada.</p>}
      </div>
    </>
  );
}
