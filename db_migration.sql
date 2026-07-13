CREATE TABLE IF NOT EXISTS qr_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    is_free BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0,
    category VARCHAR(100),
    design JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert 10 Free Templates
INSERT INTO qr_templates (name, is_free, is_premium, design) VALUES 
('Classic Minimal', TRUE, FALSE, '{"fg": "#000000", "bg": "#ffffff", "dotsType": "square"}'),
('Ocean Breeze', TRUE, FALSE, '{"fg": "#0284c7", "bg": "#f0f9ff", "dotsType": "dots"}'),
('Forest Path', TRUE, FALSE, '{"fg": "#166534", "bg": "#f0fdf4", "dotsType": "rounded"}'),
('Sunset Glow', TRUE, FALSE, '{"fg": "#c2410c", "bg": "#fff7ed", "dotsType": "classy"}'),
('Berry Bliss', TRUE, FALSE, '{"fg": "#9d174d", "bg": "#fff1f2", "dotsType": "extra-rounded"}'),
('Sky High', TRUE, FALSE, '{"fg": "#1e40af", "bg": "#eff6ff", "dotsType": "classy-rounded"}'),
('Mint Fresh', TRUE, FALSE, '{"fg": "#0f766e", "bg": "#f0fdfa", "dotsType": "dots"}'),
('Plum Punch', TRUE, FALSE, '{"fg": "#6d28d9", "bg": "#f5f3ff", "dotsType": "square"}'),
('Sand Stone', TRUE, FALSE, '{"fg": "#78350f", "bg": "#fefce8", "dotsType": "rounded"}'),
('Graphite Grey', TRUE, FALSE, '{"fg": "#374151", "bg": "#f3f4f6", "dotsType": "classy"}');

-- Insert 30 Premium Templates
INSERT INTO qr_templates (name, is_premium, is_free, price, design) 
SELECT 
    'Premium ' || i || ' ' || (ARRAY['Dot', 'Cyberpunk', 'Classic', 'Neon', 'Modern', 'Luxury'])[i%6 + 1],
    TRUE, FALSE, 49,
    '{"fg": "#' || floor(random()*16777215)::int::text || '", "bg": "#' || floor(random()*16777215)::int::text || '", "dotsType": "' || (ARRAY['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'])[i%6 + 1] || '"}'
FROM generate_series(1, 30) AS i;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branding_unlocked BOOLEAN DEFAULT FALSE;
-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    project_type TEXT NOT NULL, -- 'QR', 'Logo', 'AI'
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'archived', 'trash'
    is_favorite BOOLEAN DEFAULT FALSE,
    folder_id UUID REFERENCES public.folders(id),
    thumbnail_url TEXT,
    preview_url TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    design JSONB NOT NULL DEFAULT '{}'::jsonb,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    premium_assets_used BOOLEAN DEFAULT FALSE,
    version_number INTEGER DEFAULT 1,
    tags JSONB DEFAULT '[]'::jsonb,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project versions table
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    version_number INTEGER NOT NULL,
    data JSONB NOT NULL,
    design JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create download history table
CREATE TABLE IF NOT EXISTS public.download_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    file_type TEXT NOT NULL, -- 'png', 'svg', 'pdf', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;

-- Policies for Folders
DROP POLICY IF EXISTS "Users can view own folders" ON public.folders;
CREATE POLICY "Users can view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folders" ON public.folders;
CREATE POLICY "Users can insert own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folders" ON public.folders;
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON public.folders;
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Policies for Projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Policies for Project Versions
DROP POLICY IF EXISTS "Users can view own project versions" ON public.project_versions;
CREATE POLICY "Users can view own project versions" ON public.project_versions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own project versions" ON public.project_versions;
CREATE POLICY "Users can insert own project versions" ON public.project_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own project versions" ON public.project_versions;
CREATE POLICY "Users can delete own project versions" ON public.project_versions FOR DELETE USING (auth.uid() = user_id);

-- Policies for Download History
DROP POLICY IF EXISTS "Users can view own download history" ON public.download_history;
CREATE POLICY "Users can view own download history" ON public.download_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own download history" ON public.download_history;
CREATE POLICY "Users can insert own download history" ON public.download_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_versions;

CREATE OR REPLACE FUNCTION increment_download_count(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enterprise Smart Data Lifecycle Management additions
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS archive_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS trash_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS delete_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS retention_policy TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS storage_size BIGINT DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS backup_status TEXT DEFAULT 'none';

CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON public.projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_delete_at ON public.projects(delete_at);

-- Add vip/protected columns to profiles and projects for exceptions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS never_delete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Create index on statuses and custom parameters
CREATE INDEX IF NOT EXISTS idx_projects_status_lifecycle ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_protected ON public.projects(is_protected);

-- Seed initial default lifecycle settings
INSERT INTO public.settings (id, value) VALUES
('lifecycle_settings', '{"free_retention_days": 15, "premium_retention_days": 365, "premium_policy": "keep_forever", "trash_retention_days": 15, "archive_retention_days": 30, "permanent_delete_delay": 7, "auto_cleanup_enabled": true, "auto_backup_enabled": true, "backup_retention_days": 90}')
ON CONFLICT (id) DO NOTHING;

