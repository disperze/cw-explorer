import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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
  }, []);

  const disconnect = useCallback(() => {
    setSigner(null);
    setAddress(null);
  }, []);

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
