import { useSearchParams } from 'react-router-dom';

export function useNetwork(): [string, (n: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const network = searchParams.get('network') ?? 'osmosis-1';
  const setNetwork = (n: string) =>
    setSearchParams(prev => { prev.set('network', n); return prev; }, { replace: true });
  return [network, setNetwork];
}
