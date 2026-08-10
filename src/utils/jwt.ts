import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
  sub: string;
  role?: 'admin' | 'assistente';
  iat: number;
  exp: number;
};

export function decodeSession(token: string): { userId: string; role: 'admin' | 'assistente' } | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (!payload.sub || (payload.role !== 'admin' && payload.role !== 'assistente')) return null;
    if (isTokenExpired(token)) return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function decodeUserId(token: string): string | null {
  return decodeSession(token)?.userId ?? null;
}

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function msUntilExpiration(token: string): number {
  try {
    const { exp } = jwtDecode<TokenPayload>(token);
    if (!exp) return 0;
    return Math.max(0, exp * 1000 - Date.now());
  } catch {
    return 0;
  }
}