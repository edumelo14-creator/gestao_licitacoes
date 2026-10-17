import Cabecalho from "@/components/Cabecalho";
import FormEntidade from "@/components/FormEntidade";
import { salvarEmpresa } from "../../actions";

export default function NovaEmpresa() {
  return (
    <>
      <Cabecalho trilha={[{ href: "/empresas", label: "Empresas" }]} titulo="Nova empresa" />
      <FormEntidade
        action={salvarEmpresa} cancelarHref="/empresas"
        campos={[
          { name: "nome", label: "Nome / Razão social", tipo: "texto", obrigatorio: true },
          { name: "cnpj", label: "CNPJ", tipo: "cnpj", obrigatorio: true, largura: "metade" },
          { name: "endereco", label: "Endereço", tipo: "textarea" },
        ]}
      />
    </>
  );
}
