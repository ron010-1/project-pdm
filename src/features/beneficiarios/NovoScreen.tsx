import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, radii, spacing } from '../../theme';
import { beneficiarioSchema, BeneficiarioFormValues } from './schemas';
import { useCreateBeneficiario } from './hooks';

const DEFAULT_REGION = {
  latitude: -7.1195,
  longitude: -34.845,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Props = NativeStackScreenProps<FamiliasStackParamList, 'Novo'>;

export function NovoScreen({ navigation }: Props) {
  const { create, submitting } = useCreateBeneficiario();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeneficiarioFormValues>({
    resolver: zodResolver(beneficiarioSchema),
    defaultValues: {
      nome: '',
      nome_responsavel: '',
      data_nascimento: '',
      phone1: '',
      phone2: '',
      latitude: DEFAULT_REGION.latitude,
      longitude: DEFAULT_REGION.longitude,
    },
  });

  const marker = { latitude: watch('latitude'), longitude: watch('longitude') };

  useEffect(() => {
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
  }, [setValue]);

  function handleMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setValue('latitude', latitude);
    setValue('longitude', longitude);
  }

  async function onSubmit(values: BeneficiarioFormValues) {
    setSubmitError(null);
    try {
      await create({
        nome: values.nome,
        nome_responsavel: values.nome_responsavel,
        data_nascimento: values.data_nascimento,
        phone1: values.phone1,
        phone2: values.phone2,
        location: { type: 'Point', coordinates: [values.longitude, values.latitude] },
      });
      navigation.goBack();
    } catch {
      setSubmitError('Não foi possível salvar o beneficiário agora. Tente novamente.');
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Novo beneficiário" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {submitError && <ErrorBanner message={submitError} />}
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

        <Button label="Salvar beneficiário" onPress={handleSubmit(onSubmit)} loading={submitting} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
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
});
