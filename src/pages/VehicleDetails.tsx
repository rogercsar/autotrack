import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserVehicles, mockExpenses, getUserGroups } from '../data/mockData';
import { Vehicle, Expense, Group } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import { 
  Car, 
  ArrowLeft, 
  Edit, 
  Share2, 
  DollarSign,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles] = useState<Vehicle[]>(getUserVehicles(user?.id || ''));
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [groups] = useState<Group[]>(getUserGroups(user?.id || ''));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const vehicle = vehicles.find(v => v.id === id);

  // Filtrar despesas do veículo
  const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle?.id);
  
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Veículo não encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              O veículo que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/vehicles')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Veículos
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

  const handleEditVehicle = (vehicleData: Partial<Vehicle> & { photoFile?: File | null }) => {
    // Aqui seria implementada a lógica de edição
    console.log('Editando veículo:', vehicleData);
    setIsEditModalOpen(false);
  };

  const handleAddExpense = (expenseData: Partial<Expense> & { attachmentFile?: File | null }) => {
    // Aqui seria implementada a lógica de adicionar despesa
    console.log('Adicionando despesa:', expenseData);
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/vehicles')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.model}</h1>
            <p className="text-gray-600">{vehicle.plate} • {vehicle.year}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Informações do veículo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto e informações básicas */}
        <div className="lg:col-span-2">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.model}</h2>
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
                    <p className="font-semibold text-gray-900">{vehicle.renavam}</p>
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
        </div>

        {/* Estatísticas */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Gasto</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.totalExpenses)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Este Mês</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.thisMonth)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Registros</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicleExpenses.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Despesas recentes */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Despesas Recentes</h2>
          <Button onClick={() => setIsExpenseModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Despesa
          </Button>
        </div>
        
        {vehicleExpenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma despesa registrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece registrando as despesas deste veículo
            </p>
            <Button onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Despesa
            </Button>
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
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    {expense.location && (
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
                <Button variant="outline" onClick={() => navigate('/expenses')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todas as Despesas
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Grupos */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Grupos</h2>
          <Button variant="outline" onClick={() => navigate('/groups')}>
            <Users className="w-4 h-4 mr-2" />
            Gerenciar Grupos
          </Button>
        </div>
        
        {groups.filter(g => g.vehicleIds.includes(vehicle.id)).length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Veículo não está em nenhum grupo
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione este veículo a um grupo para compartilhar informações
            </p>
            <Button onClick={() => navigate('/groups')}>
              <Users className="w-4 h-4 mr-2" />
              Criar ou Gerenciar Grupos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.filter(g => g.vehicleIds.includes(vehicle.id)).map((group) => (
              <div key={group.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <span className="text-sm text-gray-500">
                    {group.members.length} membros
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Criado em {formatDate(group.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de editar veículo */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Veículo"
        size="md"
      >
        <VehicleEditForm
          vehicle={vehicle}
          onSubmit={handleEditVehicle}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Modal de compartilhar */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Compartilhar Veículo"
        size="md"
      >
        <VehicleShareForm
          vehicle={vehicle}
          onClose={() => setIsShareModalOpen(false)}
        />
      </Modal>

      {/* Modal de adicionar despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Adicionar Despesa"
        size="md"
      >
        <ExpenseForm
          vehicle={vehicle}
          onSubmit={handleAddExpense}
          onCancel={() => setIsExpenseModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Componente de edição do veículo
interface VehicleEditFormProps {
  vehicle: Vehicle;
  onSubmit: (data: Partial<Vehicle> & { photoFile?: File | null }) => void;
  onCancel: () => void;
}

const VehicleEditForm: React.FC<VehicleEditFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    plate: vehicle.plate,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    renavam: vehicle.renavam,
    photo: vehicle.photo || ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, photoFile });
  };

  const handlePhotoChange = (file: File | null, previewUrl?: string) => {
    setPhotoFile(file);
    if (previewUrl) {
      setFormData(prev => ({ ...prev, photo: previewUrl }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Placa"
          name="plate"
          value={formData.plate}
          onChange={handleChange}
          placeholder="ABC-1234"
          required
        />
        <Input
          label="Modelo"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Honda Civic"
          required
        />
        <Input
          label="Ano"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          min="1900"
          max={new Date().getFullYear() + 1}
          required
        />
        <Input
          label="Cor"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Prata"
          required
        />
        <Input
          label="RENAVAM"
          name="renavam"
          value={formData.renavam}
          onChange={handleChange}
          placeholder="12345678901"
          required
        />
      </div>

      <ImageUpload
        label="Foto do Veículo"
        value={formData.photo}
        onChange={handlePhotoChange}
        accept="image/*"
        maxSize={5}
        helperText="Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

// Componente de compartilhamento
interface VehicleShareFormProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const VehicleShareForm: React.FC<VehicleShareFormProps> = ({ vehicle, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/public/vehicle/${vehicle.id}`;
    setShareUrl(url);
    return url;
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Erro ao copiar link:', err);
        alert('Erro ao copiar link. Tente novamente.');
      }
    }
  };

  React.useEffect(() => {
    generateShareUrl();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Link de compartilhamento</h3>
        <div className="flex space-x-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button onClick={copyToClipboard}>
            Copiar
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Este link permite visualizar as informações do veículo publicamente
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

// Componente de formulário de despesa
interface ExpenseFormProps {
  vehicle: Vehicle;
  onSubmit: (data: Partial<Expense> & { attachmentFile?: File | null }) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'fuel',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vehicleId: vehicle.id,
      type: formData.type as any,
      description: formData.description,
      amount: formData.amount,
      date: new Date(formData.date),
      attachmentFile
    });
  };

  const handleAttachmentChange = (file: File | null) => {
    setAttachmentFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="fuel">Abastecimento</option>
          <option value="maintenance">Manutenção</option>
          <option value="ticket">Multa</option>
          <option value="insurance">Seguro</option>
          <option value="ipva">IPVA</option>
          <option value="licensing">Licenciamento</option>
          <option value="other">Outros</option>
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

      <ImageUpload
        label="Anexo (opcional)"
        onChange={handleAttachmentChange}
        accept="image/*,application/pdf"
        maxSize={10}
        placeholder="Arraste uma imagem ou PDF aqui"
        helperText="Formatos aceitos: JPG, PNG, GIF, PDF. Tamanho máximo: 10MB"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar Despesa
        </Button>
      </div>
    </form>
  );
};

export default VehicleDetails;
