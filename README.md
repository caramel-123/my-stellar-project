# my-stellar-project
A Stellar smart contract project

# my-stellar-project
A Stellar smart contract project

# 🎟️ EventPass — Blockchain Ticket System

> NFT-like event tickets with clawback fraud prevention, built on Stellar Soroban.

---

## 📋 The Problem

Event organizers and attendees suffer from ticket fraud, fake reselling, and refund abuse because traditional ticketing systems (like Eventbrite or SM Tickets) have no way to revoke or verify tickets in real time.

## 💡 The Solution

EventPass issues digital ticket tokens on Stellar so organizers can instantly verify attendance and **clawback** (revoke) tickets from fraudsters, scammers, or refunded attendees — with near-zero fees and 5-second finality.

---

## 🌐 Live Contract on Stellar Testnet

| | |
|---|---|
| **Contract ID** | `CCL6J5VNU6U5IUBXO322LHKHODRO2YZ2FYG2AZA4S2QLZGH5LKWXBTKX` |
| **Transaction Hash** | `b913f428c3a472c766551079c27e0cfb1bab1144d25202d12880ab22bae80ef5` |
| **Explorer Link** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/b913f428c3a472c766551079c27e0cfb1bab1144d25202d12880ab22bae80ef5) |
| **Network** | Stellar Testnet |
| **Event** | Python Tech Event 2026 |

---

## ✨ Stellar Features Used

- [x] Soroban Smart Contract (Rust)
- [x] Custom Tokens
- [x] Clawback / Compliance
- [x] Trustline

---

## 👥 How It Works

There are 3 roles in EventPass:

| Role | What they do |
|---|---|
| **Organizer (Admin)** | Mints and clawbacks tickets |
| **Attendee** | Receives ticket into their Freighter wallet |
| **Door Checker** | Verifies wallet at the event entrance |

### The Flow
```
1. Organizer deploys contract → sets themselves as admin
2. Attendee signs up → Organizer mints 1 ticket to their wallet
3. Event day → Door checker verifies wallet → ✅ valid or ❌ denied
4. Fraud/refund? → Organizer clawbacks token instantly
```

---

## 🧱 Smart Contract Functions

| Function | Who calls it | What it does |
|---|---|---|
| `initialize(admin)` | Organizer | Sets up the contract with an admin |
| `mint_ticket(attendee, event_name)` | Organizer | Issues a ticket token to a wallet |
| `verify_ticket(attendee)` | Door checker | Returns true/false if wallet has valid ticket |
| `clawback(attendee)` | Organizer | Revokes ticket from any wallet instantly |
| `total_tickets()` | Anyone | Returns total number of tickets issued |

---

## 📁 Project Structure

```
my-stellar-project/
├── contract/                          # Soroban smart contract (Rust)
│   ├── Cargo.toml                     # Workspace config
│   └── contracts/
│       └── contract/
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs             # Main contract logic
│               └── test.rs            # 3 unit tests
└── client/                            # Next.js frontend
    ├── app/
    ├── components/
    │   └── Contract.tsx               # Main UI component
    ├── hooks/
    │   └── contract.ts                # Stellar SDK + contract calls
    └── package.json
```

---

## ⚙️ Prerequisites

- Rust toolchain: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- WASM target: `rustup target add wasm32v1-none`
- Stellar CLI: `cargo install --locked stellar-cli`
- Node.js 18+
- Freighter wallet browser extension: https://www.freighter.app

---

## 🔨 Build the Contract

```bash
cd contract
stellar contract build
```

Output: `target/wasm32v1-none/release/event_pass.wasm`

---

## 🧪 Run Tests

```bash
cd contract
cargo test
```

3 tests included:
- Happy path — mint and verify ticket
- Edge case — clawback invalidates ticket
- State check — total ticket count is correct

---

## 🚀 Deploy to Testnet

```bash
# Generate and fund your account
stellar keys generate student --network testnet
stellar keys fund student --network testnet

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/event_pass.wasm \
  --source-account student \
  --network testnet

# Initialize
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account student \
  --network testnet \
  --send=yes \
  -- initialize \
  --admin $(stellar keys address student)

# Mint a ticket
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account student \
  --network testnet \
  --send=yes \
  -- mint_ticket \
  --attendee $(stellar keys address student) \
  --event_name "Python Tech Event 2026"

# Verify ticket
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account student \
  --network testnet \
  -- verify_ticket \
  --attendee $(stellar keys address student)
```

---

## 🖥️ Run the Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000 — connect your Freighter wallet and interact with the contract!

---

## 🔐 Security Notes

- Never share your private/secret key
- `.env` files are excluded via `.gitignore`
- All development done on Testnet only
- No private keys are stored in this repository

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Rise In x Stellar University Tour — March 2026*
*EventPass by Mel*

![ss-site-stellar](https://github.com/user-attachments/assets/af52a10e-062f-4ab1-afa9-6921387a66a3)
