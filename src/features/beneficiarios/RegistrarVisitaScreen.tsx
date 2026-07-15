import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { colors, fontSizes, radii, spacing } from '../../theme';
import { visitaSchema, VisitaFormValues } from './schemas';
import { useCreateVisita } from './hooks';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'RegistrarVisita'>;

export function RegistrarVisitaScreen({ route, navigation }: Props) {
  const { beneficiarioId } = route.params;
  const { create, submitting } = useCreateVisita();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitaFormValues>({
    resolver: zodResolver(visitaSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      evolucao: '',
      acompanhamento_familiar: '',
      estimulo_familiar: '',
    },
  });

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function onSubmit(values: VisitaFormValues) {
    await create({
      ...values,
      beneficiarioId,
      imagens: photoUri ? [photoUri] : undefined,
    });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Header title="Registrar visita" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextField label="Data" placeholder="AAAA-MM-DD" value={value} onChangeText={onChange} error={errors.date?.message} />
          )}
        />
        <Controller
          control={control}
          name="evolucao"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Evolução"
              multiline
              value={value}
              onChangeText={onChange}
              error={errors.evolucao?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="acompanhamento_familiar"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Acompanhamento familiar"
              multiline
              value={value}
              onChangeText={onChange}
              error={errors.acompanhamento_familiar?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="estimulo_familiar"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Estímulo familiar"
              multiline
              value={value}
              onChangeText={onChange}
              error={errors.estimulo_familiar?.message}
            />
          )}
        />

        <Text style={styles.photoLabel}>Foto da visita (opcional)</Text>
        <Pressable style={styles.photoPicker} onPress={pickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <Ionicons name="camera" size={24} color={colors.textSecondary} />
          )}
        </Pressable>
        <Text style={styles.photoNote}>
          A foto é salva apenas no dispositivo — a API ainda não grava imagens de visita.
        </Text>

        <Button label="Salvar visita" onPress={handleSubmit(onSubmit)} loading={submitting} />
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
  photoNote: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
