import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import { Card } from '../../components/Card';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useBeneficiarios } from '../beneficiarios/hooks';
import { beneficiarioStatus } from '../../utils/age';
import { useVisitasComBeneficiarios } from '../agenda/hooks';
import { navigateToFamilias } from '../../navigation/types';

export function InicioScreen() {
  const navigation = useNavigation();
  const { nome } = useAuth();
  const { data: beneficiarios } = useBeneficiarios();
  const { data: visitas } = useVisitasComBeneficiarios();

  const ativos = useMemo(
    () => beneficiarios.filter((item) => beneficiarioStatus(item.data_nascimento) === 'ativo'),
    [beneficiarios]
  );
  const emAlerta = useMemo(
    () => beneficiarios.filter((item) => beneficiarioStatus(item.data_nascimento) === 'alerta'),
    [beneficiarios]
  );
  const visitasHoje = useMemo(
    () => visitas.filter((item) => dayjs(item.date).isSame(dayjs(), 'day')),
    [visitas]
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, '#008892']} style={styles.hero}>
        <Text style={styles.heroGreetingLabel}>Bem-vinda,</Text>
        <Text style={styles.heroGreetingName}>{nome ?? 'Assistente Social'}</Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatValue}>{visitasHoje.length}</Text>
            <Text style={styles.heroStatLabel}>Visitas hoje</Text>
          </View>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatValue}>{ativos.length}</Text>
            <Text style={styles.heroStatLabel}>Famílias ativas</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {emAlerta.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <View style={styles.alertTextGroup}>
              <Text style={styles.alertTitle}>Atenção: {emAlerta.length} criança(s) em alerta</Text>
              <Text style={styles.alertSubtitle}>
                Próximas de completar 4 anos — programa será finalizado.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Visitas de hoje</Text>
          <Pressable onPress={() => navigation.navigate('Agenda' as never)}>
            <Text style={styles.sectionLink}>Ver agenda</Text>
          </Pressable>
        </View>

        {visitasHoje.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma visita marcada para hoje.</Text>
        ) : (
          visitasHoje.map((visita) => (
            <Pressable
              key={visita.uuid}
              onPress={() => navigateToFamilias(navigation, 'VisitaDetalhe', { visitaId: visita.uuid })}
            >
              <Card style={styles.visitaCard}>
                <View style={styles.visitaIcon}>
                  <Ionicons name="home" size={20} color={colors.primary} />
                </View>
                <View style={styles.visitaBody}>
                  <Text style={styles.visitaNome} numberOfLines={1}>
                    {visita.beneficiario?.nome ?? 'Beneficiário removido'}
                  </Text>
                  <Text style={styles.visitaMeta}>{dayjs(visita.date).format('HH:mm')} • Visita domiciliar</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Card>
            </Pressable>
          ))
        )}

        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickActionCard}
            onPress={() => navigateToFamilias(navigation, 'RegistrarVisita', {})}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.quickActionLabel}>Nova visita</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionCard}
            onPress={() => navigateToFamilias(navigation, 'Novo', undefined)}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.quickActionLabel}>Novo beneficiário</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroGreetingLabel: {
    fontSize: fontSizes.sm,
    color: colors.textInverse,
  },
  heroGreetingName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  heroStatPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  heroStatValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  heroStatLabel: {
    fontSize: fontSizes.xs,
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  alertBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningMuted,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  alertTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  alertTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  alertSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  sectionLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  visitaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  visitaIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitaBody: {
    flex: 1,
    gap: spacing.xs,
  },
  visitaNome: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  visitaMeta: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
  },
  quickActionLabel: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
});
