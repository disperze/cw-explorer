import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import { NETWORKS } from '../data';
import { fmtSize, trunc } from '../utils';
import { useWallet } from '../context/WalletContext';
import { useNetwork } from '../hooks/useNetwork';
import CopyBtn from './CopyBtn';

interface Props {
  walletConnected: boolean;
}

export default function UploadPage({ walletConnected }: Props) {
  const { address, signer } = useWallet();
  const [network] = useNetwork();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ codeId: number; txhash: string; explorer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    setFile(f); setResult(null); setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !address || !signer) return;

    const net = NETWORKS.find(n => n.id === network);
    if (!net) { setError('Unknown network.'); return; }

    setLoading(true); setResult(null); setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const wasmBytes = new Uint8Array(buffer);
      const client = await SigningCosmWasmClient.connectWithSigner(
        net.rpcUrl,
        signer,
        { gasPrice: GasPrice.fromString(net.gasPrice) },
      );
      const res = await client.upload(address, wasmBytes, 'auto');
      setResult({ codeId: res.codeId, txhash: res.transactionHash, explorer: net.explorer });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow page-enter">
      <button className="back-link" onClick={() => navigate('/')}>← Contracts</button>
      <div className="page-header">
        <h1 className="page-title">Upload Contract</h1>
        <p className="page-subtitle">Store a compiled Wasm binary on-chain</p>
      </div>

      <div
        className={`dropzone${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="dropzone-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="8" width="28" height="22" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 18l6-6 6 6M18 12v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="dropzone-label">Drop your .wasm file here or click to browse</div>
        <div className="dropzone-sub">.wasm binaries only · max 2MB recommended</div>
        <input
          ref={inputRef}
          type="file"
          accept=".wasm"
          onChange={e => handleFile(e.target.files?.[0])}
          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
        />
      </div>

      {file && (
        <div className="selected-file">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <rect x="2" y="1" width="9" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 5h4M5 7.5h4M5 10h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className="selected-file-name">{file.name}</span>
          <span className="selected-file-size">{fmtSize(file.size)}</span>
          <button className="remove-file" onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}>×</button>
        </div>
      )}

      <div className="mt-24">
        {!walletConnected && (
          <div className="warning-banner">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Connect your wallet to upload a contract
          </div>
        )}
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={!file || loading || !walletConnected}
          style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 13 }}
        >
          {loading ? <><div className="spinner" />Uploading…</> : 'Upload Contract'}
        </button>
      </div>

      {result && (
        <div className="success-banner" style={{ marginTop: 24 }}>
          <div className="success-banner-title">✓ Contract Uploaded — Code ID {result.codeId}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transaction</div>
          <div className="success-banner-row">
            <span className="success-tx">{trunc(result.txhash, 16, 8)}</span>
            <CopyBtn text={result.txhash} />
          </div>
          <a className="explorer-link" href={`${result.explorer}${result.txhash}`} target="_blank" rel="noopener noreferrer">
            View on Mintscan ↗
          </a>
        </div>
      )}
      {error && <div className="error-msg mt-16">✕ {error}</div>}
    </div>
  );
}
