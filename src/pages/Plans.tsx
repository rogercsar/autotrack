import React, { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabaseClient'
import { Plan } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchPlans = async () => {
      const s = getSupabase()
      const { data, error } = await s.from('plans').select('*')
      if (error) {
        console.error('Error fetching plans:', error)
      } else {
        setPlans(data as Plan[])
      }
      setLoading(false)
    }

    fetchPlans()
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      alert('Você precisa estar logado para fazer um upgrade.')
      return
    }

    try {
      const { data, error } = await getSupabase().functions.invoke(
        'create-payment',
        {
          body: { plan_id: planId, user_id: user.id },
        }
      )

      if (error) {
        throw new Error(`Error creating payment: ${error.message}`)
      }

      if (data.init_point) {
        window.location.href = data.init_point
      }
    } catch (error) {
      console.error(error)
      alert('Ocorreu um erro ao iniciar o pagamento. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Nossos Planos</h1>
        <p className="text-gray-600 mt-2">
          Escolha o plano que melhor se adapta às suas necessidades.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-3xl font-bold text-primary-600 my-4">
                {plan.price === 0
                  ? 'Gratuito'
                  : `R$ ${plan.price.toFixed(2)}/mês`}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => plan.price > 0 && handleUpgrade(plan.id)}
                disabled={plan.price === 0}
              >
                {plan.price === 0 ? 'Plano Atual' : 'Fazer Upgrade'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Plans
