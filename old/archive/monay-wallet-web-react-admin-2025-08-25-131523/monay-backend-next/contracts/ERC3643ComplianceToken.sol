// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tokenysolutions/t-rex/contracts/token/Token.sol";
import "@tokenysolutions/t-rex/contracts/compliance/modular/ModularCompliance.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MonayComplianceToken
 * @dev ERC-3643 compliant token with integrated business rules
 */
contract MonayComplianceToken is Token, AccessControl, ReentrancyGuard {
    bytes32 public constant BUSINESS_RULE_MANAGER = keccak256("BUSINESS_RULE_MANAGER");
    bytes32 public constant KYC_PROVIDER = keccak256("KYC_PROVIDER");
    bytes32 public constant SPEND_MANAGER = keccak256("SPEND_MANAGER");
    
    struct BusinessRule {
        uint256 id;
        string name;
        bool isActive;
        uint256 priority;
        bytes32 category; // KYC_ELIGIBILITY, SPEND_MANAGEMENT, etc.
        bytes conditions; // Encoded rule conditions
        bytes actions; // Encoded rule actions
    }
    
    struct SpendLimit {
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 transactionLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastResetDay;
        uint256 lastResetMonth;
        bool isActive;
    }
    
    struct KYCData {
        uint8 kycLevel; // 0=None, 1=Basic, 2=Enhanced, 3=Premium
        bool isVerified;
        uint256 verifiedAt;
        uint256 expiresAt;
        bytes32 provider;
        uint8 riskScore; // 0-100
    }
    
    // Mappings
    mapping(uint256 => BusinessRule) public businessRules;
    mapping(address => uint256[]) public userBusinessRules;
    mapping(address => SpendLimit) public spendLimits;
    mapping(address => KYCData) public kycData;
    mapping(bytes32 => bool) public supportedCountries;
    mapping(bytes32 => bool) public restrictedCountries;
    
    // Counters
    uint256 public nextRuleId = 1;
    
    // Events
    event BusinessRuleCreated(uint256 indexed ruleId, string name, bytes32 category);
    event BusinessRuleAssigned(address indexed user, uint256 indexed ruleId);
    event SpendLimitUpdated(address indexed user, uint256 daily, uint256 monthly, uint256 transaction);
    event KYCDataUpdated(address indexed user, uint8 level, bool verified);
    event RuleViolation(address indexed user, uint256 indexed ruleId, string reason);
    event TransactionBlocked(address indexed user, uint256 amount, string reason);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _identityRegistry,
        address _compliance
    ) Token(_identityRegistry, _compliance, _name, _symbol, _decimals, address(0)) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BUSINESS_RULE_MANAGER, msg.sender);
        _grantRole(KYC_PROVIDER, msg.sender);
        _grantRole(SPEND_MANAGER, msg.sender);
    }
    
    /**
     * @dev Create a new business rule
     */
    function createBusinessRule(
        string memory _name,
        bytes32 _category,
        uint256 _priority,
        bytes memory _conditions,
        bytes memory _actions
    ) external onlyRole(BUSINESS_RULE_MANAGER) returns (uint256) {
        uint256 ruleId = nextRuleId++;
        
        businessRules[ruleId] = BusinessRule({
            id: ruleId,
            name: _name,
            isActive: true,
            priority: _priority,
            category: _category,
            conditions: _conditions,
            actions: _actions
        });
        
        emit BusinessRuleCreated(ruleId, _name, _category);
        return ruleId;
    }
    
    /**
     * @dev Assign business rule to user
     */
    function assignRuleToUser(
        address _user, 
        uint256 _ruleId
    ) external onlyRole(BUSINESS_RULE_MANAGER) {
        require(businessRules[_ruleId].id != 0, "Rule does not exist");
        require(businessRules[_ruleId].isActive, "Rule is not active");
        
        userBusinessRules[_user].push(_ruleId);
        emit BusinessRuleAssigned(_user, _ruleId);
    }
    
    /**
     * @dev Update KYC data for user
     */
    function updateKYCData(
        address _user,
        uint8 _kycLevel,
        bool _isVerified,
        uint256 _expiresAt,
        bytes32 _provider,
        uint8 _riskScore
    ) external onlyRole(KYC_PROVIDER) {
        kycData[_user] = KYCData({
            kycLevel: _kycLevel,
            isVerified: _isVerified,
            verifiedAt: block.timestamp,
            expiresAt: _expiresAt,
            provider: _provider,
            riskScore: _riskScore
        });
        
        emit KYCDataUpdated(_user, _kycLevel, _isVerified);
    }
    
    /**
     * @dev Set spend limits for user
     */
    function setSpendLimits(
        address _user,
        uint256 _dailyLimit,
        uint256 _monthlyLimit,
        uint256 _transactionLimit
    ) external onlyRole(SPEND_MANAGER) {
        spendLimits[_user] = SpendLimit({
            dailyLimit: _dailyLimit,
            monthlyLimit: _monthlyLimit,
            transactionLimit: _transactionLimit,
            dailySpent: 0,
            monthlySpent: 0,
            lastResetDay: block.timestamp / 1 days,
            lastResetMonth: block.timestamp / 30 days,
            isActive: true
        });
        
        emit SpendLimitUpdated(_user, _dailyLimit, _monthlyLimit, _transactionLimit);
    }
    
    /**
     * @dev Enhanced transfer function with business rules
     */
    function transferWithRules(
        address _to,
        uint256 _amount
    ) external nonReentrant returns (bool) {
        // Check KYC eligibility
        require(checkKYCEligibility(msg.sender), "KYC requirements not met");
        require(checkKYCEligibility(_to), "Recipient KYC requirements not met");
        
        // Check spend limits
        require(checkSpendLimits(msg.sender, _amount), "Spend limits exceeded");
        
        // Check geographic restrictions
        require(checkGeographicRestrictions(msg.sender), "Geographic restrictions");
        
        // Execute business rules
        require(executeBusinessRules(msg.sender, _to, _amount), "Business rule violation");
        
        // Update spend tracking
        updateSpendTracking(msg.sender, _amount);
        
        // Execute transfer
        return transfer(_to, _amount);
    }
    
    /**
     * @dev Check KYC eligibility
     */
    function checkKYCEligibility(address _user) public view returns (bool) {
        KYCData memory kyc = kycData[_user];
        
        if (!kyc.isVerified) return false;
        if (kyc.expiresAt > 0 && kyc.expiresAt < block.timestamp) return false;
        if (kyc.riskScore > 80) return false; // High risk threshold
        
        return true;
    }
    
    /**
     * @dev Check spend limits
     */
    function checkSpendLimits(address _user, uint256 _amount) public view returns (bool) {
        SpendLimit memory limits = spendLimits[_user];
        
        if (!limits.isActive) return true;
        
        // Check transaction limit
        if (_amount > limits.transactionLimit) return false;
        
        // Check daily limit
        uint256 currentDay = block.timestamp / 1 days;
        uint256 dailySpent = limits.dailySpent;
        if (currentDay > limits.lastResetDay) dailySpent = 0;
        if (dailySpent + _amount > limits.dailyLimit) return false;
        
        // Check monthly limit
        uint256 currentMonth = block.timestamp / 30 days;
        uint256 monthlySpent = limits.monthlySpent;
        if (currentMonth > limits.lastResetMonth) monthlySpent = 0;
        if (monthlySpent + _amount > limits.monthlyLimit) return false;
        
        return true;
    }
    
    /**
     * @dev Execute business rules for user
     */
    function executeBusinessRules(
        address _from,
        address _to,
        uint256 _amount
    ) internal returns (bool) {
        uint256[] memory rules = userBusinessRules[_from];
        
        for (uint i = 0; i < rules.length; i++) {
            BusinessRule memory rule = businessRules[rules[i]];
            if (!rule.isActive) continue;
            
            // Execute rule logic (simplified)
            bool ruleResult = evaluateRule(rule, _from, _to, _amount);
            if (!ruleResult) {
                emit RuleViolation(_from, rules[i], "Rule condition not met");
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Evaluate individual rule (simplified version)
     */
    function evaluateRule(
        BusinessRule memory _rule,
        address _from,
        address _to,
        uint256 _amount
    ) internal pure returns (bool) {
        // This would contain the actual rule evaluation logic
        // For now, returning true as placeholder
        return true;
    }
    
    /**
     * @dev Update spend tracking
     */
    function updateSpendTracking(address _user, uint256 _amount) internal {
        SpendLimit storage limits = spendLimits[_user];
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;
        
        // Reset daily if new day
        if (currentDay > limits.lastResetDay) {
            limits.dailySpent = 0;
            limits.lastResetDay = currentDay;
        }
        
        // Reset monthly if new month
        if (currentMonth > limits.lastResetMonth) {
            limits.monthlySpent = 0;
            limits.lastResetMonth = currentMonth;
        }
        
        limits.dailySpent += _amount;
        limits.monthlySpent += _amount;
    }
    
    /**
     * @dev Check geographic restrictions
     */
    function checkGeographicRestrictions(address _user) internal view returns (bool) {
        // This would integrate with identity registry to check user's country
        // For now, returning true as placeholder
        return true;
    }
    
    /**
     * @dev Get user's business rules
     */
    function getUserBusinessRules(address _user) external view returns (uint256[] memory) {
        return userBusinessRules[_user];
    }
    
    /**
     * @dev Get business rule details
     */
    function getBusinessRule(uint256 _ruleId) external view returns (BusinessRule memory) {
        return businessRules[_ruleId];
    }
}