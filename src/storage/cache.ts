import AsyncStorage from '@react-native-async-storage/async-storage';
import { Beneficiario } from '../api/types';

const BENEFICIARIOS_CACHE_KEY = 'sigpcf_beneficiarios_cache';
const VISITA_IMAGES_KEY = 'sigpcf_visita_images';

export async function saveBeneficiariosCache(data: Beneficiario[]) {
  await AsyncStorage.setItem(BENEFICIARIOS_CACHE_KEY, JSON.stringify(data));
}

export async function loadBeneficiariosCache(): Promise<Beneficiario[]> {
  const raw = await AsyncStorage.getItem(BENEFICIARIOS_CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Nem a API principal nem o microservico de imagens associam a foto a uma
// visita no backend, entao esse vinculo so existe localmente no dispositivo.
export async function saveVisitaImage(visitaId: string, url: string) {
  const raw = await AsyncStorage.getItem(VISITA_IMAGES_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  map[visitaId] = url;
  await AsyncStorage.setItem(VISITA_IMAGES_KEY, JSON.stringify(map));
}

export async function getVisitaImage(visitaId: string): Promise<string | null> {
  const raw = await AsyncStorage.getItem(VISITA_IMAGES_KEY);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};
  return map[visitaId] ?? null;
}
