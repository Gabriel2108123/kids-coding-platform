const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    host: 'db.apbkobhfnmcqqzqeeqss.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'gV3vtZbLZ0iXe2kB',
    ssl: { rejectUnauthorized: false }
  });

  const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    DROP TABLE IF EXISTS public.user_progress CASCADE;
    DROP TABLE IF EXISTS public.lessons CASCADE;
    DROP TABLE IF EXISTS public.modules CASCADE;
    DROP TABLE IF EXISTS public.projects CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;

    CREATE TABLE public.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      supabase_auth_id UUID,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL, 
      role VARCHAR(50) DEFAULT 'child',
      avatar_url VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      is_email_verified BOOLEAN DEFAULT false,
      parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      first_name VARCHAR(50),
      age INTEGER,
      gender VARCHAR(50),
      skill_level VARCHAR(50) DEFAULT 'beginner',
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE public.projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(100) NOT NULL,
      description TEXT,
      short_description VARCHAR(255),
      type VARCHAR(50) DEFAULT 'game',
      creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      creator_name VARCHAR(100),
      code TEXT,
      xml TEXT,
      thumbnail_url VARCHAR(255),
      is_published BOOLEAN DEFAULT false,
      likes_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      remix_parent_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
      tags TEXT[],
      age_groups TEXT[],
      estimated_time INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE public.modules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(100) NOT NULL,
      description TEXT,
      age_group VARCHAR(20) NOT NULL,
      difficulty_level VARCHAR(20) NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      thumbnail_url VARCHAR(255),
      category VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE public.lessons (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      content TEXT,
      order_index INTEGER DEFAULT 0,
      xp_reward INTEGER DEFAULT 50,
      estimated_duration INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS set_timestamp_users ON public.users;
    CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

    DROP TRIGGER IF EXISTS set_timestamp_projects ON public.projects;
    CREATE TRIGGER set_timestamp_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

    DROP TRIGGER IF EXISTS set_timestamp_modules ON public.modules;
    CREATE TRIGGER set_timestamp_modules BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

    DROP TRIGGER IF EXISTS set_timestamp_lessons ON public.lessons;
    CREATE TRIGGER set_timestamp_lessons BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
  `;

  try {
    console.log('Connecting to PostgreSQL DB via Direct Connection...');
    await client.connect();

    console.log('Executing comprehensive DDL Schema update...');
    await client.query(sql);

    console.log('SUCCESS: Generated all Database tables and triggers securely!');
  } catch (err) {
    console.error('ERROR executing query:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
