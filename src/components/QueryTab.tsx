import { useState } from 'react';
import { sleep, syntaxHighlight } from '../utils';
import type { Contract } from '../data';

interface Props { contract: Contract; }

export default function QueryTab({ contract: _contract }: Props) {
  const [msg, setMsg] = useState('{\n  "balance": {\n    "address": "osmo1…"\n  }\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    setLoading(true); setResult(null); setError(null);
    await sleep(1400);
    setLoading(false);
    try {
      JSON.parse(msg);
      setResult({ balance: '1000000', denom: 'uosmo', account: 'osmo1xj9p7mq5x9gfkw4uqz2s8v3n0y5gfz8hkl4rt2' });
    } catch {
      setError('Invalid JSON in message body.');
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
      {result && (
        <div className="result-code">
          <div className="result-label">Response</div>
          <pre className="result-json" dangerouslySetInnerHTML={{ __html: syntaxHighlight(result) }} />
        </div>
      )}
      {error && <div className="error-msg">✕ {error}</div>}
    </div>
  );
}
