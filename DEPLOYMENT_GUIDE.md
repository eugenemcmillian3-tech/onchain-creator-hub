# Onchain Creator & Bounty Hub - Netlify Deployment Guide

## 🚀 Deployment Status
✅ **Build Successful** - Ready for Production Deployment

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Dependencies installed (`npm install`)
- [x] Prisma client generated
- [x] Production build completed (`npm run build`)
- [x] Build artifacts created in `.next` directory
- [x] Netlify configuration file created (`netlify.toml`)
- [x] Environment variables template prepared

### 📝 Required Actions Before Deployment

1. **Database Setup**
   - Set up a PostgreSQL database (PlanetScale, Neon, Supabase, or similar)
   - Run Prisma migrations: `npx prisma migrate deploy`
   - Update `DATABASE_URL` in Netlify environment variables

2. **API Keys & Secrets**
   - Obtain Neynar API keys from https://neynar.com
   - Generate encryption key: `openssl rand -hex 32`
   - Set all required environment variables in Netlify dashboard

3. **Smart Contracts (Optional)**
   - Deploy smart contracts to Base mainnet if not already deployed
   - Update contract addresses in environment variables

## 🔧 Netlify Configuration

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: `20.19.6`
- **Functions Directory**: Not required (Next.js handles functions)

### Required Netlify Plugins
The following plugin will be auto-installed via `netlify.toml`:
- `@netlify/plugin-nextjs` - Essential for Next.js 14 support

Install manually if needed:
```bash
npm install -D @netlify/plugin-nextjs
```

## 🌐 Environment Variables

Set these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

### Critical Configuration

#### Application Settings
```
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
```

#### Database (Required)
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

#### Admin & Collector Wallet
```
ADMIN_WALLET_ADDRESS=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
NEXT_PUBLIC_COLLECTOR_WALLET=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
```

#### Security
```
SECRET_ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-hex-32>
```

#### Farcaster Integration (Required)
```
NEYNAR_API_KEY=<your-neynar-api-key>
NEYNAR_SECRET_KEY=<your-neynar-secret-key>
NEXT_PUBLIC_FARCASTER_FID=1378286
NEXT_PUBLIC_NEYNAR_CLIENT_ID=<your-neynar-client-id>
```

#### Base Network Configuration (Pre-configured)
```
BASE_RPC_URL=https://mainnet.base.org
BASE_RPC_URL_FALLBACK=https://base-mainnet.public.blastapi.io
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CHAIN_NAME=Base
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

#### Smart Contract Addresses (Update after deployment)
```
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_FEE_CONFIG_ADDRESS=0x...
NEXT_PUBLIC_ACTION_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_ACCESS_PASS_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS=0x...
```

#### Feature Flags
```
ENABLE_MAINTENANCE_MODE=false
ENABLE_NEW_BOUNTIES=true
ENABLE_PASS_MINTING=true
```

#### Analytics (Optional)
```
POSTHOG_API_KEY=<your-posthog-api-key>
OPENROUTER_API_KEY=<your-openrouter-api-key>
```

#### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📦 Deployment Methods

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Git Integration

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect Repository in Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select the repository
   - Configure build settings (or use netlify.toml)
   - Deploy!

### Method 3: Manual Deploy (Drag & Drop)

1. **Create a ZIP of .next folder**
   ```bash
   cd .next && zip -r ../deploy.zip . && cd ..
   ```

2. **Upload to Netlify**
   - Go to https://app.netlify.com/drop
   - Drag & drop the .next folder or deploy.zip

## 🔍 Post-Deployment Verification

### 1. Check Deployment Status
Visit your Netlify dashboard to ensure deployment succeeded.

### 2. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] Wallet connection works (MetaMask, Coinbase Wallet)
- [ ] Farcaster frames respond correctly
- [ ] Admin panel accessible with correct wallet
- [ ] Database connections work

### 3. Test Farcaster Integration
- [ ] Frame endpoints respond:
  - `/api/frame/home`
  - `/api/frame/actions`
  - `/api/frame/passes`
  - `/api/frame/bounties`
  - `/api/frame/analytics`
- [ ] FID 1378286 auto-connection works
- [ ] Frame metadata is correct

### 4. Test Payment Collection
- [ ] Collector wallet receives payments
- [ ] Base ETH transactions work
- [ ] USDC transactions work
- [ ] Fee calculations are correct

### 5. Monitor Logs
Check Netlify Function logs for any errors:
```bash
netlify logs:function
```

## 🛠️ Troubleshooting

### Build Fails
- Check Node version matches (20.19.6)
- Ensure all dependencies are installed
- Review build logs in Netlify dashboard

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure database allows connections from Netlify IPs
- Check SSL requirements (`?sslmode=require`)

### API Errors
- Verify all environment variables are set
- Check Neynar API key is valid
- Review function logs in Netlify dashboard

### Farcaster Frame Issues
- Verify frame endpoints return correct JSON
- Check NEXT_PUBLIC_APP_URL is set to production URL
- Test frames in Farcaster Frame Validator

## 📊 Performance Optimization

### Enable Netlify Edge Functions (Optional)
For better performance, consider using Netlify Edge Functions for API routes:
```toml
[[edge_functions]]
  path = "/api/*"
  function = "api-handler"
```

### CDN Configuration
Netlify automatically handles CDN distribution. Ensure static assets are optimized:
- Images should use WebP format
- Enable image optimization in next.config.js

### Database Connection Pooling
Use a connection pooler (PgBouncer) for production:
```
DATABASE_URL=postgresql://user:password@pooler-host:port/database
```

## 🔐 Security Checklist

- [ ] All environment variables are set as "Secret"
- [ ] Admin wallet address is correct
- [ ] SECRET_ENCRYPTION_KEY is secure and unique
- [ ] Database credentials are not exposed
- [ ] API keys have appropriate permissions
- [ ] Rate limiting is configured

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Netlify Docs**: https://docs.netlify.com
- **Base Network**: https://base.org
- **Neynar**: https://neynar.com
- **Farcaster**: https://warpcast.com

## 🎯 Key Farcaster Configuration

### FID 1378286 Integration
This FID is configured for auto-connecting Farcaster users to the platform:
- User authentication via Farcaster
- Frame interactions
- Social features

### Collector Wallet
**Address**: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
- Receives Base ETH payments
- Collects USDC on Base network
- Platform fee collection
- Bounty escrow management

## ✅ Deployment Complete!

Once deployed, your Onchain Creator & Bounty Hub will be live at:
**https://your-site-name.netlify.app**

Make sure to:
1. Test all features thoroughly
2. Monitor analytics and error logs
3. Set up custom domain (optional)
4. Enable automatic deploys from Git
5. Configure branch deploys for staging

---

**Built with** ❤️ **for Base Network & Farcaster Community**
