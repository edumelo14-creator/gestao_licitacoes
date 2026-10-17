import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";

export default async function Inicio() {
  const { supabase, perfil } = await obterSessao();
  const contar = async (t: string) => (await supabase.from(t).select("*", { count: "exact", head: true })).count ?? 0;
  const [e, f, l] = await Promise.all([contar("empresas"), contar("fornecedores"), contar("licitacoes")]);
  const { data: recentes } = await supabase
    .from("licitacoes")
    .select("id, numero, descricao, created_at, fornecedores(nome, empresas(nome))")
    .order("created_at", { ascending: false })
    .limit(8);

  const cards = [
    { n: e, label: "Empresas", href: "/empresas", novo: "/empresas/nova" },
    { n: f, label: "Fornecedores (prefeituras)", href: "/fornecedores", novo: "/fornecedores/nova" },
    { n: l, label: "Licitações", href: "/licitacoes", novo: "/licitacoes/nova" },
  ];

  return (
    <>
      <Cabecalho titulo={`Olá${perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}`} subtitulo="Visão geral dos cadastros." />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.href} className="cartao p-5">
            <div className="font-mono text-3xl font-medium">{c.n}</div>
            <div className="mt-1 text-sm text-tinta/60">{c.label}</div>
            <div className="mt-4 flex gap-3 text-sm">
              <Link href={c.href} className="text-marca hover:underline">Ver todos</Link>
              <Link href={c.novo} className="text-marca hover:underline">+ Novo</Link>
            </div>
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
                    <td className="font-mono"><Link href={`/licitacoes/${r.id}`} className="text-marca hover:underline">{r.numero}</Link></td>
                    <td>{r.descricao}</td>
                    <td>{forn?.nome}</td>
                    <td className="text-tinta/60">{forn?.empresas?.nome}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-tinta/60">
            Nenhuma licitação ainda. Comece cadastrando uma <Link href="/empresas/nova" className="text-marca hover:underline">empresa</Link>.
          </p>
        )}
      </div>
    </>
  );
}
