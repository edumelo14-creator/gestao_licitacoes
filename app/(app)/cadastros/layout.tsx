import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";

/** Toda a área de Cadastros é exclusiva de administradores. */
export default async function CadastrosLayout({ children }: { children: React.ReactNode }) {
  const { perfil } = await obterSessao();
  if (!perfil?.is_admin) redirect("/");
  return <>{children}</>;
}
