import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";

export default async function Inicio() {
  const { supabase, perfil } = await obterSessao();
  const contar = async (t: string) => (await supabase.from(t).select("*", { count: "exact", head: true })).count ?? 0;
  const [e, f, l] = await Promise.all([contar("empresas"), contar("fornecedores"), contar("licitacoes")]);
  const { data: recentes } = await supabase
    .from("licitacoes")
    .select("id, numero, descricao, fornecedores(nome, empresas(nome))")
    .order("created_at", { ascending: false })
    .limit(8);

  const cards = [
    { n: e, label: "Empresas" },
    { n: f, label: "Fornecedores (prefeituras)" },
    { n: l, label: "Licitações" },
  ];

  return (
    <>
      <Cabecalho
        titulo={`Olá${perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}`}
        subtitulo="Use a árvore à esquerda para navegar."
        acoes={perfil?.is_admin ? <Link href="/cadastros" className="btn-primario">Cadastros</Link> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="cartao p-5">
            <div className="font-mono text-3xl font-medium">{c.n}</div>
            <div className="mt-1 text-sm text-tinta/60">{c.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-tinta/50">Licitações recentes</h2>
      <div className="cartao overflow-hidden">
        {recentes && recentes.length > 0 ? (
          <table className="tabela">
            <thead><tr><th>Número</th><th>Descrição</th><th>Prefeitura</th><th>Empresa</th></tr></thead>
            <tbody>
              {recentes.map((r) => {
                const forn = r.fornecedores as unknown as { nome: string; empresas: { nome: string } } | null;
                return (
                  <tr key={r.id} className="hover:bg-papel/60">
                    <td className="font-mono"><Link href={`/ver/licitacao/${r.id}`} className="text-marca hover:underline">{r.numero}</Link></td>
                    <td>{r.descricao}</td>
                    <td>{forn?.nome}</td>
                    <td className="text-tinta/60">{forn?.empresas?.nome}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-tinta/60">Nenhuma licitação cadastrada ainda.</p>
        )}
      </div>
    </>
  );
}
