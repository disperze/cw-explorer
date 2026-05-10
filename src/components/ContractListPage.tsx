import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NETWORKS } from '../data';
import { trunc } from '../utils';
import { useContracts } from '../hooks/useContracts';
import { useNetwork } from '../hooks/useNetwork';

const PAGE_SIZE = 5;

export default function ContractListPage() {
  const [network] = useNetwork();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoAddr, setGotoAddr] = useState('');
  const { contracts, loading, error, switching } = useContracts(network);

  useEffect(() => {
    setCurrentPage(1);
    setFilter('');
  }, [network]);

  const netName = NETWORKS.find(n => n.id === network)?.name || network;
  const all = contracts;
  const filtered = all.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.address.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleGoto = () => {
    if (!gotoAddr.trim()) return;
    navigate(`/contract/${gotoAddr.trim()}`);
  };

  return (
    <div className={`page page-enter${switching ? ' net-switching' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">
          Contracts
          <span className="network-badge">{netName}</span>
        </h1>
        <p className="page-subtitle">
          {loading ? 'Fetching contracts…' : `${filtered.length} contract${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="toolbar">
        <input
          className="input-filter"
          placeholder="Filter by name or address…"
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
              <div className="skel" style={{ flex: '1 1 auto', height: 12, maxWidth: 200 }} />
              <div className="skel" style={{ width: 180, height: 10 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">[ ]</div>
          <div className="empty-title">{filter ? 'No matching contracts' : 'No contracts on this network'}</div>
          <div className="empty-msg">{filter ? `No results for "${filter}"` : 'Try switching networks or uploading a contract.'}</div>
        </div>
      ) : (
        <div className="contract-table">
          {shown.map((c, i) => (
            <div
              className="contract-row"
              key={c.address}
              onClick={() => navigate(`/contract/${c.address}`)}
            >
              <span className="row-index">{String((page - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}</span>
              <span className="row-name">{c.name}</span>
              <span className="row-creator">{trunc(c.address, 14, 8)}</span>
              <span className="row-arrow">›</span>
            </div>
          ))}
        </div>
      )}

      <div className="goto-section">
        <div className="goto-label">Go to contract</div>
        <div className="goto-row">
          <input
            className="input-address"
            placeholder="Paste a contract address…"
            value={gotoAddr}
            onChange={e => setGotoAddr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGoto()}
          />
          <button className="btn-primary" onClick={handleGoto} disabled={!gotoAddr.trim()}>Go →</button>
        </div>
      </div>
    </div>
  );
}
