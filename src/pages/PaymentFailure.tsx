import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { XCircle } from 'lucide-react'

const PaymentFailure: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Pagamento Recusado</h1>
        <p className="text-gray-600 mt-2">
          Ocorreu um problema ao processar seu pagamento. Por favor, tente
          novamente.
        </p>
        <div className="mt-6">
          <Link to="/plans">
            <Button>Tentar Novamente</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default PaymentFailure
