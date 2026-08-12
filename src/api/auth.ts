import { apiClient } from './client';
import { LoginResponse, MeResponse } from './types';

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>('/login', { email, password }).then((res) => res.data);
}

export function me() {
  return apiClient.get<MeResponse>('/login/me').then((res) => res.data);
}
