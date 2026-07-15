-- Admin system: separate admins table (never reachable via public signup),
-- subscription packages, and the two new user-facing columns admin
-- management needs (blocked status, assigned package).

create table if not exists subscription_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Free-form, not a hard enum -- specifics/tiers still being decided.
  -- Convention so far: 'free' | 'advanced'.
  tier text not null default 'free',
  price_cents integer not null default 0,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('master_admin', 'admin')),
  created_by uuid references admins(id),
  created_at timestamptz not null default now()
);

alter table users
  add column if not exists blocked boolean not null default false,
  add column if not exists subscription_package_id uuid references subscription_packages(id);
