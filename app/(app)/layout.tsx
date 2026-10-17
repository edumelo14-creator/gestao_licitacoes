import Link from "next/link";
import Arvore from "@/components/Arvore";
import { obterArvore, obterSessao } from "@/lib/sessao";
import { sair } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, perfil } = await obterSessao();

  if (!perfil?.ativo) {
    return (
      <main className="flex min-h-full items-center justify-center p-6">
        <div className="cartao max-w-md p-8">
          <h1 className="text-xl font-semibold">Acesso aguardando liberação</h1>
          <p className="mt-2 text-sm text-tinta/70">
            Sua conta <strong>{user.email}</strong> foi registrada, mas ainda não foi liberada.
            Peça a um administrador para ativá-la na tela de Usuários.
          </p>
          <form action={sair} className="mt-6">
            <button className="btn-secundario">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  const arvore = await obterArvore();
  const menu = [
    { href: "/", label: "Início" },
    { href: "/empresas", label: "Empresas" },
    { href: "/fornecedores", label: "Fornecedores" },
    { href: "/licitacoes", label: "Licitações" },
    ...(perfil.is_admin ? [{ href: "/usuarios", label: "Usuários" }] : []),
  ];

  return (
    <div className="flex h-full">
      <aside className="flex w-72 shrink-0 flex-col border-r border-linha bg-[#efece4]">
        <div className="px-4 pb-3 pt-5">
          <Link href="/" className="block">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-marca">Gestão de</div>
            <div className="text-lg font-semibold leading-tight tracking-tight">Licitações</div>
          </Link>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-3">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="rounded px-2 py-1 text-xs text-tinta/70 hover:bg-black/5 hover:text-tinta">
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-linha px-4 pb-2 pt-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-tinta/50">Empresa › Prefeitura › Licitação</span>
          <Link href="/empresas/nova" className="text-xs text-marca hover:underline" title="Nova empresa">+ Nova</Link>
        </div>
        <Arvore dados={arvore} />
        <div className="flex items-center justify-between gap-2 border-t border-linha px-4 py-3 text-xs">
          <span className="truncate text-tinta/60" title={user.email}>{perfil.nome || user.email}</span>
          <form action={sair}><button className="text-tinta/60 hover:text-alerta">Sair</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
