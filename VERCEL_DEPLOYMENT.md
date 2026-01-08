# Vercel Production Deployment Guide

## Dual Manifests & AI Features Configuration

This guide covers the deployment of the Onchain Creator Hub with:
- ✅ Dual manifests (Farcaster FID 1378286 & Base App FID 1644948)
- ✅ Auto-wallet connection based on source detection
- ✅ AI features with payment routing ($1.50 lore, $2.50 promo)
- ✅ Multi-chain payment collection to separate wallets
- ✅ Direct wallet-to-wallet transfers (no smart contracts)

---

## Payment Architecture

### Wallet A (Base App - FID: 1644948)
**Address:** `0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752`
- **Collects:** All Base app payments
- **Chains:** Ethereum, Polygon, Base, Avalanche, Fantom, Arbitrum, Optimism
- **Token:** USDC (EVM-compatible)
- **Admin Status:** Yes (free access, network fees only)
- **Auto-Connect:** Triggered from Base app access

### Wallet B (Farcaster - FID: 1378286)
**EVM Address:** `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
**Solana Address:** `BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7`
- **Collects:** All Farcaster/Warpcast payments
- **Chains:** 
  - EVM: Base, Ethereum, Arbitrum
  - Non-EVM: Solana, BSC, Monad, HyperEVM, Celo
- **Tokens:** USDC (EVM), USDC-SPL (Solana)
- **Admin Status:** Yes (free access, network fees only)
- **Auto-Connect:** Triggered from Farcaster/Warpcast access

---

## Vercel Environment Variables

### Required Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Database (PostgreSQL/Supabase)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Security
SECRET_ENCRYPTION_KEY=[generate with: openssl rand -hex 32]

# Admin Wallet
ADMIN_WALLET_ADDRESS=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3

# Dual Wallet Configuration
NEXT_PUBLIC_BASE_APP_WALLET=0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752
NEXT_PUBLIC_BASE_APP_FID=1644948
NEXT_PUBLIC_FARCASTER_WALLET_EVM=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
NEXT_PUBLIC_FARCASTER_WALLET_SOLANA=BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7
NEXT_PUBLIC_FARCASTER_FID=1378286

# Blockchain
BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CHAIN_NAME=Base
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Farcaster/Neynar
NEYNAR_API_KEY=[your-key]
NEYNAR_SECRET_KEY=[your-secret]

# AI Features
OPENROUTER_API_KEY=[your-key]
NEXT_PUBLIC_AI_LORE_PRICE=1.50
NEXT_PUBLIC_AI_PROMO_PRICE=2.50

# Feature Flags
ENABLE_MAINTENANCE_MODE=false
ENABLE_NEW_BOUNTIES=true
ENABLE_PASS_MINTING=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Deployment Steps

### 1. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push schema to database (first time)
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy
```

### 2. Vercel Configuration

1. **Import GitHub/GitLab repo** to Vercel
2. **Set Framework Preset:** Next.js
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`
5. **Install Command:** `npm install`
6. **Node Version:** 20.x

### 3. Environment Variables Setup

In Vercel Dashboard → Project Settings → Environment Variables:
- Add all variables from the list above
- Mark sensitive keys as "Encrypted"
- Apply to: Production, Preview, Development

### 4. Deploy

```bash
# Via Vercel CLI
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

---

## Testing Deployment

### Manifest Validation

1. **Farcaster Manifest:**
   - URL: `https://your-domain.vercel.app/.well-known/farcaster.json`
   - Validate FID: 1378286
   - Check account association

2. **Base Manifest:**
   - URL: `https://your-domain.vercel.app/.well-known/base.json`
   - Validate FID: 1644948
   - Check developer: urbanwarrior79

### Auto-Connect Testing

1. **From Farcaster/Warpcast:**
   - Access via `?source=farcaster`
   - Verify badge shows "Connected via Farcaster"
   - Confirm Wallet B is used

2. **From Base App:**
   - Access via `?source=base-app`
   - Verify badge shows "Connected via Base App"
   - Confirm Wallet A is used

### AI Endpoint Testing

```bash
# Test Lore Generation
curl -X POST https://your-domain.vercel.app/api/ai/lore \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A mystical realm","platform":"farcaster"}'

# Test Promo Generation
curl -X POST https://your-domain.vercel.app/api/ai/promo \
  -H "Content-Type: application/json" \
  -d '{"productName":"Creator Hub","platform":"base-app"}'
```

Expected responses include:
- `cost`: 1.50 or 2.50
- `paymentWallet`: appropriate wallet address
- `supportedChains`: array of chains
- `platform`: "farcaster" or "base-app"

---

## Features

### Auto Wallet Detection

The app automatically detects the source:
- **Farcaster/Warpcast** (FID 1378286) → Wallet B
- **Base App** (FID 1644948) → Wallet A
- **Direct Web Access** → Manual connect

Detection methods:
1. URL parameter: `?source=farcaster` or `?source=base-app`
2. Referrer header: `warpcast.com`, `farcaster`, `base.org`
3. User agent: `warpcast`, `farcaster`
4. FID header: `x-farcaster-fid`

### Payment Routing

| Feature | Price | Farcaster → | Base App → |
|---------|-------|-------------|------------|
| Lore Generation | $1.50 | Wallet B | Wallet A |
| Promo Pack | $2.50 | Wallet B | Wallet A |

**Admin Wallets (A & B):**
- ✅ Free access to all features
- ✅ Only pay network fees
- ✅ Transactions logged as admin access

### Multi-Chain Support

**Wallet A (Base App):**
- Ethereum, Polygon, Base, Avalanche, Fantom, Arbitrum, Optimism
- Payment token: USDC

**Wallet B (Farcaster):**
- EVM: Base, Ethereum, Arbitrum (USDC)
- Solana: USDC-SPL
- BSC, Monad, HyperEVM, Celo (native tokens)

---

## Database Schema

New tables added:

### TransactionLog
Tracks all payment transactions:
- User ID, amount, currency
- From/to wallets
- Chain, tx hash
- Platform (farcaster/base-app)
- Feature used (lore/promo)
- Status (pending/success/failed)

### AdminWallet
Manages admin wallet access:
- Wallet address
- Name (Wallet A/B)
- FID
- Free access flag

### FeatureAccess
Tracks feature usage:
- Wallet address
- Platform
- Last accessed
- Total usage cost

---

## API Endpoints

### AI Lore Generation
**POST** `/api/ai/lore`

```json
{
  "prompt": "A mystical realm",
  "chain": "base",
  "platform": "farcaster",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "lore": "Generated lore content...",
  "cost": 1.50,
  "paymentWallet": "0xcc9569bF1d87B7a18BD3363413b823AaF06084d3",
  "supportedChains": ["base", "ethereum", "arbitrum", "solana"],
  "platform": "farcaster",
  "isAdmin": false
}
```

### AI Promo Generation
**POST** `/api/ai/promo`

```json
{
  "productName": "Creator Hub",
  "description": "Optional description",
  "chain": "base",
  "platform": "base-app",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "promo": {
    "title": "Introducing Creator Hub",
    "description": "...",
    "hashtags": ["#Web3", "#Creator", "#OnChain"],
    "callToAction": "Join today!"
  },
  "cost": 2.50,
  "paymentWallet": "0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752",
  "supportedChains": ["ethereum", "polygon", "base", "avalanche"],
  "platform": "base-app",
  "isAdmin": false
}
```

---

## Troubleshooting

### Manifest Not Loading
- Check CORS headers
- Verify JSON syntax
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Auto-Connect Not Working
- Verify source detection logic
- Check URL parameters or referrer
- Ensure wallet detector is imported

### Payment Routing Issues
- Confirm wallet addresses are correct
- Verify chain is supported for platform
- Check transaction logs in database

### AI Generation Failing
- Verify `OPENROUTER_API_KEY` is set
- Check API quota/limits
- Review error logs

---

## Post-Deployment Checklist

- [ ] Database migrations deployed
- [ ] All env vars set in Vercel
- [ ] Manifests accessible and valid
- [ ] Auto-connect works from Farcaster
- [ ] Auto-connect works from Base app
- [ ] Lore generation tested ($1.50)
- [ ] Promo generation tested ($2.50)
- [ ] Admin wallets have free access
- [ ] Transaction logging working
- [ ] Multi-chain payments functional
- [ ] Solana support verified
- [ ] Error handling tested

---

## Support & Monitoring

### Health Checks
- `/api/health` - System health
- Database connectivity
- RPC endpoints
- AI service status

### Analytics
- Track transaction success/failure rates
- Monitor AI generation usage
- Measure platform distribution (Farcaster vs Base)
- Monitor wallet payment distribution

---

## Security Notes

1. **Admin Wallets:** Hardcoded for security, not user-configurable
2. **Encryption Key:** Use strong 32-byte hex key
3. **Database:** Enable SSL/TLS connections
4. **Rate Limiting:** Enabled by default (100 req/15min)
5. **Payment Verification:** Always verify on-chain before confirming

---

## Contact

For deployment support or issues:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: [Main README](./README.md)

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0
