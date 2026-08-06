import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as assistentesApi from '../../api/assistentes';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { AssistentesStackParamList } from '../../navigation/types';
import { colors, fontSizes, spacing } from '../../theme';
import { assistenteFormSchema, AssistenteFormValues } from './schemas';

type Props = NativeStackScreenProps<AssistentesStackParamList, 'Novo' | 'Editar'>;

export function AssistenteFormScreen({ route, navigation }: Props) {
  const editing = route.name === 'Editar';
  const assistenteId = editing
    ? (route.params as AssistentesStackParamList['Editar']).assistenteId
    : null;
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useForm<AssistenteFormValues>({
    resolver: zodResolver(assistenteFormSchema),
    defaultValues: { nome: '', email: '', telefone: '', password: '' },
  });

  useEffect(() => {
    if (!assistenteId) return;
    assistentesApi
      .getById(assistenteId)
      .then((assistente) =>
        reset({
          nome: assistente.nome,
          email: assistente.email,
          telefone: assistente.telefone,
          password: '',
        })
      )
      .catch(() => setError('Não foi possível carregar o assistente social.'))
      .finally(() => setLoading(false));
  }, [assistenteId, reset]);

  async function submit(values: AssistenteFormValues) {
    if (!editing && !values.password) {
      setFieldError('password', { message: 'Informe uma senha.' });
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (assistenteId) {
        await assistentesApi.update(assistenteId, {
          nome: values.nome,
          email: values.email,
          telefone: values.telefone,
          ...(values.password ? { password: values.password } : {}),
        });
      } else {
        await assistentesApi.create({
          nome: values.nome,
          email: values.email,
          telefone: values.telefone,
          password: values.password,
        });
      }
      navigation.goBack();
    } catch {
      setError('Não foi possível salvar. Verifique se o email já está cadastrado e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Editar assistente" onBack={navigation.goBack} />
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={editing ? 'Editar assistente' : 'Novo assistente'} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.description}>
          {editing
            ? 'Atualize os dados da conta. Deixe a senha vazia para mantê-la.'
            : 'O assistente poderá entrar no aplicativo usando o email e a senha cadastrados.'}
        </Text>
        {error && <ErrorBanner message={error} />}
        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField label="Nome completo" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.nome?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField label="Email" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="telefone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField label="Telefone" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" error={errors.telefone?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField label={editing ? 'Nova senha (opcional)' : 'Senha'} value={value} onChangeText={onChange} onBlur={onBlur} secure autoCapitalize="none" error={errors.password?.message} />
          )}
        />
        <Button label={editing ? 'Salvar alterações' : 'Cadastrar assistente'} onPress={handleSubmit(submit)} loading={submitting} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1 },
  description: { color: colors.textSecondary, fontSize: fontSizes.sm, lineHeight: 20, marginBottom: spacing.lg },
});
