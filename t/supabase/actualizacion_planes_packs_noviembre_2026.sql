-- Reset de Conciencia: planes, packs temporales y clases en directo.
-- Ejecutar una sola vez en Supabase > SQL Editor antes de publicar el codigo.

begin;

alter table public.lessons add column if not exists content_type text;
alter table public.lessons add column if not exists commercial_offer_code text;
alter table public.lessons add column if not exists access_duration_days integer;
alter table public.lessons add column if not exists included_in_subscription boolean;
alter table public.lessons add column if not exists live_url text;

update public.lessons lesson
set content_type = case
  when (
    select count(*) from public.media media_item where media_item.lesson_id = lesson.id
  ) > 1 then 'pack'
  when exists (
    select 1 from public.media media_item
    where media_item.lesson_id = lesson.id and media_item.type = 'document'
  ) then 'book'
  when exists (
    select 1 from public.media media_item
    where media_item.lesson_id = lesson.id and media_item.type = 'audio'
  ) then 'audio'
  when exists (
    select 1 from public.media media_item
    where media_item.lesson_id = lesson.id and media_item.type = 'video'
  ) then 'video'
  when coalesce(lesson.body, '') <> '' then 'thought'
  else 'video'
end
where content_type is null;

update public.lessons
set access_duration_days = 0
where access_duration_days is null;

update public.lessons
set included_in_subscription = (
  is_premium and content_type in ('video', 'audio', 'live')
)
where included_in_subscription is null;

alter table public.lessons alter column content_type set default 'video';
alter table public.lessons alter column content_type set not null;
alter table public.lessons alter column access_duration_days set default 0;
alter table public.lessons alter column access_duration_days set not null;
alter table public.lessons alter column included_in_subscription set default false;
alter table public.lessons alter column included_in_subscription set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_content_type_valid'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_content_type_valid
      check (content_type in ('video', 'audio', 'book', 'thought', 'pack', 'live'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_access_duration_nonnegative'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_access_duration_nonnegative
      check (access_duration_days >= 0);
  end if;
end $$;

create unique index if not exists lessons_commercial_offer_code_unique
  on public.lessons (commercial_offer_code)
  where commercial_offer_code is not null;

alter table public.lesson_purchases add column if not exists expires_at timestamptz;

create index if not exists lesson_purchases_active_access_idx
  on public.lesson_purchases (user_id, expires_at)
  where status = 'paid';

commit;
