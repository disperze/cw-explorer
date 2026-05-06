import { useState } from 'react';
import { trunc } from '../utils';
import CopyBtn from './CopyBtn';
import QueryTab from './QueryTab';
import ExecuteTab from './ExecuteTab';
import MigrateTab from './MigrateTab';
import BalancesTab from './BalancesTab';
import type { Contract, Page } from '../data';

type Tab = 'query' | 'execute' | 'migrate' | 'balances';

interface Props {
  contract: Contract;
  walletConnected: boolean;
  network: string;
  setPage: (p: Page) => void;
}

export default function ContractDetailPage({ contract, walletConnected, network, setPage }: Props) {
  const [tab, setTab] = useState<Tab>('query');

  return (
    <div className="page page-enter">
      <button className="back-link" onClick={() => setPage('list')}>
        ← Contracts
      </button>

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
    </div>
  );
}
