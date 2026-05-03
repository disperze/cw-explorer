import { useState } from 'react';
import Navbar from './components/Navbar';
import ContractListPage from './components/ContractListPage';
import ContractDetailPage from './components/ContractDetailPage';
import UploadPage from './components/UploadPage';
import CreatePage from './components/CreatePage';
import type { Contract, Page } from './data';

export default function App() {
  const [page, setPage] = useState<Page>('list');
  const [network, setNetwork] = useState('osmosis-1');
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const handleSetNetwork = (n: string) => {
    setNetwork(n);
    if (page === 'detail') setPage('list');
  };

  return (
    <>
      <Navbar
        network={network}
        setNetwork={handleSetNetwork}
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
        setPage={setPage}
      />
      {page === 'list' && (
        <ContractListPage
          key={network}
          network={network}
          setPage={setPage}
          setSelectedContract={setSelectedContract}
        />
      )}
      {page === 'detail' && selectedContract && (
        <ContractDetailPage
          key={selectedContract.address}
          contract={selectedContract}
          walletConnected={walletConnected}
          setPage={setPage}
        />
      )}
      {page === 'upload' && (
        <UploadPage walletConnected={walletConnected} setPage={setPage} />
      )}
      {page === 'create' && (
        <CreatePage walletConnected={walletConnected} network={network} setPage={setPage} />
      )}
    </>
  );
}
