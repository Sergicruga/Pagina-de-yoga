-- Supabase schema for Yoga teaching website

-- 1. Users table
-- Tracks free accounts and paid subscription status.
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  password_hash text,
  role text NOT NULL DEFAULT 'user',
  is_premium boolean NOT NULL DEFAULT false,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- 2. Lessons table
-- Each lesson can be free or premium, with title, description, and rich content.
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  body text,
  is_premium boolean NOT NULL DEFAULT false,
  level text,
  duration text,
  category text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Media table
-- Attach videos, images, audio, or documents to lessons.
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text,
  type text NOT NULL CHECK(type IN ('video','image','audio','document')),
  url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Promotions table
-- External promotional content like books, retreats, or articles.
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  body text,
  image_url text,
  link_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  author_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Optional: Lesson access log for audits or analytics
CREATE TABLE lesson_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  access_type text NOT NULL CHECK(access_type IN ('view','preview','download'))
);

-- Helper function to update updated_at timestamp automatically
CREATE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER promotions_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
