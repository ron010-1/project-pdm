import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

const SHORTCUTS = [
  { label: 'Famílias', icon: 'people' as const, tab: 'Familias' as const },
  { label: 'Agenda', icon: 'calendar' as const, tab: 'Agenda' as const },
  { label: 'Relatórios', icon: 'document-text' as const, tab: 'Relatorios' as const },
];

export function InicioScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>Bem-vindo(a) de volta</Text>
        <Text style={styles.subtitle}>Acompanhe famílias e visitas domiciliares com segurança e mobilidade</Text>

        <View style={styles.shortcuts}>
          {SHORTCUTS.map((shortcut) => (
            <Pressable
              key={shortcut.tab}
              onPress={() => navigation.navigate(shortcut.tab as never)}
            >
              <Card style={styles.shortcutCard}>
                <Ionicons name={shortcut.icon} size={22} color={colors.primary} />
                <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
              </Card>
            </Pressable>
          ))}
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
  header: {
    height: 49,
    justifyContent: 'center',
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
  content: {
    padding: spacing.lg,
  },
  greeting: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  shortcuts: {
    gap: spacing.md,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  shortcutLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
});
