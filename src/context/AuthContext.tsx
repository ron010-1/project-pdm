import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginRequest } from '../api/auth';
import { getById as getAssistenteById } from '../api/assistentes';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/client';
import { decodeSession, isTokenExpired, msUntilExpiration } from '../utils/jwt';

export type UserRole = 'admin' | 'assistente';

type AuthContextValue = {
  isReady: boolean;
  userId: string | null;
  role: UserRole | null;
  nome: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNome: (nome: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const expirationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearExpirationTimer() {
    if (expirationTimer.current) {
      clearTimeout(expirationTimer.current);
      expirationTimer.current = null;
    }
  }

  function handleUnauthorized() {
    clearExpirationTimer();
    SecureStore.deleteItemAsync(TOKEN_KEY);
    setUserId(null);
    setRole(null);
    setNome(null);
  }

  // Agenda um logout automático para o instante exato em que o token expirar,
  // setTimeout estoura acima de ~24,8 dias
  const MAX_TIMEOUT = 2_147_483_000;

  function scheduleAutoLogout(token: string) {
    clearExpirationTimer();
    const delay = msUntilExpiration(token);
    if (delay <= 0) {
      handleUnauthorized();
      return;
    }
    if (delay > MAX_TIMEOUT) {
      expirationTimer.current = setTimeout(() => scheduleAutoLogout(token), MAX_TIMEOUT);
      return;
    }
    expirationTimer.current = setTimeout(handleUnauthorized, delay);
  }

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);

    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      if (token && isTokenExpired(token)) {
        // Sessão já expirou enquanto o app estava fechado.
        SecureStore.deleteItemAsync(TOKEN_KEY);
        setIsReady(true);
        return;
      }

      const session = token ? decodeSession(token) : null;
      setUserId(session?.userId ?? null);
      setRole(session?.role ?? null);
      if (token && session) scheduleAutoLogout(token);
      setIsReady(true);
    });

    return () => clearExpirationTimer();
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
    scheduleAutoLogout(token);
  }

  async function logout() {
    clearExpirationTimer();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUserId(null);
    setRole(null);
    setNome(null);
  }

  function updateNome(newNome: string) {
    setNome(newNome);
  }

  return (
    <AuthContext.Provider value={{ isReady, userId, role, nome, login, logout, updateNome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}