import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { StatTile } from '../../components/StatTile';
import { BarChart } from '../../components/BarChart';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { useBeneficiarios } from '../beneficiarios/hooks';
import { useVisitasComBeneficiarios } from '../agenda/hooks';
import { beneficiarioStatus } from '../../utils/age';

export function RelatoriosScreen() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: beneficiarios, loading: loadingBeneficiarios, error: errorBeneficiarios } = useBeneficiarios();
  const { data: visitas, loading: loadingVisitas, error: errorVisitas } = useVisitasComBeneficiarios();

  const loading = loadingBeneficiarios || loadingVisitas;
  const error = errorBeneficiarios || errorVisitas;

  const visitasNoMes = useMemo(
    () => visitas.filter((visita) => dayjs(visita.date).isSame(dayjs(), 'month')).length,
    [visitas]
  );
  const familiasAtivas = useMemo(
    () => beneficiarios.filter((item) => beneficiarioStatus(item.data_nascimento) === 'ativo').length,
    [beneficiarios]
  );
  const familiasPendentes = useMemo(
    () => beneficiarios.filter((item) => beneficiarioStatus(item.data_nascimento) === 'alerta').length,
    [beneficiarios]
  );
  const visitasPorSemana = useMemo(() => {
    const hoje = dayjs();
    return [3, 2, 1, 0].map((semanasAtras, index) => {
      const inicioSemana = hoje.subtract(semanasAtras, 'week').startOf('week');
      const fimSemana = hoje.subtract(semanasAtras, 'week').endOf('week');
      const value = visitas.filter((visita) => {
        const data = dayjs(visita.date);
        return !data.isBefore(inicioSemana) && !data.isAfter(fimSemana);
      }).length;
      return { label: `Sem. ${index + 1}`, value };
    });
  }, [visitas]);

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
        {error && <ErrorBanner message={error} />}

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
            <StatTile value={loading ? '—' : visitasNoMes} label="Visitas" />
            <StatTile value={loading ? '—' : familiasAtivas} label="Famílias" />
            <StatTile value={loading ? '—' : familiasPendentes} label="Pendentes" />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Visitas por semana</Text>
          <BarChart data={visitasPorSemana} />
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
