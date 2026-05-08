import { useState, useEffect } from 'react';
import { NETWORKS } from '../data';
import { trunc } from '../utils';
import type { Page } from '../data';
import { useCodes } from '../hooks/useCodes';

const PAGE_SIZE = 5;

interface Props {
  network: string;
  setPage: (p: Page) => void;
}

export default function CodesListPage({ network, setPage: _setPage }: Props) {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { codes, loading, error, switching } = useCodes(network);

  useEffect(() => {
    setCurrentPage(1);
    setFilter('');
  }, [network]);

  const netName = NETWORKS.find(n => n.id === network)?.name || network;
  const filtered = codes.filter(c =>
    String(c.id).includes(filter) ||
    c.creator.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={`page page-enter${switching ? ' net-switching' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">
          Codes
          <span className="network-badge">{netName}</span>
        </h1>
        <p className="page-subtitle">
          {loading ? 'Fetching codes…' : `${filtered.length} code${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="toolbar">
        <input
          className="input-filter"
          placeholder="Filter by code ID or creator…"
          value={filter}
          onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
        />
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setCurrentPage(p => p - 1)}>←</button>
          <span className="page-info">{page} / {totalPages}</span>
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</button>
        </div>
      </div>

      {error && <div className="error-msg">✕ {error}</div>}

      {loading ? (
        <div className="contract-table">
          {[1,2,3,4,5].map(i => (
            <div className="skeleton-row" key={i}>
              <div className="skel" style={{ width: 28, height: 12, borderRadius: 2 }} />
              <div className="skel" style={{ width: 60, height: 12 }} />
              <div className="skel" style={{ flex: '1 1 auto', height: 10, maxWidth: 260 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">[ ]</div>
          <div className="empty-title">{filter ? 'No matching codes' : 'No codes on this network'}</div>
          <div className="empty-msg">{filter ? `No results for "${filter}"` : 'Try switching networks or uploading a contract.'}</div>
        </div>
      ) : (
        <div className="contract-table">
          {shown.map((c, i) => (
            <div className="contract-row" key={c.id}>
              <span className="row-index">{String((page - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}</span>
              <span className="row-name">#{c.id}</span>
              <span className="row-creator">{trunc(c.creator, 14, 8)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
