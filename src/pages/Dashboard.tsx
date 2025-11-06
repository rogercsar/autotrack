import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getVehiclesByOwner } from '../services/vehicleService';
import { getExpensesByVehicleIds } from '../services/expenseService';
import { countActiveAlertsByUser } from '../services/alertsService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Car, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  MapPin
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const v = await getVehiclesByOwner(user.id);
        if (!active) return;
        setVehicles(v);
        const vehicleIds = v.map((x) => x.id);
        const exps = vehicleIds.length ? await getExpensesByVehicleIds(vehicleIds) : [];
        if (!active) return;
        setExpenses(exps);
        const ac = await countActiveAlertsByUser(user.id);
        if (!active) return;
        setAlertsCount(ac);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar dados');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user]);

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const now = new Date();
    const monthlyExpenses = expenses
      .filter((e) => e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0);
    return { totalVehicles, totalExpenses, monthlyExpenses, recentAlerts: alertsCount };
  }, [vehicles, expenses, alertsCount]);

  const recentExpenses = useMemo(() => {
    return expenses
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  // Se não houver usuário logado, não renderiza conteúdo
  if (!user) return null;

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
    const types: { [key: string]: string } = {
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
    const colors: { [key: string]: string } = {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está um resumo dos seus veículos e despesas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/workshops')}>
            <MapPin className="w-4 h-4 mr-2" />
            Oficinas Próximas
          </Button>
          <Button size="sm" onClick={() => navigate('/vehicles')}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Veículos</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalVehicles}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gastos Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.monthlyExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertas</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.recentAlerts}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Veículos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Meus Veículos</h2>
            <Link to="/vehicles">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum veículo cadastrado</p>
              <Button size="sm" onClick={() => navigate('/vehicles')}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Veículo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  {vehicle.photo ? (
                    <img
                      src={vehicle.photo}
                      alt={vehicle.model}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{vehicle.model}</p>
                    <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.year}</p>
                  </div>
                  <Link to={`/vehicles/${vehicle.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Despesas Recentes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Despesas Recentes</h2>
            <Link to="/expenses">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma despesa registrada</p>
              <Button size="sm" onClick={() => navigate('/expenses')}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Despesa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const vehicle = vehicles.find(v => v.id === expense.vehicleId);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                        {getExpenseTypeLabel(expense.type)}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                        <p className="text-xs text-gray-600">
                          {vehicle?.model} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Próximos Pagamentos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Próximos Pagamentos</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <Calendar className="w-4 h-4 mr-2" />
            Ver Calendário
          </Button>
        </div>
        
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum pagamento próximo</p>
          <p className="text-sm text-gray-400 mt-1">
            Configure lembretes para IPVA, seguro e outros pagamentos
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
