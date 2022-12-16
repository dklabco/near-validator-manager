export interface IRespPayload {
  message: string;
  details?: unknown;
}

export type NEAR_NETWORK_ID = "mainnet" | "testnet" | "shardnet"

export type StackingPoolGetAccountsArgs = {
  poolId: string
  from?: number
  limit?: number
}

export interface IStackingPoolContractGetAccountsRespAccount {
  account_id: string;
  unstaked_balance: string;
  staked_balance: string;
  can_withdraw: boolean;
}

export type StackingPoolContractGetAccountsResp = IStackingPoolContractGetAccountsRespAccount[]