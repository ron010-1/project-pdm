import { apiClient } from './client';
import { LoginResponse } from './types';

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>('/login', { email, password }).then((res) => res.data);
}
