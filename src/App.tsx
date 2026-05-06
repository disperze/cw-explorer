import { useState } from 'react';
import Navbar from './components/Navbar';
import ContractListPage from './components/ContractListPage';
import ContractDetailPage from './components/ContractDetailPage';
import UploadPage from './components/UploadPage';
import CreatePage from './components/CreatePage';
import { WalletProvider, useWallet } from './context/WalletContext';
import type { Contract, Page } from './data';

function AppInner() {
  const [page, setPage] = useState<Page>('list');
  const [network, setNetwork] = useState('osmosis-1');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { address } = useWallet();
  const walletConnected = address !== null;

  const handleSetNetwork = (n: string) => {
    setNetwork(n);
    if (page === 'detail') setPage('list');
  };

  return (
    <>
      <Navbar
        network={network}
        setNetwork={handleSetNetwork}
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
          network={network}
          setPage={setPage}
        />
      )}
      {page === 'upload' && (
        <UploadPage walletConnected={walletConnected} network={network} setPage={setPage} />
      )}
      {page === 'create' && (
        <CreatePage walletConnected={walletConnected} network={network} setPage={setPage} />
      )}
    </>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppInner />
    </WalletProvider>
  );
}
