import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { colors, fontSizes, fontWeights, radii, spacing } from '../theme';
import { Button } from './Button';
import ErrorIcon from '../../assets/error_icon.svg';

type DateFieldProps = {
  label: string;
  /** Data no formato da API (AAAA-MM-DD). String vazia quando nada foi escolhido. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

const API_FORMAT = 'YYYY-MM-DD';

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Selecione a data',
  error,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? dayjs(value) : null;
  const selectedDate = parsed?.isValid() ? parsed.toDate() : new Date();

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    // No Android o picker é um diálogo próprio: fecha sozinho e avisa se foi
    // confirmado ou cancelado. No iOS ele fica embutido no nosso modal.
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && date) {
        onChange(dayjs(date).format(API_FORMAT));
      }
      return;
    }

    if (date) {
      onChange(dayjs(date).format(API_FORMAT));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[styles.field, !!error && styles.fieldError]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={parsed?.isValid() ? styles.value : styles.placeholder}>
          {parsed?.isValid() ? parsed.format('DD/MM/YYYY') : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </Pressable>

      {!!error && (
        <View style={styles.errorContainer}>
          <ErrorIcon width={11} height={11} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {open && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{label}</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
              <Button
                label="Pronto"
                onPress={() => {
                  // Sem interação o picker não dispara onChange: confirma o que está visível.
                  if (!parsed?.isValid()) onChange(dayjs(selectedDate).format(API_FORMAT));
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.inputStroke,
  },
  fieldError: {
    borderColor: colors.dangerBorder,
  },
  value: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.xs,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
