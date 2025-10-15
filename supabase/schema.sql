-- Supabase schema para AutoTrack
-- Executar em: Supabase SQL editor

-- Extensões necessárias
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type user_type_enum as enum ('basic','advanced','pro','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type expense_type_enum as enum ('fuel','ticket','maintenance','insurance','ipva','licensing','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type group_role_enum as enum ('owner','member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type company_type_enum as enum ('workshop','dealership');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_type_enum as enum ('flat_tire','mechanical_problem','accident','breakdown','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status_enum as enum ('pending','confirmed','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transfer_status_enum as enum ('pending','accepted','rejected');
exception when duplicate_object then null; end $$;

-- Utilitário para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela de perfis (espelha dados de auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  user_type user_type_enum not null default 'basic',
  avatar text,
  phone text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles(email);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Trigger: cria profile ao registrar novo usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id,
          coalesce((new.raw_user_meta_data ->> 'name'), ''),
          new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Veículos
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  plate text not null unique,
  model text not null,
  year integer not null check (year between 1900 and 2100),
  color text not null,
  renavam text not null,
  photo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vehicles_owner_idx on public.vehicles(owner_id);
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute procedure public.set_updated_at();

-- Despesas
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type expense_type_enum not null,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  date date not null,
  location text,
  receipt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists expenses_vehicle_idx on public.expenses(vehicle_id);
create index if not exists expenses_date_idx on public.expenses(date);
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

-- Grupos
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists groups_owner_idx on public.groups(owner_id);
create trigger groups_set_updated_at
  before update on public.groups
  for each row execute procedure public.set_updated_at();

-- Membros do grupo
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  role group_role_enum not null default 'member',
  joined_at timestamptz not null default now(),
  unique (user_id, group_id)
);
create index if not exists group_members_group_idx on public.group_members(group_id);
create index if not exists group_members_user_idx on public.group_members(user_id);

-- Veículos em grupos (many-to-many)
create table if not exists public.group_vehicles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  unique (group_id, vehicle_id)
);
create index if not exists group_vehicles_group_idx on public.group_vehicles(group_id);
create index if not exists group_vehicles_vehicle_idx on public.group_vehicles(vehicle_id);

-- Empresas (oficinas/concessionárias)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type company_type_enum not null,
  description text not null,
  logo text,
  phone text not null,
  email text not null,
  street text not null,
  number text not null,
  neighborhood text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  latitude double precision not null,
  longitude double precision not null,
  services text[] not null default '{}',
  rating numeric(3,1) not null default 0 check (rating >= 0 and rating <= 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists companies_type_idx on public.companies(type);
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute procedure public.set_updated_at();

-- Agendamentos
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null,
  time text not null,
  service text not null,
  description text not null,
  status appointment_status_enum not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_user_idx on public.appointments(user_id);
create index if not exists appointments_company_idx on public.appointments(company_id);
create index if not exists appointments_vehicle_idx on public.appointments(vehicle_id);
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

-- Alertas de emergência
create table if not exists public.emergency_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type alert_type_enum not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  is_active boolean not null default true,
  sent_to uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists emergency_alerts_user_idx on public.emergency_alerts(user_id);
create index if not exists emergency_alerts_vehicle_idx on public.emergency_alerts(vehicle_id);
create index if not exists emergency_alerts_active_idx on public.emergency_alerts(is_active);

-- Transferências de veículo
create table if not exists public.vehicle_transfers (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status transfer_status_enum not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists vehicle_transfers_vehicle_idx on public.vehicle_transfers(vehicle_id);
create index if not exists vehicle_transfers_from_idx on public.vehicle_transfers(from_user_id);
create index if not exists vehicle_transfers_to_idx on public.vehicle_transfers(to_user_id);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.expenses enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_vehicles enable row level security;
alter table public.companies enable row level security;
alter table public.appointments enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.vehicle_transfers enable row level security;

-- Policies
-- Profiles: usuário só vê/edita seu próprio perfil
create policy if not exists "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy if not exists "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Vehicles: proprietário acessa seus veículos
create policy if not exists "Vehicles: read own" on public.vehicles
  for select using (owner_id = auth.uid());
create policy if not exists "Vehicles: insert own" on public.vehicles
  for insert with check (owner_id = auth.uid());
create policy if not exists "Vehicles: update own" on public.vehicles
  for update using (owner_id = auth.uid());
create policy if not exists "Vehicles: delete own" on public.vehicles
  for delete using (owner_id = auth.uid());

-- Expenses: usuário acessa despesas de seus veículos
create policy if not exists "Expenses: read own" on public.expenses
  for select using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy if not exists "Expenses: insert own" on public.expenses
  for insert with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy if not exists "Expenses: update own" on public.expenses
  for update using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));
create policy if not exists "Expenses: delete own" on public.expenses
  for delete using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

-- Groups: membros ou owner acessam
create policy if not exists "Groups: read membership" on public.groups
  for select using (exists (select 1 from public.group_members gm where gm.group_id = id and gm.user_id = auth.uid()));
create policy if not exists "Groups: manage owner" on public.groups
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Group members
create policy if not exists "GroupMembers: read membership" on public.group_members
  for select using (user_id = auth.uid() or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));
create policy if not exists "GroupMembers: modify owner" on public.group_members
  for all using (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));

-- Group vehicles
create policy if not exists "GroupVehicles: read membership" on public.group_vehicles
  for select using (exists (select 1 from public.group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
create policy if not exists "GroupVehicles: modify owner" on public.group_vehicles
  for all using (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));

-- Companies: leitura pública (autenticados), modificação restrita (ex.: por admin/service role)
create policy if not exists "Companies: read any" on public.companies
  for select using (true);

-- Appointments: usuário acessa seus agendamentos
create policy if not exists "Appointments: read own" on public.appointments
  for select using (user_id = auth.uid());
create policy if not exists "Appointments: modify own" on public.appointments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Emergency alerts: usuário acessa seus alertas
create policy if not exists "Alerts: read own" on public.emergency_alerts
  for select using (user_id = auth.uid());
create policy if not exists "Alerts: modify own" on public.emergency_alerts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Vehicle transfers: envolvidos acessam
create policy if not exists "Transfers: read involved" on public.vehicle_transfers
  for select using (from_user_id = auth.uid() or to_user_id = auth.uid());
create policy if not exists "Transfers: modify involved" on public.vehicle_transfers
  for all using (from_user_id = auth.uid() or to_user_id = auth.uid())
  with check (from_user_id = auth.uid() or to_user_id = auth.uid());

-- Fim do schema