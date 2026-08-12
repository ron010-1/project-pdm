import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button } from './Button';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';
import { reverseGeocode } from '../utils/location';

export type VisitaLocation = {
  latitude: number;
  longitude: number;
  endereco: string | null;
};

type Props = {
  visible: boolean;
  initialLocation?: VisitaLocation | null;
  onClose: () => void;
  onSave: (location: VisitaLocation) => void;
};

const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function VisitLocationModal({ visible, initialLocation, onClose, onSave }: Props) {
  const [region, setRegion] = useState<Region | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!visible) return;
    setPermissionError(null);

    if (initialLocation) {
      setMarker({ latitude: initialLocation.latitude, longitude: initialLocation.longitude });
      setRegion({ ...initialLocation, ...DEFAULT_DELTA });
      setEndereco(initialLocation.endereco);
      return;
    }

    let cancelled = false;
    setLoadingGps(true);
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setPermissionError('Permissão de localização negada. Marque o ponto manualmente no mapa.');
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setMarker(coords);
        setRegion({ ...coords, ...DEFAULT_DELTA });
      } catch {
        if (!cancelled) setPermissionError('Não foi possível obter sua localização atual. Marque o ponto manualmente no mapa.');
      } finally {
        if (!cancelled) setLoadingGps(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, initialLocation]);
  
  useEffect(() => {
    if (!marker) return;
    let cancelled = false;
    setLoadingAddress(true);
    reverseGeocode(marker.latitude, marker.longitude).then((result) => {
      if (!cancelled) {
        setEndereco(result);
        setLoadingAddress(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [marker]);

  function handleMapPress(event: MapPressEvent) {
    setMarker(event.nativeEvent.coordinate);
  }

  function handleSave() {
    if (!marker) return;
    onSave({ latitude: marker.latitude, longitude: marker.longitude, endereco });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Adicione a localização</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.headerButton}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.addressBar}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          {loadingAddress || loadingGps ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.addressLoading} />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>
              {endereco ?? (marker ? `${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}` : 'Toque no mapa para marcar o ponto')}
            </Text>
          )}
        </View>

        {permissionError && <Text style={styles.permissionError}>{permissionError}</Text>}

        <View style={styles.mapWrapper}>
          {region ? (
            <MapView style={styles.map} initialRegion={region} onPress={handleMapPress}>
              {marker && <Marker coordinate={marker} />}
            </MapView>
          ) : (
            <View style={styles.mapLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button label="Salvar" onPress={handleSave} disabled={!marker} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  addressText: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  addressLoading: {
    marginVertical: spacing.sm,
  },
  permissionError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  mapWrapper: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
