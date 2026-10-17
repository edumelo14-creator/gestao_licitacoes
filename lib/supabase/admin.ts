import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Cliente com a service role — usar SOMENTE no servidor, após checar que o usuário é admin. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione-a nas variáveis de ambiente da Vercel."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
