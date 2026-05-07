import { useState, useEffect, useCallback } from 'react';
import { getStargateClient } from '../api/clientCache';
import { NETWORKS } from '../data';
import { syntaxHighlight } from '../utils';
import type { Contract, TokenBalance } from '../data';

interface Props {
  contract: Contract;
  network: string;
}

const DENOM_META: Record<string, { display: string; exponent: number; logo: string }> = {
  uosmo:  { display: 'OSMO',  exponent: 6, logo: 'O' },
  uatom:  { display: 'ATOM',  exponent: 6, logo: 'A' },
  ujuno:  { display: 'JUNO',  exponent: 6, logo: 'J' },
  untrn:  { display: 'NTRN',  exponent: 6, logo: 'N' },
  ustars: { display: 'STARS', exponent: 6, logo: '★' },
  uusdc:  { display: 'USDC',  exponent: 6, logo: '$' },
};

function denomFallback(baseDenom: string): { display: string; exponent: number; logo: string } {
  if (baseDenom.startsWith('u') && baseDenom.length > 1) {
    const sym = baseDenom.slice(1).toUpperCase();
    return { display: sym, exponent: 6, logo: sym[0] };
  }
  const sym = baseDenom.toUpperCase().slice(0, 6);
  return { display: sym, exponent: 0, logo: sym[0] };
}

async function resolveTokenBalance(
  denom: string,
  amount: string,
  restUrl: string,
): Promise<TokenBalance> {
  if (denom.startsWith('ibc/')) {
    const hash = denom.slice(4);
    try {
      const res = await fetch(`${restUrl}/ibc/apps/transfer/v1/denom_traces/${hash}`);
      const data = await res.json() as { denom_trace?: { base_denom?: string } };
      const baseDenom = data.denom_trace?.base_denom ?? denom;
      const meta = DENOM_META[baseDenom] ?? denomFallback(baseDenom);
      return { denom, amount, display: `${meta.display} (IBC)`, exponent: meta.exponent, logo: '↔' };
    } catch {
      return { denom, amount, display: 'IBC', exponent: 0, logo: '↔' };
    }
  }

  const meta = DENOM_META[denom] ?? denomFallback(denom);
  return { denom, amount, ...meta };
}

function fmt(amount: string, exp: number): string {
  const n = Number(amount) / Math.pow(10, exp);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function truncDenom(d: string): string {
  return d.length > 36 ? d.slice(0, 18) + '…' + d.slice(-10) : d;
}

export default function BalancesTab({ contract, network }: Props) {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const fetchBalances = useCallback(async () => {
    const net = NETWORKS.find(n => n.id === network);
    if (!net) { setError('Unknown network.'); setLoading(false); return; }

    setLoading(true);
    setError(null);
    setBalances([]);

    try {
      const client = await getStargateClient(net.rpcUrl);
      const coins = await client.getAllBalances(contract.address);
      const resolved = await Promise.all(
        coins.map(c => resolveTokenBalance(c.denom, c.amount, net.restUrl)),
      );
      setBalances(resolved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch balances.');
    } finally {
      setLoading(false);
    }
  }, [contract.address, network]);

  useEffect(() => { fetchBalances(); }, [fetchBalances, refresh]);

  const handleRefresh = () => setRefresh(r => r + 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
          {loading ? 'Fetching balances…' : `${balances.length} token${balances.length !== 1 ? 's' : ''} held`}
        </span>
        {!loading && (
          <button
            onClick={handleRefresh}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text0)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; }}
          >↻ Refresh</button>
        )}
      </div>

      {loading ? (
        <div className="contract-table">
          {[1,2,3].map(i => (
            <div className="skeleton-row" key={i} style={{ padding: '16px 18px' }}>
              <div className="skel" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skel" style={{ width: 80, height: 12 }} />
                <div className="skel" style={{ width: 160, height: 10 }} />
              </div>
              <div className="skel" style={{ width: 100, height: 14 }} />
            </div>
          ))}
        </div>
      ) : balances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">∅</div>
          <div className="empty-title">No balances</div>
          <div className="empty-msg">This contract holds no tokens.</div>
        </div>
      ) : (
        <div className="contract-table">
          {balances.map((b, i) => (
            <div key={b.denom} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < balances.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>
                {b.logo}
              </div>
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text0)', marginBottom: 2 }}>{b.display}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncDenom(b.denom)}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--text0)' }}>{fmt(b.amount, b.exponent)}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', marginTop: 1 }}>{b.display}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && balances.length > 0 && (
        <details style={{ marginTop: 20 }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.15s' }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Raw JSON
          </summary>
          <div className="result-code" style={{ marginTop: 10 }}>
            <pre className="result-json" dangerouslySetInnerHTML={{ __html: syntaxHighlight(balances.map(b => ({ denom: b.denom, amount: b.amount }))) }} />
          </div>
        </details>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
