// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title BountyEscrow - Escrow funds for bounties and release to winners
/// @notice Manages bounty lifecycle: posting, submission, settlement, and refunds
contract BountyEscrow is Ownable2Step, Pausable {

    /// @notice Bounty status
    enum BountyStatus {
        OPEN,
        IN_PROGRESS, // Work submitted
        COMPLETED,
        CANCELLED,
        EXPIRED
    }

    /// @notice Bounty structure
    struct Bounty {
        uint256 id;
        address poster;
        uint256 amount;
        address token; // Token address (ETH or ERC20)
        string metadataURI; // IPFS hash or URL
        BountyStatus status;
        uint256 createdAt;
        uint256 deadline;
    }

    /// @notice Submission structure
    struct Submission {
        uint256 bountyId;
        address hunter;
        string submissionURI; // Work submission URL
        uint256 submittedAt;
        bool selected;
    }

    /// @notice Platform fee receiver
    address public feeReceiver;

    /// @notice Platform fee percentage (basis points)
    uint256 public platformFeeBps;

    /// @notice Bounty counter
    uint256 public bountyCount;

    /// @notice Mapping from bounty ID to Bounty
    mapping(uint256 => Bounty) public bounties;

    /// @notice Mapping from bounty ID to submissions
    mapping(uint256 => Submission[]) public submissions;

    /// @notice Mapping from bounty ID to selected winner
    mapping(uint256 => address) public selectedWinner;

    /// @notice Mapping from bounty poster to their bounties
    mapping(address => uint256[]) public posterBounties;

    /// @notice Mapping from hunter to their submissions
    mapping(address => uint256[]) public hunterSubmissions;

    /// @notice Emitted when a bounty is posted
    event BountyPosted(
        uint256 indexed bountyId,
        address indexed poster,
        uint256 amount,
        address token,
        string metadataURI,
        uint256 deadline
    );

    /// @notice Emitted when work is submitted
    event SubmissionAdded(
        uint256 indexed bountyId,
        address indexed hunter,
        string submissionURI
    );

    /// @notice Emitted when a bounty is settled
    event BountySettled(
        uint256 indexed bountyId,
        address indexed poster,
        address indexed winner,
        uint256 amount
    );

    /// @notice Emitted when a bounty is cancelled
    event BountyCanceled(
        uint256 indexed bountyId,
        address indexed poster,
        uint256 refundAmount
    );

    /// @notice Emitted when platform fee receiver is updated
    event FeeReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    /// @notice Bounty deadline extension (7 days default)
    uint256 public constant GRACE_PERIOD = 7 days;

    /// @notice Constructor
    constructor(address _feeReceiver) {
        feeReceiver = _feeReceiver;
        platformFeeBps = 750; // 7.5% for non-subscribers
    }

    /// @notice Post a new bounty
    /// @param amount The bounty amount
    /// @param token The token address (address(0) for ETH)
    /// @param metadataURI The bounty metadata URI
    /// @param deadline The deadline timestamp
    function postBounty(
        uint256 amount,
        address token,
        string memory metadataURI,
        uint256 deadline
    ) external payable whenNotPaused returns (uint256) {
        require(amount > 0, "Invalid amount");
        require(deadline > block.timestamp, "Invalid deadline");
        require(deadline <= block.timestamp + 90 days, "Deadline too far");

        // Calculate platform fee
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 totalRequired = amount + fee;

        // Handle token transfer
        if (token == address(0)) {
            require(msg.value >= totalRequired, "Insufficient ETH");
            // Refund excess
            if (msg.value > totalRequired) {
                payable(msg.sender).transfer(msg.value - totalRequired);
            }
        } else {
            require(msg.value == 0, "ETH not accepted for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), totalRequired), "Transfer failed");
        }

        // Create bounty
        uint256 bountyId = bountyCount + 1;
        bountyCount++;

        bounties[bountyId] = Bounty({
            id: bountyId,
            poster: msg.sender,
            amount: amount,
            token: token,
            metadataURI: metadataURI,
            status: BountyStatus.OPEN,
            createdAt: block.timestamp,
            deadline: deadline
        });

        posterBounties[msg.sender].push(bountyId);

        // Transfer fee to receiver
        if (token == address(0)) {
            payable(feeReceiver).transfer(fee);
        } else {
            require(IERC20(token).transfer(feeReceiver, fee), "Fee transfer failed");
        }

        emit BountyPosted(bountyId, msg.sender, amount, token, metadataURI, deadline);

        return bountyId;
    }

    /// @notice Submit work for a bounty
    /// @param bountyId The bounty ID
    /// @param submissionURI The submission URI
    function submitWork(
        uint256 bountyId,
        string memory submissionURI
    ) external whenNotPaused {
        require(bountyId > 0 && bountyId <= bountyCount, "Invalid bounty ID");
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");
        require(block.timestamp <= bounty.deadline, "Bounty expired");
        require(bounty.poster != msg.sender, "Cannot submit to own bounty");

        submissions[bountyId].push(Submission({
            bountyId: bountyId,
            hunter: msg.sender,
            submissionURI: submissionURI,
            submittedAt: block.timestamp,
            selected: false
        }));

        hunterSubmissions[msg.sender].push(bountyId);

        emit SubmissionAdded(bountyId, msg.sender, submissionURI);
    }

    /// @notice Settle a bounty - select a winner
    /// @param bountyId The bounty ID
    /// @param winner The winning hunter address
    function settleBounty(
        uint256 bountyId,
        address winner
    ) external whenNotPaused {
        require(bountyId > 0 && bountyId <= bountyCount, "Invalid bounty ID");
        Bounty storage bounty = bounties[bountyId];
        require(bounty.poster == msg.sender, "Only poster can settle");
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");
        require(winner != address(0), "Invalid winner");

        // Find the submission
        bool found = false;
        for (uint256 i = 0; i < submissions[bountyId].length; i++) {
            if (submissions[bountyId][i].hunter == winner) {
                submissions[bountyId][i].selected = true;
                found = true;
                break;
            }
        }
        require(found, "Winner not found in submissions");

        // Mark as completed
        bounty.status = BountyStatus.COMPLETED;
        selectedWinner[bountyId] = winner;

        // Transfer bounty amount to winner
        if (bounty.token == address(0)) {
            payable(winner).transfer(bounty.amount);
        } else {
            require(IERC20(bounty.token).transfer(winner, bounty.amount), "Transfer failed");
        }

        emit BountySettled(bountyId, msg.sender, winner, bounty.amount);
    }

    /// @notice Cancel a bounty and refund the poster
    function cancelBounty(uint256 bountyId) external whenNotPaused {
        require(bountyId > 0 && bountyId <= bountyCount, "Invalid bounty ID");
        Bounty storage bounty = bounties[bountyId];
        require(bounty.poster == msg.sender, "Only poster can cancel");
        require(bounty.status == BountyStatus.OPEN, "Cannot cancel");

        bounty.status = BountyStatus.CANCELLED;

        // Calculate refund amount
        uint256 refundAmount = bounty.amount;
        
        // Transfer refund
        if (bounty.token == address(0)) {
            payable(msg.sender).transfer(refundAmount);
        } else {
            require(IERC20(bounty.token).transfer(msg.sender, refundAmount), "Refund failed");
        }

        emit BountyCanceled(bountyId, msg.sender, refundAmount);
    }

    /// @notice Get submissions for a bounty
    function getSubmissions(uint256 bountyId) external view returns (Submission[] memory) {
        return submissions[bountyId];
    }

    /// @notice Get poster's bounties
    function getPosterBounties(address poster) external view returns (uint256[] memory) {
        return posterBounties[poster];
    }

    /// @notice Get hunter's submissions
    function getHunterSubmissions(address hunter) external view returns (uint256[] memory) {
        return hunterSubmissions[hunter];
    }

    /// @notice Get bounty details
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        require(bountyId > 0 && bountyId <= bountyCount, "Invalid bounty ID");
        return bounties[bountyId];
    }

    /// @notice Update platform fee receiver (owner only)
    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid receiver");
        address oldReceiver = feeReceiver;
        feeReceiver = _feeReceiver;
        emit FeeReceiverUpdated(oldReceiver, _feeReceiver);
    }

    /// @notice Update platform fee percentage (owner only)
    function setPlatformFeeBps(uint256 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 1000, "Fee too high");
        platformFeeBps = _platformFeeBps;
    }

    /// @notice Emergency winner selection (owner only, dispute resolution)
    function emergencySettle(
        uint256 bountyId,
        address winner
    ) external onlyOwner {
        require(bountyId > 0 && bountyId <= bountyCount, "Invalid bounty ID");
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");
        require(block.timestamp > bounty.deadline, "Deadline not passed");

        bounty.status = BountyStatus.COMPLETED;
        selectedWinner[bountyId] = winner;

        if (bounty.token == address(0)) {
            payable(winner).transfer(bounty.amount);
        } else {
            require(IERC20(bounty.token).transfer(winner, bounty.amount), "Transfer failed");
        }

        emit BountySettled(bountyId, bounty.poster, winner, bounty.amount);
    }

    /// @notice Pause the contract (owner only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Allow receiving ETH
    receive() external payable {}
}
