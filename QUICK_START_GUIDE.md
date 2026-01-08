# 🚀 Quick Start Guide
## Onchain Creator Hub - Production Deployment

**Version:** 1.0.0  
**Status:** ✅ Production Ready - Grade A

---

## ⚡ 5-Minute Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (Supabase/Neon/PlanetScale)
- OpenRouter API key (optional, for AI features)
- Neynar API keys (for Farcaster)

---

## 📋 Deployment Checklist

### Step 1: Database (2 minutes)

```bash
# Clone and install
git clone <your-repo>
cd onchain-creator-hub
npm install

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://..."

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Step 2: Vercel Deploy (2 minutes)

1. **Import to Vercel**
   - Connect GitHub repo
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

2. **Add Environment Variables**
   ```
   # Required
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   DATABASE_URL=postgresql://...
   SECRET_ENCRYPTION_KEY=[generate with: openssl rand -hex 32]
   ADMIN_WALLET_ADDRESS=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
   
   # Dual Wallets
   NEXT_PUBLIC_BASE_APP_WALLET=0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752
   NEXT_PUBLIC_BASE_APP_FID=1644948
   NEXT_PUBLIC_FARCASTER_WALLET_EVM=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
   NEXT_PUBLIC_FARCASTER_WALLET_SOLANA=BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7
   NEXT_PUBLIC_FARCASTER_FID=1378286
   
   # AI Features (optional)
   OPENROUTER_API_KEY=sk-or-...
   NEXT_PUBLIC_AI_LORE_PRICE=1.50
   NEXT_PUBLIC_AI_PROMO_PRICE=2.50
   
   # Farcaster
   NEYNAR_API_KEY=...
   NEYNAR_SECRET_KEY=...
   
   # Blockchain
   BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_CHAIN_ID=8453
   NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_USDC_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes

### Step 3: Verify (1 minute)

1. **Test Manifests**
   - `https://your-app.vercel.app/.well-known/farcaster.json`
   - `https://your-app.vercel.app/.well-known/base.json`

2. **Test Health**
   - `https://your-app.vercel.app/api/health`

3. **Visit App**
   - `https://your-app.vercel.app`

---

## 🎯 Key URLs

| Feature | URL | Description |
|---------|-----|-------------|
| **Home** | `/` | Landing page |
| **Dashboard** | `/dashboard` | User dashboard |
| **Bounties** | `/bounties` | Browse bounties |
| **Passes** | `/passes` | Creator passes |
| **Analytics** | `/analytics` | Analytics dashboard |
| **Pricing** | `/pricing` | Pricing plans |
| **AI Lore** | `/ai/lore` | Lore generator |
| **AI Promo** | `/ai/promo` | Promo generator |
| **Admin** | `/admin` | Admin panel |
| **Health** | `/api/health` | Health check |

---

## 💰 Payment Wallets

### Wallet A (Base App)
- **Address:** `0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752`
- **FID:** 1644948
- **Chains:** Ethereum, Polygon, Base, Avalanche, Fantom, Arbitrum, Optimism
- **Status:** Admin (Free)

### Wallet B (Farcaster)
- **EVM:** `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`
- **Solana:** `BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7`
- **FID:** 1378286
- **Chains:** Base, Ethereum, Arbitrum, Solana, BSC, Monad, HyperEVM, Celo
- **Status:** Admin (Free)

---

## 🔑 Admin Access

Access admin panel at `/admin` after connecting one of the admin wallets:
- Wallet A: `0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752`
- Wallet B: `0xcc9569bF1d87B7a18BD3363413b823AaF06084d3`

---

## 🧪 Testing

### Quick Tests

```bash
# Test lore generation
curl -X POST https://your-app.vercel.app/api/ai/lore \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A mystical realm"}'

# Test promo generation
curl -X POST https://your-app.vercel.app/api/ai/promo \
  -H "Content-Type: application/json" \
  -d '{"productName":"Creator Hub"}'

# Test health
curl https://your-app.vercel.app/api/health
```

### Manual Tests

1. ✅ Connect wallet
2. ✅ Browse bounties
3. ✅ View passes
4. ✅ Generate lore
5. ✅ Generate promo
6. ✅ Check analytics
7. ✅ Test admin panel (if admin wallet)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Project overview |
| `VERCEL_DEPLOYMENT.md` | Detailed deployment guide |
| `AI_FEATURES.md` | AI features documentation |
| `PRODUCTION_READINESS_REPORT.md` | Full audit report |
| `GRADE_A_CERTIFICATION.md` | Production certification |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database
npx prisma db seed         # Seed admin wallets
npx prisma studio          # Open database GUI

# Contracts (optional)
npm run contract:build     # Build smart contracts
npm run contract:deploy    # Deploy contracts
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### Environment Variables Not Loading
- Make sure they're in Vercel dashboard
- Redeploy after adding new variables
- Check for typos in variable names

---

## 📊 Monitoring

### Health Check
`GET /api/health`

Response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy", "latency": 45 },
    "api": { "status": "healthy", "latency": 12 }
  },
  "uptime": 3600,
  "memory": {...}
}
```

### Admin Panel
- Health: `/admin/health`
- Security: `/admin/security`
- Logs: Check database `AuditLog` table

---

## 🔐 Security Checklist

- [x] Admin wallets hardcoded
- [x] Secrets encrypted (AES-256)
- [x] Rate limiting enabled
- [x] SIWE authentication
- [x] Input validation
- [x] Error handling
- [x] SQL injection protection
- [x] HTTPS only (Vercel)

---

## 📈 Performance Tips

1. **Enable Caching**
   - React Query already configured
   - Add Redis for heavy endpoints (optional)

2. **Monitor Performance**
   - Use Vercel Analytics
   - Check `/api/health` regularly

3. **Optimize Images**
   - Use Next.js Image component
   - Compress images before upload

---

## 🎯 Quick Reference

### API Endpoints
- `POST /api/ai/lore` - Generate lore
- `POST /api/ai/promo` - Generate promo
- `POST /api/frame/*` - Frame endpoints
- `GET/POST /api/admin/*` - Admin endpoints
- `POST /api/auth/siwe` - Authentication
- `GET /api/health` - Health check

### Pricing
- Lore: $1.50 per generation
- Promo: $2.50 per generation
- Admin wallets: FREE (network fees only)

### Support Chains
- **Wallet A:** 7 EVM chains
- **Wallet B:** 9 chains (8 EVM + Solana)

---

## 🚀 Post-Deployment

### Day 1
- [x] Verify manifests load
- [x] Test auto-connect from Farcaster
- [x] Test auto-connect from Base app
- [x] Test AI endpoints
- [x] Check health endpoint

### Week 1
- [ ] Monitor transaction logs
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Optimize slow queries
- [ ] Update documentation if needed

### Month 1
- [ ] Analyze usage patterns
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Plan new features
- [ ] Collect user feedback

---

## 🆘 Support

### Resources
- Documentation: All `*.md` files in root
- Health Check: `/api/health`
- Admin Panel: `/admin`

### Issues
- Check logs in Vercel dashboard
- Review database logs
- Check admin security audit

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Health endpoint returns 200
- ✅ Manifests load correctly
- ✅ You can connect a wallet
- ✅ AI endpoints respond
- ✅ Admin panel is accessible (with admin wallet)

---

## 🎉 You're Live!

**Congratulations!** Your Onchain Creator Hub is now live in production.

### Next Steps
1. Share your app URL
2. Post on Farcaster
3. Share on Base ecosystem
4. Monitor usage
5. Iterate based on feedback

---

**Need help?** Check the comprehensive docs in the repository root.

**Ready to build?** All features are live and working! 🚀
