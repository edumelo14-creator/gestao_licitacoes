import { redirect } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormUsuario from "@/components/FormUsuario";
import { obterSessao, type Perfil } from "@/lib/sessao";
import { alterarUsuario } from "@/app/(app)/actions";

function Alternar({ id, campo, valor, rotulo, desabilitado }: { id: string; campo: string; valor: boolean; rotulo: string; desabilitado?: boolean }) {
  return (
    <form action={alterarUsuario}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="campo" value={campo} />
      <input type="hidden" name="valor" value={String(!valor)} />
      <button
        disabled={desabilitado}
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium disabled:opacity-60 ${valor ? "bg-marca-clara text-marca-escura" : "bg-black/5 text-tinta/50"}`}
        title={desabilitado ? "Você não pode alterar seu próprio acesso" : "Clique para alternar"}
      >
        {rotulo}: {valor ? "sim" : "não"}
      </button>
    </form>
  );
}

export default async function Usuarios() {
  const { supabase, user, perfil } = await obterSessao();
  if (!perfil?.is_admin) redirect("/");
  const { data } = await supabase.from("profiles").select("id, email, nome, is_admin, ativo").order("email");
  const usuarios = (data ?? []) as Perfil[];
  const pendentes = usuarios.filter((u) => !u.ativo).length;

  return (
    <>
      <Cabecalho trilha={[{ href: "/cadastros", label: "Cadastros" }]} titulo="Usuários" subtitulo={pendentes ? `${pendentes} aguardando liberação` : "Controle de acesso ao sistema."} />
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tinta/50">Novo usuário</h2>
      <FormUsuario />
      <p className="mt-2 text-xs text-tinta/50">
        Quem entrar com uma conta Google não cadastrada aparece abaixo como inativo — basta ativar.
      </p>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-tinta/50">Usuários cadastrados</h2>
      <div className="cartao overflow-hidden">
        <table className="tabela">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Acesso</th><th>Perfil</th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome || <span className="text-tinta/40">—</span>}</td>
                <td className="text-tinta/70">{u.email}</td>
                <td><Alternar id={u.id} campo="ativo" valor={u.ativo} rotulo="Ativo" desabilitado={u.id === user.id} /></td>
                <td><Alternar id={u.id} campo="is_admin" valor={u.is_admin} rotulo="Admin" desabilitado={u.id === user.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
