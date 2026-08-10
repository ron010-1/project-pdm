import { z } from 'zod';

export const editPerfilSchema = z.object({
  email: z.string().trim().email('Informe um email válido.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.'),
});

export type EditPerfilValues = z.infer<typeof editPerfilSchema>;