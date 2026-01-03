// Contract Addresses and ABIs Configuration
// Base Mainnet contract addresses

// Collector wallet address for platform fees and payments
export const COLLECTOR_WALLET = process.env.NEXT_PUBLIC_COLLECTOR_WALLET || '0xcc9569bF1d87B7a18BD3363413b823AaF06084d3'

// Farcaster FID for auto-connection
export const FARCASTER_FID = process.env.NEXT_PUBLIC_FARCASTER_FID || '1378286'

// Environment-based contract addresses
export const CONTRACT_ADDRESSES = {
  // Base Mainnet
  base: {
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS || '',
    feeConfig: process.env.NEXT_PUBLIC_FEE_CONFIG_ADDRESS || '',
    actionProcessor: process.env.NEXT_PUBLIC_ACTION_PROCESSOR_ADDRESS || '',
    accessPassFactory: process.env.NEXT_PUBLIC_ACCESS_PASS_FACTORY_ADDRESS || '',
    bountyEscrow: process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS || '',
    usdcToken: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    collectorWallet: COLLECTOR_WALLET,
  },
  // Base Sepolia (testnet)
  baseSepolia: {
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS_SEPOLIA || '',
    feeConfig: process.env.NEXT_PUBLIC_FEE_CONFIG_ADDRESS_SEPOLIA || '',
    actionProcessor: process.env.NEXT_PUBLIC_ACTION_PROCESSOR_ADDRESS_SEPOLIA || '',
    accessPassFactory: process.env.NEXT_PUBLIC_ACCESS_PASS_FACTORY_ADDRESS_SEPOLIA || '',
    bountyEscrow: process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS_SEPOLIA || '',
    usdcToken: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS_SEPOLIA || '0x036CbD53842c5426634e7929541eC2318f3dF7d1',
  },
}

// Get current chain configuration
export function getChainConfig(chainId: number = 8453) {
  if (chainId === 84532) {
    return {
      chainId: 84532,
      name: 'Base Sepolia',
      ...CONTRACT_ADDRESSES.baseSepolia,
    }
  }
  
  return {
    chainId: 8453,
    name: 'Base',
    ...CONTRACT_ADDRESSES.base,
  }
}

// SubscriptionManager ABI (simplified - main functions only)
export const SUBSCRIPTION_MANAGER_ABI = [
  'function subscribe(uint8 tier) external payable',
  'function getUserTier(address user) external view returns (uint8)',
  'function hasAccess(address user, uint8 requiredTier) external view returns (bool)',
  'function getSubscriptionDetails(address user) external view returns (uint8 tier, uint256 expiryTimestamp, uint256 monthlyVolumeUsed, uint256 lastResetTimestamp)',
  'function getTierConfig(uint8 tier) external view returns (tuple(uint256 pricePerMonth, uint256 maxMonthlyVolume, uint256 maxActivePassCollections, uint256 maxBountyVolume, uint256 maxSingleBountySize, uint8 trackedProfiles, uint8 trackedWallets, bool active))',
  'function hasAvailableVolume(address user, uint256 requestedVolume) external view returns (bool)',
  'function getRemainingVolume(address user) external view returns (uint256)',
  'event Subscribed(address indexed user, uint8 tier, uint256 expiryTimestamp, uint256 amountPaid)',
] as const

// FeeConfig ABI
export const FEE_CONFIG_ABI = [
  'function getFeeSettings(uint8 feature) external view returns (tuple(uint256 flatFee, uint256 percentageFee, bool enabled))',
  'function calculateFee(uint8 feature, uint256 amount, bool isSubscriber) external view returns (uint256 totalFee)',
  'function updateFee(uint8 feature, uint256 flatFee, uint256 percentageFee, bool enabled) external',
  'function setGlobalFeePause(bool pause) external',
  'event FeeUpdated(uint8 feature, tuple(uint256 flatFee, uint256 percentageFee, bool enabled) settings)',
] as const

// ActionProcessor ABI
export const ACTION_PROCESSOR_ABI = [
  'function tip(address recipient, uint256 amount, bytes32 contextId) external',
  'function unlockContent(address creator, bytes32 contentId, uint256 price) external',
  'function mintNFT(address creator, uint256 tokenId, uint256 price) external',
  'function hasUnlocked(bytes32 contentId, address user) external view returns (bool)',
  'event TipPaid(address indexed payer, address indexed recipient, uint256 amount, bytes32 indexed contextId)',
  'event ContentUnlocked(address indexed payer, address indexed creator, bytes32 indexed contentId, uint256 amount)',
  'event NFTMinted(address indexed minter, address indexed creator, uint256 indexed tokenId, uint256 amount)',
] as const

// AccessPassFactory ABI
export const ACCESS_PASS_FACTORY_ABI = [
  'function createCollection(string name, string symbol, uint256 maxSupply, uint256 primaryPrice, uint256 royaltyBps, bool isSoulbound) external returns (address)',
  'function mintPass(address collectionAddress, uint256 quantity) external payable returns (uint256)',
  'function getCreatorCollections(address creator) external view returns (address[])',
  'function getCollectionCount() external view returns (uint256)',
  'function collections(address) external view returns (address collectionAddress, address creator, string name, string symbol, uint256 maxSupply, uint256 primaryPrice, uint256 royaltyBps, bool isSoulbound, uint256 createdAt)',
  'event CollectionCreated(address indexed collectionAddress, address indexed creator, string name, string symbol, uint256 maxSupply, uint256 primaryPrice, uint256 royaltyBps, bool isSoulbound)',
  'event PassMinted(address indexed collectionAddress, address indexed minter, uint256 indexed tokenId, uint256 price)',
] as const

// BountyEscrow ABI
export const BOUNTY_ESCROW_ABI = [
  'function postBounty(uint256 amount, address token, string metadataURI, uint256 deadline) external payable returns (uint256)',
  'function submitWork(uint256 bountyId, string submissionURI) external',
  'function settleBounty(uint256 bountyId, address winner) external',
  'function cancelBounty(uint256 bountyId) external',
  'function getSubmissions(uint256 bountyId) external view returns (tuple(uint256 bountyId, address hunter, string submissionURI, uint256 submittedAt, bool selected)[])',
  'function getBounty(uint256 bountyId) external view returns (tuple(uint256 id, address poster, uint256 amount, address token, string metadataURI, uint8 status, uint256 createdAt, uint256 deadline))',
  'function bountyCount() external view returns (uint256)',
  'event BountyPosted(uint256 indexed bountyId, address indexed poster, uint256 amount, address token, string metadataURI, uint256 deadline)',
  'event SubmissionAdded(uint256 indexed bountyId, address indexed hunter, string submissionURI)',
  'event BountySettled(uint256 indexed bountyId, address indexed poster, address indexed winner, uint256 amount)',
  'event BountyCanceled(uint256 indexed bountyId, address indexed poster, uint256 refundAmount)',
] as const

// Common ERC20 ABI for USDC interactions
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
] as const

// Get contract address by name
export function getContractAddress(contractName: string, chainId: number = 8453): string {
  const config = getChainConfig(chainId)
  
  switch (contractName.toLowerCase()) {
    case 'subscriptionmanager':
    case 'subscription':
      return config.subscriptionManager
    case 'feeconfig':
    case 'fee':
      return config.feeConfig
    case 'actionprocessor':
    case 'action':
      return config.actionProcessor
    case 'accesspassfactory':
    case 'passfactory':
      return config.accessPassFactory
    case 'bountyescrow':
    case 'bounty':
      return config.bountyEscrow
    case 'usdc':
    case 'usdctoken':
      return config.usdcToken
    default:
      throw new Error(`Unknown contract: ${contractName}`)
  }
}

// Validate contract addresses are configured
export function validateContractConfiguration(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  const config = getChainConfig()
  
  if (!config.subscriptionManager) missing.push('SubscriptionManager')
  if (!config.feeConfig) missing.push('FeeConfig')
  if (!config.actionProcessor) missing.push('ActionProcessor')
  if (!config.accessPassFactory) missing.push('AccessPassFactory')
  if (!config.bountyEscrow) missing.push('BountyEscrow')
  
  return {
    valid: missing.length === 0,
    missing,
  }
}
