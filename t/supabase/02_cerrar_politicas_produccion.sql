-- Paso 2: cerrar las politicas de demostracion.
-- Ejecutar solo despues de desplegar y comprobar el acceso con Supabase Auth.

begin;

update public.users set password_hash = null where password_hash is not null;
update public.lessons set live_url = null where live_url is not null;
update public.lessons set body = null where is_premium and body is not null;

drop policy if exists demo_users_read on public.users;
drop policy if exists demo_users_insert on public.users;
drop policy if exists demo_users_update on public.users;

drop policy if exists users_read_own on public.users;
create policy users_read_own on public.users for select to authenticated
using (auth_user_id = auth.uid());

drop policy if exists users_teacher_read on public.users;
create policy users_teacher_read on public.users for select to authenticated
using (public.is_teacher());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

revoke all on public.users from anon;
revoke all on public.users from authenticated;
grant select on public.users to authenticated;
grant update (full_name, last_login_at) on public.users to authenticated;

drop policy if exists demo_lessons_read on public.lessons;
drop policy if exists demo_lessons_insert on public.lessons;
drop policy if exists demo_lessons_update on public.lessons;
drop policy if exists demo_lessons_delete on public.lessons;

drop policy if exists lessons_public_read on public.lessons;
create policy lessons_public_read on public.lessons for select to anon, authenticated
using (is_published or slug = 'site-settings');

drop policy if exists lessons_teacher_manage on public.lessons;
create policy lessons_teacher_manage on public.lessons for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

revoke all on public.lessons from anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant insert, update, delete on public.lessons to authenticated;

drop policy if exists demo_media_read on public.media;
drop policy if exists demo_media_insert on public.media;
drop policy if exists demo_media_update on public.media;
drop policy if exists demo_media_delete on public.media;

drop policy if exists media_authorized_read on public.media;
create policy media_authorized_read on public.media for select to anon, authenticated
using (public.can_access_lesson(lesson_id));

drop policy if exists media_teacher_manage on public.media;
create policy media_teacher_manage on public.media for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

revoke all on public.media from anon, authenticated;
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;

drop policy if exists demo_lesson_secrets_all on public.lesson_secrets;
drop policy if exists lesson_secrets_authorized_read on public.lesson_secrets;
create policy lesson_secrets_authorized_read on public.lesson_secrets for select to anon, authenticated
using (public.can_access_lesson(lesson_id));

drop policy if exists lesson_secrets_teacher_manage on public.lesson_secrets;
create policy lesson_secrets_teacher_manage on public.lesson_secrets for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

revoke all on public.lesson_secrets from anon, authenticated;
grant select on public.lesson_secrets to anon;
grant select, insert, update, delete on public.lesson_secrets to authenticated;

drop policy if exists demo_access_logs_insert on public.lesson_access_logs;
drop policy if exists access_logs_insert_own on public.lesson_access_logs;
create policy access_logs_insert_own on public.lesson_access_logs for insert to authenticated
with check (exists (
  select 1 from public.users profile
  where profile.id = user_id and profile.auth_user_id = auth.uid()
));
revoke all on public.lesson_access_logs from anon, authenticated;
grant insert on public.lesson_access_logs to authenticated;

revoke all on public.lesson_purchases from anon, authenticated;

drop policy if exists lesson_media_public_read on storage.objects;
drop policy if exists lesson_media_demo_insert on storage.objects;
drop policy if exists lesson_media_demo_update on storage.objects;
drop policy if exists lesson_media_demo_delete on storage.objects;

update storage.buckets set public = false where id = 'lesson-media';

drop policy if exists lesson_media_authorized_read on storage.objects;
create policy lesson_media_authorized_read on storage.objects for select to anon, authenticated
using (bucket_id = 'lesson-media' and public.can_access_storage_object(name));

drop policy if exists lesson_media_teacher_insert on storage.objects;
create policy lesson_media_teacher_insert on storage.objects for insert to authenticated
with check (bucket_id = 'lesson-media' and public.is_teacher());

drop policy if exists lesson_media_teacher_update on storage.objects;
create policy lesson_media_teacher_update on storage.objects for update to authenticated
using (bucket_id = 'lesson-media' and public.is_teacher())
with check (bucket_id = 'lesson-media' and public.is_teacher());

drop policy if exists lesson_media_teacher_delete on storage.objects;
create policy lesson_media_teacher_delete on storage.objects for delete to authenticated
using (bucket_id = 'lesson-media' and public.is_teacher());

commit;
