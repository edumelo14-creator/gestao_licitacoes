# Gestão de Licitações

Next.js 15 + Supabase + Vercel. Cadastro de **Empresas → Fornecedores (Prefeituras) → Licitações**, com árvore lateral, login Google ou e-mail/senha e administração de usuários.

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://aqtvorxogkugoouwyecz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave *publishable* (Supabase → Project Settings → API Keys) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave *secret / service_role* — **nunca** expor no cliente; usada só para criar usuários |

## Configuração do login Google (uma vez)

1. Google Cloud Console → APIs e serviços → Credenciais → *Criar ID do cliente OAuth* (Aplicativo da Web).
   - URI de redirecionamento autorizado: `https://aqtvorxogkugoouwyecz.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Sign In / Providers → **Google**: habilitar e colar Client ID e Client Secret.
3. Supabase → Authentication → URL Configuration:
   - Site URL: a URL da Vercel (ex.: `https://gestao-licitacoes.vercel.app`)
   - Redirect URLs: `https://gestao-licitacoes.vercel.app/**` e `http://localhost:3000/**`

## Regras de acesso

- O **primeiro** usuário que entrar vira administrador automaticamente.
- Usuários criados pelo admin (tela **Usuários**) entram liberados, com senha ou com Google no mesmo e-mail.
- Qualquer outra conta Google que entrar fica **aguardando liberação** até o admin ativá-la.
- Todas as tabelas têm RLS: só usuários ativos leem/gravam; só admin altera perfis.

## Desenvolvimento

```bash
cp .env.example .env.local   # preencher as chaves
npm install
npm run dev
```
