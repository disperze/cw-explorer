import { useState, useEffect, useRef } from 'react';
import { NETWORKS } from '../data';
import type { Code } from '../data';
import { fetchCodes } from '../api/wasm';

const MAX_CODES = 20;

interface UseCodesResult {
  codes: Code[];
  loading: boolean;
  error: string | null;
  switching: boolean;
}

export function useCodes(network: string): UseCodesResult {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const prevNetwork = useRef(network);

  useEffect(() => {
    const isSwitch = prevNetwork.current !== network;
    if (isSwitch) setSwitching(true);
    setLoading(true);
    setError(null);
    prevNetwork.current = network;

    const net = NETWORKS.find(n => n.id === network);
    if (!net) {
      setError('Unknown network.');
      setLoading(false);
      setSwitching(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const result = await fetchCodes(net!.restUrl, MAX_CODES);
        if (!cancelled) {
          setCodes(result);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch codes.');
      } finally {
        if (!cancelled) { setLoading(false); setSwitching(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [network]);

  return { codes, loading, error, switching };
}
