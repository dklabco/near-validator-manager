import { IRespPayload, NEAR_NETWORK_ID } from "shared/types";

export function updateNetworkId(networkId: NEAR_NETWORK_ID): Promise<IRespPayload> {
  return new Promise((resolve, reject) => {

    window.fetch("/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        networkId
      })
    })
      .then(resp => resolve(resp.json()))
      .catch(reject);

  });
}
