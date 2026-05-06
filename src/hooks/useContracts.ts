import { useState, useEffect, useRef } from 'react';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { NETWORKS } from '../data';
import type { Contract } from '../data';
import { fetchLatestCodeId, fetchContractAddresses } from '../api/wasm';

const MAX_CONTRACTS = 10;

interface UseContractsResult {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  switching: boolean;
}

export function useContracts(network: string): UseContractsResult {
  const [contracts, setContracts] = useState<Contract[]>([]);
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
        const latestCodeId = await fetchLatestCodeId(net!.restUrl);
        if (latestCodeId === null) {
          if (!cancelled) { setContracts([]); setLoading(false); setSwitching(false); }
          return;
        }
        const addresses = await fetchContractAddresses(net!.restUrl, latestCodeId, MAX_CONTRACTS);
        if (cancelled) return;
        const client = await CosmWasmClient.connect(net!.rpcUrl);
        const settled = await Promise.allSettled(
          addresses.slice(0, MAX_CONTRACTS).map(addr => client.getContract(addr))
        );
        if (cancelled) return;
        const result: Contract[] = settled
          .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof client.getContract>>> =>
            r.status === 'fulfilled'
          )
          .map(r => ({ name: r.value.label, address: r.value.address, creator: r.value.creator }));
        setContracts(result);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch contracts.');
      } finally {
        if (!cancelled) { setLoading(false); setSwitching(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [network]);

  return { contracts, loading, error, switching };
}
