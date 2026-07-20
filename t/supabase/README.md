# Supabase + Vercel Deployment Guide

This guide shows how to deploy the yoga website database schema to Supabase and connect it to a Vercel-hosted front-end.

## 1. Create the Supabase project

1. Go to https://app.supabase.com and sign in or sign up.
2. Click **New project**.
3. Enter a project name, choose a password, and select a region.
4. Create the project and wait for Supabase to finish provisioning.

## 2. Add the database schema

There are two easy options:

### Option A: Use the Supabase SQL editor

1. Open your new Supabase project.
2. Go to **SQL Editor** > **New query**.
3. Copy the contents of `t/supabase/schema.sql`.
4. Paste into the editor and click **Run**.
5. Confirm that tables `users`, `lessons`, `media`, `promotions`, and `lesson_access_logs` were created.

### Option B: Use the Supabase CLI

1. Install the Supabase CLI if you do not already have it:

```powershell
npm install -g @supabase/cli
```

2. Log in to Supabase:

```powershell
supabase login
```

3. From your project folder, initialize Supabase config if you want local CLI support:

```powershell
cd "c:\Users\joel\Desktop\New folder\Pagina-de-yoga\t"
supabase init
```

4. Run the SQL file against your project:

```powershell
supabase db query "./supabase/schema.sql"
```

If the CLI requires a project reference, you can provide it via environment variables or `supabase project link`.

## 3. (Recommended) Create a Storage bucket for lesson media

If you plan to store videos, images, or audio in Supabase Storage:

1. Open the Supabase project dashboard.
2. Go to **Storage** > **Create new bucket**.
3. Name it `lesson-media` or `public-media`.
4. Set the privacy to `Public` if it should be reachable by public lessons, or `Private` for gated content.

Then store URLs in the `media.url` field.

## 4. Add basic Supabase policies (optional)

If you want to restrict access or allow public reads:

1. Go to **Auth** > **Policies**.
2. Add row-level security policies for the tables you need.
3. For example, permit public SELECT on `lessons` and `promotions` if the data is public.

Note: For a simple read-only public site, you can keep `row level security` off for those tables until you add auth logic.

## 5. Create the Vercel project

1. Go to https://vercel.com and sign in or sign up.
2. Click **New Project**.
3. Import your repository from GitHub, GitLab, or Bitbucket.
   - If you do not yet have a repo, create one for `Pagina-de-yoga` and push the contents.
4. Configure the framework preset based on your app. If your site is static or vanilla JS, choose **Other** or **Static Site**.

## 6. Add Supabase environment variables in Vercel

1. In Vercel, open your project settings.
2. Go to **Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/public API key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (server-only, if needed)

For a static front-end, you usually only need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 7. Connect your app to Supabase

If you are using a JavaScript front-end, install Supabase client code:

```powershell
npm install @supabase/supabase-js
```

Create a Supabase client file, for example `supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Then query your tables:

```js
const { data: lessons, error } = await supabase
  .from('lessons')
  .select('*, media(*)')
  .order('published_at', { ascending: false });
```

## 8. Deploy to Vercel

1. Commit your code and push to your Git repository.
2. In Vercel, click **Deploy** on the project page.
3. Wait for the build to complete.
4. Visit the generated Vercel URL.

## 9. Test the full flow

- Confirm the `users` table exists and can store free/premium state.
- Confirm `lessons` and `media` data can be read from the front-end.
- Confirm `promotions` content is available on the promo page.

## 10. Next improvements

- Add auth with Supabase Auth for sign-up/log-in.
- Use `is_premium` to gate premium lessons in the front-end.
- Add `stripe_subscription_id` to the `users` table for paid plan tracking.
- Add Supabase Storage for hosted video/image/audio.
- Add row-level security policies to protect premium content.

---

## Notes about this database design

- `users`: tracks accounts, tier, role, and subscription state.
- `lessons`: stores lesson content and premium gating.
- `media`: stores attachments for lessons.
- `promotions`: stores promo articles and projects outside lessons.
- `lesson_access_logs`: optional analytics/audit table.
