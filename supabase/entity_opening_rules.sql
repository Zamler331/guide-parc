create table if not exists public.entity_opening_rules (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (
    target_type in ('attraction', 'map_point', 'park_area')
  ),
  target_id uuid not null,
  schedule_id uuid not null references public.opening_schedules(id),
  note text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (target_type, target_id)
);

alter table public.entity_opening_rules enable row level security;

grant select on table public.entity_opening_rules to anon;
grant select, insert, update, delete on table public.entity_opening_rules to authenticated;

drop policy if exists "Public entity opening rules read" on public.entity_opening_rules;
create policy "Public entity opening rules read"
on public.entity_opening_rules
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated entity opening rules write" on public.entity_opening_rules;
create policy "Authenticated entity opening rules write"
on public.entity_opening_rules
for all
to authenticated
using (true)
with check (true);

create index if not exists entity_opening_rules_target_idx
  on public.entity_opening_rules (target_type, target_id);

create index if not exists entity_opening_rules_schedule_idx
  on public.entity_opening_rules (schedule_id);
