// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MonayComplianceToken
 * @dev ERC20 token with compliance features for Monay platform
 * Simplified version of ERC-3643 for Base L2 deployment
 */
contract MonayComplianceToken is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Business Rules
    struct BusinessRule {
        uint256 id;
        string name;
        bytes32 category;
        bool isActive;
        uint256 priority;
    }
    
    // Spend Limits
    struct SpendLimit {
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 transactionLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastDayReset;
        uint256 lastMonthReset;
    }
    
    // KYC Data
    struct KYCData {
        uint8 level;
        bool isVerified;
        uint256 verifiedAt;
        uint256 expiresAt;
        uint8 riskScore;
    }
    
    // Compliance
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted;
    mapping(address => KYCData) public kycData;
    mapping(address => SpendLimit) public spendLimits;
    mapping(uint256 => BusinessRule) public businessRules;
    mapping(address => uint256[]) public userBusinessRules;
    
    uint256 public nextRuleId = 1;
    bool public complianceEnabled = true;
    uint8 public requiredKYCLevel = 1;
    
    // Events
    event BusinessRuleCreated(uint256 indexed ruleId, string name, bytes32 category);
    event BusinessRuleAssigned(address indexed user, uint256 indexed ruleId);
    event SpendLimitUpdated(address indexed user, uint256 daily, uint256 monthly, uint256 transaction);
    event KYCDataUpdated(address indexed user, uint8 level, bool verified);
    event UserBlacklisted(address indexed user);
    event UserWhitelisted(address indexed user);
    event ComplianceCheckFailed(address indexed user, string reason);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
    
    // Minting and Burning
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(!blacklisted[to], "Recipient is blacklisted");
        require(kycData[to].isVerified || whitelisted[to], "KYC not verified");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }
    
    // Compliance Functions
    function setComplianceEnabled(bool enabled) public onlyRole(COMPLIANCE_ROLE) {
        complianceEnabled = enabled;
    }
    
    function setRequiredKYCLevel(uint8 level) public onlyRole(COMPLIANCE_ROLE) {
        requiredKYCLevel = level;
    }
    
    function blacklistUser(address user) public onlyRole(COMPLIANCE_ROLE) {
        blacklisted[user] = true;
        emit UserBlacklisted(user);
    }
    
    function removeFromBlacklist(address user) public onlyRole(COMPLIANCE_ROLE) {
        blacklisted[user] = false;
    }
    
    function whitelistUser(address user) public onlyRole(COMPLIANCE_ROLE) {
        whitelisted[user] = true;
        emit UserWhitelisted(user);
    }
    
    function removeFromWhitelist(address user) public onlyRole(COMPLIANCE_ROLE) {
        whitelisted[user] = false;
    }
    
    // KYC Functions
    function updateKYCData(
        address user,
        uint8 level,
        bool verified,
        uint256 expires,
        uint8 risk
    ) public onlyRole(COMPLIANCE_ROLE) {
        kycData[user] = KYCData({
            level: level,
            isVerified: verified,
            verifiedAt: block.timestamp,
            expiresAt: expires,
            riskScore: risk
        });
        
        emit KYCDataUpdated(user, level, verified);
    }
    
    // Spend Limit Functions
    function setSpendLimits(
        address user,
        uint256 daily,
        uint256 monthly,
        uint256 transaction
    ) public onlyRole(COMPLIANCE_ROLE) {
        spendLimits[user] = SpendLimit({
            dailyLimit: daily,
            monthlyLimit: monthly,
            transactionLimit: transaction,
            dailySpent: 0,
            monthlySpent: 0,
            lastDayReset: block.timestamp / 1 days,
            lastMonthReset: block.timestamp / 30 days
        });
        
        emit SpendLimitUpdated(user, daily, monthly, transaction);
    }
    
    // Business Rule Functions
    function createBusinessRule(
        string memory name,
        bytes32 category,
        uint256 priority,
        bytes memory conditions,
        bytes memory actions
    ) public onlyRole(COMPLIANCE_ROLE) returns (uint256) {
        uint256 ruleId = nextRuleId++;
        
        businessRules[ruleId] = BusinessRule({
            id: ruleId,
            name: name,
            category: category,
            isActive: true,
            priority: priority
        });
        
        emit BusinessRuleCreated(ruleId, name, category);
        return ruleId;
    }
    
    function assignRuleToUser(address user, uint256 ruleId) public onlyRole(COMPLIANCE_ROLE) {
        require(businessRules[ruleId].isActive, "Rule is not active");
        userBusinessRules[user].push(ruleId);
        emit BusinessRuleAssigned(user, ruleId);
    }
    
    // Transfer with compliance checks
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        if (from == address(0) || to == address(0)) {
            // Minting or burning - proceed with base implementation
            super._update(from, to, amount);
            return;
        }
        
        if (complianceEnabled) {
            require(!blacklisted[from], "Sender is blacklisted");
            require(!blacklisted[to], "Recipient is blacklisted");
            
            // Check KYC
            if (!whitelisted[from]) {
                require(kycData[from].isVerified, "Sender KYC not verified");
                require(kycData[from].level >= requiredKYCLevel, "Sender KYC level insufficient");
                require(kycData[from].expiresAt == 0 || kycData[from].expiresAt > block.timestamp, "Sender KYC expired");
            }
            
            if (!whitelisted[to]) {
                require(kycData[to].isVerified, "Recipient KYC not verified");
                require(kycData[to].level >= requiredKYCLevel, "Recipient KYC level insufficient");
                require(kycData[to].expiresAt == 0 || kycData[to].expiresAt > block.timestamp, "Recipient KYC expired");
            }
            
            // Check spend limits
            _checkSpendLimits(from, amount);
        }
        
        super._update(from, to, amount);
    }
    
    function _checkSpendLimits(address user, uint256 amount) internal {
        SpendLimit storage limits = spendLimits[user];
        
        if (limits.dailyLimit > 0 || limits.monthlyLimit > 0 || limits.transactionLimit > 0) {
            uint256 currentDay = block.timestamp / 1 days;
            uint256 currentMonth = block.timestamp / 30 days;
            
            // Reset daily counter if new day
            if (currentDay > limits.lastDayReset) {
                limits.dailySpent = 0;
                limits.lastDayReset = currentDay;
            }
            
            // Reset monthly counter if new month
            if (currentMonth > limits.lastMonthReset) {
                limits.monthlySpent = 0;
                limits.lastMonthReset = currentMonth;
            }
            
            // Check limits
            if (limits.transactionLimit > 0) {
                require(amount <= limits.transactionLimit, "Transaction limit exceeded");
            }
            
            if (limits.dailyLimit > 0) {
                require(limits.dailySpent + amount <= limits.dailyLimit, "Daily limit exceeded");
                limits.dailySpent += amount;
            }
            
            if (limits.monthlyLimit > 0) {
                require(limits.monthlySpent + amount <= limits.monthlyLimit, "Monthly limit exceeded");
                limits.monthlySpent += amount;
            }
        }
    }
    
    // Pausable functions
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}