# SolPact 🇳🇬🛰️

SolPact is a mobile-first, Solana-native crowdfunding platform designed to empower local communities in Nigeria. It allows users to fund both **Offline Real-World Projects** (like boreholes, schools, and clinics) and **Online Digital Projects** (apps, courses, and tools) using SOL.

## 🚀 Vision
“Nigerians using their phones to fund development projects in SOL; verified builders and creators claiming the bounty on-chain with full transparency.”

## 🛠️ Tech Stack
- **Frontend**: React Native + Expo (Managed Workflow)
- **On-Chain**: Solana Anchor Framework (Rust)
- **Off-Chain Backend**: Convex (Real-time DB + Serverless Functions)
- **Wallet**: Solana Mobile Wallet Adapter (MWA) with Solflare/Phantom support
- **Infrastructure**: Quicknode RPC + Convex HTTP Actions

## 📂 Project Structure
```bash
.
├── apps/mobile       # React Native Expo app
├── convex/           # Convex backend (schema, mutations, queries)
├── programs/solpact  # Solana Anchor program (smart contracts)
├── README.md         # Project documentation
└── package.json      # Monorepo configuration
```

## ✨ Key Features
- **Mobile-First UX**: Built for Android and iOS with a focus on ease of use in the Nigerian market.
- **Trustless Vaults**: Funds are held in Program Derived Addresses (PDAs) on Solana, only released when verified.
- **Multi-Step Verification**: Integrated flow for verifiers to approve project delivery via mobile proof uploads.
- **NGN/SOL Conversion**: Built-in FX utility to track goals and donations in both Naira and SOL.
- **Real-Time Sync**: Powered by Convex for instant UI updates when donations or state changes occur.

## 🏁 Getting Started

### Prerequisites
- Node.js v20+
- Solana CLI & Anchor (for program development)
- Expo Go or Development Build environment

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   cd apps/mobile && npm install
   ```

2. Start the Convex backend:
   ```bash
   npx convex dev
   ```

3. Start the Mobile app:
   ```bash
   npm run mobile:dev
   ```

## 📜 Smart Contract Instructions
- `create_campaign`: Initialize a new crowdfunding campaign.
- `donate`: Contribute SOL to a specific campaign.
- `verify_project`: Designated verifier approves the project delivery.
- `claim_bounty`: Host withdraws funds after successful verification.

## 🗺️ Roadmap
- [ ] Impact NFT Minting for backers (Metaplex)
- [ ] Kamino integration for yield-generating treasury pools
- [ ] DAO-based governance for community voting
- [ ] Localized Reputation System for hosts

---
Built with ❤️ for the Solana Nigeria Hackathon.
