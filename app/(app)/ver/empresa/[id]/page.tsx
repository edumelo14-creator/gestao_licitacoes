import { notFound } from "next/navigation";
import Ramo from "@/components/Ramo";
import { obterSessao } from "@/lib/sessao";

export default async function VerEmpresa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const { data } = await supabase.from("empresas").select("nome").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <Ramo tipo="Empresa" nome={data.nome} />;
}
