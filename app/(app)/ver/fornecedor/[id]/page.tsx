import { notFound } from "next/navigation";
import Ramo from "@/components/Ramo";
import { obterSessao } from "@/lib/sessao";

export default async function VerFornecedor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await obterSessao();
  const { data } = await supabase.from("fornecedores").select("nome, empresas(id, nome)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const e = data.empresas as unknown as { id: string; nome: string };
  return <Ramo tipo="Fornecedor" nome={data.nome} caminho={[{ href: `/ver/empresa/${e.id}`, label: e.nome }]} />;
}
