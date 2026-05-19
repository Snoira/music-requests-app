begin;

-- parties
create table public.parties (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  join_code   text not null unique
                check (join_code = upper(join_code))
                check (char_length(join_code) between 4 and 10),
  status      text not null default 'active'
                check (status in ('active', 'ended')),
  created_at  timestamptz not null default now()
);
create index on public.parties (host_id);

-- party_guests
create table public.party_guests (
  party_id    uuid not null references public.parties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (party_id, user_id)
);
create index on public.party_guests (user_id);

-- requests
create table public.requests (
  id            uuid primary key default gen_random_uuid(),
  party_id      uuid not null references public.parties(id) on delete cascade,
  guest_id      uuid not null references auth.users(id) on delete cascade,
  track_id      text not null,
  track_name    text not null,
  artist_name   text not null,
  album_art_url text,
  duration_ms   integer,
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.requests (party_id, created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- Enable RLS on all party tables (no policies yet = sealed)
alter table public.parties      enable row level security;
alter table public.party_guests enable row level security;
alter table public.requests     enable row level security;

commit;
