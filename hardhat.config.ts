import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    baseMainnet: {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    baseMainnet: {
      apiKey: process.env.BASESCAN_API_KEY || '',
      apiUrl: 'https://api.basescan.org/api',
    },
    baseSepolia: {
      apiKey: process.env.BASESCAN_API_KEY || '',
      apiUrl: 'https://api-sepolia.basescan.org/api',
    },
  },
  sourcify: {
    enabled: true,
  },
}

export default config
