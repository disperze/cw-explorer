import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { OfflineSigner } from '@cosmjs/proto-signing';

interface WalletContextValue {
  address: string | null;
  signer: OfflineSigner | null;
  connect: (chainId: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<OfflineSigner | null>(null);

  const connect = useCallback(async (chainId: string) => {
    if (!window.keplr) throw new Error('Keplr extension not found');
    await window.keplr.enable(chainId);
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const accounts = await offlineSigner.getAccounts();
    setSigner(offlineSigner);
    setAddress(accounts[0].address);
    try { localStorage.setItem('cw_wallet_address', accounts[0].address); } catch { /* ignore */ }
  }, []);

  const disconnect = useCallback(() => {
    setSigner(null);
    setAddress(null);
    try { localStorage.removeItem('cw_wallet_address'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const saved = (() => { try { return localStorage.getItem('cw_wallet_address'); } catch { return null; } })();
    if (!saved) return;
    const net = (() => { try { return localStorage.getItem('cw_network') ?? 'osmosis-1'; } catch { return 'osmosis-1'; } })();
    connect(net).catch(() => { try { localStorage.removeItem('cw_wallet_address'); } catch { /* ignore */ } });
  }, [connect]);

  return (
    <WalletContext.Provider value={{ address, signer, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
