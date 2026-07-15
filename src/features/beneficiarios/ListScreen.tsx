import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';
import { ageInYears, beneficiarioStatus, statusLabel } from '../../utils/age';
import { useBeneficiarios } from './hooks';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'Lista'>;

export function ListScreen({ navigation }: Props) {
  const { data, loading, error } = useBeneficiarios();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (item) =>
        item.nome.toLowerCase().includes(term) || item.nome_responsavel.toLowerCase().includes(term)
    );
  }, [data, query]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Famílias</Text>
        <Pressable style={styles.newButton} onPress={() => navigation.navigate('Novo')}>
          <Ionicons name="add" size={16} color={colors.textInverse} />
          <Text style={styles.newButtonLabel}>Novo</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar criança ou responsável..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <Text style={styles.countLabel}>
        {filtered.length} de {data.length} beneficiários
      </Text>

      {error && <Text style={styles.offlineNotice}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        ListEmptyComponent={
          <EmptyState
            title={query ? 'Nenhum resultado' : 'Busca Sem Beneficiários'}
            message={
              query
                ? `Não encontramos beneficiários para "${query}"`
                : 'Cadastre o primeiro beneficiário para começar.'
            }
          />
        }
        renderItem={({ item }) => {
          const status = beneficiarioStatus(item.data_nascimento);
          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('Detalhe', { beneficiarioId: item.uuid })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>{item.nome.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Badge label={statusLabel(status)} variant={status} />
                </View>
                <Text style={styles.cardMeta}>
                  {ageInYears(item.data_nascimento)} anos • Resp.: {item.nome_responsavel}
                </Text>
              </View>
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
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  countLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  offlineNotice: {
    fontSize: fontSizes.xs,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  cardMeta: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
