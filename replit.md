# SecureEvidence - Blockchain Evidence Storage

## Overview
SecureEvidence is a decentralized application for securely storing and managing cyberbullying evidence using blockchain technology, IPFS, and end-to-end encryption. The application provides a secure platform for victims to submit evidence while maintaining complete control over access permissions.

## Current State
- **Status**: Fully functional in Replit environment
- **Frontend**: React + TypeScript with Vite build system
- **Backend**: Express.js server serving both API and static files
- **Port**: Running on port 5000 (both frontend and API)
- **Database**: Uses IPFS (Pinata) for file storage and blockchain for metadata
- **Authentication**: MetaMask wallet integration

## Recent Changes (Import to Replit)
- **2024-12-25**: Imported GitHub repository and configured for Replit
  - Fixed React import syntax (removed unnecessary React import)
  - Converted server.js to server.cjs for CommonJS compatibility with ES module project
  - Configured Express server to serve built React static files
  - Updated API URLs to use relative paths for unified server
  - Set up unified development workflow on port 5000
  - Configured deployment settings for production

## User Preferences
- Development workflow: Single unified server for both frontend and backend
- Port configuration: All services run on port 5000 for Replit compatibility
- Build process: React app builds to `dist/` directory and served by Express

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Blockchain**: Ethers.js for Web3 interactions
- **Location**: Root directory (`src/`)

### Backend (Express.js)
- **Server**: Node.js with Express
- **File**: `server/server.cjs` (CommonJS format)
- **APIs**: RESTful API for evidence management
- **Storage**: Pinata SDK for IPFS integration
- **Encryption**: Built-in AES-256-GCM encryption
- **Port**: 5000 (serves both API routes and static files)

### Key Features
1. **Evidence Upload**: Encrypted file uploads to IPFS
2. **Blockchain Integration**: MetaMask wallet connection
3. **Access Control**: Victim-controlled permissions system
4. **Search**: Evidence search and management
5. **Security**: End-to-end encryption and immutable storage

### File Structure
```
├── src/                 # React frontend source
│   ├── components/      # React components
│   ├── services/       # API service layer
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript definitions
├── server/
│   └── server.cjs      # Express backend (CommonJS)
├── contracts/          # Solidity smart contracts
├── dist/              # Built React app (served by Express)
└── uploads/           # Temporary file uploads
```

### Development Workflow
1. `npm run build` - Builds React app to `dist/`
2. `node server/server.cjs` - Starts unified server
3. Server serves API routes at `/api/*` and static files for all other routes
4. Single development server approach for simplicity

### Environment Variables Needed
- `PINATA_API_KEY`: Pinata API key for IPFS storage
- `PINATA_SECRET_API_KEY`: Pinata secret key
- `VITE_CONTRACT_ADDRESS`: Deployed smart contract address
- `VITE_NETWORK_ID`: Blockchain network ID

### Production Deployment
- **Type**: Autoscale deployment
- **Build**: `npm run build`
- **Start**: `node server/server.cjs`
- **Port**: 5000

## Technical Notes
- The application gracefully handles missing API credentials with mock data
- Frontend uses relative API paths (`/api`) for unified server setup
- Smart contracts need to be deployed separately on desired blockchain network
- File uploads are temporarily stored before encryption and IPFS upload
- MetaMask integration requires user interaction for wallet connection