
import { useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'cw_network';
const DEFAULT_NETWORK = 'osmosis-1';

function getStoredNetwork(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_NETWORK; } catch { return DEFAULT_NETWORK; }
}

export function useNetwork(): [string, (n: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const network = searchParams.get('network') ?? getStoredNetwork();

  const setNetwork = (n: string) => {
    try { localStorage.setItem(STORAGE_KEY, n); } catch { /* ignore */ }
    setSearchParams(prev => { prev.set('network', n); return prev; }, { replace: true });
  };

  return [network, setNetwork];
}
