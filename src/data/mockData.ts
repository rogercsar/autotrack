import { User, Vehicle, Expense, Group, Company, UserType, ExpenseType, AlertType } from '../types';

// Dados mockados de usuários
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    userType: UserType.PRO,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '(11) 99999-9999',
    emergencyContact: '(11) 88888-8888',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    userType: UserType.ADVANCED,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '(11) 77777-7777',
    emergencyContact: '(11) 66666-6666',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    userType: UserType.BASIC,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '(11) 55555-5555',
    emergencyContact: '(11) 44444-4444',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-12-05')
  }
];

// Dados mockados de veículos
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    ownerId: '1',
    plate: 'ABC-1234',
    model: 'Honda Civic',
    year: 2020,
    color: 'Prata',
    renavam: '12345678901',
    photo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    ownerId: '1',
    plate: 'XYZ-5678',
    model: 'Toyota Corolla',
    year: 2019,
    color: 'Branco',
    renavam: '98765432109',
    photo: 'https://images.unsplash.com/photo-1549317331-15d33c1eef14?w=400&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-11-20')
  },
  {
    id: '3',
    ownerId: '2',
    plate: 'DEF-9012',
    model: 'Volkswagen Golf',
    year: 2021,
    color: 'Azul',
    renavam: '11223344556',
    photo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-11-15')
  }
];

// Dados mockados de despesas
export const mockExpenses: Expense[] = [
  {
    id: '1',
    vehicleId: '1',
    type: ExpenseType.FUEL,
    description: 'Abastecimento - Posto Shell',
    amount: 150.00,
    date: new Date('2023-12-01'),
    location: 'Posto Shell - Av. Paulista, 1000',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    vehicleId: '1',
    type: ExpenseType.MAINTENANCE,
    description: 'Troca de óleo e filtros',
    amount: 280.00,
    date: new Date('2023-11-15'),
    location: 'Oficina Auto Center',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '3',
    vehicleId: '1',
    type: ExpenseType.TICKET,
    description: 'Multa - Velocidade',
    amount: 195.23,
    date: new Date('2023-11-10'),
    location: 'Av. Faria Lima, 2000',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-10')
  },
  {
    id: '4',
    vehicleId: '2',
    type: ExpenseType.INSURANCE,
    description: 'Seguro anual',
    amount: 2500.00,
    date: new Date('2023-10-01'),
    location: 'Seguradora XYZ',
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-01')
  },
  {
    id: '5',
    vehicleId: '3',
    type: ExpenseType.FUEL,
    description: 'Abastecimento - Posto Ipiranga',
    amount: 120.00,
    date: new Date('2023-12-02'),
    location: 'Posto Ipiranga - Rua Augusta, 500',
    createdAt: new Date('2023-12-02'),
    updatedAt: new Date('2023-12-02')
  }
];

// Dados mockados de grupos
export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Família Silva',
    description: 'Grupo da família para compartilhar informações dos veículos',
    ownerId: '1',
    members: [
      {
        id: '1',
        userId: '1',
        groupId: '1',
        role: 'owner',
        joinedAt: new Date('2023-01-15')
      },
      {
        id: '2',
        userId: '2',
        groupId: '1',
        role: 'member',
        joinedAt: new Date('2023-02-01')
      }
    ],
    vehicleIds: ['1', '2'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '2',
    name: 'Amigos do Trabalho',
    description: 'Grupo para compartilhar dicas e informações automotivas',
    ownerId: '2',
    members: [
      {
        id: '3',
        userId: '2',
        groupId: '2',
        role: 'owner',
        joinedAt: new Date('2023-03-20')
      },
      {
        id: '4',
        userId: '3',
        groupId: '2',
        role: 'member',
        joinedAt: new Date('2023-04-01')
      }
    ],
    vehicleIds: ['3'],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-11-15')
  }
];

// Dados mockados de oficinas e concessionárias
export const mockCompanies: Company[] = [
  {
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
  },
  {
    id: '2',
    name: 'Concessionária Honda Center',
    type: 'dealership',
    description: 'Concessionária oficial Honda com venda e assistência técnica',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    phone: '(11) 4444-4444',
    email: 'vendas@hondacenter.com.br',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      latitude: -23.5614,
      longitude: -46.6565
    },
    services: ['Venda de veículos', 'Assistência técnica', 'Peças originais', 'Financiamento', 'Seguro'],
    rating: 4.8,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01')
  },
  {
    id: '3',
    name: 'Oficina do João',
    type: 'workshop',
    description: 'Oficina de bairro com preços acessíveis',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop',
    phone: '(11) 5555-5555',
    email: 'oficinadojoao@email.com',
    address: {
      street: 'Rua da Consolação',
      number: '456',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-000',
      latitude: -23.5475,
      longitude: -46.6361
    },
    services: ['Manutenção básica', 'Troca de pneus', 'Bateria', 'Pneus'],
    rating: 4.2,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01')
  }
];

// Dados mockados de alertas de emergência
export const mockAlerts = [
  {
    id: '1',
    userId: '1',
    vehicleId: '1',
    type: AlertType.FLAT_TIRE,
    description: 'Pneu furado na lateral direita',
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'Av. Paulista, 1000 - São Paulo, SP'
    },
    isActive: true,
    sentTo: ['2'],
    createdAt: new Date('2023-12-01T14:30:00'),
    resolvedAt: undefined
  }
];

// Função para obter estatísticas do dashboard
export const getDashboardStats = (userId: string) => {
  const userVehicles = mockVehicles.filter(v => v.ownerId === userId);
  const userExpenses = mockExpenses.filter(e => 
    userVehicles.some(v => v.id === e.vehicleId)
  );
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = userExpenses
    .filter(e => e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    totalVehicles: userVehicles.length,
    totalExpenses: totalExpenses,
    monthlyExpenses: monthlyExpenses,
    upcomingPayments: 0, // Seria calculado baseado em IPVA, seguro, etc.
    recentAlerts: mockAlerts.filter(a => a.userId === userId && a.isActive).length
  };
};

// Função para obter despesas por veículo
export const getExpensesByVehicle = (vehicleId: string) => {
  return mockExpenses.filter(e => e.vehicleId === vehicleId);
};

// Função para obter grupos do usuário
export const getUserGroups = (userId: string) => {
  return mockGroups.filter(g => 
    g.ownerId === userId || g.members.some(m => m.userId === userId)
  );
};

// Função para obter veículos do usuário
export const getUserVehicles = (userId: string) => {
  return mockVehicles.filter(v => v.ownerId === userId);
};
