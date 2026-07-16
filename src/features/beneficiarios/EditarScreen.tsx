import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { colors, fontSizes, spacing } from '../../theme';
import { BeneficiarioForm } from './BeneficiarioForm';
import { useBeneficiario, useUpdateBeneficiario } from './hooks';

type Props = NativeStackScreenProps<FamiliasStackParamList, 'Editar'>;

export function EditarScreen({ route, navigation }: Props) {
  const { beneficiarioId } = route.params;
  const { data, loading, error, reload } = useBeneficiario(beneficiarioId);
  const { update, submitting } = useUpdateBeneficiario();

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Editar beneficiário" onBack={navigation.goBack} />
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Tentar novamente" variant="outline" onPress={reload} />
        </View>
      </View>
    );
  }

  if (loading || !data) {
    return (
      <View style={styles.container}>
        <Header title="Editar beneficiário" onBack={navigation.goBack} />
        <ActivityIndicator style={styles.centerState} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Editar beneficiário" onBack={navigation.goBack} />
      <BeneficiarioForm
        defaultValues={{
          nome: data.nome,
          nome_responsavel: data.nome_responsavel,
          data_nascimento: data.data_nascimento,
          phone1: data.phone1,
          phone2: data.phone2 ?? '',
          latitude: data.location.coordinates[1],
          longitude: data.location.coordinates[0],
        }}
        fotoInicial={data.foto}
        submitLabel="Salvar alterações"
        submitting={submitting}
        submitErrorMessage="Não foi possível salvar as alterações agora. Tente novamente."
        onSubmit={async (input) => {
          await update(beneficiarioId, input);
          navigation.goBack();
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
