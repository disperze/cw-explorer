import { useState } from 'react';
import { getCosmWasmClient } from '../api/clientCache';
import { syntaxHighlight } from '../utils';
import { NETWORKS } from '../data';
import type { Contract } from '../data';

interface Props {
  contract: Contract;
  network: string;
}

export default function QueryTab({ contract, network }: Props) {
  const [msg, setMsg] = useState('{\n  "balance": {\n    "address": "osmo1…"\n  }\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    let parsedMsg: unknown;
    try {
      parsedMsg = JSON.parse(msg);
    } catch {
      setError('Invalid JSON in message body.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const net = NETWORKS.find(n => n.id === network);
      if (!net) throw new Error('Unknown network.');
      const client = await getCosmWasmClient(net.rpcUrl);
      const response = await client.queryContractSmart(contract.address, parsedMsg);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="field-group">
        <label className="field-label">Query Message</label>
        <textarea
          className="textarea-code"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder={'{\n  "query_name": { ... }\n}'}
          spellCheck={false}
        />
      </div>
      <button className="btn-primary" onClick={handleQuery} disabled={loading} style={{ minWidth: 110 }}>
        {loading ? <><div className="spinner" />Querying…</> : 'Query'}
      </button>
      {result !== null && (
        <div className="result-code">
          <div className="result-label">Response</div>
          <pre className="result-json" dangerouslySetInnerHTML={{ __html: syntaxHighlight(result) }} />
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
