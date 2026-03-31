# EventPass

EventPass, A portmanteau of Event and Pass. It literally means "Your Event Ticket on the Blockchain". Is a Soroban-powered event ticketing application built on Stellar. It helps event organizers manage digital tickets with better fraud prevention than traditional paper or screenshot-based ticketing systems.

Instead of dealing with fake tickets, reseller scams, and refund abuse, EventPass records ticket issuance, verification, and revocation on-chain. The organizer retains full clawback power — meaning any ticket can be instantly revoked from any wallet at any time.

---

## UI Screenshots

### Connect Wallet
<img width="1460" height="764" alt="Screenshot 2026-03-31 at 4 30 10 PM" src="https://github.com/user-attachments/assets/a07651cb-746b-4f68-a526-d060fa2f1e16" />

### Mint Ticket

<img width="702" height="629" alt="Screenshot 2026-03-31 at 4 31 09 PM" src="https://github.com/user-attachments/assets/5e66b5b4-577d-456c-88b7-7d71bd4816d5" />

### Verify Ticket — Valid
<img width="764" height="745" alt="Screenshot 2026-03-31 at 4 31 39 PM" src="https://github.com/user-attachments/assets/a736c624-c176-457c-92a9-d9ff37677d26" />

### Clawback — Ticket Revoked
<img width="724" height="740" alt="Screenshot 2026-03-31 at 4 32 03 PM" src="https://github.com/user-attachments/assets/41f22ab6-7eb2-4c40-81ad-e95f9d9fc945" />

### Verify Ticket — After Clawback
<img width="730" height="720" alt="Screenshot 2026-03-31 at 4 32 14 PM" src="https://github.com/user-attachments/assets/8c368457-1ce9-4bff-a82f-bcf99fcec5e7" />


---

## Stellar Expert Link

https://stellar.expert/explorer/testnet/contract/CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6

---

## Smart Contract Address

```
CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6
```

---

## Smart Contract Short Description

This Soroban smart contract manages event ticket issuance and fraud prevention on-chain. It enforces role-based permissions so only the admin (organizer) can mint or revoke tickets. Any wallet can be verified for ticket validity in real time. The clawback mechanism ensures the organizer retains full control — fake tickets, refund abuse, and reseller scams can be resolved instantly by revoking the token from any wallet.

---

## Future Scope

Planned next steps for EventPass:

- support multiple events per contract with separate ticket pools
- add QR code generation for ticket display in the frontend
- show ticket history and transaction receipts per attendee
- add transferable tickets with organizer approval
- support paid ticket minting with XLM/USDC integration
- add analytics dashboard for event attendance tracking
- export attendee list for event organizers

---

## Project Setup Guide (Local Development)

Follow these steps to run EventPass on your machine.

### 1. Clone and enter the repository.

```bash
git clone https://github.com/caramel-123/my-stellar-project.git
cd my-stellar-project
```

### 2. Install required tooling.

```bash
rustc --version
cargo --version
stellar --version
node --version
npm --version
```

### 3. Install frontend dependencies.

```bash
cd client
npm install
cd ..
```

### 4. Build and test the smart contract.

```bash
cd contract
cargo test
stellar contract build
```

Expected WASM output:

```
target/wasm32v1-none/release/event_pass.wasm
```

### 5. (Optional but recommended) Deploy your contract to testnet.

```bash
stellar keys generate student --network testnet
stellar keys fund student --network testnet

stellar contract deploy \
  --wasm target/wasm32v1-none/release/event_pass.wasm \
  --source student \
  --network testnet
```

### 6. Initialize the contract.

```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account student \
  --network testnet \
  --send=yes \
  -- initialize \
  --admin $(stellar keys address student)
```

### 7. Start the frontend development server.

```bash
cd client
npm run dev
```

### 8. Open the app in your browser.

```
http://localhost:3000
```

---

## Prerequisites

Install:

- [Rust](https://rustup.rs/)
- [Stellar CLI](https://github.com/stellar/stellar-cli/releases)
- [Node.js 18+](https://nodejs.org/)
- [Freighter browser extension](https://www.freighter.app)

Helpful checks:

```bash
rustc --version
cargo --version
stellar --version
node --version
```

---

## Smart Contract Development

Run tests:

```bash
cd contract
cargo test
```

Build a Soroban-compatible WASM artifact:

```bash
stellar contract build
```

This produces:

```
target/wasm32v1-none/release/event_pass.wasm
```

> **Important:** use `stellar contract build` and deploy from `target/wasm32v1-none/release/` — not `wasm32-unknown-unknown`

---

## Deploy To Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/event_pass.wasm \
  --source student \
  --network testnet
```

After deployment, copy the returned contract ID and update it in:

```
client/hooks/contract.ts → CONTRACT_ADDRESS
```

---

## Frontend Setup

Install dependencies:

```bash
cd client
npm install
```

Run the dev server:

```bash
npm run dev
```

---

## Contract API Reference

### `initialize(admin)`
Sets the admin (organizer) of the contract. Must be called once after deployment.

### `mint_ticket(attendee, event_name)`
Issues a ticket token to an attendee's wallet. Only the admin can call this.

### `verify_ticket(attendee) -> bool`
Returns `true` if the wallet holds a valid ticket. Anyone can call this — read-only.

### `clawback(attendee)`
Revokes a ticket from any wallet instantly. Only the admin can call this.

### `total_tickets() -> u32`
Returns the total number of tickets issued. Anyone can call this — read-only.

---

## CLI Examples

### Initialize the contract:

```bash
stellar contract invoke \
  --id CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6 \
  --source-account student \
  --network testnet \
  --send=yes \
  -- initialize \
  --admin $(stellar keys address student)
```

### Mint a ticket:

```bash
stellar contract invoke \
  --id CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6 \
  --source-account student \
  --network testnet \
  --send=yes \
  -- mint_ticket \
  --attendee ATTENDEE_WALLET_ADDRESS \
  --event_name "Python Tech Event 2026"
```

### Verify a ticket:

```bash
stellar contract invoke \
  --id CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6 \
  --source-account student \
  --network testnet \
  -- verify_ticket \
  --attendee ATTENDEE_WALLET_ADDRESS
```

### Clawback a ticket:

```bash
stellar contract invoke \
  --id CDGWBDKGVFEEZFK4QLHSVNZQC6JNXBVZUT4PUHW65ZAHBVQQMGZ6DNF6 \
  --source-account student \
  --network testnet \
  --send=yes \
  -- clawback \
  --attendee ATTENDEE_WALLET_ADDRESS
```

---

## What The Project Solves

Event organizers often deal with:

- fake or duplicate tickets
- resellers scamming buyers with invalid tickets
- attendees keeping tickets after getting refunds
- no real-time way to verify ticket validity at the door

The usual workflow is fragile:

- organizer sends a PDF or image ticket
- attendee screenshots it and shares it
- someone shows a fake copy at the door
- organizer has no way to revoke or verify

EventPass improves that by giving the organizer a smart-contract-backed source of truth.

---

## How EventPass Works

EventPass is built around 3 roles:

**Organizer (Admin)**
- deploys and initializes the contract
- mints tickets to attendee wallets
- clawbacks tickets for fraud or refunds

**Attendee**
- receives a ticket token in their Freighter wallet
- shows their wallet at the event door

**Door Checker**
- uses the Verify tab to check if a wallet has a valid ticket
- no wallet connection needed — read-only

### Core Rules Enforced By The Contract

- only the admin can mint tickets
- only the admin can revoke (clawback) tickets
- anyone can verify if a wallet has a valid ticket
- a clawed-back ticket immediately shows as invalid on verification

### Example User Flow

1. Mel deploys the EventPass contract and initializes herself as admin
2. Blockmate signs up → Mel mints 1 ticket to their Freighter wallet
3. Event day → door checker opens Verify tab → pastes blockmate's address → ✅ Valid Ticket
4. Someone tries to use a fake ticket → wallet is empty → ❌ No Valid Ticket
5. Refund requested → Mel clawbacks the token → wallet shows ❌ No Valid Ticket instantly

---

## Project Architecture

This repository is a monorepo with 2 main parts:

- Soroban smart contract in `contract/contracts/contract/src/lib.rs`
- Next.js frontend in `client/`

### Smart Contract

The contract is written in Rust with `soroban-sdk` and stores:

- admin address
- list of all issued tickets (owner, event name, validity status)

Primary contract methods:

- `initialize`
- `mint_ticket`
- `verify_ticket`
- `clawback`
- `total_tickets`

Tests live in `contract/contracts/contract/src/test.rs`.

### Frontend

The frontend is a Next.js app that integrates with:

- `@stellar/stellar-sdk`
- `@stellar/freighter-api`
- Freighter wallet
- Soroban RPC on Stellar testnet

The UI lets a user:

- connect a Freighter wallet
- mint a ticket to any wallet address
- verify if any wallet holds a valid ticket
- clawback (revoke) a ticket from any wallet

---

## Technology Stack

- Rust
- Soroban SDK
- Stellar CLI
- Next.js
- React
- TypeScript
- npm
- Freighter

---

## Repo Structure

```
my-stellar-project/
├── contract/
│   ├── Cargo.toml
│   └── contracts/
│       └── contract/
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs       # Main contract logic
│               └── test.rs      # 3 unit tests
└── client/
    ├── app/
    ├── components/
    │   └── Contract.tsx         # Main UI component
    ├── hooks/
    │   └── contract.ts          # Stellar SDK + contract calls
    └── package.json
```

---

## Current Status

This project currently includes:

- a working Soroban contract for event ticket management with clawback
- Rust tests for core contract rules (mint, clawback, verify)
- a frontend integrated with Freighter wallet
- typed client-side contract interaction code
- testnet-oriented configuration

---

## License

MIT License — free to use, modify, and distribute.

---

*Rise In x Stellar University Tour — March 2026*
*EventPass by Mel*
