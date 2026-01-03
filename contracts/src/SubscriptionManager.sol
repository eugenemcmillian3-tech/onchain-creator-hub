// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title SubscriptionManager - Handles paid tiers and subscription management
/// @notice Manages Starter/Pro/Power tiers with configurable prices and limits
contract SubscriptionManager is Ownable2Step, Pausable {

    /// @notice Tier levels
    enum Tier {
        NONE,
        STARTER,
        PRO,
        POWER
    }

    /// @notice Subscription struct for each user
    struct Subscription {
        Tier tier;
        uint256 expiryTimestamp;
        uint256 monthlyVolumeUsed;
        uint256 lastResetTimestamp;
    }

    /// @notice Tier configuration
    struct TierConfig {
        uint256 pricePerMonth; // in wei
        uint256 maxMonthlyVolume; // in USD equivalent
        uint256 maxActivePassCollections;
        uint256 maxBountyVolume;
        uint256 maxSingleBountySize;
        uint8 trackedProfiles;
        uint8 trackedWallets;
        bool active;
    }

    /// @notice Emitted when a user subscribes or renews
    event Subscribed(
        address indexed user,
        Tier tier,
        uint256 expiryTimestamp,
        uint256 amountPaid
    );

    /// @notice Emitted when a subscription expires
    event SubscriptionExpired(address indexed user, Tier tier);

    /// @notice Emitted when tier configuration is updated
    event TierConfigUpdated(Tier tier, TierConfig config);

    /// @notice Mapping from user address to subscription data
    mapping(address => Subscription) public subscriptions;

    /// @notice Mapping from tier to tier configuration
    mapping(Tier => TierConfig) public tierConfigs;

    /// @notice Platform fee receiver address
    address public feeReceiver;

    /// @notice Constructor
    constructor() {
        // Initialize tier configurations
        tierConfigs[Tier.STARTER] = TierConfig({
            pricePerMonth: 9 ether, // $9/month (assuming 1 USD = 1 ETH for simplicity, should use price feed)
            maxMonthlyVolume: 500 ether,
            maxActivePassCollections: 1,
            maxBountyVolume: 500 ether,
            maxSingleBountySize: 100 ether,
            trackedProfiles: 1,
            trackedWallets: 1,
            active: true
        });

        tierConfigs[Tier.PRO] = TierConfig({
            pricePerMonth: 29 ether,
            maxMonthlyVolume: 10000 ether,
            maxActivePassCollections: 5,
            maxBountyVolume: 10000 ether,
            maxSingleBountySize: 1000 ether,
            trackedProfiles: 5,
            trackedWallets: 5,
            active: true
        });

        tierConfigs[Tier.POWER] = TierConfig({
            pricePerMonth: 99 ether,
            maxMonthlyVolume: 100000 ether,
            maxActivePassCollections: 9999,
            maxBountyVolume: 100000 ether,
            maxSingleBountySize: 10000 ether,
            trackedProfiles: 20,
            trackedWallets: 20,
            active: true
        });
    }

    /// @notice Subscribe to a tier
    /// @param tier The tier to subscribe to
    function subscribe(Tier tier) external payable whenNotPaused {
        require(tier != Tier.NONE, "Invalid tier");
        require(tierConfigs[tier].active, "Tier not active");

        TierConfig memory config = tierConfigs[tier];
        require(msg.value >= config.pricePerMonth, "Insufficient payment");

        // Handle payment
        if (msg.value > config.pricePerMonth) {
            payable(msg.sender).transfer(msg.value - config.pricePerMonth);
        }
        if (feeReceiver != address(0)) {
            payable(feeReceiver).transfer(config.pricePerMonth);
        }

        // Update subscription
        Subscription storage sub = subscriptions[msg.sender];
        uint256 newExpiry;

        if (sub.expiryTimestamp > block.timestamp) {
            // Extend existing subscription
            newExpiry = sub.expiryTimestamp + 30 days;
        } else {
            // New subscription
            newExpiry = block.timestamp + 30 days;
            sub.tier = tier;
        }

        sub.expiryTimestamp = newExpiry;
        sub.monthlyVolumeUsed = 0;
        sub.lastResetTimestamp = block.timestamp;

        emit Subscribed(msg.sender, tier, newExpiry, config.pricePerMonth);
    }

    /// @notice Check if a user has an active subscription
    /// @param user The user address
    /// @return The user's current tier
    function getUserTier(address user) external view returns (Tier) {
        Subscription storage sub = subscriptions[user];
        if (sub.expiryTimestamp > block.timestamp) {
            return sub.tier;
        }
        return Tier.NONE;
    }

    /// @notice Check if a user has access to a specific tier level
    /// @param user The user address
    /// @param requiredTier The minimum tier required
    /// @return True if user has access
    function hasAccess(address user, Tier requiredTier) external view returns (bool) {
        Subscription storage sub = subscriptions[user];
        if (sub.expiryTimestamp < block.timestamp) {
            return false;
        }
        return sub.tier >= requiredTier;
    }

    /// @notice Get subscription details for a user
    /// @param user The user address
    /// @return tier, expiryTimestamp, monthlyVolumeUsed, lastResetTimestamp
    function getSubscriptionDetails(address user) 
        external 
        view 
        returns (Tier tier, uint256 expiryTimestamp, uint256 monthlyVolumeUsed, uint256 lastResetTimestamp) 
    {
        Subscription storage sub = subscriptions[user];
        return (sub.tier, sub.expiryTimestamp, sub.monthlyVolumeUsed, sub.lastResetTimestamp);
    }

    /// @notice Get tier configuration
    /// @param tier The tier
    /// @return TierConfig
    function getTierConfig(Tier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }

    /// @notice Update tier configuration (owner only)
    /// @param tier The tier to update
    /// @param config The new configuration
    function updateTierConfig(Tier tier, TierConfig calldata config) external onlyOwner {
        require(tier != Tier.NONE, "Cannot update NONE tier");
        tierConfigs[tier] = config;
        emit TierConfigUpdated(tier, config);
    }

    /// @notice Set fee receiver address (owner only)
    /// @param _feeReceiver The new fee receiver
    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid receiver");
        feeReceiver = _feeReceiver;
    }

    /// @notice Pause the contract (owner only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Check and reset monthly volume if needed
    function _checkAndResetMonthlyVolume(address user) internal {
        Subscription storage sub = subscriptions[user];
        if (block.timestamp >= sub.lastResetTimestamp + 30 days) {
            sub.monthlyVolumeUsed = 0;
            sub.lastResetTimestamp = block.timestamp;
        }
    }

    /// @notice Record volume usage (internal helper)
    function _recordVolume(address user, uint256 volume) internal {
        Subscription storage sub = subscriptions[user];
        _checkAndResetMonthlyVolume(user);
        sub.monthlyVolumeUsed += volume;
    }

    /// @notice Check if user has remaining volume
    function hasAvailableVolume(address user, uint256 requestedVolume) external view returns (bool) {
        Subscription storage sub = subscriptions[user];
        if (sub.expiryTimestamp < block.timestamp) {
            return false;
        }
        TierConfig memory config = tierConfigs[sub.tier];
        return (sub.monthlyVolumeUsed + requestedVolume) <= config.maxMonthlyVolume;
    }

    /// @notice Get remaining volume for a user
    function getRemainingVolume(address user) external view returns (uint256) {
        Subscription storage sub = subscriptions[user];
        if (sub.expiryTimestamp < block.timestamp) {
            return 0;
        }
        TierConfig memory config = tierConfigs[sub.tier];
        if (block.timestamp >= sub.lastResetTimestamp + 30 days) {
            return config.maxMonthlyVolume;
        }
        uint256 used = sub.monthlyVolumeUsed > config.maxMonthlyVolume 
            ? config.maxMonthlyVolume 
            : sub.monthlyVolumeUsed;
        return config.maxMonthlyVolume - used;
    }

    // Allow receiving ETH
    receive() external payable {}
}
