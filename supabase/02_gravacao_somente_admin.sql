-- Gestão de Licitações: leitura para usuários ativos; gravação só para administradores.
-- Rodar uma vez no Supabase → SQL Editor.
do $$
declare t text;
begin
  foreach t in array array['empresas','fornecedores','licitacoes'] loop
    execute format('drop policy if exists "usuarios ativos - %s" on public.%I', t, t);
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
