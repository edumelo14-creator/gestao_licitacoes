"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import BuscaProduto from "@/components/BuscaProduto";
import { salvarItem, type Estado } from "@/app/(app)/actions-itens";
import { arred2, parseNumero } from "@/lib/numeros";

type Inicial = {
  id: string;
  lote: string;
  produto: { codigo: string; descricao: string } | null;
  quantidade: string;
  valor_unitario: string;
  valor_total: string;
  nota_base: string;
  observacao: string;
};

const totalCalc = (q: string, u: string) => {
  const n = arred2(parseNumero(q) * parseNumero(u));
  return Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "";
};

export default function FormItem({
  licitacaoId, inicial, cancelarHref, emModal = false, onSucesso,
}: { licitacaoId: string; inicial?: Inicial; cancelarHref?: string; emModal?: boolean; onSucesso?: () => void }) {
  const [estado, enviar, pendente] = useActionState<Estado, FormData>(salvarItem, {});
  const ref = useRef<HTMLFormElement>(null);
  const [qtd, setQtd] = useState(inicial?.quantidade ?? "");
  const [unit, setUnit] = useState(inicial?.valor_unitario ?? "");
  const [total, setTotal] = useState(inicial?.valor_total ?? "");
  const [totalManual, setTotalManual] = useState(!!inicial);
  const [reset, setReset] = useState(0);

  useEffect(() => { if (!totalManual) setTotal(totalCalc(qtd, unit)); }, [qtd, unit, totalManual]);
  useEffect(() => {
    if (estado.ok && onSucesso) { onSucesso(); return; }
    if (estado.ok && !inicial) {
      ref.current?.reset(); setQtd(""); setUnit(""); setTotal(""); setTotalManual(false); setReset((r) => r + 1);
    }
  }, [estado, inicial, onSucesso]);

  return (
    <form ref={ref} action={enviar} className={emModal ? "" : "cartao p-5"}>
      <input type="hidden" name="licitacao_id" value={licitacaoId} />
      {inicial && <input type="hidden" name="id" value={inicial.id} />}
      {emModal && <input type="hidden" name="modal" value="1" />}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="md:col-span-1">
          <label className="rotulo" htmlFor="lote">Lote</label>
          <input id="lote" name="lote" className="campo font-mono" defaultValue={inicial?.lote} />
        </div>
        <div className="md:col-span-5">
          <label className="rotulo">Produto <span className="text-alerta">*</span></label>
          <BuscaProduto inicial={inicial?.produto} chaveReset={reset} />
        </div>
        <div className="md:col-span-2">
          <label className="rotulo" htmlFor="quantidade">Quantidade <span className="text-alerta">*</span></label>
          <input id="quantidade" name="quantidade" inputMode="decimal" required className="campo text-right font-mono" value={qtd} onChange={(e) => setQtd(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="rotulo" htmlFor="valor_unitario">Valor unitário (R$) <span className="text-alerta">*</span></label>
          <input id="valor_unitario" name="valor_unitario" inputMode="decimal" required className="campo text-right font-mono" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="rotulo" htmlFor="valor_total">
            Valor total (R$)
            {totalManual && (
              <button type="button" className="ml-2 normal-case text-marca hover:underline" onClick={() => setTotalManual(false)}>recalcular</button>
            )}
          </label>
          <input
            id="valor_total" name="valor_total" inputMode="decimal" className="campo text-right font-mono" value={total}
            onChange={(e) => { setTotal(e.target.value); setTotalManual(true); }}
          />
        </div>
        <div className="md:col-span-2">
          <label className="rotulo" htmlFor="nota_base">Nº da nota base</label>
          <input id="nota_base" name="nota_base" className="campo font-mono" defaultValue={inicial?.nota_base} />
        </div>
        <div className="md:col-span-4">
          <label className="rotulo" htmlFor="observacao">Observação</label>
          <input id="observacao" name="observacao" className="campo" defaultValue={inicial?.observacao} />
        </div>
      </div>
      {estado.erro && <p className="mt-4 rounded-md bg-alerta/5 px-3 py-2 text-sm text-alerta">{estado.erro}</p>}
      {estado.ok && <p className="mt-4 rounded-md bg-marca-clara px-3 py-2 text-sm text-marca-escura">{estado.ok}</p>}
      <div className="mt-5 flex gap-2">
        <button className="btn-primario" disabled={pendente}>{pendente ? "Salvando…" : inicial ? "Salvar item" : "Incluir item"}</button>
        {cancelarHref && <a href={cancelarHref} className="btn-secundario">Cancelar</a>}
        {emModal && onSucesso && <button type="button" className="btn-secundario" onClick={onSucesso}>Cancelar</button>}
      </div>
    </form>
  );
}
