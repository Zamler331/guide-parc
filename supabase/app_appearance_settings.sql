create table if not exists public.app_appearance_settings (
  id text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_appearance_settings_singleton check (id = 'default')
);

alter table public.app_appearance_settings enable row level security;

grant select on public.app_appearance_settings to anon, authenticated;
grant insert, update, delete on public.app_appearance_settings to authenticated;

drop policy if exists "Public can read app appearance settings" on public.app_appearance_settings;
create policy "Public can read app appearance settings"
on public.app_appearance_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage app appearance settings" on public.app_appearance_settings;
create policy "Authenticated users can manage app appearance settings"
on public.app_appearance_settings
for all
to authenticated
using (true)
with check (true);

insert into public.app_appearance_settings (id, settings)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;
