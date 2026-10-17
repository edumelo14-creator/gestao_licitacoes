"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(params.get("erro") ? "Não foi possível concluir o login." : "");
  const [carregando, setCarregando] = useState(false);

  async function entrarGoogle() {
    setErro("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErro(error.message);
  }

  async function entrarEmail(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-marca">Gestão de</div>
        <h1 className="text-3xl font-semibold tracking-tight">Licitações</h1>
        <p className="mt-2 text-sm text-tinta/60">Entre para acessar empresas, prefeituras e licitações.</p>
      </div>

      <button onClick={entrarGoogle} className="btn-secundario w-full py-2.5">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        Entrar com Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-tinta/40">
        <span className="h-px flex-1 bg-linha" /> ou com e-mail <span className="h-px flex-1 bg-linha" />
      </div>

      <form onSubmit={entrarEmail} className="space-y-4">
        <div>
          <label className="rotulo" htmlFor="email">E-mail</label>
          <input id="email" type="email" required className="campo" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="rotulo" htmlFor="senha">Senha</label>
          <input id="senha" type="password" required className="campo" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        {erro && <p className="text-sm text-alerta">{erro}</p>}
        <button type="submit" disabled={carregando} className="btn-primario w-full py-2.5">
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-xs text-tinta/50">
        Novos usuários são cadastrados por um administrador dentro do sistema.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
