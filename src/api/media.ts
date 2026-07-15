import axios from 'axios';

const mediaServiceClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_IMAGE_SERVICE_URL,
});

export async function uploadMedia(uri: string, mimeType: string): Promise<string> {
  const extension = mimeType.split('/')[1] ?? 'dat';
  const filename = uri.split('/').pop() ?? `midia.${extension}`;
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await mediaServiceClient.post<{ message: string; url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.url;
}
