import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useMe } from './hooks';
import { MeAssistente, MeResponse } from '../../api/types';
import EmailIcon from '../../../assets/email_icon.svg';
import PhoneIcon from '../../../assets/phone_icon.svg';
import LogoutIcon from '../../../assets/logout_icon.svg';

function isAssistente(data: MeResponse): data is MeAssistente {
  return 'telefone' in data;
}

export function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { data, loading, error } = useMe();

  const assistente = data && isAssistente(data) ? data : null;
  const nome = assistente?.nome ?? 'Administrador';
  const roleLabel = assistente ? 'Assistente Social' : 'Administrador';
  const initial = (assistente?.nome ?? data?.email ?? '?').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <View style={styles.content}>
        {!!error && <ErrorBanner message={error} />}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          data && (
            <>
              <Card style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.name}>{nome}</Text>
                <Text style={styles.role}>{roleLabel}</Text>
              </Card>

              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <EmailIcon width={16} height={16} />
                  <Text style={styles.infoText}>{data.email}</Text>
                </View>
                {assistente && (
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <PhoneIcon width={15} height={15} />
                    <Text style={styles.infoText}>{assistente.telefone}</Text>
                  </View>
                )}
              </Card>

              <Pressable
                onPress={logout}
                style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
              >
                <LogoutIcon width={16} height={16} />
                <Text style={styles.logoutText}>Sair</Text>
              </Pressable>
            </>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loading: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  role: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  infoCard: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoText: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  logoutText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.danger,
  },
});
