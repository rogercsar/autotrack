import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../stores/authStore'
import { RegisterData, UserType } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { Car, Eye, EyeOff, Check } from 'lucide-react'

const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<UserType>(
    UserType.BASIC
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser({ ...data, userType: selectedUserType })
      navigate('/dashboard')
    } catch (error) {
      // O erro já é tratado no contexto de autenticação
    }
  }

  const userTypeOptions = [
    {
      type: UserType.BASIC,
      title: 'Básico',
      price: 'Gratuito',
      features: [
        '1 veículo',
        'Registro de despesas',
        '1 grupo (até 2 membros)',
        'Alerta de emergência',
        'Visualizar oficinas próximas',
      ],
    },
    {
      type: UserType.ADVANCED,
      title: 'Avançado',
      price: 'R$ 9,90/mês',
      features: [
        'Até 5 veículos',
        'Todas as funcionalidades do Básico',
        '3 grupos (até 5 membros cada)',
        'Exportação para PDF',
      ],
    },
    {
      type: UserType.PRO,
      title: 'Pro',
      price: 'R$ 19,90/mês',
      features: [
        'Veículos ilimitados',
        'Todas as funcionalidades do Avançado',
        'Grupos ilimitados',
        'Compartilhamento avançado',
        'Relatórios e gráficos',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">
            Escolha seu plano e comece a gerenciar seus veículos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de cadastro */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informações Pessoais
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                error={errors.email?.message}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmar senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: (value) =>
                      value === password || 'Senhas não coincidem',
                  })}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Criar Conta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </Card>

          {/* Seleção de plano */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Escolha seu Plano
            </h2>

            <div className="space-y-4">
              {userTypeOptions.map((option) => (
                <Card
                  key={option.type}
                  className={`cursor-pointer transition-all ${
                    selectedUserType === option.type
                      ? 'ring-2 ring-primary-500 border-primary-500'
                      : 'hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedUserType(option.type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.title}
                        </h3>
                        {selectedUserType === option.type && (
                          <Check className="w-5 h-5 text-primary-600 ml-2" />
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary-600 mb-3">
                        {option.price}
                      </p>
                      <ul className="space-y-1">
                        {option.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
