# 🎟️ EventPass — Blockchain Ticket System

> NFT-like event tickets with clawback fraud prevention, built on Stellar Soroban.

---

## 📋 Problem

Event organizers and attendees suffer from ticket fraud, fake reselling, and refund abuse because traditional ticketing systems have no way to revoke or verify tickets in real time.

## 💡 Solution

EventPass issues digital ticket tokens on Stellar so organizers can instantly verify attendance and clawback tickets from fraudsters, scammers, or refunded attendees — with near-zero fees and 5-second finality.

---

## ✨ Stellar Features Used

- [x] Custom tokens
- [x] Soroban smart contract
- [x] Trustline
- [x] Clawback / Compliance

---

## 👥 Target Users

- **Organizers** — campus orgs, indie event hosts, student councils
- **Attendees** — students and event-goers with a Freighter wallet

---

## 🧱 Core MVP Transaction

```
mint_ticket(attendee_address, event_name)
```
Organizer mints 1 ticket token → attendee wallet holds it → door checker verifies → organizer can clawback anytime.

---

## 🗓️ Suggested Timeline

| Day | Task |
|-----|------|
| Day 1 | Write & deploy smart contract to testnet |
| Day 2 | Build frontend UI shell (HTML/JS or React) |
| Day 3 | Connect Freighter wallet + contract calls |
| Day 4 | Test all 3 flows: mint, verify, clawback |
| Day 5 | Record demo video + write README |

---

## ⚙️ Prerequisites

- Rust toolchain: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Stellar CLI: `cargo install --locked stellar-cli`
- Freighter wallet: https://www.freighter.app
- Wasm target: `rustup target add wasm32-unknown-unknown`

---

## 🔨 How to Build

```bash
stellar contract build
```

Output: `target/wasm32-unknown-unknown/release/event_pass.wasm`

---

## 🧪 How to Test

```bash
cargo test
```

Runs 3 tests:
1. Happy path — mint and verify ticket
2. Edge case — clawback invalidates ticket
3. State check — total ticket count is correct

---

## 🚀 How to Deploy to Testnet

```bash
# 1. Generate and fund your account
stellar keys generate organizer --network testnet
stellar keys fund organizer --network testnet

# 2. Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/event_pass.wasm \
  --source-account organizer \
  --network testnet
```

Copy the **Contract ID** from the output — you'll need it for all invocations.

---

## 🖥️ Sample CLI Invocations

### Initialize the contract
```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account organizer \
  --network testnet \
  --send=yes \
  -- initialize \
  --admin YOUR_ORGANIZER_ADDRESS
```

### Mint a ticket to an attendee
```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account organizer \
  --network testnet \
  --send=yes \
  -- mint_ticket \
  --attendee ATTENDEE_WALLET_ADDRESS \
  --event_name "Ateneo Tech Event 2026"
```

### Verify a ticket at the door
```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account organizer \
  --network testnet \
  -- verify_ticket \
  --attendee ATTENDEE_WALLET_ADDRESS
```

### Clawback a ticket (fraud/refund)
```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source-account organizer \
  --network testnet \
  --send=yes \
  -- clawback \
  --attendee ATTENDEE_WALLET_ADDRESS
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Rise In x Stellar University Tour — March 2026*