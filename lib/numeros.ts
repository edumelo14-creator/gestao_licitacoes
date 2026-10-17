/** Converte "1.234,56", "1234.56", "R$ 10,00" ou número em number. Retorna NaN se inválido. */
export function parseNumero(v: unknown): number {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return NaN;
  let s = String(v).trim().replace(/R\$|\s/g, "");
  if (!s) return NaN;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // "1.000" = mil (padrão BR)
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 });
const unit = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export const fmtMoeda = (n: number | string | null | undefined) => moeda.format(Number(n ?? 0));
export const fmtQtd = (n: number | string | null | undefined) => decimal.format(Number(n ?? 0));
export const fmtUnit = (n: number | string | null | undefined) => "R$ " + unit.format(Number(n ?? 0));
/** Para preencher inputs: 1234.5 → "1234,5" */
export const paraInput = (n: number | string | null | undefined) =>
  n === null || n === undefined || n === "" ? "" : String(n).replace(".", ",");
export const arred2 = (n: number) => Math.round(n * 100) / 100;
