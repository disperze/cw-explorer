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

export type Page = 'list' | 'detail' | 'upload' | 'create';

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

export const MOCK_CONTRACTS: Record<string, Contract[]> = {
  'osmosis-1': [
    { name: 'Osmosis CW20 USDC', address: 'osmo1zcntm7sgs7xtfq8yyuqm9qnxy6q8rfg7fjv0qjlf6xu4k0vfz24sv9fhlt', creator: 'osmo18kq8z74yjv3jy5w8gxwkn0k8s5gg3fz2yqt8ph' },
    { name: 'PCL Pool Router', address: 'osmo1c9y7crgg6y9m3s62j9tz2qy9nmcnlux7jn6p8gue0ac0lztns5sqfzqhsk', creator: 'osmo1xfj8dn2qh7fsaay0a7nkxkry2rqxx9q4kz5j8u' },
    { name: 'Twap Oracle', address: 'osmo16kz59vxegqlvuq5q02s5jxls60yv62fnnsghy0lke3fxz7p8n3kqlqlnmy', creator: 'osmo1hn2kw5fh6ywrxcs0dhrxd7e6w3n0pfk3n2qxcm' },
    { name: 'Gamm Module Proxy', address: 'osmo19jq6mj84cnt9p7sagjxqf8hxtczwc8wlpk49ej8m5p42hk9vqt7s7nq4sq', creator: 'osmo1qwrz2v31z703uf8v90ynpqf7sx5r0ysnsp8nry' },
    { name: 'Lockup Contract', address: 'osmo1kq8h3jjyafclskhv7ajg0n5u3s0ydgxpf3v3ckpqx2q6e3m5j2sfqm5qy2', creator: 'osmo1vxz8w2ny5c2mclh8p4x1j3g6z9a0syhwptl4rc' },
    { name: 'CW-ICS20 Bridge', address: 'osmo1c3ljch9dfw5kf52nfwc5z9v8g4j8lts7p5pzce0s5qe0m7q5v8d9qzsvv4', creator: 'osmo18kq8z74yjv3jy5w8gxwkn0k8s5gg3fz2yqt8ph' },
    { name: 'Supercharged Incentives', address: 'osmo1r8ln2yxnfq2n6ky0g5g58q2nqc9f5s4r7d8v9a', creator: 'osmo15j4y78lfnsrh5z8tk4n2jwdlp8czfz3e52k4hk' },
    { name: 'Fee Split Distributor', address: 'osmo1p9gjqm4z7ynqg0t4y52ax6r9fpxnt2a5s7yy5u0k3vxlh8n6m9qfhd5j2c', creator: 'osmo1xfj8dn2qh7fsaay0a7nkxkry2rqxx9q4kz5j8u' },
  ],
  'juno-1': [
    { name: 'Junoswap AMM', address: 'juno1pctfpv9k03v0ff538pz8kkw5ujlptntzkwjg14n6q4yjguxpn24sq0t4u4', creator: 'juno1hn2kw5fh6ywrxcs0dhrxd7e6w3n0pfk3n2qxcm' },
    { name: 'Loop DEX Router', address: 'juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us84zm14', creator: 'juno18kq8z74yjv3jy5w8gxwkn0k8s5gg3fz2yqt8ph' },
    { name: 'DAODAO Core', address: 'juno1duehksvym6xj4qqxh78yg5ql9rnxz7sj5eg8t5ljsjke4jppwq0s3y55jk', creator: 'juno1qwrz2v31z703uf8v90ynpqf7sx5r0ysnsp8nry' },
    { name: 'Cw-Ics20 Channel', address: 'juno1v4887y83d6g28puzvt8cl0f3tze3xcpcf8myn2njzm2w0s5jrqzqzwpxvr', creator: 'juno1vxz8w2ny5c2mclh8p4x1j3g6z9a0syhwptl4rc' },
  ],
  'neutron-1': [
    { name: 'Neutron DEX', address: 'neutron1zyf3c7wxcnljkf7j5s2xjfzytv0h7g5xhvy8t9k3gknxjx5h3eq5vm5xzj', creator: 'neutron1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6' },
    { name: 'dAtom Vault', address: 'neutron14lzpnq3x8nk4lxm2kf7d0yk4r3n8e5v6s2jq9c1fw8t0zh4pvqsnxm8yt', creator: 'neutron18kq8z74yjv3jy5w8gxwkn0k8s5gg3fz2yqt8' },
    { name: 'IBC Transfer Hook', address: 'neutron1c3ljch9dfw5kf52nfwc5z9v8g4j8lts7p5pzce0s5qe0m7q5v8d9qzsvv', creator: 'neutron1hn2kw5fh6ywrxcs0dhrxd7e6w3n0pfk3n2qxcm' },
  ],
  'cosmoshub-4': [],
  'stargaze-1': [
    { name: 'Stars NFT Marketplace', address: 'stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr8e', creator: 'stars1qwrz2v31z703uf8v90ynpqf7sx5r0ysnsp8nry' },
    { name: 'Launchpad Controller', address: 'stars1g5y6k27n3q2q8pkjnq4p9zvyc0jnjgre5hpuqn', creator: 'stars1xfj8dn2qh7fsaay0a7nkxkry2rqxx9q4kz5j8u' },
  ],
};


export const PAGE_SIZE = 5;
