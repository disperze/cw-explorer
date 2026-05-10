import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trunc } from '../utils';
import { NETWORKS } from '../data';
import { getCosmWasmClient } from '../api/clientCache';
import { useNetwork } from '../hooks/useNetwork';
import CopyBtn from './CopyBtn';
import QueryTab from './QueryTab';
import ExecuteTab from './ExecuteTab';
import MigrateTab from './MigrateTab';
import BalancesTab from './BalancesTab';
import type { Contract } from '../data';

type Tab = 'query' | 'execute' | 'migrate' | 'balances';

interface Props {
  walletConnected: boolean;
}

export default function ContractDetailPage({ walletConnected }: Props) {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [network] = useNetwork();
  const [tab, setTab] = useState<Tab>('query');
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setContract(null);
    setTab('query');

    const net = NETWORKS.find(n => n.id === network);
    if (!net) {
      setError('Unknown network.');
      setLoading(false);
      return;
    }

    getCosmWasmClient(net.rpcUrl)
      .then(client => client.getContract(address))
      .then(info => {
        if (!cancelled) {
          setContract({ name: info.label, address: info.address, creator: info.creator });
          setLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load contract.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [address, network]);

  return (
    <div className="page page-enter">
      <button className="back-link" onClick={() => navigate('/')}>
        ← Contracts
      </button>

      {loading && (
        <div className="contract-address-block">
          <div className="skel" style={{ width: 80, height: 12 }} />
          <div className="skel" style={{ flex: '1 1 auto', height: 12, maxWidth: 400 }} />
        </div>
      )}

      {error && (
        <div className="error-msg" style={{ marginTop: 16 }}>✕ {error}</div>
      )}

      {contract && (
        <>
          <div className="contract-address-block">
            <span className="contract-address-label">Contract</span>
            <span className="contract-address-val">{contract.address}</span>
            <CopyBtn text={contract.address} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>
              {contract.name}
              {contract.creator && contract.creator !== '—' && (
                <span style={{ marginLeft: 12 }}>creator: {trunc(contract.creator, 12, 6)}</span>
              )}
            </span>
          </div>

          <div className="divider" />

          <div className="tabs">
            {(['query', 'execute', 'migrate', 'balances'] as Tab[]).map(t => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'query' && <QueryTab contract={contract} network={network} />}
          {tab === 'execute' && <ExecuteTab contract={contract} network={network} walletConnected={walletConnected} />}
          {tab === 'migrate' && <MigrateTab contract={contract} network={network} walletConnected={walletConnected} />}
          {tab === 'balances' && <BalancesTab contract={contract} network={network} />}
        </>
      )}
    </div>
  );
}
