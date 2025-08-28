// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MonayTreasury
 * @dev Treasury contract for managing cross-rail swaps between Base L2 and Solana
 */
contract MonayTreasury is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    
    struct CrossRailSwap {
        address initiator;
        string targetChain;
        string targetAddress;
        uint256 amount;
        address token;
        uint256 timestamp;
        bool completed;
        bytes32 solanaSignature;
    }
    
    mapping(bytes32 => CrossRailSwap) public swaps;
    mapping(address => uint256) public tokenBalances;
    mapping(string => bool) public supportedChains;
    
    uint256 public swapNonce = 0;
    uint256 public minSwapAmount = 1e18; // 1 token minimum
    uint256 public maxSwapAmount = 1000000e18; // 1M tokens maximum
    uint256 public swapFee = 10; // 0.1% fee (10 basis points)
    
    event SwapInitiated(
        bytes32 indexed swapId,
        address indexed initiator,
        string targetChain,
        uint256 amount,
        address token
    );
    
    event SwapCompleted(
        bytes32 indexed swapId,
        bytes32 solanaSignature
    );
    
    event SwapCancelled(bytes32 indexed swapId);
    event TokenDeposited(address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed token, uint256 amount);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        
        // Add supported chains
        supportedChains["solana"] = true;
        supportedChains["base"] = true;
    }
    
    /**
     * @dev Initiate a cross-rail swap to Solana
     */
    function initiateSwapToSolana(
        address token,
        uint256 amount,
        string memory solanaAddress
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(amount >= minSwapAmount, "Amount below minimum");
        require(amount <= maxSwapAmount, "Amount above maximum");
        require(supportedChains["solana"], "Chain not supported");
        require(bytes(solanaAddress).length > 0, "Invalid Solana address");
        
        // Transfer tokens from user to treasury
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Calculate fee
        uint256 feeAmount = (amount * swapFee) / 10000;
        uint256 netAmount = amount - feeAmount;
        
        // Create swap record
        bytes32 swapId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, swapNonce++)
        );
        
        swaps[swapId] = CrossRailSwap({
            initiator: msg.sender,
            targetChain: "solana",
            targetAddress: solanaAddress,
            amount: netAmount,
            token: token,
            timestamp: block.timestamp,
            completed: false,
            solanaSignature: bytes32(0)
        });
        
        tokenBalances[token] += amount;
        
        emit SwapInitiated(swapId, msg.sender, "solana", netAmount, token);
        
        return swapId;
    }
    
    /**
     * @dev Complete a swap from Solana to Base L2
     */
    function completeSwapFromSolana(
        address recipient,
        address token,
        uint256 amount,
        bytes32 solanaSignature
    ) external onlyRole(BRIDGE_ROLE) nonReentrant {
        require(amount > 0, "Invalid amount");
        require(tokenBalances[token] >= amount, "Insufficient treasury balance");
        
        // Transfer tokens to recipient
        IERC20(token).transfer(recipient, amount);
        tokenBalances[token] -= amount;
        
        // Create swap record for tracking
        bytes32 swapId = keccak256(
            abi.encodePacked(recipient, block.timestamp, swapNonce++)
        );
        
        swaps[swapId] = CrossRailSwap({
            initiator: recipient,
            targetChain: "base",
            targetAddress: "",
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            completed: true,
            solanaSignature: solanaSignature
        });
        
        emit SwapCompleted(swapId, solanaSignature);
    }
    
    /**
     * @dev Mark a swap as completed
     */
    function markSwapCompleted(
        bytes32 swapId,
        bytes32 solanaSignature
    ) external onlyRole(BRIDGE_ROLE) {
        require(!swaps[swapId].completed, "Swap already completed");
        
        swaps[swapId].completed = true;
        swaps[swapId].solanaSignature = solanaSignature;
        
        emit SwapCompleted(swapId, solanaSignature);
    }
    
    /**
     * @dev Cancel a pending swap and refund
     */
    function cancelSwap(bytes32 swapId) external onlyRole(OPERATOR_ROLE) {
        CrossRailSwap storage swap = swaps[swapId];
        require(!swap.completed, "Swap already completed");
        require(swap.amount > 0, "Invalid swap");
        
        // Refund tokens to initiator
        IERC20(swap.token).transfer(swap.initiator, swap.amount);
        tokenBalances[swap.token] -= swap.amount;
        
        swap.completed = true;
        
        emit SwapCancelled(swapId);
    }
    
    /**
     * @dev Deposit tokens to treasury
     */
    function depositToken(address token, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[token] += amount;
        
        emit TokenDeposited(token, amount);
    }
    
    /**
     * @dev Withdraw tokens from treasury
     */
    function withdrawToken(
        address token,
        uint256 amount,
        address recipient
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenBalances[token] >= amount, "Insufficient balance");
        
        IERC20(token).transfer(recipient, amount);
        tokenBalances[token] -= amount;
        
        emit TokenWithdrawn(token, amount);
    }
    
    /**
     * @dev Update swap parameters
     */
    function updateSwapParameters(
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _fee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minSwapAmount = _minAmount;
        maxSwapAmount = _maxAmount;
        swapFee = _fee;
    }
    
    /**
     * @dev Add or remove supported chain
     */
    function setSupportedChain(string memory chain, bool supported) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        supportedChains[chain] = supported;
    }
    
    /**
     * @dev Get swap details
     */
    function getSwapDetails(bytes32 swapId) 
        external 
        view 
        returns (CrossRailSwap memory) 
    {
        return swaps[swapId];
    }
    
    /**
     * @dev Check if chain is supported
     */
    function isChainSupported(string memory chain) external view returns (bool) {
        return supportedChains[chain];
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}