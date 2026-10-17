import Link from "next/link";
import Cabecalho from "@/components/Cabecalho";
import { obterSessao } from "@/lib/sessao";

export default async function Cadastros() {
  const { supabase } = await obterSessao();
  const contar = async (t: string) => (await supabase.from(t).select("*", { count: "exact", head: true })).count ?? 0;
  const [e, f, l, p, u] = await Promise.all([contar("empresas"), contar("fornecedores"), contar("licitacoes"), contar("produtos"), contar("profiles")]);

  const itens = [
    { href: "/cadastros/empresas", novo: "/cadastros/empresas/nova", titulo: "Empresas", desc: "Empresas que entregam os produtos.", n: e },
    { href: "/cadastros/fornecedores", novo: "/cadastros/fornecedores/nova", titulo: "Fornecedores", desc: "Prefeituras, vinculadas a uma empresa.", n: f },
    { href: "/cadastros/licitacoes", novo: "/cadastros/licitacoes/nova", titulo: "Licitações", desc: "Número e descrição, vinculadas ao fornecedor.", n: l },
    { href: "/cadastros/produtos", novo: "/cadastros/produtos/novo", titulo: "Produtos", desc: "Cadastro global: código e descrição.", n: p },
    { href: "/cadastros/usuarios", novo: null, titulo: "Usuários", desc: "Acesso ao sistema e administradores.", n: u },
  ];

  return (
    <>
      <Cabecalho titulo="Cadastros" subtitulo="Área exclusiva de administradores." />
      <div className="grid gap-4 sm:grid-cols-2">
        {itens.map((i) => (
          <div key={i.href} className="cartao flex flex-col p-5">
            <div className="flex items-baseline justify-between">
              <Link href={i.href} className="text-lg font-semibold hover:text-marca">{i.titulo}</Link>
              <span className="font-mono text-2xl text-tinta/70">{i.n}</span>
            </div>
            <p className="mt-1 text-sm text-tinta/60">{i.desc}</p>
            <div className="mt-4 flex gap-2">
              <Link href={i.href} className="btn-secundario">Abrir</Link>
              {i.novo && <Link href={i.novo} className="btn-primario">+ Novo</Link>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
