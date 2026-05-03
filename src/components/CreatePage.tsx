import { useState } from 'react';
import { NETWORKS } from '../data';
import { sleep, trunc } from '../utils';
import CopyBtn from './CopyBtn';
import type { Page } from '../data';

interface Props {
  walletConnected: boolean;
  network: string;
  setPage: (p: Page) => void;
}

interface Fund { amount: string; denom: string; }

const MOCK_TX = 'C3D4E5F6A1B2789012345678901234567890ABCDEF1234567890ABCDEF123456';
const MOCK_CONTRACT_ADDR = 'osmo1newcontract4x9gfkw4uqz2s8v3n0y5gfz8hkl4rt2xj9p7mq5abc';

export default function CreatePage({ walletConnected, network, setPage }: Props) {
  const [codeId, setCodeId] = useState('');
  const [label, setLabel] = useState('');
  const [msg, setMsg] = useState('{\n  \n}');
  const [funds, setFunds] = useState<Fund[]>([{ amount: '', denom: 'uosmo' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txhash: string; contractAddr: string; codeId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const netInfo = NETWORKS.find(n => n.id === network) || NETWORKS[0];

  const addFund = () => setFunds(f => [...f, { amount: '', denom: 'uosmo' }]);
  const removeFund = (i: number) => setFunds(f => f.filter((_, idx) => idx !== i));
  const updateFund = (i: number, field: keyof Fund, val: string) =>
    setFunds(f => f.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const handleCreate = async () => {
    if (!walletConnected) { setError('Wallet not connected.'); return; }
    if (!codeId) { setError('Code ID is required.'); return; }
    if (!label.trim()) { setError('Label is required.'); return; }
    setLoading(true); setResult(null); setError(null);
    await sleep(2200);
    setLoading(false);
    try {
      JSON.parse(msg);
      setResult({ txhash: MOCK_TX, contractAddr: MOCK_CONTRACT_ADDR, codeId });
    } catch {
      setError('Invalid JSON in instantiate message.');
    }
  };

  return (
    <div className="page page-narrow page-enter">
      <button className="back-link" onClick={() => setPage('list')}>← Contracts</button>
      <div className="page-header">
        <h1 className="page-title">
          Create Contract
          <span className="network-badge">{netInfo.name}</span>
        </h1>
        <p className="page-subtitle">Instantiate a new contract from a stored code ID</p>
      </div>

      {!walletConnected && (
        <div className="warning-banner" style={{ marginBottom: 24 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Connect your wallet to instantiate contracts
        </div>
      )}

      <div className="field-group">
        <label className="field-label">Code ID</label>
        <input className="input-num" type="number" placeholder="e.g. 572" value={codeId} onChange={e => setCodeId(e.target.value)} />
      </div>

      <div className="field-group">
        <label className="field-label">Label</label>
        <input className="input-num" type="text" placeholder="Human-readable contract label" value={label} onChange={e => setLabel(e.target.value)} style={{ fontFamily: 'var(--sans)', fontSize: 13 }} />
      </div>

      <div className="field-group">
        <label className="field-label">Instantiate Message</label>
        <textarea className="textarea-code" value={msg} onChange={e => setMsg(e.target.value)} placeholder={'{\n  "key": "value"\n}'} spellCheck={false} />
      </div>

      <div className="field-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="field-label" style={{ marginBottom: 0 }}>
            Funds <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <button
            onClick={addFund}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text0)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; }}
          >+ Add</button>
        </div>
        {funds.length === 0 && (
          <div style={{ padding: '12px 14px', background: 'var(--bg1)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
            No funds attached
          </div>
        )}
        {funds.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input className="input-num" type="text" placeholder="Amount (e.g. 1000000)" value={f.amount} onChange={e => updateFund(i, 'amount', e.target.value)} style={{ flex: '2 1 0' }} />
            <input className="input-num" type="text" placeholder="Denom" value={f.denom} onChange={e => updateFund(i, 'denom', e.target.value)} style={{ flex: '1 1 0', minWidth: 80 }} />
            <button
              onClick={() => removeFund(i)}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0, transition: 'color 0.1s' }}
              onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'}
              onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'}
            >×</button>
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={handleCreate}
        disabled={loading || !walletConnected}
        style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 13, marginTop: 8 }}
      >
        {loading ? <><div className="spinner" />Instantiating…</> : 'Create Contract'}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div className="success-banner">
            <div className="success-banner-title">✓ Contract Instantiated</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contract Address</div>
            <div className="success-banner-row" style={{ marginBottom: 10 }}>
              <span className="success-tx" style={{ fontSize: 12 }}>{result.contractAddr}</span>
              <CopyBtn text={result.contractAddr} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transaction</div>
            <div className="success-banner-row">
              <span className="success-tx">{trunc(result.txhash, 16, 8)}</span>
              <CopyBtn text={result.txhash} />
            </div>
            <a className="explorer-link" href={`${netInfo.explorer}${result.txhash}`} target="_blank" rel="noopener noreferrer">
              View on Mintscan ↗
            </a>
          </div>
        </div>
      )}
      {error && <div className="error-msg mt-16">✕ {error}</div>}
    </div>
  );
}
