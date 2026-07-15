import AsyncStorage from '@react-native-async-storage/async-storage';
import { Beneficiario } from '../api/types';

const BENEFICIARIOS_CACHE_KEY = 'sigpcf_beneficiarios_cache';
const VISITA_MEDIA_KEY = 'sigpcf_visita_media';

export type VisitaMedia = {
  url: string;
  type: 'image' | 'video';
};

export async function saveBeneficiariosCache(data: Beneficiario[]) {
  await AsyncStorage.setItem(BENEFICIARIOS_CACHE_KEY, JSON.stringify(data));
}

export async function loadBeneficiariosCache(): Promise<Beneficiario[]> {
  const raw = await AsyncStorage.getItem(BENEFICIARIOS_CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Nem a API principal nem o microservico de imagens associam a midia a uma
// visita no backend, entao esse vinculo so existe localmente no dispositivo.
export async function saveVisitaMedia(visitaId: string, media: VisitaMedia) {
  const raw = await AsyncStorage.getItem(VISITA_MEDIA_KEY);
  const map: Record<string, VisitaMedia> = raw ? JSON.parse(raw) : {};
  map[visitaId] = media;
  await AsyncStorage.setItem(VISITA_MEDIA_KEY, JSON.stringify(map));
}

export async function getVisitaMedia(visitaId: string): Promise<VisitaMedia | null> {
  const raw = await AsyncStorage.getItem(VISITA_MEDIA_KEY);
  const map: Record<string, VisitaMedia> = raw ? JSON.parse(raw) : {};
  return map[visitaId] ?? null;
}
