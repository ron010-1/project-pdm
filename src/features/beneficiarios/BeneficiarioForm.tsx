import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, radii, spacing } from '../../theme';
import { beneficiarioSchema, BeneficiarioFormValues } from './schemas';
import { BeneficiarioInput } from '../../api/types';
import { uploadMedia } from '../../api/media';

type Props = {
  defaultValues: BeneficiarioFormValues;
  fotoInicial?: string;
  useCurrentLocationAsDefault?: boolean;
  submitLabel: string;
  submitting: boolean;
  submitErrorMessage?: string;
  onSubmit: (input: BeneficiarioInput) => Promise<void>;
};

export function BeneficiarioForm({
  defaultValues,
  fotoInicial,
  useCurrentLocationAsDefault = false,
  submitLabel,
  submitting,
  submitErrorMessage = 'Não foi possível salvar o beneficiário agora. Tente novamente.',
  onSubmit,
}: Props) {
  const [region, setRegion] = useState({
    latitude: defaultValues.latitude,
    longitude: defaultValues.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [photoUri, setPhotoUri] = useState<string | null>(fotoInicial ?? null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeneficiarioFormValues>({
    resolver: zodResolver(beneficiarioSchema),
    defaultValues,
  });

  const marker = { latitude: watch('latitude'), longitude: watch('longitude') };

  useEffect(() => {
    if (!useCurrentLocationAsDefault) return;
    Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(next);
      setValue('latitude', next.latitude);
      setValue('longitude', next.longitude);
    });
  }, [useCurrentLocationAsDefault, setValue]);

  function handleMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setValue('latitude', latitude);
    setValue('longitude', longitude);
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
      setUploadError(null);
    }
  }

  async function handleFormSubmit(values: BeneficiarioFormValues) {
    setSubmitError(null);
    let fotoUrl: string | undefined;

    if (photoChanged && photoUri) {
      setUploadingPhoto(true);
      try {
        fotoUrl = await uploadMedia(photoUri, 'image/jpeg');
      } catch {
        setUploadError('Não foi possível enviar a foto agora. O beneficiário será salvo sem essa alteração de foto.');
      } finally {
        setUploadingPhoto(false);
      }
    }

    try {
      await onSubmit({
        nome: values.nome,
        nome_responsavel: values.nome_responsavel,
        data_nascimento: values.data_nascimento,
        phone1: values.phone1,
        phone2: values.phone2,
        foto: fotoUrl,
        location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
      });
    } catch {
      setSubmitError(submitErrorMessage);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {submitError && <ErrorBanner message={submitError} />}

      <Text style={styles.photoLabel}>Foto (opcional)</Text>
      <Pressable style={styles.photoPicker} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Ionicons name="camera" size={24} color={colors.textSecondary} />
        )}
      </Pressable>
      {uploadError && <Text style={styles.photoError}>{uploadError}</Text>}

      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, value } }) => (
          <TextField label="Nome da criança" value={value} onChangeText={onChange} error={errors.nome?.message} />
        )}
      />
      <Controller
        control={control}
        name="nome_responsavel"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Nome do responsável"
            value={value}
            onChangeText={onChange}
            error={errors.nome_responsavel?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="data_nascimento"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Data de nascimento"
            placeholder="AAAA-MM-DD"
            value={value}
            onChangeText={onChange}
            error={errors.data_nascimento?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone1"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Telefone"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            error={errors.phone1?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone2"
        render={({ field: { onChange, value } }) => (
          <TextField label="Telefone secundário (opcional)" keyboardType="phone-pad" value={value} onChangeText={onChange} />
        )}
      />

      <Text style={styles.mapLabel}>Endereço (toque no mapa para marcar)</Text>
      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        <Marker coordinate={marker} />
      </MapView>
      {(errors.latitude || errors.longitude) && (
        <Text style={styles.mapError}>Marque o endereço no mapa.</Text>
      )}

      {uploadingPhoto ? (
        <ActivityIndicator color={colors.primary} style={styles.uploadIndicator} />
      ) : (
        <Button label={submitLabel} onPress={handleSubmit(handleFormSubmit)} loading={submitting} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  photoLabel: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  photoPicker: {
    width: 96,
    height: 96,
    borderRadius: radii.sm,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  mapLabel: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: radii.sm,
    marginBottom: spacing.xl,
  },
  mapError: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
  },
  uploadIndicator: {
    marginVertical: spacing.md,
  },
});
