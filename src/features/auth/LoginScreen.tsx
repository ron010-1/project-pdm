import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { isAxiosError } from 'axios';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Card } from '../../components/Card';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').includes('@', { message: 'Inclua um "@" no endereço de email.' }),
  password: z.string().min(4, 'A senha deve ter ao menos 4 caracteres.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setServerError('Usuário inválido. Email ou senha estão incorretos.');
      } else {
        setServerError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <Text style={styles.heroSubtitle}>Programa Criança Feliz</Text>
        <Text style={styles.heroTitle}>SIGPCF</Text>
        <Text style={styles.heroTagline}>
          Acompanhe famílias e visitas domiciliares com segurança e mobilidade
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.formTitle}>Entrar na sua conta</Text>
        <Text style={styles.formSubtitle}>Informe suas credenciais</Text>

        {serverError && <ErrorBanner message={serverError} />}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="E-mail"
              icon="mail"
              placeholder="email@teste.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Senha"
              secure
              placeholder="***********"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Pressable
          onPress={() =>
            Alert.alert(
              'Esqueci a senha',
              'A recuperação de senha ainda não existe na API. Fale com um administrador do CRAS para redefinir sua senha.'
            )
          }
        >
          <Text style={styles.forgotPassword}>Esqueci a senha</Text>
        </Pressable>

        {submitting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button label="Entrar" onPress={handleSubmit(onSubmit)} />
        )}
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  hero: {
    paddingTop: 96,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heroSubtitle: {
    color: colors.textInverse,
    fontSize: fontSizes.sm,
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginTop: spacing.xs,
  },
  heroTagline: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    marginTop: spacing.lg,
  },
  card: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  formSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    marginBottom: spacing.xxl,
  },
});
