-- Gestão de Licitações: número do lote em cada item da licitação.
alter table public.licitacao_itens add column if not exists lote text;
create index if not exists licitacao_itens_lote_idx on public.licitacao_itens (licitacao_id, lote);
