begin;

create table public.spotify_credentials (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  access_token   text        not null,
  refresh_token  text        not null,
  expires_at     timestamptz not null,
  scope          text        not null,
  updated_at     timestamptz not null default now()
);

alter table public.spotify_credentials enable row level security;

commit;
