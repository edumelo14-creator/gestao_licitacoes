"use client";

import { useCallback, useState } from "react";
import Modal from "@/components/Modal";
import FormItem from "@/components/FormItem";
import { paraInput } from "@/lib/numeros";
import type { ItemLinha } from "@/components/TabelaItens";

export default function BotaoEditarItem({ item, licitacaoId }: { item: ItemLinha; licitacaoId: string }) {
  const [aberto, setAberto] = useState(false);
  const fechar = useCallback(() => setAberto(false), []);
  return (
    <>
      <button type="button" className="text-xs text-marca hover:underline" onClick={() => setAberto(true)}>Editar</button>
      <Modal aberto={aberto} onFechar={fechar} titulo={`Editar item ${item.produto_codigo}`}>
        <FormItem
          licitacaoId={licitacaoId} emModal onSucesso={fechar}
          inicial={{
            id: item.id,
            lote: item.lote ?? "",
            produto: { codigo: item.produto_codigo, descricao: item.produtos?.descricao ?? "" },
            quantidade: paraInput(item.quantidade),
            valor_unitario: paraInput(item.valor_unitario),
            valor_total: paraInput(item.valor_total),
            nota_base: item.nota_base ?? "",
            observacao: item.observacao ?? "",
          }}
        />
      </Modal>
    </>
  );
}
