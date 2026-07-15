import dayjs from 'dayjs';
import { StatusVariant } from '../theme';

const PROGRAM_AGE_LIMIT_YEARS = 4;
const ALERT_WINDOW_MONTHS = 3;

export function ageInYears(dataNascimento: string): number {
  return dayjs().diff(dayjs(dataNascimento), 'year');
}

export function beneficiarioStatus(dataNascimento: string): Extract<StatusVariant, 'ativo' | 'alerta' | 'finalizado'> {
  const birth = dayjs(dataNascimento);
  const cutoff = birth.add(PROGRAM_AGE_LIMIT_YEARS, 'year');
  const now = dayjs();

  if (now.isAfter(cutoff)) return 'finalizado';
  if (cutoff.diff(now, 'month') <= ALERT_WINDOW_MONTHS) return 'alerta';
  return 'ativo';
}

export function statusLabel(status: 'ativo' | 'alerta' | 'finalizado'): string {
  return { ativo: 'Ativo', alerta: 'Alerta', finalizado: 'Finalizado' }[status];
}
