import { useState } from 'react';
import { sleep, trunc } from '../utils';
import CopyBtn from './CopyBtn';
import type { Contract } from '../data';

interface Props {
  contract: Contract;
  walletConnected: boolean;
}

const MOCK_TX = 'F9E8D7C6B5A4321098765432109876543210FEDCBA9876543210FEDCBA987654';

export default function MigrateTab({ contract: _contract, walletConnected }: Props) {
  const [codeId, setCodeId] = useState('');
  const [msg, setMsg] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txhash: string; newCodeId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    if (!walletConnected) { setError('Wallet not connected.'); return; }
    if (!codeId) { setError('New Code ID is required.'); return; }
    setLoading(true); setResult(null); setError(null);
    await sleep(2200);
    setLoading(false);
    try {
      JSON.parse(msg);
      setResult({ txhash: MOCK_TX, newCodeId: codeId });
    } catch {
      setError('Invalid JSON in migrate message.');
    }
  };

  return (
    <div>
      {!walletConnected && (
        <div className="warning-banner">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Connect your wallet to migrate contracts
        </div>
      )}
      <div className="field-group">
        <label className="field-label">New Code ID</label>
        <input className="input-num" type="number" placeholder="e.g. 1234" value={codeId} onChange={e => setCodeId(e.target.value)} />
      </div>
      <div className="field-group">
        <label className="field-label">Migrate Message</label>
        <textarea
          className="textarea-code"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder={'{}'}
          spellCheck={false}
        />
      </div>
      <button className="btn-primary" onClick={handleMigrate} disabled={loading} style={{ minWidth: 120 }}>
        {loading ? <><div className="spinner" />Migrating…</> : 'Migrate'}
      </button>
      {result && (
        <div className="success-banner">
          <div className="success-banner-title">✓ Migration Submitted — Code ID {result.newCodeId}</div>
          <div className="success-banner-row">
            <span className="success-tx">{trunc(result.txhash, 16, 8)}</span>
            <CopyBtn text={result.txhash} />
          </div>
          <a className="explorer-link" href={`https://www.mintscan.io/osmosis/tx/${result.txhash}`} target="_blank" rel="noopener noreferrer">
            View on Mintscan ↗
          </a>
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
