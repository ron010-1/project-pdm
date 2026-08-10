import { z } from 'zod';

/**
 * Validação permissiva de telefone brasileiro: ignora máscara e aceita de
 * 10 dígitos (fixo com DDD) a 13 (com +55). A API não impõe formato nenhum,
 * então a checagem aqui é só para pegar erro de digitação.
 */
export const telefoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }, 'Informe um telefone válido com DDD.');

/** Versão para campos opcionais: string vazia passa, preenchida é validada. */
export const telefoneOpcionalSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }, 'Informe um telefone válido com DDD.')
  .optional();
