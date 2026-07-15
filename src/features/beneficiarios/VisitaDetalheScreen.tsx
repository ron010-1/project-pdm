import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { useVisita } from './hooks';
import * as beneficiariosApi from '../../api/beneficiarios';
import { Beneficiario } from '../../api/types';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'VisitaDetalhe'>;

export function VisitaDetalheScreen({ route, navigation }: Props) {
  const { visitaId } = route.params;
  const { data: visita, loading } = useVisita(visitaId);
  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);

  useEffect(() => {
    if (visita) {
      beneficiariosApi.getById(visita.beneficiarioId).then(setBeneficiario);
    }
  }, [visita]);

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
});
