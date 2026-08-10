import { apiClient } from './client';
import { MeAdmin } from './types';

export type AdminInput = {
  email: string;
};

export function update(data: Partial<AdminInput>) {
  return apiClient.patch<MeAdmin>('/admin/me', data).then((res) => res.data);
}