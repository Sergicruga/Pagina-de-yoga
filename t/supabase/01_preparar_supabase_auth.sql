-- Paso 1: preparar Supabase Auth sin interrumpir la web actual.
-- Ejecutar antes de desplegar el codigo que usa Supabase Auth.

begin;

alter table public.users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create table if not exists public.lesson_secrets (
  lesson_id uuid primary key references public.lessons(id) on delete cascade,
  live_url text,
  content_body text,
  updated_at timestamptz not null default now()
);

alter table public.lesson_secrets
  add column if not exists content_body text;

insert into public.lesson_secrets (lesson_id, live_url, content_body)
select id,
       live_url,
       case when is_premium then body else null end
from public.lessons
where (live_url is not null and live_url <> '')
   or (is_premium and body is not null and body <> '')
on conflict (lesson_id) do update
set live_url = coalesce(excluded.live_url, lesson_secrets.live_url),
    content_body = coalesce(excluded.content_body, lesson_secrets.content_body),
    updated_at = now();

alter table public.lesson_secrets enable row level security;
drop policy if exists demo_lesson_secrets_all on public.lesson_secrets;
create policy demo_lesson_secrets_all on public.lesson_secrets for all to anon, authenticated
using (true) with check (true);
grant select, insert, update, delete on public.lesson_secrets to anon, authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (auth_user_id, email, full_name, password_hash, last_login_at)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    null,
    now()
  )
  on conflict (email) do update
  set auth_user_id = excluded.auth_user_id,
      password_hash = null,
      full_name = coalesce(nullif(public.users.full_name, ''), excluded.full_name),
      last_login_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

update public.users profile
set auth_user_id = auth_user.id,
    password_hash = null
from auth.users auth_user
where lower(profile.email) = lower(auth_user.email)
  and profile.auth_user_id is distinct from auth_user.id;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role in ('teacher', 'admin')
  );
$$;

create or replace function public.can_access_lesson(target_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lessons lesson
    where lesson.id = target_lesson_id
      and (
        not lesson.is_premium
        or public.is_teacher()
        or exists (
          select 1
          from public.users profile
          where profile.auth_user_id = auth.uid()
            and lesson.included_in_subscription
            and profile.is_premium
            and profile.subscription_status in ('active', 'trialing')
        )
        or exists (
          select 1
          from public.lesson_purchases purchase
          join public.users profile on profile.id = purchase.user_id
          where profile.auth_user_id = auth.uid()
            and purchase.lesson_id = lesson.id
            and purchase.status = 'paid'
            and (purchase.expires_at is null or purchase.expires_at > now())
        )
      )
  );
$$;

create or replace function public.can_access_storage_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  folder text;
  lesson_id uuid;
begin
  folder := split_part(object_name, '/', 1);
  if folder = 'site' then return true; end if;
  begin
    lesson_id := folder::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return public.can_access_lesson(lesson_id);
end;
$$;

revoke all on function public.is_teacher() from public;
revoke all on function public.can_access_lesson(uuid) from public;
revoke all on function public.can_access_storage_object(text) from public;
grant execute on function public.is_teacher() to anon, authenticated, service_role;
grant execute on function public.can_access_lesson(uuid) to anon, authenticated, service_role;
grant execute on function public.can_access_storage_object(text) to anon, authenticated, service_role;

commit;
