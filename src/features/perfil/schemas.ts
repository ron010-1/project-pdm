import { z } from 'zod';

export const editPerfilSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  email: z.string().trim().email('Informe um email válido.'),
  telefone: z.string().trim().min(1, 'Informe o telefone.'),
});

export type EditPerfilValues = z.infer<typeof editPerfilSchema>;

export const editAdminEmailSchema = z.object({
  email: z.string().trim().email('Informe um email válido.'),
});

export type EditAdminEmailValues = z.infer<typeof editAdminEmailSchema>;