-- Upgrade Migration for QR Templates and Purchases

-- Add Trial Start Date to Profiles
-- Note: You may need to ignore this if the column already exists.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- QR Templates Table
CREATE TABLE IF NOT EXISTS public.qr_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    access_type TEXT DEFAULT 'free', -- 'free', 'subscription', 'one_time'
    price DECIMAL DEFAULT 0,
    category TEXT DEFAULT 'General',
    design JSONB NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Template Purchases Table
CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    template_id UUID REFERENCES public.qr_templates(id) NOT NULL,
    amount DECIMAL NOT NULL,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.qr_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view templates" ON public.qr_templates;
CREATE POLICY "Anyone can view templates" ON public.qr_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.qr_templates;
CREATE POLICY "Admins can manage templates" ON public.qr_templates FOR ALL USING (auth.jwt() ->> 'email' = 'admin@qrpro.com');

DROP POLICY IF EXISTS "Users can view own purchases" ON public.template_purchases;
CREATE POLICY "Users can view own purchases" ON public.template_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON public.template_purchases;
CREATE POLICY "Users can insert own purchases" ON public.template_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clean up old entries if rerunning (optional, but good for reset)
TRUNCATE TABLE public.qr_templates CASCADE;

-- Insert initial templates (10 free, 15 subscription, 15 one-time premium)
DO $$
DECLARE
    i INT;
    dots_types TEXT[] := ARRAY['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'];
    corners_types TEXT[] := ARRAY['square', 'dot', 'extra-rounded'];
    acc_type TEXT;
    tmpl_price DECIMAL;
BEGIN
    FOR i IN 1..40 LOOP
        IF i <= 10 THEN
            acc_type := 'free';
            tmpl_price := 0;
        ELSIF i <= 25 THEN
            acc_type := 'subscription';
            tmpl_price := 0;
        ELSE
            acc_type := 'one_time';
            tmpl_price := 49; -- ₹49 per template
        END IF;

        INSERT INTO public.qr_templates (name, access_type, price, design)
        VALUES (
            'Style Template ' || i,
            acc_type,
            tmpl_price,
            json_build_object(
                'dotsType', dots_types[1 + mod(i, array_length(dots_types, 1))],
                'cornersSquareType', corners_types[1 + mod(i, array_length(corners_types, 1))],
                'cornersDotType', corners_types[1 + mod(i, array_length(corners_types, 1))],
                'fg', CASE WHEN mod(i, 3) = 0 THEN '#3b82f6' WHEN mod(i, 3) = 1 THEN '#ef4444' ELSE '#0f172a' END,
                'bg', '#ffffff'
            )::jsonb
        );
    END LOOP;
END $$;
