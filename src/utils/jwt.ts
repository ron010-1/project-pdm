import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export function decodeUserId(token: string): string | null {
  try {
    return jwtDecode<TokenPayload>(token).sub;
  } catch {
    return null;
  }
}
