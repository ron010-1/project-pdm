import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { TextField } from '../../components/TextField';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { useUpdateVisitaDate, useVisita } from './hooks';
import * as beneficiariosApi from '../../api/beneficiarios';
import { Beneficiario } from '../../api/types';
import { getVisitaMedia, VisitaMedia } from '../../storage/cache';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { useAddress } from '../../utils/location';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'VisitaDetalhe'>;

export function VisitaDetalheScreen({ route, navigation }: Props) {
  const { visitaId } = route.params;
  const { data: visita, loading, error, reload } = useVisita(visitaId);
  const { userId } = useAuth();
  const { updateDate, submitting: savingDate } = useUpdateVisitaDate();
  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);
  const [media, setMedia] = useState<VisitaMedia | null>(null);
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const endereco = useAddress(beneficiario?.location.coordinates[1], beneficiario?.location.coordinates[0]);

  const podeEditarData = !!visita && visita.assistenteId === userId;

  async function salvarNovaData() {
    if (!dateDraft.trim()) {
      setDateError('Informe a nova data.');
      return;
    }
    setDateError(null);
    try {
      await updateDate(visitaId, dateDraft);
      setEditingDate(false);
      reload();
    } catch {
      setDateError('Não foi possível atualizar a data agora.');
    }
  }

  useEffect(() => {
    if (visita) {
      beneficiariosApi.getById(visita.beneficiarioId).then(setBeneficiario);
    }
  }, [visita]);

  useEffect(() => {
    getVisitaMedia(visitaId).then(setMedia);
  }, [visitaId]);

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes da visita" onBack={navigation.goBack} />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Voltar" variant="outline" onPress={navigation.goBack} />
        </View>
      </View>
    );
  }

  if (loading || !visita) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes da visita" onBack={navigation.goBack} />
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Detalhes da visita" onBack={navigation.goBack} />

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <Badge label="REALIZADA" variant="realizada" />
            <Text style={styles.version}>#v3</Text>
          </View>

          <InfoRow label="BENEFICIÁRIO" value={beneficiario?.nome ?? '—'} />

          <View style={styles.dateRow}>
            <InfoRow label="DATA" value={dayjs(visita.date).format('DD/MM/YYYY [às] HH:mm')} />
            {podeEditarData && !editingDate && (
              <Pressable
                onPress={() => {
                  setDateDraft(visita.date.slice(0, 10));
                  setEditingDate(true);
                }}
                hitSlop={8}
              >
                <Ionicons name="pencil" size={16} color={colors.primary} />
              </Pressable>
            )}
          </View>

          {editingDate && (
            <View>
              {dateError && <ErrorBanner message={dateError} />}
              <TextField label="Nova data" placeholder="AAAA-MM-DD" value={dateDraft} onChangeText={setDateDraft} />
              <View style={styles.dateEditButtons}>
                <View style={styles.dateEditButton}>
                  <Button label="Cancelar" variant="outline" onPress={() => setEditingDate(false)} />
                </View>
                <View style={styles.dateEditButton}>
                  <Button label="Salvar" onPress={salvarNovaData} loading={savingDate} />
                </View>
              </View>
            </View>
          )}

          <InfoRow
            label="ENDEREÇO"
            value={
              endereco ??
              (beneficiario
                ? `${beneficiario.location.coordinates[1].toFixed(5)}, ${beneficiario.location.coordinates[0].toFixed(5)}`
                : '—')
            }
          />
        </Card>

        <Text style={styles.sectionTitle}>RELATO</Text>
        <Card style={styles.relatoCard}>
          <Text style={styles.relatoText}>{visita.evolucao}</Text>
        </Card>

        {media && (
          <>
            <Text style={styles.sectionTitle}>{media.type === 'video' ? 'VÍDEO DA VISITA' : 'FOTO DA VISITA'}</Text>
            {media.type === 'video' ? (
              <VideoPreview uri={media.url} />
            ) : (
              <Image source={{ uri: media.url }} style={styles.photo} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView style={styles.photo} player={player} nativeControls />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    marginTop: spacing.xxl,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  version: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  infoRow: {
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateEditButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateEditButton: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  relatoCard: {
    padding: spacing.lg,
  },
  relatoText: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radii.md,
  },
});
