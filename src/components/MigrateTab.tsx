import { useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import { NETWORKS } from '../data';
import { trunc } from '../utils';
import { useWallet } from '../context/WalletContext';
import CopyBtn from './CopyBtn';
import type { Contract } from '../data';

interface Props {
  contract: Contract;
  network: string;
  walletConnected: boolean;
}

export default function MigrateTab({ contract, network, walletConnected }: Props) {
  const { address, signer } = useWallet();
  const [codeId, setCodeId] = useState('');
  const [msg, setMsg] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txhash: string; newCodeId: string; explorer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    if (!codeId) { setError('New Code ID is required.'); return; }

    let parsedMsg: unknown;
    try {
      parsedMsg = JSON.parse(msg);
    } catch {
      setError('Invalid JSON in migrate message.');
      return;
    }

    if (!address || !signer) {
      setError('Wallet not connected. Click "Connect Wallet" in the navbar.');
      return;
    }

    const net = NETWORKS.find(n => n.id === network);
    if (!net) { setError('Unknown network.'); return; }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const client = await SigningCosmWasmClient.connectWithSigner(
        net.rpcUrl,
        signer,
        { gasPrice: GasPrice.fromString(net.gasPrice) },
      );
      const res = await client.migrate(address, contract.address, Number(codeId), parsedMsg as Record<string, unknown>, 'auto');
      setResult({ txhash: res.transactionHash, newCodeId: codeId, explorer: net.explorer });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Migration failed.');
    } finally {
      setLoading(false);
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
          <a className="explorer-link" href={`${result.explorer}${result.txhash}`} target="_blank" rel="noopener noreferrer">
            View on Mintscan ↗
          </a>
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
