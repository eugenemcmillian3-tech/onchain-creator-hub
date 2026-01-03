// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";

/// @title AccessPass - Individual access pass NFT
/// @notice Represents a creator's access pass with metadata and royalty support
contract AccessPass is ERC721URIStorage, ERC721Enumerable, IERC2981 {

    /// @notice Collection creator
    address public creator;

    /// @notice Maximum supply
    uint256 public maxSupply;

    /// @notice Current supply
    uint256 public currentSupply;

    /// @notice Primary sale price per pass
    uint256 public primaryPrice;

    /// @notice Royalty basis points
    uint256 public royaltyBps;

    /// @notice Whether soulbound (non-transferable)
    bool public isSoulbound;

    /// @notice Constructor
    constructor(
        string memory name,
        string memory symbol,
        address _creator,
        uint256 _maxSupply,
        uint256 _primaryPrice,
        uint256 _royaltyBps,
        bool _isSoulbound
    ) ERC721(name, symbol) {
        creator = _creator;
        maxSupply = _maxSupply;
        primaryPrice = _primaryPrice;
        royaltyBps = _royaltyBps;
        isSoulbound = _isSoulbound;
    }

    /// @notice Mint a new pass
    function mint(address to) external returns (uint256) {
        require(msg.sender == creator, "Only creator can mint");
        require(currentSupply < maxSupply, "Max supply reached");
        
        uint256 tokenId = currentSupply + 1;
        _safeMint(to, tokenId);
        currentSupply++;
        
        return tokenId;
    }

    /// @notice Override transfer for soulbound tokens
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (isSoulbound && from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /// @notice ERC2981 royalty info
    function royaltyInfo(
        uint256,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        return (creator, (salePrice * royaltyBps) / 10000);
    }

    /// @notice Support interfaces
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Required overrides for ERC721Enumerable
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721) {
        super._increaseBalance(account, value);
    }
}

/// @title AccessPassFactory - Deploy and manage creator access pass collections
/// @notice Factory contract for creating and managing ERC-721 access passes
contract AccessPassFactory is Ownable2Step, Pausable {

    /// @notice Collection info
    struct CollectionInfo {
        address collectionAddress;
        address creator;
        string name;
        string symbol;
        uint256 maxSupply;
        uint256 primaryPrice;
        uint256 royaltyBps;
        bool isSoulbound;
        uint256 createdAt;
    }

    /// @notice Platform fee receiver
    address public feeReceiver;

    /// @notice Platform fee percentage (basis points)
    uint256 public platformFeeBps;

    /// @notice Collection counter
    uint256 public collectionCount;

    /// @notice Mapping from collection address to info
    mapping(address => CollectionInfo) public collections;

    /// @notice Mapping from creator to their collections
    mapping(address => address[]) public creatorCollections;

    /// @notice Emitted when a new collection is created
    event CollectionCreated(
        address indexed collectionAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 primaryPrice,
        uint256 royaltyBps,
        bool isSoulbound
    );

    /// @notice Emitted when a pass is minted
    event PassMinted(
        address indexed collectionAddress,
        address indexed minter,
        uint256 indexed tokenId,
        uint256 price
    );

    /// @notice Emitted when platform fee receiver is updated
    event FeeReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    /// @notice Constructor
    constructor(address _feeReceiver) {
        feeReceiver = _feeReceiver;
        platformFeeBps = 500; // 5% platform fee
    }

    /// @notice Create a new access pass collection
    /// @param name Collection name
    /// @param symbol Collection symbol
    /// @param maxSupply Maximum supply of passes
    /// @param primaryPrice Price per pass in primary sale
    /// @param royaltyBps Royalty percentage in basis points
    /// @param isSoulbound Whether passes are soulbound
    function createCollection(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 primaryPrice,
        uint256 royaltyBps,
        bool isSoulbound
    ) external whenNotPaused returns (address) {
        require(bytes(name).length > 0, "Invalid name");
        require(bytes(symbol).length > 0, "Invalid symbol");
        require(maxSupply > 0 && maxSupply <= 10000, "Invalid max supply");
        require(royaltyBps <= 2000, "Royalty too high"); // Max 20%
        require(primaryPrice >= 0, "Invalid price");

        // Deploy new AccessPass contract
        AccessPass newCollection = new AccessPass(
            name,
            symbol,
            msg.sender,
            maxSupply,
            primaryPrice,
            royaltyBps,
            isSoulbound
        );

        address collectionAddress = address(newCollection);

        // Store collection info
        CollectionInfo memory info = CollectionInfo({
            collectionAddress: collectionAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            maxSupply: maxSupply,
            primaryPrice: primaryPrice,
            royaltyBps: royaltyBps,
            isSoulbound: isSoulbound,
            createdAt: block.timestamp
        });

        collections[collectionAddress] = info;
        creatorCollections[msg.sender].push(collectionAddress);
        collectionCount++;

        emit CollectionCreated(
            collectionAddress,
            msg.sender,
            name,
            symbol,
            maxSupply,
            primaryPrice,
            royaltyBps,
            isSoulbound
        );

        return collectionAddress;
    }

    /// @notice Mint a pass from a collection
    /// @param collectionAddress The collection address
    /// @param quantity Number of passes to mint (for now limited to 1)
    function mintPass(
        address collectionAddress,
        uint256 quantity
    ) external payable whenNotPaused returns (uint256) {
        CollectionInfo storage info = collections[collectionAddress];
        require(info.creator != address(0), "Invalid collection");
        require(quantity > 0, "Invalid quantity");

        AccessPass collection = AccessPass(payable(collectionAddress));
        uint256 totalPrice = info.primaryPrice * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Calculate platform fee
        uint256 platformFee = (totalPrice * platformFeeBps) / 10000;
        uint256 creatorAmount = totalPrice - platformFee;

        // Transfer fee to receiver
        if (platformFee > 0) {
            payable(feeReceiver).transfer(platformFee);
        }

        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        // Mint passes
        uint256 tokenId = collection.mint(msg.sender);
        
        emit PassMinted(collectionAddress, msg.sender, tokenId, totalPrice);

        return tokenId;
    }

    /// @notice Get all collections for a creator
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }

    /// @notice Get collection count
    function getCollectionCount() external view returns (uint256) {
        return collectionCount;
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
        require(_platformFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = _platformFeeBps;
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
