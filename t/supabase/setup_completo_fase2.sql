-- Yoga Team - configuracion completa de base de datos y Storage (fase 2)
--
-- Esta consulta es idempotente: se puede ejecutar aunque schema.sql ya se
-- hubiera ejecutado anteriormente.
--
-- IMPORTANTE PARA PRODUCCION:
-- Las politicas marcadas como DEMO permiten escrituras con la clave anonima
-- porque la web todavia no usa Supabase Auth. Esto sirve para probar la subida
-- desde la web estatica, pero no protege el panel frente a un usuario tecnico.
-- Cuando se active Supabase Auth deben sustituirse por politicas basadas en
-- auth.uid() y el bucket lesson-media debe pasar a privado.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Usuarios
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  password_hash text,
  role text not null default 'user',
  is_premium boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive',
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists password_hash text;
alter table public.users add column if not exists role text default 'user';
alter table public.users add column if not exists is_premium boolean default false;
alter table public.users add column if not exists stripe_customer_id text;
alter table public.users add column if not exists stripe_subscription_id text;
alter table public.users add column if not exists subscription_status text default 'inactive';
alter table public.users add column if not exists premium_until timestamptz;
alter table public.users add column if not exists created_at timestamptz default now();
alter table public.users add column if not exists updated_at timestamptz default now();
alter table public.users add column if not exists last_login_at timestamptz;

update public.users set role = 'user' where role is null;
update public.users set is_premium = false where is_premium is null;
update public.users set subscription_status = 'inactive' where subscription_status is null;

alter table public.users alter column role set default 'user';
alter table public.users alter column role set not null;
alter table public.users alter column is_premium set default false;
alter table public.users alter column is_premium set not null;
alter table public.users alter column subscription_status set default 'inactive';
alter table public.users alter column subscription_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_role_valid'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_valid check (role in ('user', 'teacher', 'admin'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'users_subscription_status_valid'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_subscription_status_valid
      check (subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Lecciones y configuracion comercial
-- ---------------------------------------------------------------------------

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  body text,
  is_premium boolean not null default false,
  price_individual numeric(10,2) not null default 0,
  preview_enabled boolean not null default false,
  preview_duration_seconds integer not null default 0,
  level text,
  duration text,
  duration_seconds integer,
  category text,
  thumbnail_url text,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null
);

alter table public.lessons add column if not exists price_individual numeric(10,2) default 0;
alter table public.lessons add column if not exists preview_enabled boolean default false;
alter table public.lessons add column if not exists preview_duration_seconds integer default 0;
alter table public.lessons add column if not exists duration_seconds integer;
alter table public.lessons add column if not exists thumbnail_url text;
alter table public.lessons add column if not exists is_published boolean default true;

update public.lessons set price_individual = 0 where price_individual is null;
update public.lessons set preview_enabled = false where preview_enabled is null;
update public.lessons set preview_duration_seconds = 0 where preview_duration_seconds is null;
update public.lessons set is_published = true where is_published is null;

alter table public.lessons alter column price_individual set default 0;
alter table public.lessons alter column price_individual set not null;
alter table public.lessons alter column preview_enabled set default false;
alter table public.lessons alter column preview_enabled set not null;
alter table public.lessons alter column preview_duration_seconds set default 0;
alter table public.lessons alter column preview_duration_seconds set not null;
alter table public.lessons alter column is_published set default true;
alter table public.lessons alter column is_published set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_price_nonnegative'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_price_nonnegative check (price_individual >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_preview_duration_nonnegative'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_preview_duration_nonnegative
      check (preview_duration_seconds >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_duration_nonnegative'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_duration_nonnegative
      check (duration_seconds is null or duration_seconds >= 0);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Archivos multimedia
-- ---------------------------------------------------------------------------

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text,
  type text not null check (type in ('video', 'image', 'audio', 'document')),
  url text not null,
  storage_bucket text not null default 'lesson-media',
  storage_path text,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  duration_seconds integer,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.media add column if not exists storage_bucket text default 'lesson-media';
alter table public.media add column if not exists storage_path text;
alter table public.media add column if not exists file_name text;
alter table public.media add column if not exists mime_type text;
alter table public.media add column if not exists file_size_bytes bigint;
alter table public.media add column if not exists duration_seconds integer;
alter table public.media add column if not exists metadata jsonb default '{}'::jsonb;

update public.media set storage_bucket = 'lesson-media' where storage_bucket is null;
update public.media set metadata = '{}'::jsonb where metadata is null;

alter table public.media alter column storage_bucket set default 'lesson-media';
alter table public.media alter column storage_bucket set not null;
alter table public.media alter column metadata set default '{}'::jsonb;
alter table public.media alter column metadata set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'media_file_size_nonnegative'
      and conrelid = 'public.media'::regclass
  ) then
    alter table public.media
      add constraint media_file_size_nonnegative
      check (file_size_bytes is null or file_size_bytes >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'media_duration_nonnegative'
      and conrelid = 'public.media'::regclass
  ) then
    alter table public.media
      add constraint media_duration_nonnegative
      check (duration_seconds is null or duration_seconds >= 0);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Compras individuales
-- Se deja cerrada para anon hasta usar Supabase Auth y Stripe en el servidor.
-- ---------------------------------------------------------------------------

create table if not exists public.lesson_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  status text not null default 'pending',
  stripe_payment_intent_id text unique,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lesson_purchases_amount_nonnegative'
      and conrelid = 'public.lesson_purchases'::regclass
  ) then
    alter table public.lesson_purchases
      add constraint lesson_purchases_amount_nonnegative check (amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'lesson_purchases_status_valid'
      and conrelid = 'public.lesson_purchases'::regclass
  ) then
    alter table public.lesson_purchases
      add constraint lesson_purchases_status_valid
      check (status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Promociones y registro de accesos
-- ---------------------------------------------------------------------------

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,
  image_url text,
  link_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_id uuid references public.users(id) on delete set null
);

create table if not exists public.lesson_access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  accessed_at timestamptz not null default now(),
  access_type text not null check (access_type in ('view', 'preview', 'download'))
);

-- ---------------------------------------------------------------------------
-- 6. Indices y fechas de modificacion
-- ---------------------------------------------------------------------------

create index if not exists lessons_published_category_idx
  on public.lessons (is_published, category, published_at desc);
create index if not exists lessons_premium_idx
  on public.lessons (is_premium);
create index if not exists media_lesson_position_idx
  on public.media (lesson_id, position);
create index if not exists purchases_user_status_idx
  on public.lesson_purchases (user_id, status);
create index if not exists purchases_lesson_status_idx
  on public.lesson_purchases (lesson_id, status);
create index if not exists access_logs_user_lesson_idx
  on public.lesson_access_logs (user_id, lesson_id, accessed_at desc);

create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
before update on public.users
for each row execute function public.update_timestamp();

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at
before update on public.lessons
for each row execute function public.update_timestamp();

drop trigger if exists promotions_updated_at on public.promotions;
create trigger promotions_updated_at
before update on public.promotions
for each row execute function public.update_timestamp();

-- ---------------------------------------------------------------------------
-- 7. Bucket publico para las pruebas actuales
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('lesson-media', 'lesson-media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- ---------------------------------------------------------------------------
-- 8. Permisos y RLS temporales de la demo
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, insert, update on public.users to anon, authenticated;
grant select, insert, update, delete on public.lessons to anon, authenticated;
grant select, insert, update, delete on public.media to anon, authenticated;
grant select on public.promotions to anon, authenticated;
grant insert on public.lesson_access_logs to anon, authenticated;

-- Las compras no se exponen al navegador hasta conectar Auth + Stripe.
revoke all on public.lesson_purchases from anon;
grant select, insert, update on public.lesson_purchases to authenticated;

alter table public.users enable row level security;
alter table public.lessons enable row level security;
alter table public.media enable row level security;
alter table public.promotions enable row level security;
alter table public.lesson_access_logs enable row level security;
alter table public.lesson_purchases enable row level security;

-- DEMO: el login actual consulta y actualiza public.users con la clave anonima.
drop policy if exists demo_users_read on public.users;
create policy demo_users_read
on public.users for select
to anon, authenticated
using (true);

drop policy if exists demo_users_insert on public.users;
create policy demo_users_insert
on public.users for insert
to anon, authenticated
with check (true);

drop policy if exists demo_users_update on public.users;
create policy demo_users_update
on public.users for update
to anon, authenticated
using (true)
with check (true);

-- DEMO: lectura y gestion de contenidos desde la web estatica.
drop policy if exists demo_lessons_read on public.lessons;
create policy demo_lessons_read
on public.lessons for select
to anon, authenticated
using (true);

drop policy if exists demo_lessons_insert on public.lessons;
create policy demo_lessons_insert
on public.lessons for insert
to anon, authenticated
with check (true);

drop policy if exists demo_lessons_update on public.lessons;
create policy demo_lessons_update
on public.lessons for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists demo_lessons_delete on public.lessons;
create policy demo_lessons_delete
on public.lessons for delete
to anon, authenticated
using (true);

drop policy if exists demo_media_read on public.media;
create policy demo_media_read
on public.media for select
to anon, authenticated
using (true);

drop policy if exists demo_media_insert on public.media;
create policy demo_media_insert
on public.media for insert
to anon, authenticated
with check (true);

drop policy if exists demo_media_update on public.media;
create policy demo_media_update
on public.media for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists demo_media_delete on public.media;
create policy demo_media_delete
on public.media for delete
to anon, authenticated
using (true);

drop policy if exists public_promotions_read on public.promotions;
create policy public_promotions_read
on public.promotions for select
to anon, authenticated
using (published_at is not null and published_at <= now());

drop policy if exists demo_access_logs_insert on public.lesson_access_logs;
create policy demo_access_logs_insert
on public.lesson_access_logs for insert
to anon, authenticated
with check (true);

-- Storage: lectura y escritura publica SOLO durante las pruebas sin Auth.
drop policy if exists lesson_media_public_read on storage.objects;
create policy lesson_media_public_read
on storage.objects for select
to public
using (bucket_id = 'lesson-media');

drop policy if exists lesson_media_demo_insert on storage.objects;
create policy lesson_media_demo_insert
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'lesson-media');

drop policy if exists lesson_media_demo_update on storage.objects;
create policy lesson_media_demo_update
on storage.objects for update
to anon, authenticated
using (bucket_id = 'lesson-media')
with check (bucket_id = 'lesson-media');

drop policy if exists lesson_media_demo_delete on storage.objects;
create policy lesson_media_demo_delete
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'lesson-media');

commit;

-- Comprobacion opcional despues de ejecutar:
-- select column_name, data_type from information_schema.columns
-- where table_schema = 'public' and table_name in ('lessons', 'media', 'lesson_purchases')
-- order by table_name, ordinal_position;
--
-- select id, name, public from storage.buckets where id = 'lesson-media';
