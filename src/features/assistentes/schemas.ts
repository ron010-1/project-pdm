import { z } from 'zod';
import { telefoneSchema } from '../../utils/phone';

export const assistenteFormSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  email: z.string().trim().email('Informe um email válido.'),
  telefone: telefoneSchema,
  password: z
    .string()
    .refine((value) => value.length === 0 || value.length >= 6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export type AssistenteFormValues = z.infer<typeof assistenteFormSchema>;
