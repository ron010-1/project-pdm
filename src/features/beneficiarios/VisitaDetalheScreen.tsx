import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { useVisita } from './hooks';
import * as beneficiariosApi from '../../api/beneficiarios';
import { Beneficiario } from '../../api/types';
import { getVisitaImage } from '../../storage/cache';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'VisitaDetalhe'>;

export function VisitaDetalheScreen({ route, navigation }: Props) {
  const { visitaId } = route.params;
  const { data: visita, loading, error } = useVisita(visitaId);
  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visita) {
      beneficiariosApi.getById(visita.beneficiarioId).then(setBeneficiario);
    }
  }, [visita]);

  useEffect(() => {
    getVisitaImage(visitaId).then(setImageUrl);
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
          <InfoRow label="DATA" value={dayjs(visita.date).format('DD/MM/YYYY [às] HH:mm')} />
          <InfoRow
            label="ENDEREÇO"
            value={
              beneficiario
                ? `${beneficiario.location.coordinates[1].toFixed(5)}, ${beneficiario.location.coordinates[0].toFixed(5)}`
                : '—'
            }
          />
        </Card>

        <Text style={styles.sectionTitle}>RELATO</Text>
        <Card style={styles.relatoCard}>
          <Text style={styles.relatoText}>{visita.evolucao}</Text>
        </Card>

        {imageUrl && (
          <>
            <Text style={styles.sectionTitle}>FOTO DA VISITA</Text>
            <Image source={{ uri: imageUrl }} style={styles.photo} />
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
