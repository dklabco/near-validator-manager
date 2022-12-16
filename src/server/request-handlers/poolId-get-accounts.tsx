import React from "react";
import { Buffer } from 'node:buffer';
import { Request, Response } from "restify";
import { providers } from "near-api-js";
import { renderToPipeableStream } from "react-dom/server";
import { PoolGetAccounts } from "client/PoolGetAccounts";
import { StackingPoolGetAccountsArgs } from "shared/types";

const provider = new providers.JsonRpcProvider(
  "https://rpc.shardnet.near.org"
);

const arrBytesToString = (arr: ArrayLike<number>): string => {
  return new TextDecoder().decode(Uint8Array.from(arr))
}

const poolIdGetAccountsQuery = async ({ poolId, from = 0, limit = 10 }: StackingPoolGetAccountsArgs): Promise<any> => {
  let rawResult: any, result: any, error: any, status: number = 500
  if (!poolId) {
    status = 400
    error = 'poolId not provided'
  }
  // echo '{"from_index": 0, "limit": 10}' | base64
  console.log(`{"from_index": ${from}, "limit": ${limit}}`)
  const args: string = Buffer.from(`{"from_index": ${from}, "limit": ${limit}}`).toString("base64");
  try {
    rawResult = await provider.query({
      request_type: "call_function",
      account_id: poolId,
      method_name: "get_accounts",
      args_base64: args,
      finality: "optimistic",
    })
    result = JSON.parse(Buffer.from(rawResult.result).toString());
    status = 200
  } catch (e) {
    error = e
  }
  return { rawResult, result, status, error };
}

export const poolIdGetAccountsJsonRenderer = async (req: Request, res: Response): Promise<any> => {
  const { rawResult, result, status, error } = await poolIdGetAccountsQuery({
    poolId: req.params?.poolId,
    from: req.params?.from,
    limit: req.params?.limit
  })
  res.send(status, { rawResult, result, error })
}

export const poolIdGetAccountsPageRenderer = async (req: Request, res: Response): Promise<void> => {
  console.log(req.url, req.query, req.params)
  const { result, error, status } = await poolIdGetAccountsQuery({
    poolId: req.params?.poolId,
    from: req.params?.from,
    limit: req.params?.limit
  });
  // console.log({ result, error, status })
  let didError = false;
  const stream = renderToPipeableStream(
    <PoolGetAccounts accounts={result} />, {
      onShellReady() {
        // The content above all Suspense boundaries is ready.
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : status;
        res.setHeader("Content-type", "text/html");
        stream.pipe(res);
      },
      onShellError(error) {
        // Something errored before we could complete the shell so we emit an alternative shell.
        res.statusCode = 500;
        res.setHeader("Content-type", "text/html");
        res.send('<!doctype html><p>Loading...</p><script src="clientrender.js"></script>');
      },
      onError(err) {
        didError = true;
        console.error(err);
      }
    }
  );
}