// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ChristmasGift is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum GiftType { EQUAL, LUCKY }
    
    struct Gift {
        address creator;
        address token;          // address(0) = ETH
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 totalShares;
        uint256 claimedShares;
        bytes32 passwordHash;
        GiftType giftType;
        bool proOnly;           // Lucky draw requires Pro
        string title;
        uint256 expireTime;
        bool active;
    }

    mapping(uint256 => Gift) public gifts;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => mapping(address => uint256)) public claimedAmount;
    
    uint256 public giftCount;
    uint256 public constant MIN_EXPIRE_TIME = 1 hours;
    uint256 public constant MAX_EXPIRE_TIME = 30 days;

    event GiftCreated(
        uint256 indexed giftId,
        address indexed creator,
        address token,
        uint256 totalAmount,
        uint256 shares,
        GiftType giftType,
        string title
    );
    
    event GiftClaimed(
        uint256 indexed giftId,
        address indexed claimer,
        uint256 amount
    );
    
    event GiftRefunded(
        uint256 indexed giftId,
        address indexed creator,
        uint256 amount
    );

    // Create a gift with ETH
    function createGiftETH(
        uint256 shares,
        bytes32 passwordHash,
        GiftType giftType,
        bool proOnly,
        string calldata title,
        uint256 duration
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Amount must be > 0");
        require(shares > 0 && shares <= 100, "Shares: 1-100");
        require(msg.value >= shares, "Amount too small for shares");
        require(duration >= MIN_EXPIRE_TIME && duration <= MAX_EXPIRE_TIME, "Invalid duration");

        uint256 giftId = giftCount++;
        
        gifts[giftId] = Gift({
            creator: msg.sender,
            token: address(0),
            totalAmount: msg.value,
            remainingAmount: msg.value,
            totalShares: shares,
            claimedShares: 0,
            passwordHash: passwordHash,
            giftType: giftType,
            proOnly: proOnly,
            title: title,
            expireTime: block.timestamp + duration,
            active: true
        });

        emit GiftCreated(giftId, msg.sender, address(0), msg.value, shares, giftType, title);
        return giftId;
    }

    // Create a gift with ERC20 token
    function createGiftToken(
        address token,
        uint256 amount,
        uint256 shares,
        bytes32 passwordHash,
        GiftType giftType,
        bool proOnly,
        string calldata title,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(shares > 0 && shares <= 100, "Shares: 1-100");
        require(amount >= shares, "Amount too small for shares");
        require(duration >= MIN_EXPIRE_TIME && duration <= MAX_EXPIRE_TIME, "Invalid duration");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 giftId = giftCount++;
        
        gifts[giftId] = Gift({
            creator: msg.sender,
            token: token,
            totalAmount: amount,
            remainingAmount: amount,
            totalShares: shares,
            claimedShares: 0,
            passwordHash: passwordHash,
            giftType: giftType,
            proOnly: proOnly,
            title: title,
            expireTime: block.timestamp + duration,
            active: true
        });

        emit GiftCreated(giftId, msg.sender, token, amount, shares, giftType, title);
        return giftId;
    }

    // Claim a gift
    function claimGift(
        uint256 giftId,
        string calldata password,
        bool isPro
    ) external nonReentrant {
        Gift storage gift = gifts[giftId];
        
        require(gift.active, "Gift not active");
        require(block.timestamp < gift.expireTime, "Gift expired");
        require(!hasClaimed[giftId][msg.sender], "Already claimed");
        require(gift.claimedShares < gift.totalShares, "All claimed");
        require(keccak256(abi.encodePacked(password)) == gift.passwordHash, "Wrong password");
        
        if (gift.giftType == GiftType.LUCKY) {
            require(isPro, "Lucky draw requires Pro");
        }

        uint256 claimAmount;
        
        if (gift.giftType == GiftType.EQUAL) {
            claimAmount = gift.totalAmount / gift.totalShares;
        } else {
            // Lucky draw - random amount
            uint256 remainingShares = gift.totalShares - gift.claimedShares;
            if (remainingShares == 1) {
                claimAmount = gift.remainingAmount;
            } else {
                uint256 maxAmount = (gift.remainingAmount * 2) / remainingShares;
                uint256 randomSeed = uint256(keccak256(abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    giftId,
                    gift.claimedShares
                )));
                claimAmount = (randomSeed % maxAmount) + 1;
                if (claimAmount > gift.remainingAmount) {
                    claimAmount = gift.remainingAmount;
                }
            }
        }

        hasClaimed[giftId][msg.sender] = true;
        claimedAmount[giftId][msg.sender] = claimAmount;
        gift.claimedShares++;
        gift.remainingAmount -= claimAmount;

        if (gift.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(gift.token).safeTransfer(msg.sender, claimAmount);
        }

        emit GiftClaimed(giftId, msg.sender, claimAmount);
    }

    // Refund expired or remaining gift
    function refundGift(uint256 giftId) external nonReentrant {
        Gift storage gift = gifts[giftId];
        
        require(gift.creator == msg.sender, "Not creator");
        require(gift.active, "Not active");
        require(
            block.timestamp >= gift.expireTime || gift.claimedShares == gift.totalShares,
            "Cannot refund yet"
        );
        require(gift.remainingAmount > 0, "Nothing to refund");

        uint256 refundAmount = gift.remainingAmount;
        gift.remainingAmount = 0;
        gift.active = false;

        if (gift.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(gift.token).safeTransfer(msg.sender, refundAmount);
        }

        emit GiftRefunded(giftId, msg.sender, refundAmount);
    }

    // View functions
    function getGift(uint256 giftId) external view returns (
        address creator,
        address token,
        uint256 totalAmount,
        uint256 remainingAmount,
        uint256 totalShares,
        uint256 claimedShares,
        GiftType giftType,
        bool proOnly,
        string memory title,
        uint256 expireTime,
        bool active
    ) {
        Gift storage gift = gifts[giftId];
        return (
            gift.creator,
            gift.token,
            gift.totalAmount,
            gift.remainingAmount,
            gift.totalShares,
            gift.claimedShares,
            gift.giftType,
            gift.proOnly,
            gift.title,
            gift.expireTime,
            gift.active
        );
    }

    function hasUserClaimed(uint256 giftId, address user) external view returns (bool) {
        return hasClaimed[giftId][user];
    }

    function getUserClaimedAmount(uint256 giftId, address user) external view returns (uint256) {
        return claimedAmount[giftId][user];
    }
}
