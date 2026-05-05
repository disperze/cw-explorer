# TODO: Migrate from Mock UI to Real Web3 dApp

This file tracks all changes needed to convert the cw-explorer skeleton into a production-ready CosmWasm dApp.

---

## 1. Install Dependencies

```bash
npm install \
  @cosmjs/cosmwasm-stargate \
  @cosmjs/stargate \
  @cosmjs/proto-signing \
  @cosmjs/encoding \
  @keplr-wallet/types \
  cosmjs-types
```

| Package | Purpose |
|---|---|
| `@cosmjs/cosmwasm-stargate` | Query contracts, upload wasm, instantiate, execute, migrate |
| `@cosmjs/stargate` | Bank module queries (balances), fee estimation |
| `@cosmjs/proto-signing` | DirectSecp256k1HdWallet and offline signer support |
| `@cosmjs/encoding` | Base64, hex, bech32 encoding utilities |
| `@keplr-wallet/types` | TypeScript types for the Keplr browser extension API |
| `cosmjs-types` | Protobuf type definitions for Cosmos SDK messages |

---

## 2. Configuration & Environment

- [ ] Create `.env` (ensure it is in `.gitignore`) with per-network RPC and REST endpoints:
  ```
  VITE_OSMOSIS_RPC=https://rpc.osmosis.zone
  VITE_OSMOSIS_REST=https://lcd.osmosis.zone
  VITE_JUNO_RPC=https://rpc.juno.strange.love
  VITE_JUNO_REST=https://api.juno.strange.love
  VITE_NEUTRON_RPC=https://rpc-kralum.neutron-1.neutron.org
  VITE_NEUTRON_REST=https://rest-kralum.neutron-1.neutron.org
  VITE_COSMOSHUB_RPC=https://rpc.cosmos.network
  VITE_COSMOSHUB_REST=https://api.cosmos.network
  VITE_STARGAZE_RPC=https://rpc.stargaze-1.publicnode.com
  VITE_STARGAZE_REST=https://rest.stargaze-1.publicnode.com
  ```

- [ ] **`src/data.ts`** — Extend the `Network` type and `NETWORKS` array to include `rpcUrl`, `restUrl`, and `gasPrice`:
  ```ts
  interface Network {
    id: string;
    name: string;
    explorer: string;
    rpcUrl: string;
    restUrl: string;
    gasPrice: string; // e.g. "0.025uosmo"
  }
  ```

---

## 3. Wallet Context

- [ ] Create **`src/context/WalletContext.tsx`** — global wallet state (signer, address, connect/disconnect):
  ```ts
  interface WalletContextValue {
    address: string | null;
    signer: OfflineSigner | null;
    connect: (chainId: string) => Promise<void>;
    disconnect: () => void;
  }
  ```

---

## 4. Wallet Integration — `src/components/Navbar.tsx`

Replace the boolean `connected` toggle with real Keplr integration:

- [ ] On mount, check `window.keplr`; show "Install Keplr" link if absent
- [ ] On connect button click:
  - Call `window.keplr.enable(network.id)`
  - If chain not added, call `window.keplr.experimentalSuggestChain(chainInfo)` first
  - Get signer via `window.keplr.getOfflineSigner(network.id)`
  - Retrieve address via `signer.getAccounts()` → `accounts[0].address`
  - Store signer + address in `WalletContext`
- [ ] Show real wallet address (truncated) when connected
- [ ] Re-connect when network switches
- [ ] Remove `WALLET_ADDR` constant from `src/data.ts`

---

## 5. Contract List — `src/components/ContractListPage.tsx`

Show the **10 latest contracts** by resolving from the most recent code ID:

- [ ] Connect a `CosmWasmClient` for the selected network: `CosmWasmClient.connect(network.rpcUrl)`
- [ ] Fetch the latest code ID via REST:
  ```
  GET {restUrl}/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1
  ```
  Extract `code_infos[0].code_id`
- [ ] Walk backwards from the latest code ID, fetching contracts per code:
  ```
  GET {restUrl}/cosmwasm/wasm/v1/code/{id}/contracts
  ```
  Collect addresses until 10 are gathered
- [ ] For each address, call `client.getContract(address)` to get label, creator, and code ID
- [ ] Display the 10 most-recent contracts (newest first)
- [ ] Remove `MOCK_CONTRACTS` from `src/data.ts`
- [ ] Remove all `sleep()` calls; use real async/await loading

---

## 6. Contract Queries — `src/components/QueryTab.tsx`

- [ ] Connect a `CosmWasmClient`: `CosmWasmClient.connect(network.rpcUrl)`
- [ ] Call `client.queryContractSmart(contractAddress, queryMsg)` with the user-provided JSON
- [ ] Display the real response JSON (existing syntax highlighter can be reused)
- [ ] Show an error banner if the query fails (invalid message, contract error, etc.)
- [ ] Remove the hardcoded mock response and `sleep(1400)`

---

## 7. Contract Execution — `src/components/ExecuteTab.tsx`

- [ ] Gate the Execute button behind wallet connection; prompt to connect if not connected
- [ ] Build a `SigningCosmWasmClient`:
  ```ts
  SigningCosmWasmClient.connectWithSigner(network.rpcUrl, signer, { gasPrice })
  ```
- [ ] Call `client.execute(address, contractAddress, executeMsg, "auto", memo, funds)`
- [ ] Display real `result.transactionHash`
- [ ] Link the tx hash to `{network.explorer}{txHash}` (Mintscan) — existing `explorer` field can be reused
- [ ] Remove `MOCK_TX` and `sleep(2000)`

---

## 8. Contract Migration — `src/components/MigrateTab.tsx`

- [ ] Gate behind wallet connection
- [ ] Use `client.migrate(address, contractAddress, newCodeId, migrateMsg, "auto")`
- [ ] Display real `result.transactionHash` with explorer link
- [ ] Remove `MOCK_TX` and `sleep(2200)`

---

## 9. Token Balances — `src/components/BalancesTab.tsx`

- [ ] Connect a `StargateClient`: `StargateClient.connect(network.rpcUrl)`
- [ ] Call `client.getAllBalances(contractAddress)` to fetch real holdings
- [ ] For IBC denoms, resolve metadata via:
  ```
  GET {restUrl}/ibc/apps/transfer/v1/denom_traces/{hash}
  ```
- [ ] Fetch token display metadata (exponent, symbol) from the chain registry or Cosmos Directory API
- [ ] Remove `MOCK_BALANCES` from `src/data.ts`
- [ ] Remove `sleep(1000)` / `sleep(900)`

---

## 10. Wasm Upload — `src/components/UploadPage.tsx`

- [ ] Gate behind wallet connection
- [ ] Read the selected `.wasm` file as `Uint8Array` using `FileReader` / `arrayBuffer()`
- [ ] Use `client.upload(address, wasmBytes, "auto")`
- [ ] Display real `result.codeId` and `result.transactionHash` with explorer link
- [ ] Remove the random Code ID generation and `sleep(2500)`

---

## 11. Contract Instantiation — `src/components/CreatePage.tsx`

- [ ] Gate behind wallet connection
- [ ] Call `client.instantiate(address, codeId, initMsg, label, "auto", { funds })`
- [ ] Display real `result.contractAddress` and `result.transactionHash` with explorer link
- [ ] Remove `MOCK_CONTRACT_ADDR`, `MOCK_TX`, and `sleep(2200)`

---

## 12. Code Cleanup

- [ ] Delete all `MOCK_*` exports from `src/data.ts` once every component has been migrated
- [ ] Remove any remaining `sleep()` calls from components (keep `sleep` in `src/utils.ts` only if still needed elsewhere)
- [ ] Add user-facing error messages for RPC/network failures across all components
- [ ] Handle "wallet not connected" state gracefully in all action tabs (Execute, Migrate, Upload, Instantiate)

---

## 13. Optional Enhancements

- [ ] Cache `CosmWasmClient` / `StargateClient` instances per network to avoid reconnecting on every action
- [ ] Add network-aware `keplr.enable()` call when the user switches networks in the Navbar
- [ ] Add transaction history per contract via `GET /cosmos/tx/v1beta1/txs?events=wasm._contract_address='{addr}'`
- [ ] Support Ledger hardware wallets via `@cosmjs/ledger-amino`
- [ ] Support additional wallet extensions (Leap, Cosmostation) by abstracting the signer interface
- [ ] Integrate CosmosKit or Graz for multi-wallet support

---

## Critical Files

| File | Change |
|---|---|
| `src/data.ts` | Add `rpcUrl`/`restUrl`/`gasPrice` to `Network`; remove all `MOCK_*` exports |
| `src/context/WalletContext.tsx` | **New file** — wallet state context |
| `src/components/Navbar.tsx` | Real Keplr connect/disconnect |
| `src/components/ContractListPage.tsx` | Fetch 10 latest contracts from chain |
| `src/components/QueryTab.tsx` | Real `queryContractSmart` |
| `src/components/ExecuteTab.tsx` | Real `execute` with signing |
| `src/components/MigrateTab.tsx` | Real `migrate` with signing |
| `src/components/BalancesTab.tsx` | Real `getAllBalances` |
| `src/components/CreatePage.tsx` | Real `instantiate` with signing |
| `src/components/UploadPage.tsx` | Real `upload` with signing |
