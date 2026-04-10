# SecureEvidence - Blockchain Cyberbullying Evidence Storage

SecureEvidence is a decentralized application designed to securely store, manage, and verify cyberbullying evidence using blockchain technology, IPFS (Pinata), and robust encryption.

## 🚀 Key Features

- **Blockchain-Backed Immutability**: All evidence metadata is stored on the Ethereum blockchain, ensuring it cannot be tampered with.
- **Secure IPFS Storage**: Evidence files are encrypted on the client-side and stored on IPFS via Pinata.
- **Smart Access Control**: Victims maintain complete control over who can view their evidence.
- **End-to-End Encryption**: AES-256-GCM encryption ensures data remains private even on decentralized storage.
- **Transparent Audit Trail**: Every access attempt and permission change is recorded on-chain.

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Multer
- **Blockchain**: Solidity, Ethers.js
- **Storage**: Pinata (IPFS)
- **Database**: Supabase (Metadata)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) browser extension
- A local Ethereum network (like [Ganache](https://trufflesuite.com/ganache/) or Hardhat) or a Testnet.

## ⚙️ Setup & Installation

### 1. Project Setup
```bash
# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your credentials. You can use `.env.example` as a template.

```bash
cp .env.example .env
```

**Required Variables:**
- `PINATA_API_KEY`: Your Pinata API Key.
- `PINATA_SECRET_API_KEY`: Your Pinata Secret Key.
- `VITE_CONTRACT_ADDRESS`: The address of your deployed smart contract.
- `VITE_NETWORK_ID`: The chain ID of your Ethereum network (e.g., `5777` for Ganache).

### 3. Backend Setup
The backend handles file encryption and IPFS pinning.

```bash
# Start the server
npm run server
```

The server will be running on `http://localhost:5000`.

### 4. Frontend Setup
The frontend provides the user interface for interacting with the blockchain and managing evidence.

```bash
# In a new terminal window
npm run dev
```

The application will be available at `http://localhost:5173`.

## ⛓ Smart Contract Deployment

If you are using a custom contract, follow these steps:
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Copy the content from `contracts/EvidenceStorage.sol`.
3. Compile and deploy the contract to your network.
4. Copy the deployed contract address and update `VITE_CONTRACT_ADDRESS` in your `.env`.

## 📖 Usage Guide

1. **Connect Wallet**: Click "Connect MetaMask" and approve the connection.
2. **Submit Evidence**: Go to the "Submit Evidence" tab, upload your file, and confirm the transaction.
3. **Manage Access**: In "My Evidence", you can see your submissions and manage who has permission to view them.
4. **View Evidence**: Authorized users can request access and view evidence once approved.