import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVehiclesByOwner } from '../services/vehicleService';
import { getGroupsByUser } from '../services/groupService';
import { getAlertsByUser, createAlert, resolveAlert, deleteAlert } from '../services/alertsService';
import { EmergencyAlert, AlertType, Vehicle, Group } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  AlertTriangle, 
  Plus, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Navigation,
  Send
} from 'lucide-react';

const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) {
        if (active) {
          setVehicles([]);
          setAlerts([]);
          setGroups([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [vs, gs, as] = await Promise.all([
          getVehiclesByOwner(user.id),
          getGroupsByUser(user.id),
          getAlertsByUser(user.id),
        ]);
        if (!active) return;
        setVehicles(vs);
        setGroups(gs);
        setAlerts(as);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar alertas');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  // Filtrar alertas
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => alert.userId === user?.id);
    
    switch (filter) {
      case 'active':
        return filtered.filter(alert => alert.isActive);
      case 'resolved':
        return filtered.filter(alert => !alert.isActive);
      default:
        return filtered;
    }
  }, [alerts, user?.id, filter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getAlertTypeLabel = (type: AlertType) => {
    const types: Record<AlertType, string> = {
      flat_tire: 'Pneu Furado',
      mechanical_problem: 'Problema Mecânico',
      accident: 'Acidente',
      breakdown: 'Pane',
      other: 'Outro'
    };
    return types[type] || type;
  };

  const getAlertTypeColor = (type: AlertType) => {
    const colors: Record<AlertType, string> = {
      flat_tire: 'bg-yellow-100 text-yellow-800',
      mechanical_problem: 'bg-orange-100 text-orange-800',
      accident: 'bg-red-100 text-red-800',
      breakdown: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.FLAT_TIRE:
        return '🚗💥';
      case AlertType.MECHANICAL_PROBLEM:
        return '🔧';
      case AlertType.ACCIDENT:
        return '🚨';
      case AlertType.BREAKDOWN:
        return '⚡';
      default:
        return '⚠️';
    }
  };

  const handleCreateAlert = async (alertData: Partial<EmergencyAlert>) => {
    try {
      const payload = {
        userId: user?.id || '',
        vehicleId: alertData.vehicleId || '',
        type: alertData.type || AlertType.OTHER,
        description: alertData.description || '',
        location: alertData.location || {
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'Localização não disponível'
        },
        isActive: true,
      } as Omit<EmergencyAlert, 'id' | 'createdAt' | 'resolvedAt' | 'sentTo'>;
      const { alert, error } = await createAlert(payload);
      if (error || !alert) {
        setError(error?.message || 'Falha ao criar alerta');
        return;
      }
      setAlerts([...alerts, alert]);
      setIsCreateModalOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao criar alerta');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { alert, error } = await resolveAlert(alertId);
      if (error || !alert) {
        setError(error?.message || 'Falha ao resolver alerta');
        return;
      }
      setAlerts(alerts.map(a => a.id === alertId ? alert : a));
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao resolver alerta');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este alerta?')) return;
    try {
      const { error } = await deleteAlert(alertId);
      if (error) {
        setError(error.message || 'Falha ao excluir alerta');
        return;
      }
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado ao excluir alerta');
    }
  };

  const openDetailsModal = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
    setIsDetailsModalOpen(true);
  };

  // Simular obtenção de localização atual
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address: string }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Localização atual'
            });
          },
          () => {
            // Fallback para São Paulo se não conseguir obter localização
            resolve({
              latitude: -23.5505,
              longitude: -46.6333,
              address: 'São Paulo, SP (localização aproximada)'
            });
          }
        );
      } else {
        resolve({
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'São Paulo, SP (localização não disponível)'
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas de Emergência</h1>
          <p className="text-gray-600 mt-1">
            Gerencie alertas de emergência e notifique seus contatos
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Alerta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.userId === user?.id && a.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolvidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.userId === user?.id && !a.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contatos</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + group.members.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolvidos
          </button>
        </div>
      </Card>

      {/* Lista de alertas */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Carregando...</p>
          </div>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Nenhum alerta criado' : 'Nenhum alerta encontrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Crie seu primeiro alerta de emergência'
                : 'Ajuste os filtros para ver mais alertas'
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Alerta
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const vehicle = vehicles.find(v => v.id === alert.vehicleId);
            return (
              <Card key={alert.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          alert.isActive 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.isActive ? 'Ativo' : 'Resolvido'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        {alert.description}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {vehicle?.model} • {vehicle?.plate}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {alert.location.address}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailsModal(alert)}
                    >
                      Ver Detalhes
                    </Button>
                    {alert.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de criar alerta */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Alerta de Emergência"
        size="md"
      >
        <AlertForm
          vehicles={vehicles}
          onSubmit={handleCreateAlert}
          onCancel={() => setIsCreateModalOpen(false)}
          getCurrentLocation={getCurrentLocation}
        />
      </Modal>

      {/* Modal de detalhes do alerta */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAlert(null);
        }}
        title="Detalhes do Alerta"
        size="lg"
      >
        {selectedAlert && (
          <AlertDetails
            alert={selectedAlert}
            vehicle={vehicles.find(v => v.id === selectedAlert.vehicleId)}
            onResolve={() => {
              handleResolveAlert(selectedAlert.id);
              setIsDetailsModalOpen(false);
              setSelectedAlert(null);
            }}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedAlert(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Componente do formulário de alerta
interface AlertFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: Partial<EmergencyAlert>) => void;
  onCancel: () => void;
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number; address: string }>;
}

const AlertForm: React.FC<AlertFormProps> = ({ vehicles, onSubmit, onCancel, getCurrentLocation }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: AlertType.OTHER,
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    }
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGettingLocation) {
      setIsGettingLocation(true);
      try {
        const location = await getCurrentLocation();
        setFormData(prev => ({ ...prev, location }));
      } catch (error) {
        console.error('Erro ao obter localização:', error);
      } finally {
        setIsGettingLocation(false);
      }
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({ ...prev, location }));
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          Tipo de Emergência
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          {Object.values(AlertType).map(type => (
            <option key={type} value={type}>
              {type === 'flat_tire' && 'Pneu Furado'}
              {type === 'mechanical_problem' && 'Problema Mecânico'}
              {type === 'accident' && 'Acidente'}
              {type === 'breakdown' && 'Pane'}
              {type === 'other' && 'Outro'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição da Emergência
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Descreva o que aconteceu e o que você precisa..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Localização
        </label>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            isLoading={isGettingLocation}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Obter Localização Atual
          </Button>
          {formData.location.address && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <MapPin className="w-4 h-4 inline mr-1" />
                {formData.location.address}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Aviso Importante</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Este alerta será enviado para todos os membros dos seus grupos e contato de emergência.
              Use apenas em situações reais de emergência.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger">
          <Send className="w-4 h-4 mr-2" />
          Enviar Alerta
        </Button>
      </div>
    </form>
  );
};

// Componente de detalhes do alerta
interface AlertDetailsProps {
  alert: EmergencyAlert;
  vehicle?: Vehicle;
  onResolve: () => void;
  onClose: () => void;
}

const AlertDetails: React.FC<AlertDetailsProps> = ({ alert, vehicle, onResolve, onClose }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getAlertTypeLabel = (type: AlertType) => {
    const types: Record<AlertType, string> = {
      flat_tire: 'Pneu Furado',
      mechanical_problem: 'Problema Mecânico',
      accident: 'Acidente',
      breakdown: 'Pane',
      other: 'Outro'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Informações do alerta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Alerta</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Tipo</p>
              <p className="text-lg text-gray-900">{getAlertTypeLabel(alert.type)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Descrição</p>
              <p className="text-gray-900">{alert.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                alert.isActive 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {alert.isActive ? 'Ativo' : 'Resolvido'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Criado em</p>
              <p className="text-gray-900">{formatDate(alert.createdAt)}</p>
            </div>
            {alert.resolvedAt && (
              <div>
                <p className="text-sm font-medium text-gray-600">Resolvido em</p>
                <p className="text-gray-900">{formatDate(alert.resolvedAt)}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
          {vehicle ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Modelo</p>
                <p className="text-lg text-gray-900">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Placa</p>
                <p className="text-gray-900">{vehicle.plate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ano</p>
                <p className="text-gray-900">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cor</p>
                <p className="text-gray-900">{vehicle.color}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Veículo não encontrado</p>
          )}
        </Card>
      </div>

      {/* Localização */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Endereço</p>
            <p className="text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {alert.location.address}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Latitude</p>
              <p className="text-gray-900">{alert.location.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Longitude</p>
              <p className="text-gray-900">{alert.location.longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        {alert.isActive && (
          <Button onClick={onResolve}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Resolvido
          </Button>
        )}
      </div>
    </div>
  );
};

export default Alerts;
