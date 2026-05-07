# CosmWasm Explorer

A web3 frontend for browsing, querying, and interacting with CosmWasm smart contracts across multiple Cosmos chains. Connect your Keplr wallet to upload, instantiate, execute, and migrate contracts directly from the browser.

## Features

- **Contract list** — browse all deployed CosmWasm contracts on a chain with live pagination and name/address filtering
- **Direct navigation** — jump to any contract by pasting its address
- **Query** — send read-only smart queries and inspect JSON responses
- **Execute** — submit signed transactions to a contract (wallet required)
- **Migrate** — migrate a contract to a new code ID (wallet required)
- **Balances** — view token balances held by a contract
- **Upload** — store a compiled `.wasm` binary on-chain via drag-and-drop (wallet required)
- **Instantiate** — create a new contract from a code ID with a JSON init message and optional funds (wallet required)
- **Multi-network** — switch between Cosmos Hub, Osmosis, Juno, Neutron, and Stargaze

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Keplr](https://www.keplr.app/) browser extension (for wallet features)

## Installation

```bash
git clone https://github.com/disperze/cw-explorer.git
cd cw-explorer
npm install
```

## Configuration

The app works out of the box with public RPC/REST endpoints. To use custom endpoints (recommended for production), create a `.env.local` file in the project root:

```env
# Cosmos Hub
VITE_COSMOSHUB_RPC=https://rpc.cosmos.network
VITE_COSMOSHUB_REST=https://api.cosmos.network

# Osmosis
VITE_OSMOSIS_RPC=https://rpc.osmosis.zone
VITE_OSMOSIS_REST=https://lcd.osmosis.zone

# Juno
VITE_JUNO_RPC=https://rpc.juno.strange.love
VITE_JUNO_REST=https://api.juno.strange.love

# Neutron
VITE_NEUTRON_RPC=https://rpc-kralum.neutron-1.neutron.org
VITE_NEUTRON_REST=https://rest-kralum.neutron-1.neutron.org

# Stargaze
VITE_STARGAZE_RPC=https://rpc.stargaze-1.publicnode.com
VITE_STARGAZE_REST=https://rest.stargaze-1.publicnode.com
```

All variables are optional — any variable not set falls back to the default public endpoint shown above.

## Running locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for production

```bash
npm run build
```

The output is written to `dist/`. Serve it with any static file host (Vercel, Netlify, Nginx, etc.).

To preview the production build locally:

```bash
npm run preview
```

## Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + TypeScript |
| Bundler | Vite |
| Chain client | CosmJS (`@cosmjs/cosmwasm-stargate`, `@cosmjs/stargate`) |
| Wallet | Keplr (`@keplr-wallet/types`) |

## Supported networks

| Network | Chain ID |
|---|---|
| Cosmos Hub | `cosmoshub-4` |
| Osmosis | `osmosis-1` |
| Juno | `juno-1` |
| Neutron | `neutron-1` |
| Stargaze | `stargaze-1` |

## Usage

1. Open the app and select a network from the top navigation bar.
2. The contract list loads automatically. Use the filter input to search by name or address, or paste an address in the **Go to contract** field to navigate directly.
3. Click any contract row to open the detail view with **Query**, **Execute**, **Migrate**, and **Balances** tabs.
4. To upload a new `.wasm` binary, click **Upload** in the navbar, connect Keplr, then drag-and-drop or select your file.
5. To instantiate a contract, click **Create**, enter the code ID, a label, an instantiate message (JSON), and optional funds.

Transactions link out to [Mintscan](https://www.mintscan.io/) for easy on-chain verification.
