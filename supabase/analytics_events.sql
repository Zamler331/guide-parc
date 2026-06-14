create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  device_id text not null,
  page text null,
  entity_type text null,
  entity_id text null,
  metadata jsonb null,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from anon, authenticated;
grant insert on table public.analytics_events to anon, authenticated;
grant select on table public.analytics_events to authenticated;

drop policy if exists "Public analytics insert" on public.analytics_events;
create policy "Public analytics insert"
on public.analytics_events
for insert
to anon, authenticated
with check (
  event_name in (
    'app_opened',
    'pwa_installed',
    'page_view',
    'map_opened',
    'attraction_opened',
    'show_schedule_opened',
    'info_opened',
    'alert_seen',
    'install_button_clicked'
  )
);

drop policy if exists "Authenticated analytics read" on public.analytics_events;
create policy "Authenticated analytics read"
on public.analytics_events
for select
to authenticated
using (true);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name);

create index if not exists analytics_events_device_id_idx
  on public.analytics_events (device_id);
