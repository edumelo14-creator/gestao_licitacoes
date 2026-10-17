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

  return (
    <div className="flex h-full">
      <aside className="flex w-72 shrink-0 flex-col border-r border-linha bg-[#efece4]">
        <div className="px-4 pb-3 pt-5">
          <Link href="/" className="block">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-marca">Gestão de</div>
            <div className="text-lg font-semibold leading-tight tracking-tight">Licitações</div>
          </Link>
        </div>
        <nav className="flex gap-2 px-3 pb-3">
          <Link href="/" className="btn-secundario flex-1 py-1.5 text-xs">Início</Link>
          {perfil.is_admin && (
            <Link href="/cadastros" className="btn-primario flex-1 py-1.5 text-xs">Cadastros</Link>
          )}
        </nav>
        <div className="border-t border-linha px-4 pb-2 pt-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-tinta/50">Empresa › Prefeitura › Licitação</span>
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
