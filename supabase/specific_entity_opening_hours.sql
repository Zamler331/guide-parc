create table if not exists public.entity_opening_schedules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#14b8a6',
  is_open boolean not null default true,
  opens_at time null,
  closes_at time null,
  description text null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.entity_opening_schedules (
  id,
  name,
  color,
  is_open,
  opens_at,
  closes_at,
  description,
  sort_order,
  is_active
)
select
  os.id,
  os.name || ' (specifique)',
  coalesce(os.color, '#14b8a6'),
  coalesce(os.is_open, true),
  os.opens_at,
  os.closes_at,
  os.description,
  coalesce(os.sort_order, 0),
  coalesce(os.is_active, true)
from public.opening_schedules os
where exists (
  select 1
  from public.entity_opening_rules eor
  where eor.schedule_id = os.id
)
on conflict (id) do nothing;

alter table public.entity_opening_rules
  add column if not exists starts_on date null,
  add column if not exists ends_on date null,
  add column if not exists weekdays integer[] not null default array[0, 1, 2, 3, 4, 5, 6];

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.entity_opening_rules'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like '%opening_schedules%'
  loop
    execute format(
      'alter table public.entity_opening_rules drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.entity_opening_rules'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) like '%target_type%'
      and pg_get_constraintdef(oid) like '%target_id%'
  loop
    execute format(
      'alter table public.entity_opening_rules drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.entity_opening_rules
  drop constraint if exists entity_opening_rules_target_type_check;

alter table public.entity_opening_rules
  add constraint entity_opening_rules_target_type_check
  check (
    target_type in (
      'attraction',
      'map_point',
      'park_area',
      'restaurant',
      'shop'
    )
  );

alter table public.entity_opening_rules
  drop constraint if exists entity_opening_rules_weekdays_check;

alter table public.entity_opening_rules
  add constraint entity_opening_rules_weekdays_check
  check (
    weekdays <@ array[0, 1, 2, 3, 4, 5, 6]
    and cardinality(weekdays) > 0
  );

alter table public.entity_opening_rules
  add constraint entity_opening_rules_schedule_id_fkey
  foreign key (schedule_id)
  references public.entity_opening_schedules(id)
  on delete cascade;

create index if not exists entity_opening_rules_target_lookup_idx
  on public.entity_opening_rules(target_type, target_id, is_active);

create index if not exists entity_opening_rules_date_lookup_idx
  on public.entity_opening_rules(starts_on, ends_on);

alter table public.entity_opening_schedules enable row level security;
alter table public.entity_opening_rules enable row level security;

grant select on public.entity_opening_schedules to anon, authenticated;
grant insert, update, delete on public.entity_opening_schedules to authenticated;
grant select on public.entity_opening_rules to anon, authenticated;
grant insert, update, delete on public.entity_opening_rules to authenticated;

drop policy if exists "Entity opening schedules are readable" on public.entity_opening_schedules;
drop policy if exists "Authenticated users manage entity opening schedules" on public.entity_opening_schedules;

create policy "Entity opening schedules are readable"
on public.entity_opening_schedules
for select
to anon, authenticated
using (true);

create policy "Authenticated users manage entity opening schedules"
on public.entity_opening_schedules
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Entity opening rules are readable" on public.entity_opening_rules;
drop policy if exists "Authenticated users manage entity opening rules" on public.entity_opening_rules;

create policy "Entity opening rules are readable"
on public.entity_opening_rules
for select
to anon, authenticated
using (true);

create policy "Authenticated users manage entity opening rules"
on public.entity_opening_rules
for all
to authenticated
using (true)
with check (true);
