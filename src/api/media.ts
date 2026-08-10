import { apiClient } from './client';

export async function uploadMedia(uri: string, mimeType: string): Promise<string> {
  const extension = mimeType.split('/')[1] ?? 'dat';
  const filename = uri.split('/').pop() ?? `midia.${extension}`;
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await apiClient.post<{ path: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.path;
}

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  return `${process.env.EXPO_PUBLIC_API_URL}${value}`;
}

export function isVideoUrl(value: string): boolean {
  return /\.(mp4|mov|m4v|3gp|avi|mkv)(\?|$)/i.test(value);
}
