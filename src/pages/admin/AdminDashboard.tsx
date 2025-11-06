import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { mockUsers, mockCompanies, mockVehicles, mockExpenses } from '../../data/mockData';
import { UserType, Company } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { 
  Users, 
  Building2, 
  Car, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Star
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'workshop' | 'dealership'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtrar empresas
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || company.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && company.isActive) ||
                           (selectedStatus === 'inactive' && !company.isActive);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [companies, searchTerm, selectedType, selectedStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalUsers = mockUsers.length;
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.isActive).length;
    const totalVehicles = mockVehicles.length;
    const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyRevenue = totalExpenses * 0.1; // 10% de comissão

    return {
      totalUsers,
      totalCompanies,
      activeCompanies,
      totalVehicles,
      totalExpenses,
      monthlyRevenue
    };
  }, [companies]);

  // Verificar se o usuário é admin
  if (user?.userType !== UserType.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta área.
            </p>
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

  const handleAddCompany = (companyData: Partial<Company>) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyData.name || '',
      type: companyData.type || 'workshop',
      description: companyData.description || '',
      logo: companyData.logo,
      phone: companyData.phone || '',
      email: companyData.email || '',
      address: companyData.address || {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        latitude: 0,
        longitude: 0
      },
      services: companyData.services || [],
      rating: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCompanies([...companies, newCompany]);
    setIsAddCompanyModalOpen(false);
  };

  const handleEditCompany = (companyData: Partial<Company>) => {
    if (!editingCompany) return;

    const updatedCompanies = companies.map(c => 
      c.id === editingCompany.id 
        ? { ...c, ...companyData, updatedAt: new Date() }
        : c
    );

    setCompanies(updatedCompanies);
    setIsEditCompanyModalOpen(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      setCompanies(companies.filter(c => c.id !== companyId));
    }
  };

  const handleToggleCompanyStatus = (companyId: string) => {
    const updatedCompanies = companies.map(c => 
      c.id === companyId 
        ? { ...c, isActive: !c.isActive, updatedAt: new Date() }
        : c
    );
    setCompanies(updatedCompanies);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setIsEditCompanyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Gerencie empresas, usuários e monitore a plataforma
          </p>
        </div>
        <Button onClick={() => setIsAddCompanyModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Empresa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeCompanies}/{stats.totalCompanies}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Car className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Veículos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.monthlyRevenue)}
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
              placeholder="Buscar empresas..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredCompanies.length} empresas
          </div>
        </div>
      </Card>

      {/* Lista de empresas */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                      <Building2 className="w-8 h-8 text-gray-400" />
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          company.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.isActive ? 'Ativa' : 'Inativa'}
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
                          <Phone className="w-4 h-4 mr-1" />
                          {formatPhone(company.phone)}
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
                      onClick={() => openEditModal(company)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCompanyStatus(company.id)}
                    >
                      {company.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de adicionar/editar empresa */}
      <Modal
        isOpen={isAddCompanyModalOpen || isEditCompanyModalOpen}
        onClose={() => {
          setIsAddCompanyModalOpen(false);
          setIsEditCompanyModalOpen(false);
          setEditingCompany(null);
        }}
        title={isAddCompanyModalOpen ? "Adicionar Empresa" : "Editar Empresa"}
        size="lg"
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={isAddCompanyModalOpen ? handleAddCompany : handleEditCompany}
          onCancel={() => {
            setIsAddCompanyModalOpen(false);
            setIsEditCompanyModalOpen(false);
            setEditingCompany(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Componente do formulário de empresa
interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    type: company?.type || 'workshop',
    description: company?.description || '',
    logo: company?.logo || '',
    phone: company?.phone || '',
    email: company?.email || '',
    street: company?.address?.street || '',
    number: company?.address?.number || '',
    neighborhood: company?.address?.neighborhood || '',
    city: company?.address?.city || '',
    state: company?.address?.state || '',
    zipCode: company?.address?.zipCode || '',
    latitude: company?.address?.latitude || 0,
    longitude: company?.address?.longitude || 0,
    services: company?.services || [],
    rating: company?.rating || 0,
    isActive: company?.isActive ?? true
  });

  const [newService, setNewService] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: formData.type,
      description: formData.description,
      logo: formData.logo,
      phone: formData.phone,
      email: formData.email,
      address: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude,
        longitude: formData.longitude
      },
      services: formData.services,
      rating: formData.rating,
      isActive: formData.isActive
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome da Empresa"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Auto Center São Paulo"
          required
        />

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
            <option value="workshop">Oficina</option>
            <option value="dealership">Concessionária</option>
          </select>
        </div>

        <Input
          label="Telefone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(11) 3333-3333"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contato@empresa.com"
          required
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
          placeholder="Descreva os serviços oferecidos..."
          required
        />
      </div>

      <Input
        label="URL do Logo (opcional)"
        name="logo"
        value={formData.logo}
        onChange={handleChange}
        placeholder="https://exemplo.com/logo.jpg"
      />

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Rua"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Rua das Flores"
            required
          />
          <Input
            label="Número"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="123"
            required
          />
          <Input
            label="Bairro"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            placeholder="Vila Madalena"
            required
          />
          <Input
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="São Paulo"
            required
          />
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="SP"
            required
          />
          <Input
            label="CEP"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="01234-567"
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
            {formData.services.map((service, index) => (
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
          {company ? 'Salvar Alterações' : 'Adicionar Empresa'}
        </Button>
      </div>
    </form>
  );
};

export default AdminDashboard;
