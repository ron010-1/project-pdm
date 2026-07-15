import { useCallback, useEffect, useState } from 'react';
import * as beneficiariosApi from '../../api/beneficiarios';
import * as visitasApi from '../../api/visitas';
import { Beneficiario, BeneficiarioInput, Visita, VisitaInput } from '../../api/types';
import { loadBeneficiariosCache, saveBeneficiariosCache } from '../../storage/cache';

export function useBeneficiarios() {
  const [data, setData] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await beneficiariosApi.list();
      setData(result);
      await saveBeneficiariosCache(result);
    } catch {
      const cached = await loadBeneficiariosCache();
      setData(cached);
      setError('Não foi possível atualizar a lista. Mostrando dados salvos no dispositivo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useBeneficiario(id: string) {
  const [data, setData] = useState<Beneficiario | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [beneficiario, allVisitas] = await Promise.all([
        beneficiariosApi.getById(id),
        visitasApi.list(),
      ]);
      setData(beneficiario);
      setVisitas(allVisitas.filter((visita) => visita.beneficiarioId === id));
    } catch {
      setError('Não foi possível carregar este beneficiário agora.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, visitas, loading, error, reload };
}

export function useCreateBeneficiario() {
  const [submitting, setSubmitting] = useState(false);

  async function create(input: BeneficiarioInput) {
    setSubmitting(true);
    try {
      return await beneficiariosApi.create(input);
    } finally {
      setSubmitting(false);
    }
  }

  return { create, submitting };
}

export function useCreateVisita() {
  const [submitting, setSubmitting] = useState(false);

  async function create(input: VisitaInput) {
    setSubmitting(true);
    try {
      return await visitasApi.create(input);
    } finally {
      setSubmitting(false);
    }
  }

  return { create, submitting };
}

export function useVisita(id: string) {
  const [data, setData] = useState<Visita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    visitasApi
      .getById(id)
      .then(setData)
      .catch(() => setError('Não foi possível carregar esta visita agora.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useUpdateVisitaDate() {
  const [submitting, setSubmitting] = useState(false);

  async function updateDate(id: string, date: string) {
    setSubmitting(true);
    try {
      return await visitasApi.update(id, { date });
    } finally {
      setSubmitting(false);
    }
  }

  return { updateDate, submitting };
}
