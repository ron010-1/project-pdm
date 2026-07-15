export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type Beneficiario = {
  uuid: string;
  nome: string;
  nome_responsavel: string;
  data_nascimento: string;
  phone1: string;
  phone2?: string;
  location: GeoPoint;
  assistenteId: string;
};

export type BeneficiarioInput = {
  nome: string;
  nome_responsavel: string;
  data_nascimento: string;
  phone1: string;
  phone2?: string;
  location: GeoPoint;
};

export type Visita = {
  uuid: string;
  date: string;
  evolucao: string;
  acompanhamento_familiar: string;
  estimulo_familiar: string;
  assistenteId: string;
  beneficiarioId: string;
  imagens?: string[];
};

export type VisitaInput = {
  date: string;
  evolucao: string;
  acompanhamento_familiar: string;
  estimulo_familiar: string;
  beneficiarioId: string;
  imagens?: string[];
};

export type AssistenteSocial = {
  uuid: string;
  email: string;
  telefone: string;
  nome: string;
  adminId: string;
};

export type LoginResponse = {
  token: string;
};
