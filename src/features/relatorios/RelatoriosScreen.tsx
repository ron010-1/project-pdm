import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { StatTile } from '../../components/StatTile';
import { BarChart } from '../../components/BarChart';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

const RESUMO_MOCK = { visitas: 28, familias: 12, pendentes: 3 };
const VISITAS_POR_SEMANA_MOCK = [
  { label: 'Sem. 1', value: 6 },
  { label: 'Sem. 2', value: 9 },
  { label: 'Sem. 3', value: 5 },
  { label: 'Sem. 4', value: 8 },
];

export function RelatoriosScreen() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleExport(label: string) {
    if (!inicio || !fim) {
      setFeedback({ type: 'error', message: 'Selecione o período completo!' });
      return;
    }
    setFeedback({ type: 'success', message: `${label} gerado com sucesso.` });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Visitas e atendimentos</Text>
              <Text style={styles.cardSubtitle}>Exporte por período</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <TextField label="Início" placeholder="dd/mm/aaaa" value={inicio} onChangeText={setInicio} />
            </View>
            <View style={styles.dateField}>
              <TextField label="Fim" placeholder="dd/mm/aaaa" value={fim} onChangeText={setFim} />
            </View>
          </View>

          {feedback && (
            <Text style={feedback.type === 'success' ? styles.successText : styles.errorText}>
              {feedback.message}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button label="Visualizar PDF" variant="outline" onPress={() => handleExport('PDF')} />
            </View>
            <View style={styles.buttonHalf}>
              <Button label="Exportar CSV" onPress={() => handleExport('CSV')} />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do mês</Text>
          <View style={styles.statsRow}>
            <StatTile value={RESUMO_MOCK.visitas} label="Visitas" />
            <StatTile value={RESUMO_MOCK.familias} label="Famílias" />
            <StatTile value={RESUMO_MOCK.pendentes} label="Pendentes" />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Visitas por semana</Text>
          <BarChart data={VISITAS_POR_SEMANA_MOCK} />
        </Card>
      </ScrollView>
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
    gap: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  successText: {
    fontSize: fontSizes.sm,
    color: colors.success,
    marginTop: -spacing.sm,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.dangerBorder,
    marginTop: -spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
