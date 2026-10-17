import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import Importador from "@/components/Importador";
import { obterSessao } from "@/lib/sessao";

export default async function Produtos({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { supabase } = await obterSessao();
  let consulta = supabase.from("produtos").select("codigo, descricao, licitacao_itens(count)").order("codigo").limit(500);
  if (q) {
    const t = q.replace(/[%,()]/g, "");
    consulta = consulta.or(`codigo.ilike.%${t}%,descricao.ilike.%${t}%`);
  }
  const [{ data }, { count }] = await Promise.all([
    consulta,
    supabase.from("produtos").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <Cabecalho
        trilha={[{ href: "/cadastros", label: "Cadastros" }]}
        titulo="Produtos"
        subtitulo={`Cadastro global — ${count ?? 0} produto(s).`}
        acoes={<Link href="/cadastros/produtos/novo" className="btn-primario">Novo produto</Link>}
      />
      <div className="mb-4 flex flex-wrap items-start gap-2">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Buscar por código ou descrição…" className="campo w-72" />
          <button className="btn-secundario">Buscar</button>
        </form>
        <div className="ml-auto"><Importador modo="produtos" /></div>
      </div>
      <div className="cartao overflow-hidden">
        {data && data.length > 0 ? (
          <table className="tabela">
            <thead><tr><th className="w-40">Código</th><th>Descrição</th><th className="text-right">Usado em</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.codigo} className="hover:bg-papel/60">
                  <td className="font-mono">
                    <Link href={`/cadastros/produtos/${encodeURIComponent(p.codigo)}`} className="text-marca hover:underline">{p.codigo}</Link>
                  </td>
                  <td>{p.descricao}</td>
                  <td className="text-right font-mono text-tinta/60">{(p.licitacao_itens as unknown as { count: number }[])[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="p-6 text-sm text-tinta/60">{q ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}</p>}
      </div>
      {data && data.length === 500 && <p className="mt-2 text-xs text-tinta/50">Mostrando os primeiros 500 — use a busca para filtrar.</p>}
    </>
  );
}
