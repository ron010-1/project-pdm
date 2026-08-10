import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DateField } from '../../components/DateField';
import { StatTile } from '../../components/StatTile';
import { BarChart } from '../../components/BarChart';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { useBeneficiarios } from '../beneficiarios/hooks';
import { useVisitasComBeneficiarios } from '../agenda/hooks';
import { rotuloCadastradoPor, useAssistentes } from '../assistentes/hooks';
import { beneficiarioStatus } from '../../utils/age';
import { DadosRelatorio, exportarCsv, exportarPdf, LinhaRelatorio } from './export';

export function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [exportando, setExportando] = useState<'pdf' | 'csv' | null>(null);

  const { data: beneficiarios, loading: loadingBeneficiarios, error: errorBeneficiarios } = useBeneficiarios();
  const { data: visitas, loading: loadingVisitas, error: errorVisitas } = useVisitasComBeneficiarios();
  const { nomePorId } = useAssistentes();

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

  /**
   * Recorte do período: visitas entram pela data da visita, beneficiários pela
   * data de cadastro (`createdAt`, devolvido pela API).
   */
  const dadosDoPeriodo = useMemo<DadosRelatorio | null>(() => {
    if (!inicio || !fim) return null;

    const de = dayjs(inicio).startOf('day');
    const ate = dayjs(fim).endOf('day');
    const dentroDoPeriodo = (data?: string) => {
      if (!data) return false;
      const d = dayjs(data);
      return d.isValid() && !d.isBefore(de) && !d.isAfter(ate);
    };

    const visitasFiltradas = visitas.filter((visita) => dentroDoPeriodo(visita.date));
    const beneficiariosFiltrados = beneficiarios.filter((item) => dentroDoPeriodo(item.createdAt));

    const chaves = new Set<string>([
      ...visitasFiltradas.map((visita) => visita.assistenteId ?? ''),
      ...beneficiariosFiltrados.map((beneficiario) => beneficiario.assistenteId ?? ''),
    ]);

    const porAssistente: LinhaRelatorio[] = Array.from(chaves)
      .map((chave) => ({
        assistente: rotuloCadastradoPor(chave || null, nomePorId),
        visitas: visitasFiltradas.filter((visita) => (visita.assistenteId ?? '') === chave).length,
        beneficiarios: beneficiariosFiltrados.filter(
          (beneficiario) => (beneficiario.assistenteId ?? '') === chave
        ).length,
      }))
      .filter((linha) => linha.visitas > 0 || linha.beneficiarios > 0)
      .sort((a, b) => b.visitas - a.visitas);

    return {
      inicio,
      fim,
      totalVisitas: visitasFiltradas.length,
      totalBeneficiarios: beneficiariosFiltrados.length,
      porAssistente,
    };
  }, [inicio, fim, visitas, beneficiarios, nomePorId]);

  async function handleExport(formato: 'pdf' | 'csv') {
    if (!dadosDoPeriodo) {
      setFeedback({ type: 'error', message: 'Selecione o período completo!' });
      return;
    }

    setFeedback(null);
    setExportando(formato);
    try {
      if (formato === 'pdf') {
        await exportarPdf(dadosDoPeriodo);
      } else {
        await exportarCsv(dadosDoPeriodo);
      }
      setFeedback({ type: 'success', message: 'Relatório gerado. Escolha onde salvar ou enviar.' });
    } catch {
      setFeedback({ type: 'error', message: 'Não foi possível gerar o relatório agora.' });
    } finally {
      setExportando(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
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
              <DateField label="Início" value={inicio} onChange={setInicio} maximumDate={new Date()} />
            </View>
            <View style={styles.dateField}>
              <DateField label="Fim" value={fim} onChange={setFim} maximumDate={new Date()} />
            </View>
          </View>

          {dadosDoPeriodo && (
            <View style={styles.previaBox}>
              <Text style={styles.previaTitulo}>
                {dadosDoPeriodo.totalVisitas} visita(s) no período · {dadosDoPeriodo.totalBeneficiarios}{' '}
                beneficiário(s) cadastrado(s)
              </Text>
              {dadosDoPeriodo.porAssistente.map((linha) => (
                <Text key={linha.assistente} style={styles.previaLinha}>
                  {linha.assistente}: {linha.visitas} visita(s), {linha.beneficiarios} beneficiário(s)
                </Text>
              ))}
            </View>
          )}

          {feedback && (
            <Text style={feedback.type === 'success' ? styles.successText : styles.errorText}>
              {feedback.message}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                label="Exportar PDF"
                variant="outline"
                onPress={() => handleExport('pdf')}
                loading={exportando === 'pdf'}
                disabled={loading || exportando !== null}
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button
                label="Exportar CSV"
                onPress={() => handleExport('csv')}
                loading={exportando === 'csv'}
                disabled={loading || exportando !== null}
              />
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
  previaBox: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: -spacing.sm,
  },
  previaTitulo: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  previaLinha: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
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
