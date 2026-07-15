import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, radii, spacing } from '../../theme';
import { visitaSchema, VisitaFormValues } from './schemas';
import { useBeneficiarios, useCreateVisita } from './hooks';
import { uploadMedia } from '../../api/media';
import { saveVisitaMedia } from '../../storage/cache';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'RegistrarVisita'>;

export function RegistrarVisitaScreen({ route, navigation }: Props) {
  const { create, submitting } = useCreateVisita();
  const { data: beneficiarios } = useBeneficiarios();
  const [beneficiarioId, setBeneficiarioId] = useState<string | undefined>(route.params?.beneficiarioId);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [beneficiarioError, setBeneficiarioError] = useState<string | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const beneficiarioSelecionado = beneficiarios.find((item) => item.uuid === beneficiarioId);
  const beneficiariosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return beneficiarios;
    return beneficiarios.filter((item) => item.nome.toLowerCase().includes(term));
  }, [beneficiarios, search]);

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

  async function pickMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.7 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === 'video' ? 'video' : 'image');
      setUploadError(null);
    }
  }

  async function onSubmit(values: VisitaFormValues) {
    if (!beneficiarioId) {
      setBeneficiarioError('Selecione um beneficiário.');
      return;
    }
    setBeneficiarioError(null);
    setSubmitError(null);
    let mediaUrl: string | null = null;

    if (mediaUri) {
      setUploadingMedia(true);
      try {
        mediaUrl = await uploadMedia(mediaUri, mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
      } catch {
        setUploadError(
          mediaType === 'video'
            ? 'Não foi possível enviar o vídeo agora. A visita será salva sem ele.'
            : 'Não foi possível enviar a foto agora. A visita será salva sem ela.'
        );
      } finally {
        setUploadingMedia(false);
      }
    }

    try {
      const visita = await create({
        ...values,
        beneficiarioId,
        imagens: mediaUrl ? [mediaUrl] : undefined,
      });

      if (mediaUrl) {
        await saveVisitaMedia(visita.uuid, { url: mediaUrl, type: mediaType });
      }

      navigation.goBack();
    } catch {
      setSubmitError('Não foi possível salvar a visita agora. Tente novamente.');
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Registrar visita" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {submitError && <ErrorBanner message={submitError} />}

        <Text style={styles.fieldLabel}>Beneficiário</Text>
        <Pressable
          style={[styles.selectField, beneficiarioError && styles.selectFieldError]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={beneficiarioSelecionado ? styles.selectValue : styles.selectPlaceholder}>
            {beneficiarioSelecionado?.nome ?? 'Selecione...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {beneficiarioError && <Text style={styles.beneficiarioError}>{beneficiarioError}</Text>}

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

        <Text style={styles.photoLabel}>Foto ou vídeo da visita (opcional)</Text>
        <Pressable style={styles.photoPicker} onPress={pickMedia}>
          {mediaUri && mediaType === 'image' ? (
            <Image source={{ uri: mediaUri }} style={styles.photoPreview} />
          ) : mediaUri && mediaType === 'video' ? (
            <View style={styles.videoPreview}>
              <Ionicons name="videocam" size={24} color={colors.primary} />
              <Text style={styles.videoPreviewLabel}>Vídeo selecionado</Text>
            </View>
          ) : (
            <Ionicons name="camera" size={24} color={colors.textSecondary} />
          )}
        </Pressable>
        {uploadError && <Text style={styles.photoError}>{uploadError}</Text>}
        <Text style={styles.photoNote}>
          A mídia é enviada para um serviço próprio de imagens/vídeos — a API principal ainda não
          grava mídia de visita, então o vínculo com esta visita é lembrado só neste dispositivo.
        </Text>

        {uploadingMedia ? (
          <ActivityIndicator color={colors.primary} style={styles.uploadIndicator} />
        ) : (
          <Button label="Marcar como realizada" onPress={handleSubmit(onSubmit)} loading={submitting} />
        )}
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalContainer}>
          <Header title="Selecione o beneficiário" onBack={() => setPickerVisible(false)} />
          <View style={styles.modalSearchRow}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar por nome..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={beneficiariosFiltrados}
            keyExtractor={(item) => item.uuid}
            contentContainerStyle={styles.modalListContent}
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  setBeneficiarioId(item.uuid);
                  setBeneficiarioError(null);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.modalItemLabel}>{item.nome}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
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
  fieldLabel: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.xs,
  },
  selectFieldError: {
    borderColor: colors.dangerBorder,
  },
  selectValue: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  selectPlaceholder: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  beneficiarioError: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    marginBottom: spacing.lg,
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
  videoPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  videoPreviewLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  photoError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  photoNote: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  uploadIndicator: {
    marginVertical: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    margin: spacing.lg,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  modalListContent: {
    paddingHorizontal: spacing.lg,
  },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemLabel: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
});
