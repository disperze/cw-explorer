import { useState, useRef, useEffect } from 'react';
import { NETWORKS } from '../data';
import { trunc } from '../utils';
import { useWallet } from '../context/WalletContext';
import type { Page } from '../data';

interface Props {
  network: string;
  setNetwork: (n: string) => void;
  setPage: (p: Page) => void;
}

export default function Navbar({ network, setNetwork, setPage }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keplrMissing, setKeplrMissing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { address, connect, disconnect } = useWallet();

  useEffect(() => {
    setKeplrMissing(!window.keplr);
  }, []);

  // Re-connect when network switches if already connected
  useEffect(() => {
    if (address) {
      connect(network).catch(() => disconnect());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const navTo = (p: Page) => { setMenuOpen(false); setPage(p); };

  const handleConnect = async () => {
    if (!window.keplr) {
      setKeplrMissing(true);
      return;
    }
    setConnecting(true);
    try {
      await connect(network);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setPage('list')}>
        <div className="navbar-logo-mark">CW</div>
        <span>CosmWasm</span>
      </div>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <select className="net-select" value={network} onChange={e => setNetwork(e.target.value)}>
          {NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>

        {keplrMissing ? (
          <a
            className="btn-wallet"
            href="https://www.keplr.app/download"
            target="_blank"
            rel="noreferrer"
          >
            Install Keplr
          </a>
        ) : address ? (
          <div className="wallet-menu-wrap" ref={menuRef}>
            <button className="btn-wallet connected" onClick={() => setMenuOpen(o => !o)}>
              {trunc(address, 8, 6)}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 4, opacity: 0.6 }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="wallet-dropdown">
                <div className="wallet-dropdown-header">
                  <div className="wallet-dropdown-label">Connected</div>
                  <div className="wallet-dropdown-addr">{address}</div>
                </div>
                <button className="wallet-dropdown-item" onClick={() => navTo('upload')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5 6l2-2 2 2M7 4v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload Wasm
                </button>
                <button className="wallet-dropdown-item" onClick={() => navTo('create')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Create Contract
                </button>
                <div className="wallet-dropdown-divider" />
                <button className="wallet-dropdown-disconnect" onClick={() => { disconnect(); setMenuOpen(false); }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M9 9l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-wallet pulse" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
