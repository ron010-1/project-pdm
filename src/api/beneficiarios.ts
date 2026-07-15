import { apiClient } from './client';
import { Beneficiario, BeneficiarioInput } from './types';

export function list() {
  return apiClient.get<Beneficiario[]>('/benefs').then((res) => res.data);
}

export function getById(id: string) {
  return apiClient.get<Beneficiario>(`/benefs/${id}`).then((res) => res.data);
}

export function create(data: BeneficiarioInput) {
  return apiClient.post<Beneficiario>('/benefs', data).then((res) => res.data);
}

export function update(id: string, data: Partial<BeneficiarioInput>) {
  return apiClient.patch<Beneficiario>(`/benefs/${id}`, data).then((res) => res.data);
}

export function remove(id: string) {
  return apiClient.delete(`/benefs/${id}`).then((res) => res.data);
}
