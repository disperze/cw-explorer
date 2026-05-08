export interface Network {
  id: string;
  name: string;
  explorer: string;
  rpcUrl: string;
  restUrl: string;
  gasPrice: string;
}

export interface Contract {
  name: string;
  address: string;
  creator: string;
}

export interface TokenBalance {
  denom: string;
  display: string;
  amount: string;
  exponent: number;
  logo: string;
}

export interface Code {
  id: number;
  creator: string;
  dataHash: string;
}

export type Page = 'list' | 'detail' | 'upload' | 'create' | 'codes';

export const NETWORKS: Network[] = [
  {
    id: 'cosmoshub-4',
    name: 'Cosmos Hub',
    explorer: 'https://www.mintscan.io/cosmos/tx/',
    rpcUrl: import.meta.env.VITE_COSMOSHUB_RPC ?? 'https://rpc.cosmos.network',
    restUrl: import.meta.env.VITE_COSMOSHUB_REST ?? 'https://api.cosmos.network',
    gasPrice: '0.025uatom',
  },
  {
    id: 'osmosis-1',
    name: 'Osmosis',
    explorer: 'https://www.mintscan.io/osmosis/tx/',
    rpcUrl: import.meta.env.VITE_OSMOSIS_RPC ?? 'https://rpc.osmosis.zone',
    restUrl: import.meta.env.VITE_OSMOSIS_REST ?? 'https://lcd.osmosis.zone',
    gasPrice: '0.025uosmo',
  },
  {
    id: 'juno-1',
    name: 'Juno',
    explorer: 'https://www.mintscan.io/juno/tx/',
    rpcUrl: import.meta.env.VITE_JUNO_RPC ?? 'https://rpc.juno.strange.love',
    restUrl: import.meta.env.VITE_JUNO_REST ?? 'https://api.juno.strange.love',
    gasPrice: '0.025ujuno',
  },
  {
    id: 'neutron-1',
    name: 'Neutron',
    explorer: 'https://www.mintscan.io/neutron/tx/',
    rpcUrl: import.meta.env.VITE_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
    restUrl: import.meta.env.VITE_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
    gasPrice: '0.025untrn',
  },
  {
    id: 'stargaze-1',
    name: 'Stargaze',
    explorer: 'https://www.mintscan.io/stargaze/tx/',
    rpcUrl: import.meta.env.VITE_STARGAZE_RPC ?? 'https://rpc.stargaze-1.publicnode.com',
    restUrl: import.meta.env.VITE_STARGAZE_REST ?? 'https://rest.stargaze-1.publicnode.com',
    gasPrice: '0.025ustars',
  },
];

