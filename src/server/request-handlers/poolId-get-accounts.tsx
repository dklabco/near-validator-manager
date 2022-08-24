import React from "react";
import { Request, Response } from "restify";
import { providers } from "near-api-js";
import { renderToPipeableStream } from "react-dom/server";
import { PoolGetAccounts } from "client/PoolGetAccounts";

const provider = new providers.JsonRpcProvider(
  "https://rpc.shardnet.near.org"
);

const arrBytesToString = (arr: ArrayLike<number>): string => {
  return new TextDecoder().decode(Uint8Array.from(arr))
}

const poolIdGetAccountsQuery = async (poolId: string): Promise<any> => {
  let rawResult: any, result: any, error: any, status: number = 500
  if (!poolId) {
    status = 400
    error = 'poolId not provided'
  }
  try {
    rawResult = await provider.query({
      request_type: "call_function",
      account_id: poolId,
      method_name: "get_accounts",
      // @TODO enable pagination
      args_base64: "eyJmcm9tX2luZGV4IjogMCwgImxpbWl0IjogMTB9Cg==", // echo '{"from_index": 0, "limit": 10}' | base64
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
  const { rawResult, result, status, error } = await poolIdGetAccountsQuery(req.params?.poolId)
  res.send(status, { rawResult, result, error })
}

export const poolIdGetAccountsPageRenderer = async (req: Request, res: Response): Promise<void> => {
  const { result, error, status } = await poolIdGetAccountsQuery(req.params?.poolId);
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