import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const cache = new Map<string, string>();

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!place) return null;

    const rua = [place.street, place.streetNumber].filter(Boolean).join(', ');
    const cidade = [place.city, place.region].filter(Boolean).join('/');
    const endereco = [rua, cidade].filter(Boolean).join(' — ');

    if (endereco) cache.set(key, endereco);
    return endereco || null;
  } catch {
    return null;
  }
}

export function useAddress(latitude?: number, longitude?: number): string | null {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    let cancelled = false;

    reverseGeocode(latitude, longitude).then((result) => {
      if (!cancelled) setAddress(result);
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return address;
}
