import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData, UserType } from '../types';
import toast from 'react-hot-toast';
import { getSupabase } from '../lib/supabaseClient';
import { getProfileById, updateUserType } from '../services/profileService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const s = getSupabase();
        const { data } = await s.auth.getUser();
        const authUser = data.user;
        if (authUser) {
          const profile = await getProfileById(authUser.id);
          if (profile) setUser(profile);
        }
      } catch {
        // Supabase não configurado
      } finally {
        setIsLoading(false);
      }
    };
    init();

    let unsub: (() => void) | null = null;
    try {
      const s = getSupabase();
      const { data: listener } = s.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getProfileById(session.user.id);
          setUser(profile);
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      unsub = () => listener?.subscription.unsubscribe();
    } catch {
      // Supabase não configurado
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const s = getSupabase();
      const { data, error } = await s.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const authUser = data.user;
      if (!authUser) throw new Error('Usuário não autenticado');
      const profile = await getProfileById(authUser.id);
      if (!profile) throw new Error('Perfil não encontrado');
      setUser(profile);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }
      const s = getSupabase();
      const { data, error } = await s.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name },
        },
      });
      if (error) throw error;
      const authUser = data.user;
      if (!authUser) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
        return;
      }
      await updateUserType(authUser.id, userData.userType as UserType);
      const profile = await getProfileById(authUser.id);
      if (!profile) throw new Error('Perfil não encontrado após cadastro');
      setUser(profile);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      const s = getSupabase();
      await s.auth.signOut();
    } catch {}
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
