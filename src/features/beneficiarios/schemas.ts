import { z } from 'zod';

export const beneficiarioSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da criança.'),
  nome_responsavel: z.string().min(1, 'Informe o nome do responsável.'),
  data_nascimento: z.string().min(1, 'Informe a data de nascimento.'),
  phone1: z.string().min(1, 'Informe um telefone de contato.'),
  phone2: z.string().optional(),
  latitude: z.number({ message: 'Marque o endereço no mapa.' }),
  longitude: z.number({ message: 'Marque o endereço no mapa.' }),
});

export type BeneficiarioFormValues = z.infer<typeof beneficiarioSchema>;

export const visitaSchema = z.object({
  date: z.string().min(1, 'Informe a data da visita.'),
  evolucao: z.string().min(1, 'Descreva a evolução do atendimento.'),
  acompanhamento_familiar: z.string().min(1, 'Descreva o acompanhamento familiar.'),
  estimulo_familiar: z.string().min(1, 'Descreva o estímulo familiar.'),
});

export type VisitaFormValues = z.infer<typeof visitaSchema>;
