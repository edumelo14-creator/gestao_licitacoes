import { notFound } from "next/navigation";
import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import BotaoExcluir from "@/components/BotaoExcluir";
import { obterSessao } from "@/lib/sessao";
import { excluirProduto, salvarProduto } from "@/app/(app)/actions-itens";

export default async function Produto({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const cod = decodeURIComponent(codigo);
  const { supabase } = await obterSessao();
  const { data: p } = await supabase.from("produtos").select("codigo, descricao").eq("codigo", cod).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <Cabecalho
        trilha={[{ href: "/cadastros", label: "Cadastros" }, { href: "/cadastros/produtos", label: "Produtos" }]}
        titulo={p.descricao}
        subtitulo={<span className="font-mono">{p.codigo}</span>}
        acoes={<BotaoExcluir action={excluirProduto} ocultos={{ codigo: p.codigo }} mensagem={`Excluir o produto ${p.codigo}?`} />}
      />
      <FormEntidade
        action={salvarProduto} ocultos={{ original: p.codigo }} cancelarHref="/cadastros/produtos"
        campos={[
          { name: "descricao", label: "Descrição", tipo: "texto", obrigatorio: true, valor: p.descricao },
        ]}
      />
      <p className="mt-2 text-xs text-tinta/50">O código ({p.codigo}) é gerado automaticamente e não pode ser alterado.</p>
    </>
  );
}
