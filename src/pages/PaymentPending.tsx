import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Clock } from 'lucide-react'

const PaymentPending: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md text-center">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Pagamento Pendente</h1>
        <p className="text-gray-600 mt-2">
          Seu pagamento está sendo processado. Avisaremos quando for aprovado.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Voltar para o Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default PaymentPending
