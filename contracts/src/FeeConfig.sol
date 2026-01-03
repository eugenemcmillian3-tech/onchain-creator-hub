// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title FeeConfig - Global configuration for platform fees
/// @notice Centralized fee management for all platform operations
contract FeeConfig is Ownable2Step, Pausable {

    /// @notice Fee configuration for a specific feature
    struct FeeSettings {
        uint256 flatFee; // Flat fee in wei (for non-subscribers)
        uint256 percentageFee; // Percentage fee in basis points (e.g., 750 = 7.5%)
        bool enabled;
    }

    /// @notice Feature types
    enum Feature {
        PAY_PER_ACTION,
        CREATOR_PRIMARY_SALE,
        SECONDARY_ROYALTY,
        BOUNTY_FUNDING,
        BOUNTY_COMPLETION,
        ANALYTICS_QUERY
    }

    /// @notice Platform fee configuration
    struct PlatformFees {
        FeeSettings payPerAction;
        FeeSettings primarySale;
        FeeSettings secondarySale;
        FeeSettings bountyFunding;
        FeeSettings bountyCompletion;
        FeeSettings analyticsQuery;
    }

    /// @notice Emitted when fee settings are updated
    event FeeUpdated(Feature feature, FeeSettings settings);

    /// @notice Emitted when fees are paused/unpaused globally
    event FeesGlobalPause(bool paused);

    /// @notice Global pause for all fee collection
    bool public globalFeePause;

    /// @notice Platform fee configuration
    PlatformFees public fees;

    /// @notice Constructor
    constructor() {
        // Default fee configuration
        fees.payPerAction = FeeSettings({
            flatFee: 0.25 ether, // 0.25 USD equivalent
            percentageFee: 0,
            enabled: true
        });

        fees.primarySale = FeeSettings({
            flatFee: 0,
            percentageFee: 1000, // 10% for non-subs
            enabled: true
        });

        fees.secondarySale = FeeSettings({
            flatFee: 0,
            percentageFee: 200, // 2% for non-subs
            enabled: true
        });

        fees.bountyFunding = FeeSettings({
            flatFee: 0,
            percentageFee: 750, // 7.5% for non-subs
            enabled: true
        });

        fees.bountyCompletion = FeeSettings({
            flatFee: 1 ether, // 1 USD equivalent flat fee for non-subs
            percentageFee: 0,
            enabled: true
        });

        fees.analyticsQuery = FeeSettings({
            flatFee: 0.1 ether, // 0.10 USD equivalent per query
            percentageFee: 0,
            enabled: true
        });
    }

    /// @notice Get fee settings for a feature
    /// @param feature The feature type
    /// @return FeeSettings
    function getFeeSettings(Feature feature) external view returns (FeeSettings memory) {
        if (globalFeePause) {
            return FeeSettings({ flatFee: 0, percentageFee: 0, enabled: false });
        }

        if (feature == Feature.PAY_PER_ACTION) return fees.payPerAction;
        if (feature == Feature.CREATOR_PRIMARY_SALE) return fees.primarySale;
        if (feature == Feature.SECONDARY_ROYALTY) return fees.secondarySale;
        if (feature == Feature.BOUNTY_FUNDING) return fees.bountyFunding;
        if (feature == Feature.BOUNTY_COMPLETION) return fees.bountyCompletion;
        if (feature == Feature.ANALYTICS_QUERY) return fees.analyticsQuery;
        
        revert("Invalid feature");
    }

    /// @notice Calculate total fee for a transaction
    /// @param feature The feature type
    /// @param amount The transaction amount
    /// @param isSubscriber Whether the user is a subscriber
    /// @return totalFee The calculated fee
    function calculateFee(
        Feature feature, 
        uint256 amount, 
        bool isSubscriber
    ) external view returns (uint256 totalFee) {
        FeeSettings memory settings = getFeeSettings(feature);
        if (!settings.enabled) return 0;

        // Apply subscriber discounts
        uint256 flatFee = settings.flatFee;
        uint256 percentage = settings.percentageFee;

        if (isSubscriber) {
            // Subscribers get reduced or zero flat fees
            if (feature == Feature.PAY_PER_ACTION) flatFee = 0;
            if (feature == Feature.BOUNTY_COMPLETION) flatFee = 0;
            if (feature == Feature.ANALYTICS_QUERY) flatFee = 0;

            // Subscribers also get percentage discounts
            if (feature == Feature.CREATOR_PRIMARY_SALE) percentage = 750; // 7.5% for subs
            if (feature == Feature.SECONDARY_ROYALTY) percentage = 100; // 1% for subs
            if (feature == Feature.BOUNTY_FUNDING) percentage = 500; // 5% for subs
        }

        // Calculate percentage fee
        uint256 percentageFee = (amount * percentage) / 10000;

        return flatFee + percentageFee;
    }

    /// @notice Update fee settings for a feature
    /// @param feature The feature type
    /// @param flatFee New flat fee
    /// @param percentageFee New percentage fee in basis points
    /// @param enabled Whether the fee is enabled
    function updateFee(
        Feature feature,
        uint256 flatFee,
        uint256 percentageFee,
        bool enabled
    ) external onlyOwner {
        if (feature == Feature.PAY_PER_ACTION) {
            fees.payPerAction = FeeSettings(flatFee, percentageFee, enabled);
        } else if (feature == Feature.CREATOR_PRIMARY_SALE) {
            fees.primarySale = FeeSettings(flatFee, percentageFee, enabled);
        } else if (feature == Feature.SECONDARY_ROYALTY) {
            fees.secondarySale = FeeSettings(flatFee, percentageFee, enabled);
        } else if (feature == Feature.BOUNTY_FUNDING) {
            fees.bountyFunding = FeeSettings(flatFee, percentageFee, enabled);
        } else if (feature == Feature.BOUNTY_COMPLETION) {
            fees.bountyCompletion = FeeSettings(flatFee, percentageFee, enabled);
        } else if (feature == Feature.ANALYTICS_QUERY) {
            fees.analyticsQuery = FeeSettings(flatFee, percentageFee, enabled);
        } else {
            revert("Invalid feature");
        }

        emit FeeUpdated(feature, FeeSettings(flatFee, percentageFee, enabled));
    }

    /// @notice Set global fee pause
    /// @param pause Whether to pause all fees
    function setGlobalFeePause(bool pause) external onlyOwner {
        globalFeePause = pause;
        emit FeesGlobalPause(pause);
    }

    /// @notice Pause the contract (owner only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }
}
