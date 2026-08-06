import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AssistenteSocial } from '../../api/types';
import * as assistentesApi from '../../api/assistentes';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { AssistentesStackParamList } from '../../navigation/types';
import { colors, fontSizes, fontWeights, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<AssistentesStackParamList, 'Lista'>;

export function AssistentesListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AssistenteSocial[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await assistentesApi.list());
    } catch {
      setError('Não foi possível carregar os assistentes sociais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => void load(), [load]));

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (item) => item.nome.toLowerCase().includes(term) || item.email.toLowerCase().includes(term)
    );
  }, [data, query]);

  function confirmDelete(item: AssistenteSocial) {
    Alert.alert(
      'Excluir assistente',
      `Deseja excluir ${item.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await assistentesApi.remove(item.uuid);
              setData((current) => current.filter((assistente) => assistente.uuid !== item.uuid));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o assistente social.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View>
          <Text style={styles.title}>Assistentes sociais</Text>
          <Text style={styles.subtitle}>Gerenciamento exclusivo do administrador</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => navigation.navigate('Novo')}>
          <Ionicons name="add" size={18} color={colors.textInverse} />
          <Text style={styles.newButtonText}>Novo</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nome ou email..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      </View>

      {error && <ErrorBanner message={error} />}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uuid}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={query ? 'Nenhum resultado' : 'Nenhum assistente cadastrado'}
            message={query ? 'Tente buscar por outro nome ou email.' : 'Cadastre o primeiro assistente social.'}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.email}</Text>
              <Text style={styles.meta}>{item.telefone}</Text>
            </View>
            <Pressable
              accessibilityLabel={`Editar ${item.nome}`}
              style={styles.iconButton}
              onPress={() => navigation.navigate('Editar', { assistenteId: item.uuid })}
            >
              <Ionicons name="pencil" size={19} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityLabel={`Excluir ${item.nome}`}
              style={styles.iconButton}
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash-outline" size={19} color={colors.danger} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.lg },
  title: { color: colors.textPrimary, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  subtitle: { color: colors.textSecondary, fontSize: fontSizes.xs, marginTop: spacing.xs },
  newButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  newButtonText: { color: colors.textInverse, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.md, marginBottom: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: fontSizes.base },
  list: { paddingBottom: spacing.xxl },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryMuted },
  avatarText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: fontWeights.bold },
  cardBody: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: fontWeights.semibold },
  meta: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 2 },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
