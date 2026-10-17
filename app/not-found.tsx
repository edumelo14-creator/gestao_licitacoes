import Link from "next/link";
export default function NaoEncontrado() {
  return (
    <main className="flex min-h-full items-center justify-center p-6 text-center">
      <div><h1 className="text-xl font-semibold">Registro não encontrado</h1><Link href="/" className="mt-3 inline-block text-marca hover:underline">Voltar ao início</Link></div>
    </main>
  );
}
