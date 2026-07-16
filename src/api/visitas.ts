import { apiClient } from './client';
import { Visita, VisitaInput } from './types';

export function list() {
  return apiClient.get<{ count: number; rows: Visita[] }>('/visitas').then((res) => res.data.rows);
}

export function getById(id: string) {
  return apiClient.get<Visita>(`/visitas/${id}`).then((res) => res.data);
}

export function create(data: VisitaInput) {
  return apiClient.post<Visita>('/visitas', data).then((res) => res.data);
}

export function update(id: string, data: Partial<VisitaInput>) {
  return apiClient.patch<Visita>(`/visitas/${id}`, data).then((res) => res.data);
}

export function remove(id: string) {
  return apiClient.delete(`/visitas/${id}`).then((res) => res.data);
}
