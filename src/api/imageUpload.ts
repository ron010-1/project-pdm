import axios from 'axios';

const imageServiceClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_IMAGE_SERVICE_URL,
});

export async function uploadImage(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? 'foto.jpg';
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await imageServiceClient.post<{ message: string; url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.url;
}
