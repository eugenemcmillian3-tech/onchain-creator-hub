import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin wallets...')

  const walletA = await prisma.adminWallet.upsert({
    where: { walletAddress: '0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752' },
    update: {},
    create: {
      walletAddress: '0xEA8bA41Ca7055F896dD4E008B1596ab2b064E752',
      name: 'Wallet A - Base App',
      fid: 1644948n,
      canAccessFree: true,
    },
  })

  const walletB = await prisma.adminWallet.upsert({
    where: { walletAddress: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3' },
    update: {},
    create: {
      walletAddress: '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3',
      name: 'Wallet B - Farcaster',
      fid: 1378286n,
      canAccessFree: true,
    },
  })

  console.log('✅ Admin wallets seeded:', { walletA, walletB })

  console.log('🌱 Seeding feature flags...')

  await prisma.featureFlag.upsert({
    where: { key: 'ai_lore_generation' },
    update: {},
    create: {
      key: 'ai_lore_generation',
      enabled: true,
      description: 'Enable AI-powered lore generation',
      metadata: { price: 1.50 },
    },
  })

  await prisma.featureFlag.upsert({
    where: { key: 'ai_promo_pack' },
    update: {},
    create: {
      key: 'ai_promo_pack',
      enabled: true,
      description: 'Enable AI-powered promo pack generation',
      metadata: { price: 2.50 },
    },
  })

  console.log('✅ Feature flags seeded')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
