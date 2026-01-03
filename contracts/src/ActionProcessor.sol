// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title ActionProcessor - Handle pay-per-action flows
/// @notice Processes tips, paywalls, and single NFT mints with platform fees
contract ActionProcessor is Ownable2Step, Pausable {

    /// @notice Action types
    enum ActionType {
        TIP,
        PAYWALL_UNLOCK,
        NFT_MINT
    }

    /// @notice Action context
    struct ActionContext {
        address creator;
        bytes32 contentId; // Associated cast or content ID
        uint256 amount; // Amount in wei
    }

    /// @notice Platform fee receiver
    address public feeReceiver;

    /// @notice Fee configuration contract
    address public feeConfig;

    /// @notice Supported payment token (USDC on Base)
    address public paymentToken;

    /// @notice Emitted when a tip is paid
    event TipPaid(
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed contextId
    );

    /// @notice Emitted when content is unlocked
    event ContentUnlocked(
        address indexed payer,
        address indexed creator,
        bytes32 indexed contentId,
        uint256 amount
    );

    /// @notice Emitted when an NFT is minted
    event NFTMinted(
        address indexed minter,
        address indexed creator,
        uint256 indexed tokenId,
        uint256 amount
    );

    /// @notice Emitted when platform fee is charged
    event ActionFeeCharged(
        address indexed user,
        uint256 amount,
        ActionType actionType
    );

    /// @notice Emitted when fee receiver is updated
    event FeeReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    /// @notice Emitted when fee config is updated
    event FeeConfigUpdated(address indexed oldConfig, address indexed newConfig);

    /// @notice Mapping to track if content has been unlocked
    mapping(bytes32 => mapping(address => bool)) public unlockedContent;

    /// @notice Constructor
    constructor(
        address _paymentToken,
        address _feeConfig,
        address _feeReceiver
    ) {
        paymentToken = _paymentToken;
        feeConfig = _feeConfig;
        feeReceiver = _feeReceiver;
    }

    /// @notice Process a tip payment
    /// @param recipient The tip recipient
    /// @param amount The tip amount
    /// @param contextId The associated context (cast ID, etc.)
    function tip(
        address recipient,
        uint256 amount,
        bytes32 contextId
    ) external whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // Calculate fee
        uint256 fee = _calculateFee(amount, ActionType.TIP);

        // Transfer payment
        _transferPayment(msg.sender, recipient, amount - fee);

        // Transfer fee to receiver
        if (fee > 0) {
            _transferFee(msg.sender, fee);
        }

        emit TipPaid(msg.sender, recipient, amount, contextId);
    }

    /// @notice Unlock paywalled content
    /// @param creator The content creator
    /// @param contentId The content ID to unlock
    /// @param price The unlock price
    function unlockContent(
        address creator,
        bytes32 contentId,
        uint256 price
    ) external whenNotPaused {
        require(creator != address(0), "Invalid creator");
        require(!unlockedContent[contentId][msg.sender], "Already unlocked");
        require(price > 0, "Invalid price");

        // Calculate fee
        uint256 fee = _calculateFee(price, ActionType.PAYWALL_UNLOCK);

        // Transfer payment
        _transferPayment(msg.sender, creator, price - fee);

        // Transfer fee
        if (fee > 0) {
            _transferFee(msg.sender, fee);
        }

        // Mark as unlocked
        unlockedContent[contentId][msg.sender] = true;

        emit ContentUnlocked(msg.sender, creator, contentId, price);
    }

    /// @notice Mint an NFT with platform fee
    /// @param creator The NFT creator
    /// @param tokenId The token ID to mint
    /// @param price The mint price
    function mintNFT(
        address creator,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused {
        require(creator != address(0), "Invalid creator");
        require(price > 0, "Invalid price");

        // Calculate fee
        uint256 fee = _calculateFee(price, ActionType.NFT_MINT);

        // Transfer payment
        _transferPayment(msg.sender, creator, price - fee);

        // Transfer fee
        if (fee > 0) {
            _transferFee(msg.sender, fee);
        }

        emit NFTMinted(msg.sender, creator, tokenId, price);
    }

    /// @notice Check if user has unlocked specific content
    function hasUnlocked(bytes32 contentId, address user) external view returns (bool) {
        return unlockedContent[contentId][user];
    }

    /// @notice Calculate platform fee
    function _calculateFee(uint256 amount, ActionType actionType) internal returns (uint256) {
        // In production, this would query the FeeConfig contract
        // For now, use simple fee calculation
        uint256 feePercentage = 1000; // 10% default for non-subs
        return (amount * feePercentage) / 10000;
    }

    /// @notice Transfer payment from user to recipient
    function _transferPayment(address from, address to, uint256 amount) internal {
        require(IERC20(paymentToken).transferFrom(from, to, amount), "Transfer failed");
    }

    /// @notice Transfer fee to fee receiver
    function _transferFee(address from, uint256 amount) internal {
        require(IERC20(paymentToken).transferFrom(from, feeReceiver, amount), "Fee transfer failed");
    }

    /// @notice Update fee receiver (owner only)
    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        address oldReceiver = feeReceiver;
        feeReceiver = _feeReceiver;
        emit FeeReceiverUpdated(oldReceiver, _feeReceiver);
    }

    /// @notice Update fee config address (owner only)
    function setFeeConfig(address _feeConfig) external onlyOwner {
        address oldConfig = feeConfig;
        feeConfig = _feeConfig;
        emit FeeConfigUpdated(oldConfig, _feeConfig);
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
