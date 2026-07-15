import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import * as visitasApi from '../../api/visitas';
import * as beneficiariosApi from '../../api/beneficiarios';
import { Beneficiario, Visita } from '../../api/types';

export type VisitaComBeneficiario = Visita & { beneficiario: Beneficiario | null };

export function useVisitasComBeneficiarios() {
  const [data, setData] = useState<VisitaComBeneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitas, beneficiarios] = await Promise.all([visitasApi.list(), beneficiariosApi.list()]);
      const byId = new Map(beneficiarios.map((beneficiario) => [beneficiario.uuid, beneficiario]));
      const merged = visitas
        .map((visita) => ({ ...visita, beneficiario: byId.get(visita.beneficiarioId) ?? null }))
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      setData(merged);
    } catch {
      setError('Não foi possível carregar as visitas agora.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
