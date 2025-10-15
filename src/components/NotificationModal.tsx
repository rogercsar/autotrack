import React, { useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';
import { User } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  User as UserIcon,
  Clock,
  MapPin,
  Car,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'emergency';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  fromUser?: User;
  vehicleId?: string;
  vehicleModel?: string;
  location?: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Mock notifications - em uma aplicação real, isso viria de uma API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'emergency',
        title: 'Alerta de Emergência',
        message: 'João Silva ativou um alerta de emergência para o veículo Honda Civic',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        read: false,
        fromUser: mockUsers.find(u => u.id === '2'),
        vehicleId: '1',
        vehicleModel: 'Honda Civic',
        location: 'Av. Paulista, 1000 - São Paulo, SP',
        actionUrl: '/alerts',
        actionText: 'Ver Detalhes'
      },
      {
        id: '2',
        type: 'success',
        title: 'Despesa Registrada',
        message: 'Nova despesa de R$ 150,00 registrada para o veículo Toyota Corolla',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        read: false,
        vehicleId: '2',
        vehicleModel: 'Toyota Corolla',
        actionUrl: '/expenses',
        actionText: 'Ver Despesas'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Lembrete de Manutenção',
        message: 'O veículo Honda Civic está próximo da revisão programada',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        read: true,
        vehicleId: '1',
        vehicleModel: 'Honda Civic',
        actionUrl: '/vehicles/1',
        actionText: 'Ver Veículo'
      },
      {
        id: '4',
        type: 'info',
        title: 'Novo Membro no Grupo',
        message: 'Maria Santos foi adicionada ao grupo "Família Silva"',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        read: true,
        fromUser: mockUsers.find(u => u.id === '3'),
        actionUrl: '/groups',
        actionText: 'Ver Grupo'
      },
      {
        id: '5',
        type: 'error',
        title: 'Falha no Backup',
        message: 'Não foi possível fazer backup dos seus dados. Tente novamente.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
        read: true,
        actionUrl: '/settings',
        actionText: 'Configurações'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'emergency':
        return notification.type === 'emergency';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const emergencyCount = notifications.filter(n => n.type === 'emergency').length;

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days} dias atrás`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      // Em uma aplicação real, isso navegaria para a URL
      console.log('Navegando para:', notification.actionUrl);
    }
    setSelectedNotification(null);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Notificações"
        size="lg"
      >
        <div className="space-y-4">
          {/* Filtros e ações */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'all' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'unread' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('emergency')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'emergency' 
                    ? 'bg-red-100 text-red-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Emergência ({emergencyCount})
              </button>
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* Implementar configurações de notificação */}}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-500">
                  {filter === 'unread' && 'Você não tem notificações não lidas'}
                  {filter === 'emergency' && 'Você não tem alertas de emergência'}
                  {filter === 'all' && 'Você não tem notificações'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    notification.read 
                      ? 'bg-white border-gray-200 hover:bg-gray-50' 
                      : 'bg-primary-50 border-primary-200 hover:bg-primary-100'
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.fromUser && (
                        <div className="flex items-center space-x-2 mt-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            De: {notification.fromUser.name}
                          </span>
                        </div>
                      )}
                      {notification.vehicleModel && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Veículo: {notification.vehicleModel}
                          </span>
                        </div>
                      )}
                      {notification.location && (
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {notification.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de detalhes da notificação */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title={selectedNotification?.title || ''}
        size="md"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              {getNotificationIcon(selectedNotification.type)}
              <div className="flex-1">
                <p className="text-gray-900">{selectedNotification.message}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatTimeAgo(selectedNotification.timestamp)}
                  </div>
                  {selectedNotification.fromUser && (
                    <div className="flex items-center text-sm text-gray-500">
                      <UserIcon className="w-4 h-4 mr-2" />
                      De: {selectedNotification.fromUser.name}
                    </div>
                  )}
                  {selectedNotification.vehicleModel && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Car className="w-4 h-4 mr-2" />
                      Veículo: {selectedNotification.vehicleModel}
                    </div>
                  )}
                  {selectedNotification.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedNotification.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedNotification.actionUrl && (
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                  Fechar
                </Button>
                <Button onClick={() => handleAction(selectedNotification)}>
                  {selectedNotification.actionText || 'Ver Detalhes'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default NotificationModal;


