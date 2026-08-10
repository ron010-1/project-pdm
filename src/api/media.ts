import { apiClient } from './client';

/**
 * Envia a mídia para a própria API (POST /uploads) e devolve o caminho relativo
 * que ela grava — ex.: "/uploads/uuid.jpg". O caminho é relativo de propósito:
 * o endereço do servidor muda (IP da máquina, deploy) sem invalidar o que já
 * está salvo no banco.
 */
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

/**
 * Monta a URL exibível a partir do que veio da API. Registros criados antes do
 * upload próprio guardam URLs absolutas de serviços externos; os novos guardam
 * caminho relativo, que precisa ser prefixado com a base atual da API.
 */
export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  return `${process.env.EXPO_PUBLIC_API_URL}${value}`;
}

/** A API não guarda o tipo da mídia, então ele é inferido pela extensão. */
export function isVideoUrl(value: string): boolean {
  return /\.(mp4|mov|m4v|3gp|avi|mkv)(\?|$)/i.test(value);
}
