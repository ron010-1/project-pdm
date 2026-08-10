import { useCallback, useEffect, useMemo, useState } from 'react';
import * as assistentesApi from '../../api/assistentes';
import { AssistenteSocial } from '../../api/types';

/**
 * Lista de assistentes sociais. O backend já filtra por papel: admin recebe
 * todos, assistente recebe apenas o próprio registro.
 */
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

/**
 * Rótulo de quem cadastrou um registro. A API grava `assistenteId` nulo quando
 * quem cadastrou foi um admin.
 */
export function rotuloCadastradoPor(
  assistenteId: string | null | undefined,
  nomePorId: Map<string, string>
): string {
  if (!assistenteId) return 'Administrador';
  return nomePorId.get(assistenteId) ?? 'Assistente social';
}
