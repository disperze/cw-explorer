import { useState } from 'react';
import { NETWORKS } from '../data';
import { sleep, trunc } from '../utils';
import CopyBtn from './CopyBtn';
import type { Contract } from '../data';

interface Props {
  contract: Contract;
  walletConnected: boolean;
}

const MOCK_TX = 'A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456';

export default function ExecuteTab({ contract: _contract, walletConnected }: Props) {
  const [msg, setMsg] = useState('{\n  "transfer": {\n    "recipient": "osmo1…",\n    "amount": "1000000"\n  }\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txhash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const network = NETWORKS[1];

  const handleExecute = async () => {
    if (!walletConnected) { setError('Wallet not connected. Click "Connect Wallet" in the navbar.'); return; }
    setLoading(true); setResult(null); setError(null);
    await sleep(2000);
    setLoading(false);
    try {
      JSON.parse(msg);
      setResult({ txhash: MOCK_TX });
    } catch {
      setError('Invalid JSON in message body.');
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
          Connect your wallet to execute messages
        </div>
      )}
      <div className="field-group">
        <label className="field-label">Execute Message</label>
        <textarea
          className="textarea-code"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder={'{\n  "message_name": { ... }\n}'}
          spellCheck={false}
        />
      </div>
      <button className="btn-primary" onClick={handleExecute} disabled={loading} style={{ minWidth: 130 }}>
        {loading ? <><div className="spinner" />Broadcasting…</> : 'Execute'}
      </button>
      {result && (
        <div className="success-banner">
          <div className="success-banner-title">✓ Transaction Submitted</div>
          <div className="success-banner-row">
            <span className="success-tx">{trunc(result.txhash, 16, 8)}</span>
            <CopyBtn text={result.txhash} />
          </div>
          <a className="explorer-link" href={`${network.explorer}${result.txhash}`} target="_blank" rel="noopener noreferrer">
            View on Mintscan ↗
          </a>
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
