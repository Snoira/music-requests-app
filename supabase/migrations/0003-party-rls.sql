begin;

-- ============================================================
-- Helpers: privileged checks that bypass RLS to break recursion.
-- ============================================================

create or replace function public.is_party_host(p_party_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.parties 
    where id = p_party_id
      and host_id = auth.uid()
  );
$$;

create or replace function public.is_party_guest(p_party_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.party_guests
    where party_id = p_party_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_active_party_guest(p_party_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.party_guests pg
    join public.parties p on p.id = pg.party_id
    where pg.party_id = p_party_id
      and pg.user_id = auth.uid()
      and p.status = 'active'
  );
$$;

revoke all on function public.is_party_host(uuid)         from public;
revoke all on function public.is_party_guest(uuid)        from public;
revoke all on function public.is_active_party_guest(uuid) from public;
grant execute on function public.is_party_host(uuid)         to authenticated;
grant execute on function public.is_party_guest(uuid)        to authenticated;
grant execute on function public.is_active_party_guest(uuid) to authenticated;

-- ============================================================
-- parties
-- ============================================================

create policy "Hosts manage their parties"
  on public.parties
  for all
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "Guests read their parties"
  on public.parties
  for select
  to authenticated
  using (is_party_guest(id));

-- ============================================================
-- party_guests
-- ============================================================

create policy "Users see own memberships"
  on public.party_guests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Hosts see guests of their parties"
  on public.party_guests
  for select
  to authenticated
  using (is_party_host(party_id));

-- There are deliberately INSERT/UPDATE/DELETE policies — joining is via the
-- join_party() security-definer function only.

-- ============================================================
-- requests
-- ============================================================

create policy "Party participants read requests"
  on public.requests
  for select
  to authenticated
  using (is_party_guest(party_id) or is_party_host(party_id));

create policy "Guests submit requests in active parties"
  on public.requests
  for insert
  to authenticated
  with check (
    guest_id = auth.uid()
    and is_active_party_guest(party_id)
  );

create policy "Hosts update requests in their parties"
  on public.requests
  for update
  to authenticated
  using (is_party_host(party_id))
  with check (is_party_host(party_id));

commit;