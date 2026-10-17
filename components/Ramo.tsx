import Link from "next/link";

/** Visualização somente leitura de um ramo da árvore: caminho + nome. */
export default function Ramo({
  tipo, nome, caminho = [],
}: {
  tipo: string;
  nome: React.ReactNode;
  caminho?: { href: string; label: string }[];
}) {
  return (
    <div className="pt-6">
      {caminho.length > 0 && (
        <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-tinta/50">
          {caminho.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              <Link href={c.href} className="hover:text-marca">{c.label}</Link>
            </span>
          ))}
        </nav>
      )}
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-marca">{tipo}</div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{nome}</h1>
    </div>
  );
}
