# Onchain Creator & Bounty Hub

🚀 **✅ Production Build Complete - Ready for Netlify Deployment**

A comprehensive Base + Farcaster dApp for creators and hunters. Built with Next.js, TypeScript, and Solidity.

## 🎯 Deployment Status

**Build Status:** ✅ Complete  
**Target Platform:** Netlify Production  
**Network:** Base (Chain ID: 8453)  
**Farcaster FID:** 1378286  
**Collector Wallet:** `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`

### Quick Deploy
```bash
# Option 1: Automated deployment
./deploy.sh

# Option 2: Manual deployment
netlify login
netlify deploy --prod
```

**📚 Full deployment instructions:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Features

- **Pay-Per-Action Frames**: Tips, paywalls, and NFT mints with automatic fee splitting
- **Creator Access Passes**: Deploy soulbound or transferable access pass NFTs
- **Escrowed Bounties**: Post bounties with funds locked in smart contracts
- **Analytics Dashboard**: Track earnings, volume, and user engagement
- **Wallet-Gated Admin Panel**: Secure platform management for owners
- **Farcaster Integration**: Auto-connect users with FID 1378286
- **Base Network**: Low-cost transactions with ETH and USDC support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (PlanetScale, Neon, Supabase)
- **Blockchain**: Base (EVM), viem/wagmi
- **Authentication**: SIWE (Sign-In with Ethereum), Neynar for Farcaster
- **Smart Contracts**: Solidity 0.8.24
- **Deployment**: Netlify with Edge Functions

## Project Structure

```
onchain-creator-hub/
├── contracts/           # Solidity smart contracts
│   └── src/
│       ├── SubscriptionManager.sol
│       ├── FeeConfig.sol
│       ├── ActionProcessor.sol
│       ├── AccessPassFactory.sol
│       └── BountyEscrow.sol
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin panel pages
│   │   │   ├── config/  # Environment config
│   │   │   ├── secrets/ # Secrets management
│   │   │   ├── features/# Feature flags
│   │   │   └── health/  # System health
│   │   ├── api/         # API routes
│   │   │   ├── admin/   # Admin APIs
│   │   │   ├── auth/    # Authentication
│   │   │   ├── frame/   # Farcaster Frames
│   │   │   └── health/  # Health check
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   └── lib/             # Utility libraries
│       ├── auth.ts      # SIWE authentication
│       ├── contracts/   # Contract addresses & ABIs
│       ├── db.ts        # Prisma client
│       ├── encryption.ts # AES-256 encryption
│       └── utils.ts     # Utility functions
├── public/
│   └── .well-known/     # Farcaster manifest
├── netlify.toml         # Netlify configuration
├── DEPLOYMENT_GUIDE.md  # Full deployment guide
└── deploy.sh            # Automated deploy script
```

## Getting Started

### Prerequisites

- Node.js 20.19.6+
- PostgreSQL database
- npm or yarn
- MetaMask or compatible wallet
- Neynar API key (for Farcaster integration)
- Netlify account (for production deployment)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd onchain-creator-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - Database URL
   - Admin wallet address
   - RPC URLs
   - API keys
   - Contract addresses

5. Set up the database:
```bash
npm run db:generate
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

### Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Quick start:**
1. Set environment variables in Netlify dashboard
2. Run `./deploy.sh` or `netlify deploy --prod`
3. Test Farcaster frame endpoints
4. Verify collector wallet integration

## Smart Contracts

### Deploying Contracts

1. Configure your wallet private key in `.env`:
```env
PRIVATE_KEY=your-wallet-private-key
BASESCAN_API_KEY=your-basescan-api-key
```

2. Deploy to Base mainnet:
```bash
npm run contract:build
npm run contract:deploy --network baseMainnet
```

3. Update contract addresses in `.env` and redeploy the frontend.

### Contract Addresses (Base Mainnet)

After deployment, update these environment variables:
- `NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS`
- `NEXT_PUBLIC_FEE_CONFIG_ADDRESS`
- `NEXT_PUBLIC_ACTION_PROCESSOR_ADDRESS`
- `NEXT_PUBLIC_ACCESS_PASS_FACTORY_ADDRESS`
- `NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS`

## Admin Panel

### Access

The admin panel is located at `/admin` and requires:

1. Platform owner wallet connection
2. SIWE signature authentication
3. Session-based access (24-hour expiry)

### Features

- **Environment Configuration**: Manage environment variables
- **Secrets Management**: AES-256 encrypted API key storage with rotation
- **Feature Flags**: Toggle platform features and kill switches
- **System Health**: Monitor database, RPC, and API status
- **Security**: Role-enforced middleware and audit logging

### Setting Up Admin

1. Set your wallet address in `.env`:
```env
ADMIN_WALLET_ADDRESS=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
```

2. Navigate to `/admin/login`
3. Connect your wallet
4. Sign the SIWE message to authenticate

## Farcaster Frames

### Available Frames

- **Home Frame** (`/api/frame/home`): Entry point
- **Actions Frame** (`/api/frame/actions`): Tips, paywalls, mints
- **Passes Frame** (`/api/frame/passes`): Access pass management
- **Bounties Frame** (`/api/frame/bounties`): Bounty operations
- **Analytics Frame** (`/api/frame/analytics`): Stats and insights

### Frame Validation

Frames are validated using Neynar's frame validation API. Configure your API key in environment variables.

### Farcaster Configuration

- **FID**: 1378286 (for auto-connecting users)
- **Collector Wallet**: 0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
- **Supported Tokens**: Base ETH, USDC on Base

## Pricing

### Subscription Tiers

| Tier | Price | Monthly Volume | Features |
|------|-------|----------------|----------|
| Starter | $9/mo | $500 | 1 pass collection, basic analytics |
| Pro | $29/mo | $10K | 5 pass collections, advanced analytics |
| Power | $99/mo | $100K | Unlimited, full API access |

### Pay-Per-Use

For non-subscribers:
- Pay-per-action: $0.25/transaction
- Platform fees: 7.5-10% on sales

## Security

### Encryption

All secrets are encrypted using AES-256-CBC before storage. The encryption key is stored in environment variables.

### Authentication

- SIWE (Sign-In with Ethereum) for admin access
- Nonce-based signature verification
- Session cookies with httpOnly flag

### Rate Limiting

API rate limiting is enabled by default. Configure limits in environment variables.

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Testing Frames

Use the [Farcaster Developer Playground](https://warpcast.com/~/developers/frames) to test frames locally with ngrok.

## Deployment

### Netlify (Production)

**Recommended deployment platform**

1. Run automated deployment script:
   ```bash
   ./deploy.sh
   ```

2. Or deploy manually:
   ```bash
   netlify login
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard
4. Test deployment and frame endpoints

**Full guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Environment Variables for Production

Ensure all sensitive variables are set:
- `DATABASE_URL` - Production PostgreSQL
- `NEYNAR_API_KEY` - Farcaster API key
- `NEYNAR_SECRET_KEY` - Farcaster secret key
- `SECRET_ENCRYPTION_KEY` - 64-character hex string
- `NEXTAUTH_SECRET` - Strong random string (32+ chars)
- `ADMIN_WALLET_ADDRESS` - Platform owner wallet
- `BASE_RPC_URL` - Production Base RPC
- Contract addresses for all deployed contracts

See [.env.production.example](./.env.production.example) for complete list.

## Collector Wallet

**Address:** `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`

**Purpose:**
- Collect platform fees and payments
- Hold bounty escrow funds
- Receive creator pass sales revenue
- Manage Base ETH and USDC transactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Resources

- **Next.js**: https://nextjs.org/docs
- **Base Network**: https://base.org
- **Farcaster**: https://warpcast.com
- **Neynar**: https://neynar.com
- **Netlify**: https://docs.netlify.com
- **Prisma**: https://prisma.io/docs

## License

MIT License - see LICENSE file for details.

## Disclaimer

This platform sells tools, access, and coordination only. Not investment advice. Use at your own risk.

---

**Built with** ❤️ **for Base Network & Farcaster Community**
