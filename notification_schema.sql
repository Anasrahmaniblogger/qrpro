-- Notification Management System Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Global Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enable_notifications BOOLEAN DEFAULT true,
    enable_email_notifications BOOLEAN DEFAULT false,
    enable_push_notifications BOOLEAN DEFAULT false,
    enable_browser_notifications BOOLEAN DEFAULT true,
    enable_popup_notifications BOOLEAN DEFAULT true,
    enable_sound BOOLEAN DEFAULT true,
    enable_badge_counter BOOLEAN DEFAULT true,
    enable_floating_notification BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert default row if not exists
INSERT INTO notification_settings (id)
SELECT uuid_generate_v4()
WHERE NOT EXISTS (SELECT 1 FROM notification_settings);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Welcome, Announcement, Promotion, etc.
    target_users TEXT NOT NULL, -- All, Free, Premium, etc.
    status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused, archived
    
    -- Content Builder
    title TEXT,
    subtitle TEXT,
    description TEXT,
    emoji TEXT,
    image_url TEXT,
    icon TEXT,
    button_text TEXT,
    button_url TEXT,
    
    -- Promotion Specific
    offer_badge TEXT,
    strike_price NUMERIC,
    discount_price NUMERIC,
    countdown_timer TIMESTAMP WITH TIME ZONE,
    coupon_code TEXT,
    
    -- Design & Layout
    popup_design TEXT DEFAULT 'modal', -- glass, modal, toast, bottom_sheet, etc.
    background TEXT,
    animation TEXT,
    popup_position TEXT DEFAULT 'center',
    
    -- Behavior Rules
    display_time INTEGER, -- seconds
    priority INTEGER DEFAULT 0,
    sound BOOLEAN DEFAULT false,
    auto_close BOOLEAN DEFAULT true,
    display_frequency TEXT DEFAULT 'show_once',
    delay_time INTEGER DEFAULT 0,
    
    -- Smart Triggers (JSON array of rules)
    trigger_rules JSONB DEFAULT '[]'::jsonb,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    schedule_repeat TEXT DEFAULT 'none',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- A/B Testing
    is_ab_test BOOLEAN DEFAULT false,
    ab_test_variant TEXT,
    parent_ab_test_id UUID REFERENCES notifications(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. User Notification Logs (Tracking delivery, opens, clicks)
CREATE TABLE IF NOT EXISTS user_notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- delivered, opened, read, dismissed, clicked, converted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Notification Analytics (Aggregated view or table for performance)
CREATE TABLE IF NOT EXISTS notification_analytics (
    notification_id UUID PRIMARY KEY REFERENCES notifications(id) ON DELETE CASCADE,
    sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    read INTEGER DEFAULT 0,
    dismissed INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_settings;

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read for active notifications (users need to see them)
CREATE POLICY "Allow public read active notifications" ON notifications
    FOR SELECT USING (status IN ('active', 'paused')); -- 'paused' might be needed if they become active

-- Admin full access (Assuming admins have a specific role or we just allow all authenticated for now based on previous setup, but better to restrict. Assuming service role or anon key with specific logic)
-- For simplicity, allowing select for everyone so the client can fetch them.
CREATE POLICY "Allow all read on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true);

CREATE POLICY "Allow all on notification_settings" ON notification_settings FOR ALL USING (true);
CREATE POLICY "Allow all on user_notification_logs" ON user_notification_logs FOR ALL USING (true);
CREATE POLICY "Allow all on notification_analytics" ON notification_analytics FOR ALL USING (true);
