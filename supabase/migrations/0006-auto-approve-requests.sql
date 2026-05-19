begin;

-- Per-party setting: when true, new requests skip the 'pending' state.
alter table public.parties
  add column auto_approve boolean not null default false;

-- Trigger function: rewrites status on insert if the party has auto_approve on.
create or replace function public.auto_approve_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auto_approve boolean;
begin
  select auto_approve into v_auto_approve
  from public.parties
  where id = new.party_id;

  if v_auto_approve then
    new.status := 'approved';
  end if;

  return new;
end;
$$;

create trigger requests_auto_approve
  before insert on public.requests
  for each row execute function public.auto_approve_request();

commit;