import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVehiclesByOwner } from '../services/vehicleService';
import { getExpensesByVehicleIds } from '../services/expenseService';
import { Expense, ExpenseType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ExpenseType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) return;
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
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar despesas');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  // Filtrar e ordenar despesas
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const vehicle = vehicles.find(v => v.id === expense.vehicleId);
      if (!vehicle) return false;

      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVehicle = selectedVehicle === 'all' || expense.vehicleId === selectedVehicle;
      const matchesType = selectedType === 'all' || expense.type === selectedType;

      return matchesSearch && matchesVehicle && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, vehicles, searchTerm, selectedVehicle, selectedType, sortBy, sortOrder]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const thisMonth = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const byType = filteredExpenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return { total, thisMonth, byType };
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

  const getExpenseTypeLabel = (type: ExpenseType) => {
    const types: Record<ExpenseType, string> = {
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

  const getExpenseTypeColor = (type: ExpenseType) => {
    const colors: Record<ExpenseType, string> = {
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

  const handleAddExpense = (expenseData: Partial<Expense>) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      vehicleId: expenseData.vehicleId || '',
      type: expenseData.type || ExpenseType.OTHER,
      description: expenseData.description || '',
      amount: expenseData.amount || 0,
      date: expenseData.date || new Date(),
      location: expenseData.location,
      receipt: expenseData.receipt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setExpenses([...expenses, newExpense]);
    setIsAddModalOpen(false);
  };

  const handleEditExpense = (expenseData: Partial<Expense>) => {
    if (!editingExpense) return;

    const updatedExpenses = expenses.map(e => 
      e.id === editingExpense.id 
        ? { ...e, ...expenseData, updatedAt: new Date() }
        : e
    );

    setExpenses(updatedExpenses);
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setExpenses(expenses.filter(e => e.id !== expenseId));
    }
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe os gastos dos seus veículos
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Despesa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.total)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(stats.thisMonth)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registros</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : filteredExpenses.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os veículos</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.model} - {vehicle.plate}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ExpenseType | 'all')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os tipos</option>
            {Object.values(ExpenseType).map(type => (
              <option key={type} value={type}>
                {getExpenseTypeLabel(type)}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
              <option value="type">Tipo</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de despesas */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Carregando...</p>
          </div>
        </Card>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma despesa encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedVehicle !== 'all' || selectedType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece registrando sua primeira despesa'
              }
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Despesa
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          {filteredExpenses.map((expense) => {
            const vehicle = vehicles.find(v => v.id === expense.vehicleId);
            return (
              <Card key={expense.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                          {getExpenseTypeLabel(expense.type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">
                        {expense.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vehicle?.model} • {vehicle?.plate}
                        {expense.location && (
                          <span className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {expense.location}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(expense)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de adicionar despesa */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Despesa"
        size="md"
      >
        <ExpenseForm
          vehicles={vehicles}
          onSubmit={handleAddExpense}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Modal de editar despesa */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Editar Despesa"
        size="md"
      >
        <ExpenseForm
          vehicles={vehicles}
          expense={editingExpense}
          onSubmit={handleEditExpense}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingExpense(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Componente do formulário de despesa
interface ExpenseFormProps {
  vehicles: any[];
  expense?: Expense | null;
  onSubmit: (data: Partial<Expense>) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ vehicles, expense, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicleId: expense?.vehicleId || '',
    type: expense?.type || ExpenseType.FUEL,
    description: expense?.description || '',
    amount: expense?.amount || 0,
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: expense?.location || '',
    receipt: expense?.receipt || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date),
      amount: parseFloat(formData.amount.toString())
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veículo
          </label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Selecione um veículo</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.model} - {vehicle.plate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            {Object.values(ExpenseType).map(type => (
              <option key={type} value={type}>
                {type === 'fuel' && 'Abastecimento'}
                {type === 'maintenance' && 'Manutenção'}
                {type === 'ticket' && 'Multa'}
                {type === 'insurance' && 'Seguro'}
                {type === 'ipva' && 'IPVA'}
                {type === 'licensing' && 'Licenciamento'}
                {type === 'other' && 'Outros'}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Descrição"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Abastecimento - Posto Shell"
          required
        />

        <Input
          label="Valor"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0,00"
          required
        />

        <Input
          label="Data"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Input
          label="Local (opcional)"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ex: Posto Shell - Av. Paulista"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comprovante/Nota (opcional)
        </label>
        <textarea
          name="receipt"
          value={formData.receipt}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Observações sobre o comprovante ou nota fiscal..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {expense ? 'Salvar Alterações' : 'Adicionar Despesa'}
        </Button>
      </div>
    </form>
  );
};

export default Expenses;
