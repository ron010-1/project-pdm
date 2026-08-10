import { z } from 'zod';

export const telefoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }, 'Informe um telefone válido com DDD.');

export const telefoneOpcionalSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }, 'Informe um telefone válido com DDD.')
  .optional();
