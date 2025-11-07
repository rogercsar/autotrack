// Tipos de usuário com funcionalidades progressivas
export enum UserType {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  PRO = 'pro',
  ADMIN = 'admin',
}

// Interface para usuário
export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  avatar?: string
  phone?: string
  emergencyContact?: string
  createdAt: Date
  updatedAt: Date
}

// Interface para veículo
export interface Vehicle {
  id: string
  ownerId: string
  plate: string
  model: string
  year: number
  color: string
  renavam: string
  photo?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipos de despesas
export enum ExpenseType {
  FUEL = 'fuel',
  TICKET = 'ticket',
  MAINTENANCE = 'maintenance',
  INSURANCE = 'insurance',
  IPVA = 'ipva',
  LICENSING = 'licensing',
  OTHER = 'other',
}

// Interface para despesas
export interface Expense {
  id: string
  vehicleId: string
  type: ExpenseType
  description: string
  amount: number
  date: Date
  location?: string
  receipt?: string
  createdAt: Date
  updatedAt: Date
}

// Interface para grupos
export interface Group {
  id: string
  name: string
  description?: string
  ownerId: string
  members: GroupMember[]
  vehicleIds: string[]
  createdAt: Date
  updatedAt: Date
}

// Interface para membros do grupo
export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: 'owner' | 'member'
  joinedAt: Date
}

// Tipos de alertas de emergência
export enum AlertType {
  FLAT_TIRE = 'flat_tire',
  MECHANICAL_PROBLEM = 'mechanical_problem',
  ACCIDENT = 'accident',
  BREAKDOWN = 'breakdown',
  OTHER = 'other',
}

// Interface para alertas
export interface EmergencyAlert {
  id: string
  userId: string
  vehicleId: string
  type: AlertType
  description: string
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  isActive: boolean
  sentTo: string[] // IDs dos usuários notificados
  createdAt: Date
  resolvedAt?: Date
}

// Interface para oficinas e concessionárias
export interface Company {
  id: string
  name: string
  type: 'workshop' | 'dealership'
  description: string
  logo?: string
  phone: string
  email: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    latitude: number
    longitude: number
  }
  services: string[]
  rating: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface para agendamentos
export interface Appointment {
  id: string
  userId: string
  companyId: string
  vehicleId: string
  date: Date
  time: string
  service: string
  description: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

// Interface para transferência de veículo
export interface VehicleTransfer {
  id: string
  vehicleId: string
  fromUserId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  createdAt: Date
  completedAt?: Date
}


// Interface para dados de registro
export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Interface para dados de login
export interface LoginData {
  email: string
  password: string
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalVehicles: number
  totalExpenses: number
  monthlyExpenses: number
  upcomingPayments: number
  recentAlerts: number
}

// Interface para dados de exportação PDF
export interface VehicleExportData {
  vehicle: Vehicle
  expenses: Expense[]
  totalExpenses: number
  averageMonthlyExpense: number
  exportDate: Date
}
