import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserVehicles, mockUsers } from '../data/mockData';
import { Vehicle, VehicleTransfer, User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  Car, 
  ArrowRight, 
  User as UserIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Trash2,
  Send
} from 'lucide-react';

const VehicleTransferPage: React.FC = () => {
  const { user } = useAuth();
  const [vehicles] = useState<Vehicle[]>(getUserVehicles(user?.id || ''));
  const [transfers, setTransfers] = useState<VehicleTransfer[]>([
    {
      id: '1',
      vehicleId: '1',
      fromUserId: '1',
      toUserId: '2',
      status: 'pending',
      message: 'Transferindo meu Honda Civic para você',
      createdAt: new Date('2023-12-01'),
      completedAt: undefined
    },
    {
      id: '2',
      vehicleId: '2',
      fromUserId: '2',
      toUserId: '1',
      status: 'accepted',
      message: 'Aceito a transferência do Toyota Corolla',
      createdAt: new Date('2023-11-15'),
      completedAt: new Date('2023-11-16')
    }
  ]);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<VehicleTransfer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Filtrar transferências
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const vehicle = vehicles.find(v => v.id === transfer.vehicleId);
      const matchesSearch = vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transfers, vehicles, searchTerm, statusFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      accepted: 'Aceita',
      rejected: 'Rejeitada'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleTransferVehicle = (transferData: Partial<VehicleTransfer>) => {
    const newTransfer: VehicleTransfer = {
      id: Date.now().toString(),
      vehicleId: transferData.vehicleId || '',
      fromUserId: user?.id || '',
      toUserId: transferData.toUserId || '',
      status: 'pending',
      message: transferData.message,
      createdAt: new Date(),
      completedAt: undefined
    };

    setTransfers([...transfers, newTransfer]);
    setIsTransferModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleAcceptTransfer = (transferId: string) => {
    const updatedTransfers = transfers.map(t => 
      t.id === transferId 
        ? { ...t, status: 'accepted' as const, completedAt: new Date() }
        : t
    );
    setTransfers(updatedTransfers);
  };

  const handleRejectTransfer = (transferId: string) => {
    const updatedTransfers = transfers.map(t => 
      t.id === transferId 
        ? { ...t, status: 'rejected' as const, completedAt: new Date() }
        : t
    );
    setTransfers(updatedTransfers);
  };

  const handleDeleteTransfer = (transferId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transferência?')) {
      setTransfers(transfers.filter(t => t.id !== transferId));
    }
  };

  const openTransferModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsTransferModalOpen(true);
  };

  const openDetailsModal = (transfer: VehicleTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transferência de Veículos</h1>
          <p className="text-gray-600 mt-1">
            Transfira seus veículos para outros usuários do AutoTrack
          </p>
        </div>
      </div>

      {/* Aviso importante */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Aviso Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Ao transferir um veículo, todo o histórico de despesas e informações serão transferidos para o novo proprietário. 
              Os grupos criados por você não serão transferidos.
            </p>
          </div>
        </div>
      </Card>

      {/* Meus veículos */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus Veículos</h2>
        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum veículo cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
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
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{vehicle.model}</h3>
                    <p className="text-sm text-gray-600">{vehicle.plate}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => openTransferModal(vehicle)}
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transferir Veículo
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar transferências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="accepted">Aceitas</option>
            <option value="rejected">Rejeitadas</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Car className="w-4 h-4 mr-2" />
            {filteredTransfers.length} transferências
          </div>
        </div>
      </Card>

      {/* Lista de transferências */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <ArrowRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transferência encontrada
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca
              </p>
            </div>
          </Card>
        ) : (
          filteredTransfers.map((transfer) => {
            const vehicle = vehicles.find(v => v.id === transfer.vehicleId);
            const fromUser = mockUsers.find(u => u.id === transfer.fromUserId);
            const toUser = mockUsers.find(u => u.id === transfer.toUserId);
            const isFromMe = transfer.fromUserId === user?.id;

            return (
              <Card key={transfer.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Car className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle?.model} - {vehicle?.plate}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {getStatusIcon(transfer.status)}
                          <span className="ml-1">{getStatusLabel(transfer.status)}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          {isFromMe ? 'Para' : 'De'}: {isFromMe ? toUser?.name : fromUser?.name}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(transfer.createdAt)}
                        </div>
                      </div>

                      {transfer.message && (
                        <p className="text-sm text-gray-700 mb-2">
                          "{transfer.message}"
                        </p>
                      )}

                      {transfer.completedAt && (
                        <p className="text-xs text-gray-500">
                          {isFromMe ? 'Transferido' : 'Recebido'} em {formatDate(transfer.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailsModal(transfer)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {!isFromMe && transfer.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptTransfer(transfer.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectTransfer(transfer.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    {isFromMe && transfer.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransfer(transfer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de transferir veículo */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedVehicle(null);
        }}
        title="Transferir Veículo"
        size="md"
      >
        {selectedVehicle && (
          <TransferForm
            vehicle={selectedVehicle}
            onSubmit={handleTransferVehicle}
            onCancel={() => {
              setIsTransferModalOpen(false);
              setSelectedVehicle(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de detalhes da transferência */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTransfer(null);
        }}
        title="Detalhes da Transferência"
        size="lg"
      >
        {selectedTransfer && (
          <TransferDetails
            transfer={selectedTransfer}
            vehicle={vehicles.find(v => v.id === selectedTransfer.vehicleId)}
            fromUser={mockUsers.find(u => u.id === selectedTransfer.fromUserId)}
            toUser={mockUsers.find(u => u.id === selectedTransfer.toUserId)}
            onAccept={() => {
              handleAcceptTransfer(selectedTransfer.id);
              setIsDetailsModalOpen(false);
              setSelectedTransfer(null);
            }}
            onReject={() => {
              handleRejectTransfer(selectedTransfer.id);
              setIsDetailsModalOpen(false);
              setSelectedTransfer(null);
            }}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedTransfer(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Componente do formulário de transferência
interface TransferFormProps {
  vehicle: Vehicle;
  onSubmit: (data: Partial<VehicleTransfer>) => void;
  onCancel: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    toUserId: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      vehicleId: vehicle.id,
      toUserId: formData.toUserId,
      message: formData.message
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informações do veículo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Veículo a ser transferido</h3>
        <div className="flex items-center space-x-3">
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
          <div>
            <p className="font-medium text-gray-900">{vehicle.model}</p>
            <p className="text-sm text-gray-600">{vehicle.plate} • {vehicle.year}</p>
          </div>
        </div>
      </div>

      <Input
        label="Email do novo proprietário"
        name="toUserId"
        type="email"
        value={formData.toUserId}
        onChange={handleChange}
        placeholder="novo.proprietario@email.com"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensagem (opcional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Deixe uma mensagem para o novo proprietário..."
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Confirmação</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Tem certeza que deseja transferir este veículo? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Send className="w-4 h-4 mr-2" />
          Enviar Transferência
        </Button>
      </div>
    </form>
  );
};

// Componente de detalhes da transferência
interface TransferDetailsProps {
  transfer: VehicleTransfer;
  vehicle?: Vehicle;
  fromUser?: User;
  toUser?: User;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const TransferDetails: React.FC<TransferDetailsProps> = ({ 
  transfer, 
  vehicle, 
  fromUser, 
  toUser, 
  onAccept, 
  onReject, 
  onClose 
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      accepted: 'Aceita',
      rejected: 'Rejeitada'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Informações do veículo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Veículo</h3>
        {vehicle ? (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {vehicle.photo ? (
              <img
                src={vehicle.photo}
                alt={vehicle.model}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h4 className="text-lg font-medium text-gray-900">{vehicle.model}</h4>
              <p className="text-gray-600">{vehicle.plate} • {vehicle.year} • {vehicle.color}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Veículo não encontrado</p>
        )}
      </div>

      {/* Informações dos usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Proprietário Atual</h3>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{fromUser?.name || 'Usuário não encontrado'}</p>
              <p className="text-sm text-gray-600">{fromUser?.email}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Novo Proprietário</h3>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{toUser?.name || 'Usuário não encontrado'}</p>
              <p className="text-sm text-gray-600">{toUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status e mensagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
              {getStatusLabel(transfer.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Criado em {formatDate(transfer.createdAt)}
          </p>
          {transfer.completedAt && (
            <p className="text-sm text-gray-600">
              {transfer.status === 'accepted' ? 'Aceito' : 'Rejeitado'} em {formatDate(transfer.completedAt)}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Mensagem</h3>
          {transfer.message ? (
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              "{transfer.message}"
            </p>
          ) : (
            <p className="text-gray-500 italic">Nenhuma mensagem</p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        {transfer.status === 'pending' && (
          <>
            <Button variant="outline" onClick={onReject}>
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
            <Button onClick={onAccept}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Aceitar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleTransferPage;
