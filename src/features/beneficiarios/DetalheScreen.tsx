import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { ageInYears, beneficiarioStatus, statusLabel } from '../../utils/age';
import { useBeneficiario } from './hooks';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'Detalhe'>;

export function DetalheScreen({ route, navigation }: Props) {
  const { beneficiarioId } = route.params;
  const { data, visitas, loading, error, reload } = useBeneficiario(beneficiarioId);

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes" onBack={navigation.goBack} />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Tentar novamente" variant="outline" onPress={reload} />
        </View>
      </View>
    );
  }

  if (loading || !data) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes" onBack={navigation.goBack} />
        <ActivityIndicator style={styles.centerState} color={colors.primary} />
      </View>
    );
  }

  const status = beneficiarioStatus(data.data_nascimento);

  return (
    <View style={styles.container}>
      <Header title="Detalhe Beneficiário" onBack={navigation.goBack} />

      <FlatList
        contentContainerStyle={styles.content}
        data={visitas}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            {status === 'alerta' && (
              <View style={styles.alertBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.warning} />
                <Text style={styles.alertText}>
                  Esta criança está próxima de completar 4 anos. O acompanhamento será finalizado em
                  breve.
                </Text>
              </View>
            )}

            <Card style={styles.infoCard}>
              <View style={styles.infoTopRow}>
                <Text style={styles.name}>{data.nome}</Text>
                <Badge label={statusLabel(status)} variant={status} />
              </View>
              <Text style={styles.ageLabel}>{ageInYears(data.data_nascimento)} anos</Text>

              <InfoRow label="NASCIMENTO" value={dayjs(data.data_nascimento).format('DD/MM/YYYY')} />
              <InfoRow label="RESPONSÁVEL" value={`${data.nome_responsavel} — ${data.phone1}`} />
              <InfoRow
                label="ENDEREÇO"
                value={`${data.location.coordinates[1].toFixed(5)}, ${data.location.coordinates[0].toFixed(5)}`}
              />

              <Button
                label="Registrar visita"
                onPress={() => navigation.navigate('RegistrarVisita', { beneficiarioId })}
              />
            </Card>

            <Text style={styles.sectionTitle}>HISTÓRICO DE VISITAS</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('VisitaDetalhe', { visitaId: item.uuid })}>
            <Card style={styles.visitaCard}>
              <Text style={styles.visitaDate}>{dayjs(item.date).format('DD/MM/YYYY • HH:mm')}</Text>
              <Text style={styles.visitaRelato}>{item.evolucao}</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyVisitas}>Nenhuma visita registrada ainda.</Text>}
      />
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  alertBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.warningMuted,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  alertText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
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
  infoCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  ageLabel: {
    fontSize: fontSizes.base,
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
    marginBottom: spacing.sm,
  },
  visitaCard: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  visitaDate: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  visitaRelato: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  emptyVisitas: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
