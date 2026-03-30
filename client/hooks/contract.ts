"use client";

import {
  Contract,
  Networks,
  TransactionBuilder,
  Keypair,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  isAllowed,
  requestAccess,
} from "@stellar/freighter-api";

// ============================================================
// CONSTANTS — paste your contract ID here
// ============================================================

export const CONTRACT_ADDRESS = "CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6";

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK = "TESTNET";

const server = new rpc.Server(RPC_URL);

// ============================================================
// Wallet Helpers
// ============================================================

export async function checkConnection(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const connResult = await isConnected();
  if (!connResult.isConnected) {
    throw new Error("Freighter extension is not installed or not available.");
  }
  const allowedResult = await isAllowed();
  if (!allowedResult.isAllowed) {
    await setAllowed();
    await requestAccess();
  }
  const { address } = await getAddress();
  if (!address) throw new Error("Could not retrieve wallet address.");
  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connResult = await isConnected();
    if (!connResult.isConnected) return null;
    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) return null;
    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// ============================================================
// Core Contract Call Helper
// ============================================================

export async function callContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller: string,
  sign: boolean = true
) {
  const contract = new Contract(CONTRACT_ADDRESS);
  const account = await server.getAccount(caller);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as rpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  if (!sign) return simulated;

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const txToSubmit = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(txToSubmit);

  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${result.status}`);
  }

  let getResult = await server.getTransaction(result.hash);
  while (getResult.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    getResult = await server.getTransaction(result.hash);
  }

  if (getResult.status === "FAILED") throw new Error("Transaction failed on chain.");
  return getResult;
}

export async function readContract(
  method: string,
  params: xdr.ScVal[] = [],
  caller?: string
) {
  const account = caller || Keypair.random().publicKey();
  const sim = await callContract(method, params, account, false);
  if (
    rpc.Api.isSimulationSuccess(sim as rpc.Api.SimulateTransactionResponse) &&
    (sim as rpc.Api.SimulateTransactionSuccessResponse).result
  ) {
    return scValToNative(
      (sim as rpc.Api.SimulateTransactionSuccessResponse).result!.retval
    );
  }
  return null;
}

// ============================================================
// ScVal Helpers
// ============================================================

export const toScValString = (v: string) => nativeToScVal(v, { type: "string" });
export const toScValAddress = (v: string) => new Address(v).toScVal();

// ============================================================
// EventPass — Contract Methods
// ============================================================

/** Initialize the contract with admin */
export async function initializeContract(caller: string) {
  return callContract("initialize", [toScValAddress(caller)], caller, true);
}

/** Mint a ticket to an attendee wallet */
export async function mintTicket(
  caller: string,
  attendee: string,
  eventName: string
) {
  return callContract(
    "mint_ticket",
    [toScValAddress(attendee), toScValString(eventName)],
    caller,
    true
  );
}

/** Verify if a wallet has a valid ticket — read only */
export async function verifyTicket(attendee: string, caller?: string) {
  return readContract("verify_ticket", [toScValAddress(attendee)], caller);
}

/** Clawback (revoke) a ticket from a wallet */
export async function clawbackTicket(caller: string, attendee: string) {
  return callContract(
    "clawback",
    [toScValAddress(attendee)],
    caller,
    true
  );
}

/** Get total number of tickets issued */
export async function getTotalTickets(caller?: string) {
  return readContract("total_tickets", [], caller);
}

export { nativeToScVal, scValToNative, Address, xdr };