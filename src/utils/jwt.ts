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
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function decodeUserId(token: string): string | null {
  return decodeSession(token)?.userId ?? null;
}
