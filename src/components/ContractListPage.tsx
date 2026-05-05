import { useState, useEffect, useRef } from 'react';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { NETWORKS } from '../data';
import { trunc } from '../utils';
import type { Contract, Page } from '../data';

const PAGE_SIZE = 5;
const MAX_CONTRACTS = 10;

interface Props {
  network: string;
  setPage: (p: Page) => void;
  setSelectedContract: (c: Contract) => void;
}

export default function ContractListPage({ network, setPage, setSelectedContract }: Props) {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gotoAddr, setGotoAddr] = useState('');
  const [switching, setSwitching] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const prevNetwork = useRef(network);

  useEffect(() => {
    const isSwitch = prevNetwork.current !== network;
    if (isSwitch) setSwitching(true);
    setLoading(true);
    setError(null);
    prevNetwork.current = network;
    setCurrentPage(1);
    setFilter('');

    const net = NETWORKS.find(n => n.id === network);
    if (!net) {
      setError('Unknown network.');
      setLoading(false);
      setSwitching(false);
      return;
    }

    let cancelled = false;

    async function fetchContracts() {
      try {
        // Get the latest code ID
        const codesRes = await fetch(
          `${net!.restUrl}/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1`
        );
        if (!codesRes.ok) throw new Error(`Failed to fetch codes: ${codesRes.status}`);
        const codesJson = await codesRes.json();
        const codeInfos: { code_id: string }[] = codesJson.code_infos ?? [];
        if (codeInfos.length === 0) {
          if (!cancelled) { setContracts([]); setLoading(false); setSwitching(false); }
          return;
        }

        const latestCodeId = parseInt(codeInfos[0].code_id, 10);
        const addresses: string[] = [];

        // Walk backwards collecting contract addresses
        for (let id = latestCodeId; id >= 1 && addresses.length < MAX_CONTRACTS; id--) {
          const res = await fetch(
            `${net!.restUrl}/cosmwasm/wasm/v1/code/${id}/contracts?pagination.reverse=true&pagination.limit=${MAX_CONTRACTS - addresses.length}`
          );
          if (!res.ok) continue;
          const json = await res.json();
          const batch: string[] = (json.contracts ?? []).reverse();
          addresses.push(...batch);
        }

        if (cancelled) return;

        // Fetch contract details via CosmWasmClient
        const client = await CosmWasmClient.connect(net!.rpcUrl);
        const settled = await Promise.allSettled(
          addresses.slice(0, MAX_CONTRACTS).map(addr => client.getContract(addr))
        );

        if (cancelled) return;

        const result: Contract[] = settled
          .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof client.getContract>>> => r.status === 'fulfilled')
          .map(r => ({
            name: r.value.label,
            address: r.value.address,
            creator: r.value.creator,
          }));

        setContracts(result);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch contracts.');
      } finally {
        if (!cancelled) { setLoading(false); setSwitching(false); }
      }
    }

    fetchContracts();
    return () => { cancelled = true; };
  }, [network]);

  const netName = NETWORKS.find(n => n.id === network)?.name || network;
  const all = contracts;
  const filtered = all.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.address.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleGoto = () => {
    if (!gotoAddr.trim()) return;
    setSelectedContract({ name: 'Unknown Contract', address: gotoAddr.trim(), creator: '—' });
    setPage('detail');
  };

  return (
    <div className={`page page-enter${switching ? ' net-switching' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">
          Contracts
          <span className="network-badge">{netName}</span>
        </h1>
        <p className="page-subtitle">
          {loading ? 'Fetching contracts…' : `${filtered.length} contract${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="toolbar">
        <input
          className="input-filter"
          placeholder="Filter by name or address…"
          value={filter}
          onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
        />
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setCurrentPage(p => p - 1)}>←</button>
          <span className="page-info">{page} / {totalPages}</span>
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</button>
        </div>
      </div>

      {error && <div className="error-msg">✕ {error}</div>}

      {loading ? (
        <div className="contract-table">
          {[1,2,3,4,5].map(i => (
            <div className="skeleton-row" key={i}>
              <div className="skel" style={{ width: 28, height: 12, borderRadius: 2 }} />
              <div className="skel" style={{ flex: '1 1 auto', height: 12, maxWidth: 200 }} />
              <div className="skel" style={{ width: 180, height: 10 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">[ ]</div>
          <div className="empty-title">{filter ? 'No matching contracts' : 'No contracts on this network'}</div>
          <div className="empty-msg">{filter ? `No results for "${filter}"` : 'Try switching networks or uploading a contract.'}</div>
        </div>
      ) : (
        <div className="contract-table">
          {shown.map((c, i) => (
            <div
              className="contract-row"
              key={c.address}
              onClick={() => { setSelectedContract(c); setPage('detail'); }}
            >
              <span className="row-index">{String((page - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}</span>
              <span className="row-name">{c.name}</span>
              <span className="row-creator">{trunc(c.address, 14, 8)}</span>
              <span className="row-arrow">›</span>
            </div>
          ))}
        </div>
      )}

      <div className="goto-section">
        <div className="goto-label">Go to contract</div>
        <div className="goto-row">
          <input
            className="input-address"
            placeholder="Paste a contract address…"
            value={gotoAddr}
            onChange={e => setGotoAddr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGoto()}
          />
          <button className="btn-primary" onClick={handleGoto} disabled={!gotoAddr.trim()}>Go →</button>
        </div>
      </div>
    </div>
  );
}
