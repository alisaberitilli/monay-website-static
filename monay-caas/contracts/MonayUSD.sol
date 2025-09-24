// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MonayUSD
 * @dev MonayUSD is a wrapped stablecoin backed 1:1 by Circle USDC
 * This is Phase 2 of the hybrid approach where we wrap USDC to create MonayUSD
 * Phase 3 will transition to direct USD backing
 */
contract MonayUSD is ERC20, ERC20Permit, ERC20Pausable, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // USDC contract address (to be set based on network)
    IERC20 public immutable USDC;

    // Reserve tracking
    uint256 public totalReserves;
    mapping(address => uint256) public userReserves;

    // Events
    event USDCWrapped(address indexed user, uint256 amount);
    event USDCUnwrapped(address indexed user, uint256 amount);
    event ReservesUpdated(uint256 newTotal);

    // Errors
    error InsufficientUSDCBalance();
    error InsufficientMonayUSDBalance();
    error TransferFailed();
    error ZeroAmount();

    /**
     * @dev Constructor
     * @param _usdcAddress Address of the USDC contract
     * @param _admin Address to grant admin role
     */
    constructor(
        address _usdcAddress,
        address _admin
    ) ERC20("Monay USD", "MonayUSD") ERC20Permit("Monay USD") {
        require(_usdcAddress != address(0), "Invalid USDC address");
        require(_admin != address(0), "Invalid admin address");

        USDC = IERC20(_usdcAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _admin);
    }

    /**
     * @dev Wrap USDC to mint MonayUSD
     * @param amount Amount of USDC to wrap
     */
    function wrapUSDC(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();

        // Check user has sufficient USDC balance
        if (USDC.balanceOf(msg.sender) < amount) revert InsufficientUSDCBalance();

        // Transfer USDC from user to this contract
        bool success = USDC.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        // Mint equivalent MonayUSD to user
        _mint(msg.sender, amount);

        // Update reserves
        totalReserves += amount;
        userReserves[msg.sender] += amount;

        emit USDCWrapped(msg.sender, amount);
        emit ReservesUpdated(totalReserves);
    }

    /**
     * @dev Unwrap MonayUSD to get back USDC
     * @param amount Amount of MonayUSD to unwrap
     */
    function unwrapUSDC(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();

        // Check user has sufficient MonayUSD balance
        if (balanceOf(msg.sender) < amount) revert InsufficientMonayUSDBalance();

        // Burn MonayUSD from user
        _burn(msg.sender, amount);

        // Transfer equivalent USDC back to user
        bool success = USDC.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();

        // Update reserves
        totalReserves -= amount;
        userReserves[msg.sender] -= amount;

        emit USDCUnwrapped(msg.sender, amount);
        emit ReservesUpdated(totalReserves);
    }

    /**
     * @dev Mint new MonayUSD (only for authorized minters)
     * This will be used in Phase 3 when transitioning to direct USD backing
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burn MonayUSD (only for authorized treasury)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyRole(TREASURY_ROLE) {
        _burn(from, amount);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Get the USDC reserves backing MonayUSD
     */
    function getReserveRatio() external view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 100;

        uint256 usdcBalance = USDC.balanceOf(address(this));
        return (usdcBalance * 100) / supply;
    }

    /**
     * @dev Emergency withdraw USDC (only admin)
     * This should only be used in emergency situations
     */
    function emergencyWithdrawUSDC(address to, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(to != address(0), "Invalid recipient");
        bool success = USDC.transfer(to, amount);
        require(success, "Transfer failed");
    }

    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}

/**
 * @dev Interface for USDC (or any ERC20 token)
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}