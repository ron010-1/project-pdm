import { useCallback, useEffect, useState } from 'react';
import * as authApi from '../../api/auth';
import { MeResponse } from '../../api/types';

export function useMe() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authApi.me();
      setData(me);
    } catch {
      setError('Não foi possível carregar o perfil agora.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
