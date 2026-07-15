import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { useVisitasComBeneficiarios } from './hooks';
import { navigateToFamilias } from '../../navigation/types';

const MESES_ABREVIADOS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

export function AgendaScreen() {
  const navigation = useNavigation();
  const { data, loading, error } = useVisitasComBeneficiarios();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <Pressable
          style={styles.newButton}
          onPress={() => navigateToFamilias(navigation, 'RegistrarVisita', {})}
        >
          <Ionicons name="add" size={16} color={colors.textInverse} />
          <Text style={styles.newButtonLabel}>Nova</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.offlineNotice}>{error}</Text>}

      <FlatList
        contentContainerStyle={styles.content}
        data={data}
        keyExtractor={(item) => item.uuid}
        refreshing={loading}
        ListEmptyComponent={
          <EmptyState
            title="Sem visitas registradas"
            message="Registre a primeira visita pela agenda."
          />
        }
        renderItem={({ item }) => {
          const date = dayjs(item.date);
          return (
            <Pressable
              onPress={() => navigateToFamilias(navigation, 'VisitaDetalhe', { visitaId: item.uuid })}
            >
              <Card style={styles.card}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateMonth}>{MESES_ABREVIADOS[date.month()]}</Text>
                  <Text style={styles.dateDay}>{date.format('DD')}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {item.beneficiario?.nome ?? 'Beneficiário removido'}
                  </Text>
                  <Text style={styles.data}>{date.format('HH:mm')} • visita domiciliar</Text>
                </View>
                <Badge label="Realizada" variant="realizada" />
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
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
    height: 49,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  newButtonLabel: {
    color: colors.textInverse,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  offlineNotice: {
    fontSize: fontSizes.xs,
    color: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateBadge: {
    width: 56,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  nome: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  data: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
