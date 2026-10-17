-- Gestão de Licitações: cadastro global de produtos + itens por licitação.
-- Rodar uma vez no Supabase → SQL Editor.

create table if not exists public.produtos (
  codigo text primary key,
  descricao text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid()
);
create index if not exists produtos_descricao_idx on public.produtos (lower(descricao));
create index if not exists produtos_created_by_idx on public.produtos (created_by);

create table if not exists public.licitacao_itens (
  id uuid primary key default gen_random_uuid(),
  licitacao_id uuid not null references public.licitacoes(id) on delete cascade,
  produto_codigo text not null references public.produtos(codigo) on update cascade on delete restrict,
  quantidade numeric(15,4) not null check (quantidade >= 0),
  valor_unitario numeric(15,4) not null check (valor_unitario >= 0),
  valor_total numeric(15,2) not null check (valor_total >= 0),
  nota_base text,
  observacao text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid()
);
create index if not exists licitacao_itens_licitacao_idx on public.licitacao_itens (licitacao_id);
create index if not exists licitacao_itens_produto_idx on public.licitacao_itens (produto_codigo);
create index if not exists licitacao_itens_created_by_idx on public.licitacao_itens (created_by);

alter table public.produtos enable row level security;
alter table public.licitacao_itens enable row level security;

do $$
declare t text;
begin
  foreach t in array array['produtos','licitacao_itens'] loop
    execute format('drop policy if exists "ativos leem - %s" on public.%I', t, t);
    execute format('drop policy if exists "admin insere - %s" on public.%I', t, t);
    execute format('drop policy if exists "admin altera - %s" on public.%I', t, t);
    execute format('drop policy if exists "admin exclui - %s" on public.%I', t, t);
    execute format('create policy "ativos leem - %s" on public.%I for select to authenticated using ((select private.is_active_user()))', t, t);
    execute format('create policy "admin insere - %s" on public.%I for insert to authenticated with check ((select private.is_admin()))', t, t);
    execute format('create policy "admin altera - %s" on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t, t);
    execute format('create policy "admin exclui - %s" on public.%I for delete to authenticated using ((select private.is_admin()))', t, t);
  end loop;
end $$;
