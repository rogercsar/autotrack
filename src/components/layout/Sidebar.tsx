import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Car, 
  DollarSign, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Settings,
  BarChart3,
  FileText,
  Share2,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Veículos', href: '/vehicles', icon: Car },
    { name: 'Despesas', href: '/expenses', icon: DollarSign },
    { name: 'Grupos', href: '/groups', icon: Users },
    { name: 'Oficinas', href: '/workshops', icon: MapPin },
    { name: 'Alertas', href: '/alerts', icon: AlertTriangle },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
    { name: 'Transferir', href: '/transfer', icon: ArrowRight },
    { name: 'Exportar', href: '/export', icon: FileText },
    { name: 'Compartilhar', href: '/share', icon: Share2 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-3 sm:px-4 py-4 sm:py-6 border-b border-gray-200 lg:py-2 lg:px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg sm:text-xl lg:text-lg font-bold text-gray-900">AutoTrack</h1>
                <p className="text-xs text-gray-500 hidden sm:block lg:hidden">Gestão de Veículos</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      isActive(item.href)
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>AutoTrack v1.0.0</p>
              <p>© 2023 Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
