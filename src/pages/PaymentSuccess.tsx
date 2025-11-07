import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { CheckCircle } from 'lucide-react'

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">
          Pagamento Aprovado!
        </h1>
        <p className="text-gray-600 mt-2">
          Seu plano foi atualizado com sucesso. Você já pode aproveitar os novos
          recursos.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Ir para o Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default PaymentSuccess
