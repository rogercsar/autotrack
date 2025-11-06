import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import {
  Bell,
  Shield,
  Palette,
  Database,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  RefreshCw,
} from 'lucide-react'

const Settings: React.FC = () => {
  const { user } = useAuthStore()
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isDataModalOpen, setIsDataModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  if (!user) return null

  const settingsCategories = [
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Configure como você recebe notificações',
      icon: Bell,
      color: 'bg-blue-100 text-blue-600',
      onClick: () => setIsNotificationModalOpen(true),
    },
    {
      id: 'privacy',
      title: 'Privacidade e Segurança',
      description: 'Gerencie sua privacidade e configurações de segurança',
      icon: Shield,
      color: 'bg-green-100 text-green-600',
      onClick: () => setIsPrivacyModalOpen(true),
    },
    {
      id: 'appearance',
      title: 'Aparência',
      description: 'Personalize a aparência da aplicação',
      icon: Palette,
      color: 'bg-purple-100 text-purple-600',
      onClick: () => setIsThemeModalOpen(true),
    },
    {
      id: 'data',
      title: 'Dados e Backup',
      description: 'Gerencie seus dados e backups',
      icon: Database,
      color: 'bg-orange-100 text-orange-600',
      onClick: () => setIsDataModalOpen(true),
    },
  ]

  const handleExportData = () => {
    // Implementar exportação de dados
    console.log('Exportando dados...')
  }

  const handleImportData = () => {
    // Implementar importação de dados
    console.log('Importando dados...')
  }

  const handleDeleteAccount = () => {
    // Implementar exclusão de conta
    console.log('Excluindo conta...')
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas preferências e configurações da aplicação
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>

      {/* Categorias de configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={category.onClick}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Configurações avançadas */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Configurações Avançadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={handleImportData}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </Button>
          <Button
            variant="outline"
            className="justify-start text-red-600 hover:text-red-700"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Conta
          </Button>
        </div>
      </Card>

      {/* Informações da conta */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Informações da Conta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tipo de Usuário</p>
            <p className="font-semibold text-gray-900">
              {user.userType === UserType.BASIC && 'Básico'}
              {user.userType === UserType.ADVANCED && 'Avançado'}
              {user.userType === UserType.PRO && 'Pro'}
              {user.userType === UserType.ADMIN && 'Admin'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Membro desde</p>
            <p className="font-semibold text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Última atualização</p>
            <p className="font-semibold text-gray-900">
              {new Date(user.updatedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ativo
            </span>
          </div>
        </div>
      </Card>

      {/* Modal de notificações */}
      <Modal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title="Configurações de Notificação"
        size="lg"
      >
        <NotificationSettings
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </Modal>

      {/* Modal de privacidade */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privacidade e Segurança"
        size="lg"
      >
        <PrivacySettings onClose={() => setIsPrivacyModalOpen(false)} />
      </Modal>

      {/* Modal de tema */}
      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Aparência"
        size="md"
      >
        <ThemeSettings onClose={() => setIsThemeModalOpen(false)} />
      </Modal>

      {/* Modal de dados */}
      <Modal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        title="Dados e Backup"
        size="lg"
      >
        <DataSettings onClose={() => setIsDataModalOpen(false)} />
      </Modal>

      {/* Modal de exclusão de conta */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Conta"
        size="md"
      >
        <DeleteAccountForm
          onConfirm={handleDeleteAccount}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

// Componente de configurações de notificação
interface NotificationSettingsProps {
  onClose: () => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onClose,
}) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    expenseAlerts: true,
    maintenanceReminders: true,
    groupUpdates: true,
    emergencyAlerts: true,
    marketingEmails: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSave = () => {
    // Implementar salvamento das configurações
    console.log('Salvando configurações de notificação:', settings)
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Notificações por Email
            </h4>
            <p className="text-sm text-gray-500">
              Receber notificações por email
            </p>
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
            <h4 className="text-sm font-medium text-gray-900">
              Notificações Push
            </h4>
            <p className="text-sm text-gray-500">
              Receber notificações no navegador
            </p>
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
            <h4 className="text-sm font-medium text-gray-900">
              Notificações SMS
            </h4>
            <p className="text-sm text-gray-500">
              Receber notificações por SMS
            </p>
          </div>
          <input
            type="checkbox"
            name="smsNotifications"
            checked={settings.smsNotifications}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Tipos de Notificação
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">
                  Alertas de Despesas
                </h5>
                <p className="text-sm text-gray-500">
                  Notificar sobre despesas altas
                </p>
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
                <h5 className="text-sm font-medium text-gray-900">
                  Lembretes de Manutenção
                </h5>
                <p className="text-sm text-gray-500">
                  Lembrar sobre manutenções programadas
                </p>
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
                <h5 className="text-sm font-medium text-gray-900">
                  Atualizações de Grupo
                </h5>
                <p className="text-sm text-gray-500">
                  Notificar sobre mudanças nos grupos
                </p>
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
                <h5 className="text-sm font-medium text-gray-900">
                  Alertas de Emergência
                </h5>
                <p className="text-sm text-gray-500">
                  Notificar sobre alertas de emergência
                </p>
              </div>
              <input
                type="checkbox"
                name="emergencyAlerts"
                checked={settings.emergencyAlerts}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">
                  Emails de Marketing
                </h5>
                <p className="text-sm text-gray-500">
                  Receber ofertas e novidades
                </p>
              </div>
              <input
                type="checkbox"
                name="marketingEmails"
                checked={settings.marketingEmails}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}

// Componente de configurações de privacidade
interface PrivacySettingsProps {
  onClose: () => void
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    cookies: true,
    twoFactorAuth: false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = () => {
    console.log('Salvando configurações de privacidade:', settings)
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibilidade do Perfil
          </label>
          <select
            name="profileVisibility"
            value={settings.profileVisibility}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="private">Privado</option>
            <option value="friends">Apenas Amigos</option>
            <option value="public">Público</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Compartilhamento de Dados
            </h4>
            <p className="text-sm text-gray-500">
              Permitir compartilhamento de dados para melhorar o serviço
            </p>
          </div>
          <input
            type="checkbox"
            name="dataSharing"
            checked={settings.dataSharing}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-500">
              Permitir coleta de dados de uso para analytics
            </p>
          </div>
          <input
            type="checkbox"
            name="analytics"
            checked={settings.analytics}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Cookies</h4>
            <p className="text-sm text-gray-500">
              Aceitar cookies para melhorar a experiência
            </p>
          </div>
          <input
            type="checkbox"
            name="cookies"
            checked={settings.cookies}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Autenticação de Dois Fatores
            </h4>
            <p className="text-sm text-gray-500">
              Adicionar uma camada extra de segurança
            </p>
          </div>
          <input
            type="checkbox"
            name="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}

// Componente de configurações de tema
interface ThemeSettingsProps {
  onClose: () => void
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
  const [theme, setTheme] = useState('light')
  const [accentColor, setAccentColor] = useState('blue')

  const themes = [
    { id: 'light', name: 'Claro', description: 'Tema claro padrão' },
    { id: 'dark', name: 'Escuro', description: 'Tema escuro para uso noturno' },
    {
      id: 'auto',
      name: 'Automático',
      description: 'Segue as configurações do sistema',
    },
  ]

  const colors = [
    { id: 'blue', name: 'Azul', color: 'bg-blue-500' },
    { id: 'green', name: 'Verde', color: 'bg-green-500' },
    { id: 'purple', name: 'Roxo', color: 'bg-purple-500' },
    { id: 'orange', name: 'Laranja', color: 'bg-orange-500' },
  ]

  const handleSave = () => {
    console.log('Salvando configurações de tema:', { theme, accentColor })
    onClose()
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Tema</h4>
        <div className="space-y-2">
          {themes.map((themeOption) => (
            <label key={themeOption.id} className="flex items-center space-x-3">
              <input
                type="radio"
                name="theme"
                value={themeOption.id}
                checked={theme === themeOption.id}
                onChange={(e) => setTheme(e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {themeOption.name}
                </p>
                <p className="text-sm text-gray-500">
                  {themeOption.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Cor de Destaque
        </h4>
        <div className="flex space-x-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setAccentColor(color.id)}
              className={`w-8 h-8 rounded-full ${color.color} ${
                accentColor === color.id ? 'ring-2 ring-gray-400' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}

// Componente de configurações de dados
interface DataSettingsProps {
  onClose: () => void
}

const DataSettings: React.FC<DataSettingsProps> = ({ onClose }) => {
  const handleExportData = () => {
    console.log('Exportando dados...')
  }

  const handleImportData = () => {
    console.log('Importando dados...')
  }

  const handleDeleteData = () => {
    console.log('Excluindo dados...')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Exportar Dados
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Baixe uma cópia de todos os seus dados em formato JSON
          </p>
          <Button size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Importar Dados
          </h4>
          <p className="text-sm text-green-700 mb-3">
            Restaure seus dados a partir de um arquivo de backup
          </p>
          <Button size="sm" variant="outline" onClick={handleImportData}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Dados
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-900 mb-2">
            Excluir Dados
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Exclua permanentemente todos os seus dados da aplicação
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={handleDeleteData}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Dados
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  )
}

// Componente de exclusão de conta
interface DeleteAccountFormProps {
  onConfirm: () => void
  onCancel: () => void
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [confirmText, setConfirmText] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value)
    setIsConfirmed(e.target.value === 'EXCLUIR')
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Atenção!</h4>
            <p className="text-sm text-red-700 mt-1">
              Esta ação é irreversível. Todos os seus dados serão excluídos
              permanentemente.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Para confirmar, digite "EXCLUIR" abaixo:
        </label>
        <Input
          value={confirmText}
          onChange={handleConfirmChange}
          placeholder="EXCLUIR"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={!isConfirmed}>
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Conta
        </Button>
      </div>
    </div>
  )
}

export default Settings
