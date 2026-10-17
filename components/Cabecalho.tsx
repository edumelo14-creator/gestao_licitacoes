import Link from "next/link";

export default function Cabecalho({
  trilha = [], titulo, subtitulo, acoes,
}: {
  trilha?: { href: string; label: string }[];
  titulo: string;
  subtitulo?: React.ReactNode;
  acoes?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {trilha.length > 0 && (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-tinta/50">
            {trilha.map((t, i) => (
              <span key={t.href} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <Link href={t.href} className="hover:text-marca">{t.label}</Link>
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{titulo}</h1>
        {subtitulo && <div className="mt-1 text-sm text-tinta/60">{subtitulo}</div>}
      </div>
      {acoes && <div className="flex items-start gap-2">{acoes}</div>}
    </header>
  );
}
