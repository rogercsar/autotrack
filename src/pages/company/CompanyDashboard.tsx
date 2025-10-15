import React, { useState, useMemo } from 'react';
import { Company, Appointment } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  Building2, 
  Calendar, 
  Users, 
  Phone,
  Mail,
  MapPin,
  Star,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye
} from 'lucide-react';

const CompanyDashboard: React.FC = () => {
  // Dados mockados da empresa logada
  const [company, setCompany] = useState<Company>({
    id: '1',
    name: 'Auto Center São Paulo',
    type: 'workshop',
    description: 'Oficina especializada em manutenção preventiva e corretiva',
    logo: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=100&h=100&fit=crop',
    phone: '(11) 3333-3333',
    email: 'contato@autocentersp.com.br',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      latitude: -23.5505,
      longitude: -46.6333
    },
    services: ['Troca de óleo', 'Revisão geral', 'Freios', 'Suspensão', 'Ar condicionado'],
    rating: 4.5,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01')
  });

  // Dados mockados de agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      userId: '1',
      companyId: '1',
      vehicleId: '1',
      date: new Date('2023-12-15'),
      time: '09:00',
      service: 'Troca de óleo',
      description: 'Troca de óleo e filtros do motor',
      status: 'pending',
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2023-12-10')
    },
    {
      id: '2',
      userId: '2',
      companyId: '1',
      vehicleId: '2',
      date: new Date('2023-12-16'),
      time: '14:00',
      service: 'Revisão geral',
      description: 'Revisão completa do veículo',
      status: 'confirmed',
      createdAt: new Date('2023-12-11'),
      updatedAt: new Date('2023-12-11')
    },
    {
      id: '3',
      userId: '3',
      companyId: '1',
      vehicleId: '3',
      date: new Date('2023-12-14'),
      time: '10:30',
      service: 'Freios',
      description: 'Troca de pastilhas de freio',
      status: 'completed',
      createdAt: new Date('2023-12-09'),
      updatedAt: new Date('2023-12-14')
    }
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const todayAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      todayAppointments
    };
  }, [appointments]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    const updatedAppointments = appointments.map(a => 
      a.id === appointmentId 
        ? { ...a, status: newStatus as any, updatedAt: new Date() }
        : a
    );
    setAppointments(updatedAppointments);
  };

  const handleUpdateCompany = (companyData: Partial<Company>) => {
    setCompany(prev => ({
      ...prev,
      ...companyData,
      updatedAt: new Date()
    }));
    setIsEditModalOpen(false);
  };

  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel da Empresa</h1>
          <p className="text-gray-600 mt-1">
            Gerencie agendamentos e informações da sua empresa
          </p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      {/* Informações da empresa */}
      <Card>
        <div className="flex items-start space-x-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h2>
            <p className="text-gray-600 mb-4">{company.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {formatPhone(company.phone)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {company.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {company.address.city}, {company.address.state}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar agendamentos..."
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
            <option value="confirmed">Confirmados</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredAppointments.length} agendamentos
          </div>
        </div>
      </Card>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca
              </p>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.service}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {appointment.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(appointment.date)} às {appointment.time}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Cliente #{appointment.userId}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAppointmentModal(appointment)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {appointment.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirmar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de editar empresa */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil da Empresa"
        size="lg"
      >
        <CompanyEditForm
          company={company}
          onSubmit={handleUpdateCompany}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Modal de detalhes do agendamento */}
      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Detalhes do Agendamento"
        size="md"
      >
        {selectedAppointment && (
          <AppointmentDetails
            appointment={selectedAppointment}
            onStatusChange={(newStatus) => {
              handleUpdateAppointmentStatus(selectedAppointment.id, newStatus);
              setIsAppointmentModalOpen(false);
              setSelectedAppointment(null);
            }}
            onClose={() => {
              setIsAppointmentModalOpen(false);
              setSelectedAppointment(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Componente de edição da empresa
interface CompanyEditFormProps {
  company: Company;
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
}

const CompanyEditForm: React.FC<CompanyEditFormProps> = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: company.name,
    description: company.description,
    phone: company.phone,
    email: company.email,
    street: company.address.street,
    number: company.address.number,
    neighborhood: company.address.neighborhood,
    city: company.address.city,
    state: company.address.state,
    zipCode: company.address.zipCode,
    logo: company.logo || ''
  });

  const [services, setServices] = useState(company.services);
  const [newService, setNewService] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      address: {
        ...company.address,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      logo: formData.logo,
      services: services
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices(prev => [...prev, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome da Empresa"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Telefone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="URL do Logo"
          name="logo"
          value={formData.logo}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Rua"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
          />
          <Input
            label="Número"
            name="number"
            value={formData.number}
            onChange={handleChange}
            required
          />
          <Input
            label="Bairro"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            required
          />
          <Input
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            label="CEP"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Serviços</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Adicionar serviço"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
            />
            <Button type="button" onClick={handleAddService}>
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                {service}
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

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

// Componente de detalhes do agendamento
interface AppointmentDetailsProps {
  appointment: Appointment;
  onStatusChange: (status: string) => void;
  onClose: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ appointment, onStatusChange, onClose }) => {
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
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Agendamento</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Serviço</p>
              <p className="text-gray-900">{appointment.service}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Descrição</p>
              <p className="text-gray-900">{appointment.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Data e Hora</p>
              <p className="text-gray-900">{formatDate(appointment.date)} às {appointment.time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">ID do Cliente</p>
              <p className="text-gray-900">#{appointment.userId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ID do Veículo</p>
              <p className="text-gray-900">#{appointment.vehicleId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Solicitado em</p>
              <p className="text-gray-900">{formatDate(appointment.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        {appointment.status === 'pending' && (
          <>
            <Button
              variant="outline"
              onClick={() => onStatusChange('cancelled')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={() => onStatusChange('confirmed')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </>
        )}
        {appointment.status === 'confirmed' && (
          <Button onClick={() => onStatusChange('completed')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Concluído
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
