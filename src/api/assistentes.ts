import { apiClient } from './client';
import { AssistenteSocial } from './types';

export type AssistenteSocialInput = {
  email: string;
  password: string;
  telefone: string;
  nome: string;
};

export function list() {
  return apiClient.get<AssistenteSocial[]>('/assists').then((res) => res.data);
}

export function getById(id: string) {
  return apiClient.get<AssistenteSocial>(`/assists/${id}`).then((res) => res.data);
}

export function create(data: AssistenteSocialInput) {
  return apiClient.post<AssistenteSocial>('/assists', data).then((res) => res.data);
}

export function update(id: string, data: Partial<AssistenteSocialInput>) {
  return apiClient.patch<AssistenteSocial>(`/assists/${id}`, data).then((res) => res.data);
}

export function remove(id: string) {
  return apiClient.delete(`/assists/${id}`).then((res) => res.data);
}
