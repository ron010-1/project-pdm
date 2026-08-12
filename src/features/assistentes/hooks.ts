import { useCallback, useEffect, useMemo, useState } from 'react';
import * as assistentesApi from '../../api/assistentes';
import { AssistenteSocial } from '../../api/types';

export function useAssistentes() {
  const [data, setData] = useState<AssistenteSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await assistentesApi.list());
    } catch {
      setError('Não foi possível carregar os assistentes sociais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const nomePorId = useMemo(
    () => new Map(data.map((assistente) => [assistente.uuid, assistente.nome])),
    [data]
  );

  return { data, nomePorId, loading, error, reload };
}

export function rotuloCadastradoPor(
  assistenteId: string | null | undefined,
  nomePorId: Map<string, string>
): string {
  if (!assistenteId) return 'Administrador';
  return nomePorId.get(assistenteId) ?? 'Assistente social';
}
