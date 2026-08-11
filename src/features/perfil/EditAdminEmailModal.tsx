import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { editAdminEmailSchema, EditAdminEmailValues } from './schemas';

type Props = {
  visible: boolean;
  initialValues: EditAdminEmailValues;
  onClose: () => void;
  onSave: (values: EditAdminEmailValues) => Promise<void>;
};

export function EditAdminEmailModal({ visible, initialValues, onClose, onSave }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAdminEmailValues>({
    resolver: zodResolver(editAdminEmailSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (visible) {
      reset(initialValues);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function submit(values: EditAdminEmailValues) {
    setSubmitting(true);
    setError(null);
    try {
      await onSave(values);
      onClose();
    } catch {
      setError('Não foi possível salvar seu email. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar email</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {error && <ErrorBanner message={error} />}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                icon="mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Button label="Salvar alterações" onPress={handleSubmit(submit)} loading={submitting} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});