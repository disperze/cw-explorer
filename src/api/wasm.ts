interface CodeInfo {
  code_id: string;
  creator: string;
  data_hash: string;
}

interface CodeListResponse {
  code_infos?: CodeInfo[];
}

interface ContractsByCodeResponse {
  contracts?: string[];
}

export async function fetchLatestCodeId(restUrl: string): Promise<number | null> {
  const res = await fetch(`${restUrl}/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1`);
  if (!res.ok) throw new Error(`Failed to fetch codes: ${res.status}`);
  const json: CodeListResponse = await res.json();
  const infos = json.code_infos ?? [];
  if (infos.length === 0) return null;
  return parseInt(infos[0].code_id, 10);
}

export async function fetchCodes(restUrl: string, limit: number): Promise<import('../data').Code[]> {
  const res = await fetch(
    `${restUrl}/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=${limit}`
  );
  if (!res.ok) throw new Error(`Failed to fetch codes: ${res.status}`);
  const json: CodeListResponse = await res.json();
  return (json.code_infos ?? []).map(info => ({
    id: parseInt(info.code_id, 10),
    creator: info.creator ?? '',
    dataHash: info.data_hash ?? '',
  }));
}

export async function fetchContractAddresses(
  restUrl: string,
  latestCodeId: number,
  max: number,
): Promise<string[]> {
  const addresses: string[] = [];
  for (let id = latestCodeId; id >= 1 && addresses.length < max; id--) {
    const res = await fetch(
      `${restUrl}/cosmwasm/wasm/v1/code/${id}/contracts?pagination.reverse=true&pagination.limit=${max - addresses.length}`
    );
    if (!res.ok) continue;
    const json: ContractsByCodeResponse = await res.json();
    addresses.push(...(json.contracts ?? []).reverse());
  }
  return addresses;
}
