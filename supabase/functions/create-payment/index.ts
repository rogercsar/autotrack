// supabase/functions/create-payment/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan_id, user_id } = await req.json()

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch plan details from the database
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError) {
      throw new Error(`Failed to fetch plan: ${planError.message}`)
    }

    // 3. Initialize Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
    })
    const preference = new Preference(client)

    // 4. Create payment preference
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `Plano ${plan.name} - AutoTrack`,
            quantity: 1,
            unit_price: plan.price,
          },
        ],
        back_urls: {
          success: `${Deno.env.get('SITE_URL')}/payment/success`,
          failure: `${Deno.env.get('SITE_URL')}/payment/failure`,
          pending: `${Deno.env.get('SITE_URL')}/payment/pending`,
        },
        auto_return: 'approved',
        notification_url: `${Deno.env.get(
          'SUPABASE_FUNCTION_URL'
        )}/payment-webhook?user_id=${user_id}&plan_id=${plan_id}`,
        metadata: {
          user_id: user_id,
          plan_id: plan_id,
        },
      },
    })

    // 5. Return the checkout URL
    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
