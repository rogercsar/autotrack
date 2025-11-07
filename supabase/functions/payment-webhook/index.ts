// supabase/functions/payment-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    const plan_id = searchParams.get('plan_id')

    const body = await req.json()

    // 1. Verify the payment status
    if (body.type === 'payment' && body.action === 'payment.created') {
      const paymentId = body.data.id

      // Here you would typically fetch the payment from Mercado Pago to verify it
      // For this example, we'll assume the payment is approved

      // 2. Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // 3. Fetch plan details to get the user_type
      const { data: plan, error: planError } = await supabaseAdmin
        .from('plans')
        .select('name')
        .eq('id', plan_id)
        .single()

      if (planError) {
        throw new Error(`Failed to fetch plan: ${planError.message}`)
      }

      // 4. Update the user's user_type in the profiles table
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ user_type: plan.name.toLowerCase() })
        .eq('id', user_id)

      if (updateError) {
        throw new Error(`Failed to update user plan: ${updateError.message}`)
      }
    }

    // 5. Return a success response to Mercado Pago
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
