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

export default function ExecuteTab({ contract, network, walletConnected }: Props) {
  const { address, signer } = useWallet();
  const [msg, setMsg] = useState('{\n  "transfer": {\n    "recipient": "osmo1…",\n    "amount": "1000000"\n  }\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txhash: string; explorer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    let parsedMsg: unknown;
    try {
      parsedMsg = JSON.parse(msg);
    } catch {
      setError('Invalid JSON in message body.');
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
      const res = await client.execute(address, contract.address, parsedMsg as Record<string, unknown>, 'auto');
      setResult({ txhash: res.transactionHash, explorer: net.explorer });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Execution failed.');
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
          <a className="explorer-link" href={`${result.explorer}${result.txhash}`} target="_blank" rel="noopener noreferrer">
            View on Mintscan ↗
          </a>
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
