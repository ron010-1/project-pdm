import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginRequest } from '../api/auth';
import { getById as getAssistenteById } from '../api/assistentes';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/client';
import { decodeUserId } from '../utils/jwt';

type AuthContextValue = {
  isReady: boolean;
  userId: string | null;
  nome: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      SecureStore.deleteItemAsync(TOKEN_KEY);
      setUserId(null);
      setNome(null);
    });

    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      setUserId(token ? decodeUserId(token) : null);
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
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUserId(decodeUserId(token));
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUserId(null);
    setNome(null);
  }

  return (
    <AuthContext.Provider value={{ isReady, userId, nome, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
