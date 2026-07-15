import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

const AGENDA_MOCK = [
  { id: '1', nome: 'Sofia Albuquerque', data: '15/07/2026 às 09:00' },
  { id: '2', nome: 'Lucas Mendes', data: '15/07/2026 às 11:00' },
  { id: '3', nome: 'Davi Oliveira', data: '16/07/2026 às 14:00' },
];

export function AgendaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={AGENDA_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.data}>{item.data}</Text>
          </Card>
        )}
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
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
  nome: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  data: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
