import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import { salvarProduto } from "@/app/(app)/actions-itens";

export default function NovoProduto() {
  return (
    <>
      <Cabecalho trilha={[{ href: "/cadastros", label: "Cadastros" }, { href: "/cadastros/produtos", label: "Produtos" }]} titulo="Novo produto" />
      <FormEntidade
        action={salvarProduto} cancelarHref="/cadastros/produtos"
        campos={[
          { name: "codigo", label: "Código", tipo: "texto", obrigatorio: true, largura: "metade" },
          { name: "descricao", label: "Descrição", tipo: "texto", obrigatorio: true },
        ]}
      />
    </>
  );
}
