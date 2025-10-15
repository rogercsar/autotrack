import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGroups, getUserVehicles, mockUsers } from '../data/mockData';
import { Group, GroupMember, UserType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  UserMinus,
  Share2,
  Car,
  Mail,
  Phone,
  Crown,
  Shield
} from 'lucide-react';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>(getUserGroups(user?.id || ''));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const vehicles = getUserVehicles(user?.id || '');

  // Filtrar grupos
  const filteredGroups = useMemo(() => {
    return groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Verificar limites do usuário
  const getUserLimits = () => {
    if (!user) return { maxGroups: 0, maxMembersPerGroup: 0 };
    
    switch (user.userType) {
      case UserType.BASIC:
        return { maxGroups: 1, maxMembersPerGroup: 2 };
      case UserType.ADVANCED:
        return { maxGroups: 3, maxMembersPerGroup: 5 };
      case UserType.PRO:
        return { maxGroups: Infinity, maxMembersPerGroup: Infinity };
      default:
        return { maxGroups: 0, maxMembersPerGroup: 0 };
    }
  };

  const limits = getUserLimits();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleAddGroup = (groupData: Partial<Group>) => {
    if (groups.length >= limits.maxGroups) {
      alert(`Você atingiu o limite de ${limits.maxGroups} grupos para seu plano.`);
      return;
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupData.name || '',
      description: groupData.description,
      ownerId: user?.id || '',
      members: [{
        id: Date.now().toString(),
        userId: user?.id || '',
        groupId: '',
        role: 'owner',
        joinedAt: new Date()
      }],
      vehicleIds: groupData.vehicleIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Atualizar o groupId do membro owner
    newGroup.members[0].groupId = newGroup.id;

    setGroups([...groups, newGroup]);
    setIsAddModalOpen(false);
  };

  const handleEditGroup = (groupData: Partial<Group>) => {
    if (!editingGroup) return;

    const updatedGroups = groups.map(g => 
      g.id === editingGroup.id 
        ? { ...g, ...groupData, updatedAt: new Date() }
        : g
    );

    setGroups(updatedGroups);
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  const handleAddMember = (groupId: string, userEmail: string) => {
    const foundUser = mockUsers.find(u => u.email === userEmail);
    if (!foundUser) {
      alert('Usuário não encontrado com este email.');
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (group.members.length >= limits.maxMembersPerGroup) {
      alert(`Você atingiu o limite de ${limits.maxMembersPerGroup} membros para seu plano.`);
      return;
    }

    if (group.members.some(m => m.userId === foundUser.id)) {
      alert('Este usuário já é membro do grupo.');
      return;
    }

    const newMember: GroupMember = {
      id: Date.now().toString(),
      userId: foundUser.id,
      groupId: groupId,
      role: 'member',
      joinedAt: new Date()
    };

    const updatedGroups = groups.map(g => 
      g.id === groupId 
        ? { ...g, members: [...g.members, newMember], updatedAt: new Date() }
        : g
    );

    setGroups(updatedGroups);
    setIsMemberModalOpen(false);
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro?')) {
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              members: g.members.filter(m => m.id !== memberId),
              updatedAt: new Date()
            }
          : g
      );

      setGroups(updatedGroups);
    }
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const openMemberModal = (group: Group) => {
    setSelectedGroup(group);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
          <p className="text-gray-600 mt-1">
            Crie grupos para compartilhar informações dos seus veículos
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Limite: {groups.length}/{limits.maxGroups === Infinity ? '∞' : limits.maxGroups} grupos
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          disabled={groups.length >= limits.maxGroups}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Grupo
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </Card>

      {/* Lista de grupos */}
      {filteredGroups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo criado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro grupo para compartilhar informações'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Grupo
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => {
            const isOwner = group.ownerId === user?.id;
            const memberCount = group.members.length;
            const vehicleCount = group.vehicleIds.length;

            return (
              <Card key={group.id} className="overflow-hidden">
                {/* Header do grupo */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.name}
                        </h3>
                        {isOwner && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {isOwner && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(group)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estatísticas do grupo */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Membros</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {memberCount}/{limits.maxMembersPerGroup === Infinity ? '∞' : limits.maxMembersPerGroup}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                        <Car className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Veículos</p>
                      <p className="text-lg font-semibold text-gray-900">{vehicleCount}</p>
                    </div>
                  </div>

                  {/* Lista de membros */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Membros</h4>
                    <div className="space-y-1">
                      {group.members.slice(0, 3).map((member) => {
                        const memberUser = mockUsers.find(u => u.id === member.userId);
                        return (
                          <div key={member.id} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {memberUser?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900 flex-1">
                              {memberUser?.name || 'Usuário desconhecido'}
                            </span>
                            {member.role === 'owner' && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                            {isOwner && member.role !== 'owner' && (
                              <button
                                onClick={() => handleRemoveMember(group.id, member.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {group.members.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{group.members.length - 3} outros membros
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2">
                    {isOwner && memberCount < limits.maxMembersPerGroup && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMemberModal(group)}
                        className="flex-1"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Membro
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Criado em {formatDate(group.createdAt)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de criar/editar grupo */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingGroup(null);
        }}
        title={isAddModalOpen ? "Criar Grupo" : "Editar Grupo"}
        size="md"
      >
        <GroupForm
          group={editingGroup}
          vehicles={vehicles}
          onSubmit={isAddModalOpen ? handleAddGroup : handleEditGroup}
          onCancel={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingGroup(null);
          }}
        />
      </Modal>

      {/* Modal de adicionar membro */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedGroup(null);
        }}
        title="Adicionar Membro"
        size="sm"
      >
        <AddMemberForm
          group={selectedGroup}
          onSubmit={(userEmail) => {
            if (selectedGroup) {
              handleAddMember(selectedGroup.id, userEmail);
            }
          }}
          onCancel={() => {
            setIsMemberModalOpen(false);
            setSelectedGroup(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Componente do formulário de grupo
interface GroupFormProps {
  group?: Group | null;
  vehicles: any[];
  onSubmit: (data: Partial<Group> & { groupImage?: File | null }) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ group, vehicles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    vehicleIds: group?.vehicleIds || []
  });
  const [groupImage, setGroupImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, groupImage });
  };

  const handleImageChange = (file: File | null) => {
    setGroupImage(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleToggle = (vehicleId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleIds: prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter(id => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do Grupo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ex: Família Silva"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Descreva o propósito deste grupo..."
        />
      </div>

      <ImageUpload
        label="Foto do Grupo (opcional)"
        onChange={handleImageChange}
        accept="image/*"
        maxSize={5}
        helperText="Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Veículos a compartilhar
        </label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {vehicles.map(vehicle => (
            <label key={vehicle.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.vehicleIds.includes(vehicle.id)}
                onChange={() => handleVehicleToggle(vehicle.id)}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-700">
                {vehicle.model} - {vehicle.plate}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {group ? 'Salvar Alterações' : 'Criar Grupo'}
        </Button>
      </div>
    </form>
  );
};

// Componente do formulário de adicionar membro
interface AddMemberFormProps {
  group: Group | null;
  onSubmit: (userEmail: string) => void;
  onCancel: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ group, onSubmit, onCancel }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email do usuário
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@email.com"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          O usuário deve ter uma conta no AutoTrack
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar Membro
        </Button>
      </div>
    </form>
  );
};

export default Groups;
