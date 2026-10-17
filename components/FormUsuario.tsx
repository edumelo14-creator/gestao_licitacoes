"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarUsuario, type Estado } from "@/app/(app)/actions";

export default function FormUsuario() {
  const [estado, enviar, pendente] = useActionState<Estado, FormData>(criarUsuario, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (estado.ok) ref.current?.reset(); }, [estado]);
  return (
    <form ref={ref} action={enviar} className="cartao p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="rotulo" htmlFor="nome">Nome</label><input id="nome" name="nome" className="campo" /></div>
        <div><label className="rotulo" htmlFor="email">E-mail <span className="text-alerta">*</span></label><input id="email" name="email" type="email" required className="campo" /></div>
        <div><label className="rotulo" htmlFor="senha">Senha inicial <span className="text-alerta">*</span></label><input id="senha" name="senha" type="text" minLength={8} required className="campo font-mono" /></div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="is_admin" className="accent-marca" /> Administrador</label>
      </div>
      {estado.erro && <p className="mt-4 rounded-md bg-alerta/5 px-3 py-2 text-sm text-alerta">{estado.erro}</p>}
      {estado.ok && <p className="mt-4 rounded-md bg-marca-clara px-3 py-2 text-sm text-marca-escura">{estado.ok}</p>}
      <button className="btn-primario mt-6" disabled={pendente}>{pendente ? "Criando…" : "Criar usuário"}</button>
    </form>
  );
}
