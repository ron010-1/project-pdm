import AsyncStorage from '@react-native-async-storage/async-storage';
import { Beneficiario } from '../api/types';

const BENEFICIARIOS_CACHE_KEY = 'sigpcf_beneficiarios_cache';

export async function saveBeneficiariosCache(data: Beneficiario[]) {
  await AsyncStorage.setItem(BENEFICIARIOS_CACHE_KEY, JSON.stringify(data));
}

export async function loadBeneficiariosCache(): Promise<Beneficiario[]> {
  const raw = await AsyncStorage.getItem(BENEFICIARIOS_CACHE_KEY);
  return raw ? JSON.parse(raw) : [];
}
