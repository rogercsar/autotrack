import React, { useState, useMemo } from 'react';
import { mockCompanies } from '../data/mockData';
import { Company } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  MapPin, 
  Search, 
  Phone,
  Mail,
  Star,
  Navigation,
  Calendar,
  MessageCircle,
  Clock,
  Wrench,
  Car,
  Map,
  List
} from 'lucide-react';

const Workshops: React.FC = () => {
  const [companies] = useState<Company[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'workshop' | 'dealership'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Filtrar e ordenar empresas
  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || company.type === selectedType;
      return matchesSearch && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
        default:
          // Simular distância baseada na localização
          return 0;
      }
    });

    return filtered;
  }, [companies, searchTerm, selectedType, sortBy]);

  // formatPhone definido e usado em CompanyDetails

  const getCompanyTypeLabel = (type: string) => {
    return type === 'workshop' ? 'Oficina' : 'Concessionária';
  };

  const getCompanyTypeColor = (type: string) => {
    return type === 'workshop' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getCompanyTypeIcon = (type: string) => {
    return type === 'workshop' ? <Wrench className="w-4 h-4" /> : <Car className="w-4 h-4" />;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // Fallback para São Paulo
          setUserLocation({
            latitude: -23.5505,
            longitude: -46.6333
          });
        }
      );
    }
  };

  const openDetailsModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  const openAppointmentModal = (company: Company) => {
    setSelectedCompany(company);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oficinas e Concessionárias</h1>
          <p className="text-gray-600 mt-1">
            Encontre oficinas e concessionárias próximas a você
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          >
            {viewMode === 'list' ? <Map className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
            {viewMode === 'list' ? 'Mapa' : 'Lista'}
          </Button>
          <Button variant="outline" onClick={handleGetLocation}>
            <Navigation className="w-4 h-4 mr-2" />
            Minha Localização
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar oficinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | 'workshop' | 'dealership')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="workshop">Oficinas</option>
            <option value="dealership">Concessionárias</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="distance">Mais próximas</option>
            <option value="rating">Melhor avaliadas</option>
            <option value="name">Nome A-Z</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {userLocation ? 'Localização obtida' : 'Localização não disponível'}
          </div>
        </div>
      </Card>

      {/* Lista de empresas */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Logo da empresa */}
                  <div className="flex-shrink-0">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {getCompanyTypeIcon(company.type)}
                      </div>
                    )}
                  </div>

                  {/* Informações da empresa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompanyTypeColor(company.type)}`}>
                            {getCompanyTypeLabel(company.type)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {company.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {company.address.city}, {company.address.state}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {company.rating.toFixed(1)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Aberto agora
                          </div>
                        </div>

                        {/* Serviços */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {company.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {service}
                            </span>
                          ))}
                          {company.services.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              +{company.services.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsModal(company)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAppointmentModal(company)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${company.phone}`)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/55${company.phone.replace(/\D/g, '')}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Mapa simulado */
        <Card>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mapa Interativo
              </h3>
              <p className="text-gray-500 mb-4">
                Integração com Google Maps ou OpenStreetMap
              </p>
              <Button variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Ativar Localização
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal de detalhes da empresa */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCompany(null);
        }}
        title={selectedCompany?.name}
        size="lg"
      >
        {selectedCompany && (
          <CompanyDetails
            company={selectedCompany}
            onAppointment={() => {
              setIsDetailsModalOpen(false);
              openAppointmentModal(selectedCompany);
            }}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedCompany(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de agendamento */}
      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedCompany(null);
        }}
        title={`Agendar - ${selectedCompany?.name}`}
        size="md"
      >
        {selectedCompany && (
          <AppointmentForm
            company={selectedCompany}
            onSubmit={() => {
              setIsAppointmentModalOpen(false);
              setSelectedCompany(null);
            }}
            onCancel={() => {
              setIsAppointmentModalOpen(false);
              setSelectedCompany(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Componente de detalhes da empresa
interface CompanyDetailsProps {
  company: Company;
  onAppointment: () => void;
  onClose: () => void;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, onAppointment, onClose }) => {
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const getCompanyTypeLabel = (type: string) => {
    return type === 'workshop' ? 'Oficina' : 'Concessionária';
  };

  const getCompanyTypeColor = (type: string) => {
    return type === 'workshop' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header da empresa */}
      <div className="flex items-start space-x-4">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🏢</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompanyTypeColor(company.type)}`}>
              {getCompanyTypeLabel(company.type)}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {company.rating.toFixed(1)} (4.5/5)
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Aberto agora
            </div>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre</h3>
        <p className="text-gray-700">{company.description}</p>
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contato</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-500 mr-3" />
              <a
                href={`tel:${company.phone}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {formatPhone(company.phone)}
              </a>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-500 mr-3" />
              <a
                href={`mailto:${company.email}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {company.email}
              </a>
            </div>
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-1" />
              <div>
                <p className="text-gray-900">
                  {company.address.street}, {company.address.number}
                </p>
                <p className="text-gray-600">
                  {company.address.neighborhood}, {company.address.city} - {company.address.state}
                </p>
                <p className="text-gray-600">
                  CEP: {company.address.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Serviços</h3>
          <div className="grid grid-cols-2 gap-2">
            {company.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={onAppointment}>
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Serviço
        </Button>
      </div>
    </div>
  );
};

// Componente de formulário de agendamento
interface AppointmentFormProps {
  company: Company;
  onSubmit: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    service: '',
    description: '',
    vehicle: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria enviado para o backend
    alert('Agendamento solicitado com sucesso!');
    onSubmit();
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
        <Input
          label="Data"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <Input
          label="Horário"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Serviço
        </label>
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          <option value="">Selecione um serviço</option>
          {company.services.map((service, index) => (
            <option key={index} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Veículo (opcional)"
        name="vehicle"
        value={formData.vehicle}
        onChange={handleChange}
        placeholder="Ex: Honda Civic - ABC-1234"
      />

      <Input
        label="Telefone para contato"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição do problema/serviço
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Descreva o que precisa ser feito..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Calendar className="w-4 h-4 mr-2" />
          Solicitar Agendamento
        </Button>
      </div>
    </form>
  );
};

export default Workshops;
