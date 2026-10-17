"use client";

import { useCallback, useState } from "react";
import Modal from "@/components/Modal";
import FormItem from "@/components/FormItem";
import Importador from "@/components/Importador";

/** Botões "Incluir item" e "Importar planilha" — cada um abre um modal. */
export default function ItensAcoes({ licitacaoId }: { licitacaoId: string }) {
  const [modal, setModal] = useState<"incluir" | "importar" | null>(null);
  const fechar = useCallback(() => setModal(null), []);
  return (
    <>
      <div className="flex gap-2">
        <button type="button" className="btn-primario" onClick={() => setModal("incluir")}>+ Incluir item</button>
        <button type="button" className="btn-secundario" onClick={() => setModal("importar")}>Importar planilha</button>
      </div>
      <Modal aberto={modal === "incluir"} onFechar={fechar} titulo="Incluir item">
        <FormItem licitacaoId={licitacaoId} emModal onSucesso={fechar} />
      </Modal>
      <Modal aberto={modal === "importar"} onFechar={fechar} titulo="Importar itens" largura="max-w-5xl">
        <Importador modo="itens" licitacaoId={licitacaoId} embutido />
      </Modal>
    </>
  );
}
