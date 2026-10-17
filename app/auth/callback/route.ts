import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const erroProvedor = searchParams.get("error_description");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
    console.error("[auth/callback] falha ao abrir sessão:", error.message);
    return NextResponse.redirect(`${origin}/login?erro=${encodeURIComponent(error.message)}`);
  }
  if (erroProvedor) console.error("[auth/callback] erro do provedor:", erroProvedor);
  return NextResponse.redirect(`${origin}/login?erro=${encodeURIComponent(erroProvedor ?? "auth")}`);
}
