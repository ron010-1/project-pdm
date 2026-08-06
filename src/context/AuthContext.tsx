import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginRequest } from '../api/auth';
import { getById as getAssistenteById } from '../api/assistentes';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/client';
import { decodeSession } from '../utils/jwt';

export type UserRole = 'admin' | 'assistente';

type AuthContextValue = {
  isReady: boolean;
  userId: string | null;
  role: UserRole | null;
  nome: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      SecureStore.deleteItemAsync(TOKEN_KEY);
      setUserId(null);
      setRole(null);
      setNome(null);
    });

    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      const session = token ? decodeSession(token) : null;
      setUserId(session?.userId ?? null);
      setRole(session?.role ?? null);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      setNome(null);
      return;
    }
    // O uuid pode ser de um Admin (sem registro em /assists) - falha silenciosa é esperada nesse caso.
    getAssistenteById(userId)
      .then((assistente) => setNome(assistente.nome))
      .catch(() => setNome(null));
  }, [userId]);

  async function login(email: string, password: string) {
    const { token } = await loginRequest(email, password);
    const session = decodeSession(token);
    if (!session) throw new Error('Token de autenticação inválido');
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUserId(session.userId);
    setRole(session.role);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUserId(null);
    setRole(null);
    setNome(null);
  }

  return (
    <AuthContext.Provider value={{ isReady, userId, role, nome, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
