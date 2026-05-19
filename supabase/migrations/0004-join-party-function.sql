begin;

create or replace function public.join_party(p_join_code text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_party_id uuid;
  v_status   text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select id, status
    into v_party_id, v_status
  from public.parties
  where join_code = upper(trim(p_join_code));

  if v_party_id is null then
    raise exception 'Invalid party code' using errcode = 'P0002';
  end if;

  if v_status <> 'active' then
    raise exception 'Party is not active' using errcode = 'P0003';
  end if;

  insert into public.party_guests (party_id, user_id)
  values (v_party_id, auth.uid())
  on conflict do nothing;

  return v_party_id;
end;
$$;

revoke all on function public.join_party(text) from public;
grant execute on function public.join_party(text) to authenticated;

commit;