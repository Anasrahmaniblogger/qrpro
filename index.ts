import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID') || '';
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || '';
const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg/orders"; 

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { order_id, type, template_id } = await req.json();
        
        // 1. Get user from auth header
        const authHeader = req.headers.get('Authorization')!;
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        
        if(!user) throw new Error("Unauthorized");

        // 2. Call Cashfree to verify payment
        const response = await fetch(`${CASHFREE_API_URL}/${order_id}/payments`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY
            }
        });

        const payments = await response.json();
        
        // Find if there's any successful payment
        const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');

        if(successfulPayment) {
            // Use service role to bypass RLS for DB updates
            const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
            
            if(type === 'subscription') {
                await supabaseAdmin.from('profiles').update({
                    subscription_tier: 'PRO'
                }).eq('id', user.id);
            } else if (type === 'template') {
                await supabaseAdmin.from('template_purchases').insert([{
                    user_id: user.id,
                    template_id: template_id,
                    amount: successfulPayment.payment_amount,
                    transaction_id: successfulPayment.cf_payment_id
                }]);
            }
            
            return new Response(JSON.stringify({ status: 'SUCCESS' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        } else {
            return new Response(JSON.stringify({ status: 'PENDING_OR_FAILED' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
});
