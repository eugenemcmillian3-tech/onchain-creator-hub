# AI Features Guide

## Overview

The Onchain Creator Hub now includes AI-powered content generation features with automatic payment routing to designated wallets based on the access platform.

---

## Features

### 1. AI Lore Generation
**Price:** $1.50 per generation
**Endpoint:** `/api/ai/lore`

Generate compelling lore and backstories for your projects, characters, or worlds.

#### Usage

```bash
POST /api/ai/lore
Content-Type: application/json

{
  "prompt": "A mystical realm where creators rule",
  "chain": "base",
  "platform": "farcaster",
  "walletAddress": "0x..."
}
```

#### Response

```json
{
  "lore": "In the ethereal expanse of the Onchain Realm...",
  "cost": 1.50,
  "paymentWallet": "0xcc9569bF1d87B7a18BD3363413b823AaF06084d3",
  "supportedChains": ["base", "ethereum", "arbitrum", "solana"],
  "platform": "farcaster",
  "isAdmin": false
}
```

---

### 2. AI Promo Pack Generation
**Price:** $2.50 per generation
**Endpoint:** `/api/ai/promo`

Create professional promotional content including title, description, hashtags, and call-to-action.

#### Usage

```bash
POST /api/ai/promo
Content-Type: application/json

{
  "productName": "Creator NFT Collection",
  "description": "Limited edition passes for exclusive content",
  "chain": "base",
  "platform": "base-app",
  "walletAddress": "0x..."
}
```

#### Response

```json
{
  "promo": {
    "title": "Introducing Creator NFT Collection",
    "description": "Unlock exclusive content with limited edition passes...",
    "hashtags": ["#Web3", "#NFT", "#Creator", "#Base", "#Exclusive"],
    "callToAction": "Mint your pass today and join the community!"
  },
  "cost": 2.50,
  "paymentWallet": "0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752",
  "supportedChains": ["ethereum", "polygon", "base", "avalanche", "fantom", "arbitrum", "optimism"],
  "platform": "base-app",
  "isAdmin": false
}
```

---

## Payment Routing

### Farcaster/Warpcast Users
**Payment Wallet:** Wallet B (0xcc9569bF1d87B7a18BD3363413b823AaF06084d3)
**Supported Chains:**
- EVM: Base, Ethereum, Arbitrum (USDC)
- Solana: USDC-SPL
- Other: BSC, Monad, HyperEVM, Celo

### Base App Users
**Payment Wallet:** Wallet A (0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752)
**Supported Chains:**
- Ethereum, Polygon, Base, Avalanche, Fantom, Arbitrum, Optimism (USDC)

### Admin Wallets
Both Wallet A and Wallet B are admin wallets:
- ✅ **Free Access:** No payment required
- ✅ **Network Fees Only:** Only pay gas fees
- ✅ **Logged:** All usage is tracked as admin access

---

## Platform Detection

The system automatically detects the source platform:

### Detection Methods
1. **URL Parameter:** `?source=farcaster` or `?source=base-app`
2. **Referrer Header:** Checks for `warpcast.com`, `farcaster`, `base.org`
3. **User Agent:** Detects Warpcast or Farcaster clients
4. **FID Header:** `x-farcaster-fid` or `fid`

### Example URLs
- From Farcaster: `https://yoursite.com?source=farcaster`
- From Base App: `https://yoursite.com?source=base-app`
- Direct Access: `https://yoursite.com` (defaults to Base App routing)

---

## Integration Examples

### React Component

```tsx
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export function LoreGenerator() {
  const { address } = useAccount()
  const [prompt, setPrompt] = useState('')
  const [lore, setLore] = useState('')
  const [loading, setLoading] = useState(false)

  const generateLore = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          walletAddress: address,
          chain: 'base',
        }),
      })

      const data = await response.json()
      
      if (data.paymentRequired) {
        // Handle payment flow
        console.log('Payment required:', data.amount, 'to', data.paymentWallet)
        // Initiate wallet transaction...
      } else {
        setLore(data.lore)
      }
    } catch (error) {
      console.error('Failed to generate lore:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your world..."
      />
      <button onClick={generateLore} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Lore ($1.50)'}
      </button>
      {lore && <p>{lore}</p>}
    </div>
  )
}
```

### Promo Pack Component

```tsx
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export function PromoGenerator() {
  const { address } = useAccount()
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [promo, setPromo] = useState(null)
  const [loading, setLoading] = useState(false)

  const generatePromo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          description,
          walletAddress: address,
          chain: 'base',
        }),
      })

      const data = await response.json()
      
      if (data.paymentRequired) {
        // Handle payment flow
        console.log('Payment required:', data.amount, 'to', data.paymentWallet)
      } else {
        setPromo(data.promo)
      }
    } catch (error) {
      console.error('Failed to generate promo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Product name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Product description (optional)"
      />
      <button onClick={generatePromo} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Promo ($2.50)'}
      </button>
      {promo && (
        <div>
          <h3>{promo.title}</h3>
          <p>{promo.description}</p>
          <div>
            {promo.hashtags.map(tag => (
              <span key={tag}>{tag} </span>
            ))}
          </div>
          <p><strong>{promo.callToAction}</strong></p>
        </div>
      )}
    </div>
  )
}
```

---

## Error Handling

### Payment Required (402)
```json
{
  "error": "Payment initiation failed",
  "message": "No wallet connected",
  "paymentRequired": true,
  "amount": 1.50,
  "paymentWallet": "0x...",
  "supportedChains": ["base", "ethereum", ...]
}
```

### Invalid Input (400)
```json
{
  "error": "Valid prompt is required"
}
```

### Service Unavailable (503)
```json
{
  "error": "AI service is not configured"
}
```

### Internal Error (500)
```json
{
  "error": "Failed to generate lore",
  "details": "Error message"
}
```

---

## Database Tracking

All AI feature usage is tracked in three tables:

### TransactionLog
Records payment transactions:
- User ID, amount, currency
- From/to wallet addresses
- Blockchain network
- Transaction hash
- Platform source
- Feature used
- Status

### FeatureAccess
Tracks overall feature usage:
- Wallet address
- Platform (farcaster/base-app)
- Last accessed timestamp
- Total usage cost

### AdminWallet
Manages admin access:
- Wallet address
- Name (Wallet A/B)
- FID
- Free access flag

---

## Configuration

### Environment Variables

```bash
# AI Service
OPENROUTER_API_KEY=sk-or-...

# Pricing
NEXT_PUBLIC_AI_LORE_PRICE=1.50
NEXT_PUBLIC_AI_PROMO_PRICE=2.50

# Wallets
NEXT_PUBLIC_BASE_APP_WALLET=0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752
NEXT_PUBLIC_FARCASTER_WALLET_EVM=0xcc9569bF1d87B7a18BD3363413b823AaF06084d3
NEXT_PUBLIC_FARCASTER_WALLET_SOLANA=BWYezHCzL6SUbqumfqtZAfcZ7krxJ8xSqLDhSQMUx4C7

# FIDs
NEXT_PUBLIC_BASE_APP_FID=1644948
NEXT_PUBLIC_FARCASTER_FID=1378286
```

---

## Testing

### Local Development

```bash
# Set up environment
cp .env.example .env.local

# Add OpenRouter API key
OPENROUTER_API_KEY=sk-or-...

# Run dev server
npm run dev

# Test lore endpoint
curl -X POST http://localhost:3000/api/ai/lore \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A mystical realm"}'

# Test promo endpoint
curl -X POST http://localhost:3000/api/ai/promo \
  -H "Content-Type: application/json" \
  -d '{"productName":"Creator Hub"}'
```

### Production Testing

Replace `localhost:3000` with your production URL:
- `https://your-domain.vercel.app`

---

## Rate Limits

- **Default:** 100 requests per 15 minutes per IP
- **Admin Wallets:** Unlimited (but still logged)
- **Configurable:** Via `RATE_LIMIT_*` env vars

---

## Security

1. **Payment Verification:** All payments verified on-chain
2. **Admin Detection:** Based on wallet address comparison
3. **Platform Detection:** Multi-layered source detection
4. **Transaction Logging:** Complete audit trail
5. **Rate Limiting:** Prevents abuse

---

## Best Practices

1. **Always connect wallet** before using AI features
2. **Verify chain support** for your platform
3. **Handle payment flows** gracefully in UI
4. **Show clear pricing** to users
5. **Implement loading states** for better UX
6. **Cache results** when appropriate
7. **Monitor usage** via transaction logs

---

## Future Enhancements

- [ ] Batch generation with discounts
- [ ] Subscription plans for unlimited access
- [ ] Additional AI models (GPT-4, etc.)
- [ ] Custom fine-tuned models
- [ ] NFT minting of generated content
- [ ] Collaborative editing features

---

## Support

For issues or questions:
- GitHub Issues: [Repository](https://github.com/your-repo)
- Documentation: [Main README](./README.md)
- Deployment: [Vercel Guide](./VERCEL_DEPLOYMENT.md)

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0
