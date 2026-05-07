import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StargateClient } from '@cosmjs/stargate';

const cosmWasmClients = new Map<string, CosmWasmClient>();
const stargateClients = new Map<string, StargateClient>();

export async function getCosmWasmClient(rpcUrl: string): Promise<CosmWasmClient> {
  const cached = cosmWasmClients.get(rpcUrl);
  if (cached) return cached;
  try {
    const client = await CosmWasmClient.connect(rpcUrl);
    cosmWasmClients.set(rpcUrl, client);
    return client;
  } catch (e) {
    cosmWasmClients.delete(rpcUrl);
    throw e;
  }
}

export async function getStargateClient(rpcUrl: string): Promise<StargateClient> {
  const cached = stargateClients.get(rpcUrl);
  if (cached) return cached;
  try {
    const client = await StargateClient.connect(rpcUrl);
    stargateClients.set(rpcUrl, client);
    return client;
  } catch (e) {
    stargateClients.delete(rpcUrl);
    throw e;
  }
}
