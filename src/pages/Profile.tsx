import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { UserType, User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import { 
  User as UserIcon, 
  Edit, 
  Save, 
  Mail,
  Phone,
  Shield,
  Crown,
  Star,
  Calendar,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  if (!user) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getUserTypeLabel = (userType: UserType) => {
    const types: Record<UserType, string> = {
      basic: 'Básico',
      advanced: 'Avançado',
      pro: 'Pro',
      admin: 'Admin'
    };
    return types[userType] || userType;
  };

  const getUserTypeColor = (userType: UserType) => {
    const colors: Record<UserType, string> = {
      basic: 'bg-gray-100 text-gray-800',
      advanced: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case UserType.BASIC:
        return <UserIcon className="w-4 h-4" />;
      case UserType.ADVANCED:
        return <Star className="w-4 h-4" />;
      case UserType.PRO:
        return <Crown className="w-4 h-4" />;
      case UserType.ADMIN:
        return <Shield className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const handleUpdateProfile = (profileData: Partial<User> & { avatarFile?: File | null }) => {
    // Aqui seria implementada a lógica de atualização do perfil
    console.log('Atualizando perfil:', profileData);
    setIsEditModalOpen(false);
  };

  const handleChangePassword = (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    // Aqui seria implementada a lógica de alteração de senha
    console.log('Alterando senha:', passwordData);
    setIsPasswordModalOpen(false);
  };

  const handleUpdateNotifications = (notificationData: any) => {
    // Aqui seria implementada a lógica de atualização das notificações
    console.log('Atualizando notificações:', notificationData);
    setIsNotificationsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      {/* Informações do usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto e informações básicas */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start space-x-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user.userType)}`}>
                    {getUserTypeIcon(user.userType)}
                    <span className="ml-1">{getUserTypeLabel(user.userType)}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-gray-600">Telefone</p>
                        <p className="font-semibold text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.emergencyContact && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-gray-600">Contato de Emergência</p>
                        <p className="font-semibold text-gray-900">{user.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Membro desde {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsNotificationsModalOpen(true)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notificações
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {/* Implementar upgrade de plano */}}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade de Plano
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plano Atual</h3>
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getUserTypeColor(user.userType)} mb-3`}>
                {getUserTypeIcon(user.userType)}
                <span className="ml-2">{getUserTypeLabel(user.userType)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {user.userType === UserType.BASIC && 'Plano gratuito com funcionalidades básicas'}
                {user.userType === UserType.ADVANCED && 'Plano avançado com recursos extras'}
                {user.userType === UserType.PRO && 'Plano profissional com todos os recursos'}
                {user.userType === UserType.ADMIN && 'Acesso administrativo completo'}
              </p>
              {user.userType !== UserType.PRO && user.userType !== UserType.ADMIN && (
                <Button size="sm">
                  Fazer Upgrade
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de editar perfil */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil"
        size="md"
      >
        <ProfileEditForm
          user={user}
          onSubmit={handleUpdateProfile}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Modal de alterar senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha"
        size="sm"
      >
        <PasswordChangeForm
          onSubmit={handleChangePassword}
          onCancel={() => setIsPasswordModalOpen(false)}
        />
      </Modal>

      {/* Modal de notificações */}
      <Modal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        title="Configurações de Notificação"
        size="md"
      >
        <NotificationSettingsForm
          onSubmit={handleUpdateNotifications}
          onCancel={() => setIsNotificationsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Componente de edição do perfil
interface ProfileEditFormProps {
  user: User;
  onSubmit: (data: Partial<User> & { avatarFile?: File | null }) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    emergencyContact: user.emergencyContact || '',
    avatar: user.avatar || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, avatarFile });
  };

  const handleAvatarChange = (file: File | null, previewUrl?: string) => {
    setAvatarFile(file);
    if (previewUrl) {
      setFormData(prev => ({ ...prev, avatar: previewUrl }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome completo"
        name="name"
        value={formData.name}
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
        label="Telefone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
      />

      <Input
        label="Contato de Emergência"
        name="emergencyContact"
        value={formData.emergencyContact}
        onChange={handleChange}
        placeholder="(11) 88888-8888"
      />

      <ImageUpload
        label="Foto do Perfil"
        value={formData.avatar}
        onChange={handleAvatarChange}
        accept="image/*"
        maxSize={5}
        helperText="Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

// Componente de alteração de senha
interface PasswordChangeFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  onCancel: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha Atual
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('current')}
          >
            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('new')}
          >
            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Nova Senha
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => togglePasswordVisibility('confirm')}
          >
            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Lock className="w-4 h-4 mr-2" />
          Alterar Senha
        </Button>
      </div>
    </form>
  );
};

// Componente de configurações de notificação
interface NotificationSettingsFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({ onSubmit, onCancel }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    expenseAlerts: true,
    maintenanceReminders: true,
    groupUpdates: true,
    emergencyAlerts: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(settings);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
            <p className="text-sm text-gray-500">Receber notificações por email</p>
          </div>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
            <p className="text-sm text-gray-500">Receber notificações no navegador</p>
          </div>
          <input
            type="checkbox"
            name="pushNotifications"
            checked={settings.pushNotifications}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Alertas de Despesas</h4>
            <p className="text-sm text-gray-500">Notificar sobre despesas altas</p>
          </div>
          <input
            type="checkbox"
            name="expenseAlerts"
            checked={settings.expenseAlerts}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Lembretes de Manutenção</h4>
            <p className="text-sm text-gray-500">Lembrar sobre manutenções programadas</p>
          </div>
          <input
            type="checkbox"
            name="maintenanceReminders"
            checked={settings.maintenanceReminders}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Atualizações de Grupo</h4>
            <p className="text-sm text-gray-500">Notificar sobre mudanças nos grupos</p>
          </div>
          <input
            type="checkbox"
            name="groupUpdates"
            checked={settings.groupUpdates}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Alertas de Emergência</h4>
            <p className="text-sm text-gray-500">Notificar sobre alertas de emergência</p>
          </div>
          <input
            type="checkbox"
            name="emergencyAlerts"
            checked={settings.emergencyAlerts}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Bell className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
};

export default Profile;
