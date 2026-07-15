import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginRequest } from '../api/auth';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/client';
import { decodeUserId } from '../utils/jwt';

type AuthContextValue = {
  isReady: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      SecureStore.deleteItemAsync(TOKEN_KEY);
      setUserId(null);
    });

    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      setUserId(token ? decodeUserId(token) : null);
      setIsReady(true);
    });
  }, []);

  async function login(email: string, password: string) {
    const { token } = await loginRequest(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUserId(decodeUserId(token));
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ isReady, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
