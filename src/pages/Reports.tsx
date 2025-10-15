import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserVehicles, mockExpenses } from '../data/mockData';
import { Vehicle, Expense } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  PieChart,
  FileText,
  Settings
} from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [vehicles] = useState<Vehicle[]>(getUserVehicles(user?.id || ''));
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months');
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const isDateInPeriod = (date: Date, period: string) => {
    const expenseDate = new Date(date);
    const now = new Date();
    
    switch (period) {
      case '1month':
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return expenseDate >= oneMonthAgo;
      case '3months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return expenseDate >= threeMonthsAgo;
      case '6months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        return expenseDate >= sixMonthsAgo;
      case '1year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return expenseDate >= oneYearAgo;
      case 'all':
        return true;
      default:
        return true;
    }
  };

  // Filtrar despesas baseado nos filtros
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const vehicleMatch = selectedVehicle === 'all' || expense.vehicleId === selectedVehicle;
      const dateMatch = isDateInPeriod(expense.date, selectedPeriod);
      return vehicleMatch && dateMatch;
    });

    return filtered;
  }, [expenses, selectedVehicle, selectedPeriod]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    
    const byType = filteredExpenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const byMonth = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topExpenses = filteredExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpenses,
      averageExpense,
      byType,
      byMonth,
      topExpenses,
      count: filteredExpenses.length
    };
  }, [filteredExpenses]);

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
      fuel: 'bg-blue-500',
      maintenance: 'bg-orange-500',
      ticket: 'bg-red-500',
      insurance: 'bg-green-500',
      ipva: 'bg-purple-500',
      licensing: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleExportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório...');
  };

  const handleGeneratePDF = () => {
    // Implementar geração de PDF
    console.log('Gerando PDF...');
  };

  const reportTypes = [
    {
      id: 'overview',
      name: 'Visão Geral',
      description: 'Resumo completo das despesas',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'trends',
      name: 'Tendências',
      description: 'Análise de tendências ao longo do tempo',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'categories',
      name: 'Categorias',
      description: 'Despesas por categoria',
      icon: PieChart,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'monthly',
      name: 'Mensal',
      description: 'Relatório mensal detalhado',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada das suas despesas e gastos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleGeneratePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Filtros ativos */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedVehicle === 'all' ? 'Todos os veículos' : vehicles.find(v => v.id === selectedVehicle)?.model}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {selectedPeriod === 'all' ? 'Todo o período' : 
                 selectedPeriod === '1month' ? 'Último mês' :
                 selectedPeriod === '3months' ? 'Últimos 3 meses' :
                 selectedPeriod === '6months' ? 'Últimos 6 meses' :
                 selectedPeriod === '1year' ? 'Último ano' : 'Período personalizado'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Alterar Filtros
          </Button>
        </div>
      </Card>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
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
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Média por Despesa</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.averageExpense)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.count}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedPeriod === '1month' ? '1M' :
                 selectedPeriod === '3months' ? '3M' :
                 selectedPeriod === '6months' ? '6M' :
                 selectedPeriod === '1year' ? '1A' : 'T'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tipos de relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((reportType) => {
          const Icon = reportType.icon;
          return (
            <Card
              key={reportType.id}
              className={`cursor-pointer transition-all ${
                selectedReportType === reportType.id 
                  ? 'ring-2 ring-primary-500 bg-primary-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedReportType(reportType.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${reportType.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{reportType.name}</h3>
                  <p className="text-sm text-gray-600">{reportType.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo do relatório */}
      {selectedReportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas por categoria */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getExpenseTypeColor(type)}`} />
                    <span className="text-sm font-medium text-gray-900">
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

          {/* Top 5 despesas */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maiores Despesas</h3>
            <div className="space-y-3">
              {stats.topExpenses.map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedReportType === 'trends' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendências Mensais</h3>
          <div className="space-y-3">
            {Object.entries(stats.byMonth).map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(amount / Math.max(...Object.values(stats.byMonth))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedReportType === 'categories' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, amount]) => {
              const percentage = (amount / stats.totalExpenses) * 100;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getExpenseTypeColor(type)}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {getExpenseTypeLabel(type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getExpenseTypeColor(type)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {selectedReportType === 'monthly' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatório Mensal</h3>
          <div className="space-y-4">
            {Object.entries(stats.byMonth).map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{month}</h4>
                  <p className="text-sm text-gray-600">
                    {filteredExpenses.filter(e => {
                      const expenseMonth = new Date(e.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                      return expenseMonth === month;
                    }).length} despesas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Média: {formatCurrency(amount / filteredExpenses.filter(e => {
                      const expenseMonth = new Date(e.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                      return expenseMonth === month;
                    }).length)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal de filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros do Relatório"
        size="md"
      >
        <ReportFilters
          selectedVehicle={selectedVehicle}
          selectedPeriod={selectedPeriod}
          vehicles={vehicles}
          onVehicleChange={setSelectedVehicle}
          onPeriodChange={setSelectedPeriod}
          onClose={() => setIsFilterModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Componente de filtros do relatório
interface ReportFiltersProps {
  selectedVehicle: string;
  selectedPeriod: string;
  vehicles: Vehicle[];
  onVehicleChange: (vehicle: string) => void;
  onPeriodChange: (period: string) => void;
  onClose: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedVehicle,
  selectedPeriod,
  vehicles,
  onVehicleChange,
  onPeriodChange,
  onClose
}) => {
  const handleSave = () => {
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Veículo
        </label>
        <select
          value={selectedVehicle}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Todos os veículos</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.model} - {vehicle.plate}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Período
        </label>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="1month">Último mês</option>
          <option value="3months">Últimos 3 meses</option>
          <option value="6months">Últimos 6 meses</option>
          <option value="1year">Último ano</option>
          <option value="all">Todo o período</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Filter className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default Reports;


