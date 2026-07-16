import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from '../../navigation/types';
import { Header } from '../../components/Header';
import { colors } from '../../theme';
import { BeneficiarioForm } from './BeneficiarioForm';
import { useCreateBeneficiario } from './hooks';

const DEFAULT_REGION = {
  latitude: -7.1195,
  longitude: -34.845,
};

type Props = NativeStackScreenProps<FamiliasStackParamList, 'Novo'>;

export function NovoScreen({ navigation }: Props) {
  const { create, submitting } = useCreateBeneficiario();

  return (
    <View style={styles.container}>
      <Header title="Novo beneficiário" onBack={navigation.goBack} />
      <BeneficiarioForm
        defaultValues={{
          nome: '',
          nome_responsavel: '',
          data_nascimento: '',
          phone1: '',
          phone2: '',
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
        }}
        useCurrentLocationAsDefault
        submitLabel="Salvar beneficiário"
        submitting={submitting}
        submitErrorMessage="Não foi possível salvar o beneficiário agora. Tente novamente."
        onSubmit={async (input) => {
          await create(input);
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
});
