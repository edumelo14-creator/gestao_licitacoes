-- Gestão de Licitações: código de produto incremental automático.
-- Ao inserir um produto sem código, o banco usa (maior código numérico + 1).
-- Códigos informados explicitamente (ex.: importação) continuam aceitos.
create or replace function private.produtos_codigo_auto()
returns trigger
language plpgsql
set search_path = ''
as $$
declare proximo bigint;
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    perform pg_advisory_xact_lock(hashtext('public.produtos.codigo'));
    select coalesce(max(codigo::bigint), 0) + 1
      into proximo
      from public.produtos
     where codigo ~ '^[0-9]{1,18}$';
    new.codigo := proximo::text;
  end if;
  return new;
end $$;

drop trigger if exists produtos_codigo_auto on public.produtos;
create trigger produtos_codigo_auto
before insert on public.produtos
for each row execute function private.produtos_codigo_auto();
