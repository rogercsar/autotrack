import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockVehicles, mockExpenses } from '../data/mockData';
import { Vehicle } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Car, 
  ArrowLeft, 
  DollarSign,
  Calendar,
  MapPin,
  Star,
  Eye,
  EyeOff,
  User,
  
} from 'lucide-react';

const PublicVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const vehicle = mockVehicles.find(v => v.id === id);

  // Filtrar despesas do veículo
  const vehicleExpenses = mockExpenses.filter(e => e.vehicleId === vehicle?.id);
  
  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!vehicle) return { totalExpenses: 0, thisMonth: 0, byType: {} };
    
    const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = vehicleExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);

    const byType = vehicleExpenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalExpenses, thisMonth, byType };
  }, [vehicleExpenses, vehicle]);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Veículo não encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              O veículo que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getExpenseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fuel: 'Abastecimento',
      maintenance: 'Manutenção',
      ticket: 'Multa',
      insurance: 'Seguro',
      ipva: 'IPVA',
      licensing: 'Licenciamento',
      other: 'Outros'
    };
    return types[type] || type;
  };

  const getExpenseTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fuel: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      ticket: 'bg-red-100 text-red-800',
      insurance: 'bg-green-100 text-green-800',
      ipva: 'bg-purple-100 text-purple-800',
      licensing: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com banner de promoção */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AutoTrack</h1>
                <p className="text-sm opacity-90">Gestão Veicular Inteligente</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-primary-600"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button
                className="bg-white text-primary-600 hover:bg-gray-100"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de promoção */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>Gostou do que viu?</strong> Crie sua conta no AutoTrack para gerenciar seu veículo!
            </p>
            <Button
              size="sm"
              className="ml-4"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Informações do veículo */}
          <Card>
            <div className="flex items-start space-x-6">
              {vehicle.photo ? (
                <img
                  src={vehicle.photo}
                  alt={vehicle.model}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Car className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.model}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Placa</p>
                    <p className="font-semibold text-gray-900">{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ano</p>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cor</p>
                    <p className="font-semibold text-gray-900">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">RENAVAM</p>
                    <p className="font-semibold text-gray-900">
                      {showSensitiveData ? vehicle.renavam : '*** *** ***'}
                      <button
                        onClick={() => setShowSensitiveData(!showSensitiveData)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Cadastrado em {formatDate(vehicle.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Gasto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalExpenses)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.thisMonth)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Registros</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicleExpenses.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Despesas recentes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Despesas Recentes</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {showSensitiveData ? 'Dados completos' : 'Dados limitados'}
                </span>
                <button
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {vehicleExpenses.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma despesa registrada
                </h3>
                <p className="text-gray-500">
                  Este veículo ainda não possui despesas registradas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicleExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                            {getExpenseTypeLabel(expense.type)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {showSensitiveData ? expense.description : 'Despesa registrada'}
                        </p>
                        {expense.location && showSensitiveData && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {expense.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))}
                {vehicleExpenses.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                      E mais {vehicleExpenses.length - 5} despesas...
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Despesas por categoria */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Despesas por Categoria</h2>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(type)}`}>
                      {getExpenseTypeLabel(type)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Call to action */}
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Gostou do que viu?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Crie sua conta no AutoTrack para gerenciar seu veículo, registrar despesas, 
                compartilhar informações e muito mais!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <Star className="w-5 h-5 mr-2" />
                  Criar Conta Grátis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="w-5 h-5 mr-2" />
                  Fazer Login
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Já tem uma conta? Faça login para acessar seus veículos
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de login */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Fazer Login"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Faça login para acessar sua conta AutoTrack
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsLoginModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => navigate('/login')}>
              Fazer Login
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de registro */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Criar Conta"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Crie sua conta gratuita no AutoTrack
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => navigate('/register')}>
              Criar Conta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PublicVehicle;
