import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { isTokenExpired } from '../utils/jwt';

export const TOKEN_KEY = 'sigpcf_token';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);

  if (token && isTokenExpired(token)) {
    unauthorizedHandler?.();
    return Promise.reject(new axios.Cancel('Sessão expirada'));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);