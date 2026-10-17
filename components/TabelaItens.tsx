import Link from "next/link";
import BotaoExcluir from "@/components/BotaoExcluir";
import { excluirItem } from "@/app/(app)/actions-itens";
import { fmtMoeda, fmtQtd, fmtUnit } from "@/lib/numeros";

export type ItemLinha = {
  id: string;
  lote: string | null;
  produto_codigo: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  nota_base: string | null;
  observacao: string | null;
  produtos: { descricao: string } | null;
};

export default function TabelaItens({ itens, licitacaoId, editavel = false, voltar }: { itens: ItemLinha[]; licitacaoId: string; editavel?: boolean; voltar?: string }) {
  if (!itens.length) return <p className="cartao p-6 text-sm text-tinta/60">Nenhum item nesta licitação.</p>;
  const total = itens.reduce((s, i) => s + Number(i.valor_total), 0);
  return (
    <div className="cartao overflow-x-auto">
      <table className="tabela">
        <thead>
          <tr>
            <th className="w-10">#</th><th>Lote</th><th>Código</th><th>Descrição</th>
            <th className="text-right">Qtd.</th><th className="text-right">Unitário</th><th className="text-right">Total</th>
            <th>Nota base</th><th>Observação</th>{editavel && <th />}
          </tr>
        </thead>
        <tbody>
          {itens.map((i, n) => (
            <tr key={i.id} className="hover:bg-papel/60">
              <td className="font-mono text-tinta/40">{n + 1}</td>
              <td className="font-mono">{i.lote}</td>
              <td className="font-mono">{i.produto_codigo}</td>
              <td>{i.produtos?.descricao}</td>
              <td className="text-right font-mono">{fmtQtd(i.quantidade)}</td>
              <td className="text-right font-mono">{fmtUnit(i.valor_unitario)}</td>
              <td className="text-right font-mono">{fmtMoeda(i.valor_total)}</td>
              <td className="font-mono">{i.nota_base}</td>
              <td className="max-w-[16rem] truncate text-tinta/70" title={i.observacao ?? ""}>{i.observacao}</td>
              {editavel && (
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/cadastros/licitacoes/${licitacaoId}/itens/${i.id}${voltar ? `?voltar=${encodeURIComponent(voltar)}` : ""}`} className="text-xs text-marca hover:underline">Editar</Link>
                    <BotaoExcluir action={excluirItem} ocultos={{ id: i.id, licitacao_id: licitacaoId }} mensagem={`Excluir o item ${i.produto_codigo}?`} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-papel/60 font-medium">
            <td colSpan={6} className="px-4 py-2.5 text-right text-xs uppercase tracking-wide text-tinta/60">{itens.length} item(ns) — Total</td>
            <td className="px-4 py-2.5 text-right font-mono">{fmtMoeda(total)}</td>
            <td colSpan={editavel ? 3 : 2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
