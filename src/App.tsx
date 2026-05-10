import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContractListPage from './components/ContractListPage';
import ContractDetailPage from './components/ContractDetailPage';
import CodesListPage from './components/CodesListPage';
import CodeDetailPage from './components/CodeDetailPage';
import UploadPage from './components/UploadPage';
import CreatePage from './components/CreatePage';
import { WalletProvider, useWallet } from './context/WalletContext';

function AppInner() {
  const { address } = useWallet();
  const walletConnected = address !== null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ContractListPage />} />
        <Route path="/codes" element={<CodesListPage />} />
        <Route path="/codes/:id" element={<CodeDetailPage />} />
        <Route path="/upload" element={<UploadPage walletConnected={walletConnected} />} />
        <Route path="/create" element={<CreatePage walletConnected={walletConnected} />} />
        <Route path="/contract/:address" element={<ContractDetailPage walletConnected={walletConnected} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <HashRouter>
        <AppInner />
      </HashRouter>
    </WalletProvider>
  );
}
