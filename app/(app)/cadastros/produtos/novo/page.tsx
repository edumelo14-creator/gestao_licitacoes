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
          { name: "descricao", label: "Descrição", tipo: "texto", obrigatorio: true },
        ]}
      />
      <p className="mt-2 text-xs text-tinta/50">O código é gerado automaticamente, em sequência.</p>
    </>
  );
}
