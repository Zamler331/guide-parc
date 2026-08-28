create extension if not exists pgcrypto;

create table if not exists public.app_visual_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz null,
  constraint app_visual_profiles_status_check
    check (status in ('draft', 'published', 'archived'))
);

create unique index if not exists app_visual_profiles_one_published
on public.app_visual_profiles (status)
where status = 'published';

alter table public.app_visual_profiles enable row level security;

grant select on public.app_visual_profiles to anon, authenticated;
grant insert, update, delete on public.app_visual_profiles to authenticated;

drop policy if exists "Public can read published visual profile" on public.app_visual_profiles;
create policy "Public can read published visual profile"
on public.app_visual_profiles
for select
to anon, authenticated
using (status = 'published' or auth.uid() is not null);

drop policy if exists "Authenticated users can manage visual profiles" on public.app_visual_profiles;
create policy "Authenticated users can manage visual profiles"
on public.app_visual_profiles
for all
to authenticated
using (true)
with check (true);

insert into public.app_visual_profiles (name, status, settings, published_at)
select 'Style par defaut', 'published', '{}'::jsonb, now()
where not exists (
  select 1 from public.app_visual_profiles where status = 'published'
);
