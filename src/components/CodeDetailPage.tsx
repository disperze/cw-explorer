import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trunc } from '../utils';
import { NETWORKS } from '../data';
import { getCosmWasmClient } from '../api/clientCache';
import { fetchCodeInfo, fetchCodeContracts } from '../api/wasm';
import { useNetwork } from '../hooks/useNetwork';
import type { Code, Contract } from '../data';

export default function CodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [network] = useNetwork();
  const [code, setCode] = useState<Code | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setContractsLoading(true);
    setError(null);
    setCode(null);
    setContracts([]);

    const net = NETWORKS.find(n => n.id === network);
    if (!net) {
      setError('Unknown network.');
      setLoading(false);
      setContractsLoading(false);
      return;
    }

    const codeId = parseInt(id, 10);

    async function load() {
      try {
        const codeInfo = await fetchCodeInfo(net!.restUrl, codeId);
        if (cancelled) return;
        setCode(codeInfo);
        setLoading(false);

        const addresses = await fetchCodeContracts(net!.restUrl, codeId);
        if (cancelled) return;

        if (addresses.length > 0) {
          const client = await getCosmWasmClient(net!.rpcUrl);
          if (cancelled) return;
          const settled = await Promise.allSettled(
            addresses.slice(0, 20).map(addr => client.getContract(addr))
          );
          if (cancelled) return;
          const result: Contract[] = settled
            .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof client.getContract>>> =>
              r.status === 'fulfilled'
            )
            .map(r => ({ name: r.value.label, address: r.value.address, creator: r.value.creator }));
          setContracts(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load code.');
          setLoading(false);
        }
      } finally {
        if (!cancelled) setContractsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, network]);

  return (
    <div className="page page-enter">
      <button className="back-link" onClick={() => navigate('/codes')}>
        ← Codes
      </button>

      {loading && !code && (
        <div className="contract-address-block">
          <div className="skel" style={{ width: 60, height: 12 }} />
          <div className="skel" style={{ flex: '1 1 auto', height: 12, maxWidth: 200 }} />
        </div>
      )}

      {error && <div className="error-msg" style={{ marginTop: 16 }}>✕ {error}</div>}

      {code && (
        <>
          <div className="contract-address-block">
            <span className="contract-address-label">Code</span>
            <span className="contract-address-val">#{code.id}</span>
          </div>

          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>
              {code.creator && (
                <span>creator: {trunc(code.creator, 12, 6)}</span>
              )}
              {code.dataHash && (
                <span style={{ marginLeft: 12 }}>hash: {code.dataHash.slice(0, 16)}…</span>
              )}
            </span>
          </div>

          <div className="divider" />

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text1)', fontWeight: 500 }}>
              Contracts
            </span>
          </div>

          {contractsLoading ? (
            <div className="contract-table">
              {[1, 2, 3].map(i => (
                <div className="skeleton-row" key={i}>
                  <div className="skel" style={{ width: 28, height: 12, borderRadius: 2 }} />
                  <div className="skel" style={{ flex: '1 1 auto', height: 12, maxWidth: 200 }} />
                  <div className="skel" style={{ width: 180, height: 10 }} />
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[ ]</div>
              <div className="empty-title">No contracts</div>
              <div className="empty-msg">No contracts have been instantiated from this code.</div>
            </div>
          ) : (
            <div className="contract-table">
              {contracts.map((c, i) => (
                <div
                  className="contract-row"
                  key={c.address}
                  onClick={() => navigate(`/contract/${c.address}`)}
                >
                  <span className="row-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="row-name">{c.name || '(unnamed)'}</span>
                  <span className="row-creator">{trunc(c.address, 14, 8)}</span>
                  <span className="row-arrow">›</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
