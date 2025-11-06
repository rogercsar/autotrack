import { create } from 'zustand'
import { User, RegisterData, UserType } from '../types'
import toast from 'react-hot-toast'
import {
  signInWithPassword,
  signUp,
  signOut,
  getUser,
} from '../api/auth'
import { getProfileById, updateUserType } from '../services/profileService'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await signInWithPassword(email, password)
      if (error) throw error
      const authUser = data.user
      if (!authUser) throw new Error('Usuário não autenticado')
      const profile = await getProfileById(authUser.id)
      if (!profile) throw new Error('Perfil não encontrado')
      set({ user: profile })
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer login'
      toast.error(errorMessage)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  register: async (userData) => {
    set({ isLoading: true })
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Senhas não coincidem')
      }
      const { data, error } = await signUp(userData)
      if (error) throw error
      const authUser = data.user
      if (!authUser) {
        toast.success('Conta criada! Verifique seu email para confirmar.')
        return
      }
      await updateUserType(authUser.id, userData.userType as UserType)
      const profile = await getProfileById(authUser.id)
      if (!profile) throw new Error('Perfil não encontrado após cadastro')
      set({ user: profile })
      toast.success('Conta criada com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao criar conta'
      toast.error(errorMessage)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  logout: async () => {
    try {
      await signOut()
    } catch {
    } finally {
      set({ user: null })
      toast.success('Logout realizado com sucesso!')
    }
  },
  checkUser: async () => {
    try {
      const { data } = await getUser()
      const authUser = data.user
      if (authUser) {
        const profile = await getProfileById(authUser.id)
        if (profile) set({ user: profile })
      }
    } catch {
      // Supabase não configurado
    } finally {
      set({ isLoading: false })
    }
  },
}))
