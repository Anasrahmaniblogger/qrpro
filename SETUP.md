# QR Pro - Setup Guide

## 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the contents of `database.sql` to create tables, RLS policies, and default settings.
3. Go to **Project Settings -> API** and copy the `Project URL` and `anon public` key.
4. Open `user.html` and `admin.html` and paste these values into the `SUPABASE_URL` and `SUPABASE_KEY` constants at the top of the script tag.
5. Enable Google Auth in Supabase: **Authentication -> Providers -> Google**.

## 2. Cashfree Setup
1. Create a [Cashfree](https://www.cashfree.com/) account.
2. Get your App ID and Secret Key.
3. Implement the server-side token generation in Supabase Edge Functions to securely process payments without exposing your secret key to the frontend.

## 3. AI Setup (Gemini/OpenAI)
1. Get a Gemini API key from Google AI Studio.
2. In the Admin Panel (`admin.html`), navigate to Settings -> AI Settings and enter the API key.
3. The keys are stored securely in the `settings` table and should be accessed via Edge Functions to generate content (AI QR, AI Logos) securely.

## 4. Deployment
1. You can host `user.html` and `admin.html` directly on Vercel, Netlify, or GitHub Pages as they are static HTML files.
2. Ensure you add the hosted domain to **Supabase Authentication -> URL Configuration -> Site URL** so that Google OAuth redirects correctly.

## 5. Testing Checklist
- [ ] User can sign up via Google
- [ ] User can view the Landing Page
- [ ] User can generate a standard QR code (saved to Supabase)
- [ ] User can design a basic logo
- [ ] User can view their limits updating
- [ ] Admin can log into `admin.html` using the configured admin email
- [ ] Admin can update website settings which instantly reflect on `user.html`
