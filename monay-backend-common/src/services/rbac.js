import crypto from 'crypto';
import { EventEmitter } from 'events';

class RBACService extends EventEmitter {
  constructor() {
    super();
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.resourcePermissions = new Map();
    this.policies = new Map();
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default system roles and permissions
   */
  initializeDefaultRoles() {
    // Define permissions
    const permissions = [
      // Wallet permissions
      { id: 'wallet:create', name: 'Create Wallet', category: 'Wallet' },
      { id: 'wallet:read', name: 'View Wallet', category: 'Wallet' },
      { id: 'wallet:update', name: 'Update Wallet', category: 'Wallet' },
      { id: 'wallet:delete', name: 'Delete Wallet', category: 'Wallet' },
      { id: 'wallet:transfer', name: 'Transfer from Wallet', category: 'Wallet' },

      // Transaction permissions
      { id: 'transaction:create', name: 'Create Transaction', category: 'Transaction' },
      { id: 'transaction:read', name: 'View Transaction', category: 'Transaction' },
      { id: 'transaction:approve', name: 'Approve Transaction', category: 'Transaction' },
      { id: 'transaction:cancel', name: 'Cancel Transaction', category: 'Transaction' },

      // User permissions
      { id: 'user:create', name: 'Create User', category: 'User' },
      { id: 'user:read', name: 'View User', category: 'User' },
      { id: 'user:update', name: 'Update User', category: 'User' },
      { id: 'user:delete', name: 'Delete User', category: 'User' },
      { id: 'user:suspend', name: 'Suspend User', category: 'User' },

      // Role permissions
      { id: 'role:create', name: 'Create Role', category: 'Role' },
      { id: 'role:read', name: 'View Role', category: 'Role' },
      { id: 'role:update', name: 'Update Role', category: 'Role' },
      { id: 'role:delete', name: 'Delete Role', category: 'Role' },
      { id: 'role:assign', name: 'Assign Role', category: 'Role' },

      // Compliance permissions
      { id: 'compliance:view', name: 'View Compliance', category: 'Compliance' },
      { id: 'compliance:approve', name: 'Approve Compliance', category: 'Compliance' },
      { id: 'compliance:override', name: 'Override Compliance', category: 'Compliance' },
      { id: 'compliance:export', name: 'Export Compliance', category: 'Compliance' },

      // Analytics permissions
      { id: 'analytics:view', name: 'View Analytics', category: 'Analytics' },
      { id: 'analytics:export', name: 'Export Analytics', category: 'Analytics' },
      { id: 'analytics:configure', name: 'Configure Analytics', category: 'Analytics' },

      // System permissions
      { id: 'system:configure', name: 'Configure System', category: 'System' },
      { id: 'system:audit', name: 'View Audit Logs', category: 'System' },
      { id: 'system:backup', name: 'Backup System', category: 'System' },
      { id: 'system:restore', name: 'Restore System', category: 'System' },

      // API permissions
      { id: 'api:create', name: 'Create API Key', category: 'API' },
      { id: 'api:read', name: 'View API Keys', category: 'API' },
      { id: 'api:revoke', name: 'Revoke API Key', category: 'API' },

      // Webhook permissions
      { id: 'webhook:create', name: 'Create Webhook', category: 'Webhook' },
      { id: 'webhook:read', name: 'View Webhooks', category: 'Webhook' },
      { id: 'webhook:update', name: 'Update Webhook', category: 'Webhook' },
      { id: 'webhook:delete', name: 'Delete Webhook', category: 'Webhook' },

      // Export permissions
      { id: 'export:create', name: 'Create Export', category: 'Export' },
      { id: 'export:read', name: 'View Exports', category: 'Export' },
      { id: 'export:download', name: 'Download Export', category: 'Export' },
      { id: 'export:schedule', name: 'Schedule Export', category: 'Export' }
    ];

    // Store permissions
    permissions.forEach(perm => {
      this.permissions.set(perm.id, perm);
    });

    // Define default roles
    const roles = [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: Array.from(this.permissions.keys()),
        isSystem: true,
        priority: 100
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access with most permissions',
        permissions: [
          'wallet:*', 'transaction:*', 'user:*', 'role:read',
          'compliance:*', 'analytics:*', 'system:audit', 'api:*',
          'webhook:*', 'export:*'
        ],
        isSystem: true,
        priority: 90
      },
      {
        id: 'compliance-officer',
        name: 'Compliance Officer',
        description: 'Compliance and regulatory oversight',
        permissions: [
          'wallet:read', 'transaction:read', 'user:read',
          'compliance:*', 'analytics:view', 'analytics:export',
          'system:audit', 'export:*'
        ],
        isSystem: true,
        priority: 80
      },
      {
        id: 'finance-manager',
        name: 'Finance Manager',
        description: 'Financial operations and reporting',
        permissions: [
          'wallet:*', 'transaction:*', 'user:read',
          'analytics:*', 'export:*'
        ],
        isSystem: true,
        priority: 70
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'API and integration access',
        permissions: [
          'wallet:read', 'transaction:read', 'user:read',
          'api:*', 'webhook:*', 'export:read', 'export:download'
        ],
        isSystem: true,
        priority: 60
      },
      {
        id: 'operator',
        name: 'Operator',
        description: 'Day-to-day operations management',
        permissions: [
          'wallet:create', 'wallet:read', 'wallet:update',
          'transaction:create', 'transaction:read',
          'user:read', 'user:update', 'export:create', 'export:read'
        ],
        isSystem: true,
        priority: 50
      },
      {
        id: 'auditor',
        name: 'Auditor',
        description: 'Read-only access for audit purposes',
        permissions: [
          'wallet:read', 'transaction:read', 'user:read',
          'compliance:view', 'analytics:view', 'system:audit',
          'export:read', 'export:download'
        ],
        isSystem: true,
        priority: 40
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Basic read-only access',
        permissions: [
          'wallet:read', 'transaction:read', 'analytics:view'
        ],
        isSystem: true,
        priority: 30
      },
      {
        id: 'user',
        name: 'Standard User',
        description: 'Basic user with limited permissions',
        permissions: [
          'wallet:read', 'transaction:read'
        ],
        isSystem: true,
        priority: 20
      },
      {
        id: 'guest',
        name: 'Guest',
        description: 'Minimal access for guests',
        permissions: [],
        isSystem: true,
        priority: 10
      }
    ];

    // Store roles with expanded permissions
    roles.forEach(role => {
      role.permissions = this.expandWildcardPermissions(role.permissions);
      this.roles.set(role.id, role);
    });
  }

  /**
   * Expand wildcard permissions (e.g., 'wallet:*' -> all wallet permissions)
   */
  expandWildcardPermissions(permissions) {
    const expanded = new Set();

    permissions.forEach(perm => {
      if (perm.includes('*')) {
        const prefix = perm.replace('*', '');
        this.permissions.forEach((_, key) => {
          if (key.startsWith(prefix)) {
            expanded.add(key);
          }
        });
      } else {
        expanded.add(perm);
      }
    });

    return Array.from(expanded);
  }

  /**
   * Create a new role
   */
  async createRole({
    name,
    description,
    permissions,
    priority = 50,
    tenantId
  }) {
    const roleId = crypto.randomUUID();

    const role = {
      id: roleId,
      name,
      description,
      permissions: this.expandWildcardPermissions(permissions),
      isSystem: false,
      priority,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(roleId, role);
    this.emit('role:created', role);

    return role;
  }

  /**
   * Update a role
   */
  async updateRole(roleId, updates) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('System roles cannot be modified');
    }

    if (updates.permissions) {
      updates.permissions = this.expandWildcardPermissions(updates.permissions);
    }

    Object.assign(role, updates, { updatedAt: new Date() });
    this.emit('role:updated', role);

    return role;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('System roles cannot be deleted');
    }

    // Remove role from all users
    this.userRoles.forEach((roles, userId) => {
      const index = roles.indexOf(roleId);
      if (index !== -1) {
        roles.splice(index, 1);
      }
    });

    this.roles.delete(roleId);
    this.emit('role:deleted', roleId);

    return { success: true };
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, roleId) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, []);
    }

    const userRoles = this.userRoles.get(userId);
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
    }

    this.emit('role:assigned', { userId, roleId });

    return { success: true };
  }

  /**
   * Remove role from user
   */
  async removeRole(userId, roleId) {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) {
      return { success: true };
    }

    const index = userRoles.indexOf(roleId);
    if (index !== -1) {
      userRoles.splice(index, 1);
    }

    this.emit('role:removed', { userId, roleId });

    return { success: true };
  }

  /**
   * Get user roles
   */
  getUserRoles(userId) {
    const roleIds = this.userRoles.get(userId) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean);
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId) {
    const permissions = new Set();
    const roles = this.getUserRoles(userId);

    roles.forEach(role => {
      role.permissions.forEach(perm => permissions.add(perm));
    });

    return Array.from(permissions);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission, resource = null) {
    // Check super admin bypass
    const userRoles = this.getUserRoles(userId);
    if (userRoles.some(role => role.id === 'super-admin')) {
      return true;
    }

    // Check regular permissions
    const userPermissions = this.getUserPermissions(userId);

    // Check exact permission
    if (userPermissions.includes(permission)) {
      // If resource specified, check resource-level permissions
      if (resource) {
        return this.hasResourcePermission(userId, permission, resource);
      }
      return true;
    }

    // Check wildcard permissions
    const [category, action] = permission.split(':');
    if (userPermissions.includes(`${category}:*`)) {
      if (resource) {
        return this.hasResourcePermission(userId, `${category}:*`, resource);
      }
      return true;
    }

    return false;
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(userId, permissions, resource = null) {
    return permissions.every(perm => this.hasPermission(userId, perm, resource));
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(userId, permissions, resource = null) {
    return permissions.some(perm => this.hasPermission(userId, perm, resource));
  }

  /**
   * Grant permission to resource
   */
  async grantResourcePermission({
    userId,
    resourceType,
    resourceId,
    permission,
    expiresAt = null
  }) {
    const key = `${resourceType}:${resourceId}`;

    if (!this.resourcePermissions.has(key)) {
      this.resourcePermissions.set(key, new Map());
    }

    const resourcePerms = this.resourcePermissions.get(key);

    if (!resourcePerms.has(userId)) {
      resourcePerms.set(userId, []);
    }

    const userResourcePerms = resourcePerms.get(userId);
    const permEntry = {
      permission,
      grantedAt: new Date(),
      expiresAt
    };

    userResourcePerms.push(permEntry);

    this.emit('resource:permission:granted', {
      userId,
      resourceType,
      resourceId,
      permission
    });

    return { success: true };
  }

  /**
   * Revoke permission from resource
   */
  async revokeResourcePermission({
    userId,
    resourceType,
    resourceId,
    permission
  }) {
    const key = `${resourceType}:${resourceId}`;
    const resourcePerms = this.resourcePermissions.get(key);

    if (!resourcePerms) {
      return { success: true };
    }

    const userResourcePerms = resourcePerms.get(userId);
    if (!userResourcePerms) {
      return { success: true };
    }

    const index = userResourcePerms.findIndex(p => p.permission === permission);
    if (index !== -1) {
      userResourcePerms.splice(index, 1);
    }

    this.emit('resource:permission:revoked', {
      userId,
      resourceType,
      resourceId,
      permission
    });

    return { success: true };
  }

  /**
   * Check resource-level permission
   */
  hasResourcePermission(userId, permission, resource) {
    const key = `${resource.type}:${resource.id}`;
    const resourcePerms = this.resourcePermissions.get(key);

    if (!resourcePerms) {
      return true; // No specific resource permissions, use role permissions
    }

    const userResourcePerms = resourcePerms.get(userId);
    if (!userResourcePerms) {
      return true; // No specific resource permissions for user
    }

    // Check for matching permission
    const now = new Date();
    return userResourcePerms.some(perm => {
      if (perm.permission !== permission) {
        return false;
      }
      if (perm.expiresAt && new Date(perm.expiresAt) < now) {
        return false;
      }
      return true;
    });
  }

  /**
   * Create an access policy
   */
  async createPolicy({
    name,
    description,
    rules,
    effect = 'allow', // 'allow' or 'deny'
    priority = 50
  }) {
    const policyId = crypto.randomUUID();

    const policy = {
      id: policyId,
      name,
      description,
      rules,
      effect,
      priority,
      active: true,
      createdAt: new Date()
    };

    this.policies.set(policyId, policy);
    this.emit('policy:created', policy);

    return policy;
  }

  /**
   * Evaluate policies for access
   */
  evaluatePolicies(userId, action, resource) {
    const policies = Array.from(this.policies.values())
      .filter(p => p.active)
      .sort((a, b) => b.priority - a.priority);

    for (const policy of policies) {
      const matches = this.evaluatePolicyRules(userId, action, resource, policy.rules);

      if (matches) {
        return policy.effect === 'allow';
      }
    }

    // No matching policy, use default permission check
    return this.hasPermission(userId, action, resource);
  }

  /**
   * Evaluate policy rules
   */
  evaluatePolicyRules(userId, action, resource, rules) {
    return rules.every(rule => {
      switch (rule.type) {
        case 'user':
          return this.evaluateUserRule(userId, rule);
        case 'role':
          return this.evaluateRoleRule(userId, rule);
        case 'resource':
          return this.evaluateResourceRule(resource, rule);
        case 'time':
          return this.evaluateTimeRule(rule);
        case 'condition':
          return this.evaluateConditionRule(userId, action, resource, rule);
        default:
          return false;
      }
    });
  }

  /**
   * Evaluate user-based rule
   */
  evaluateUserRule(userId, rule) {
    if (rule.operator === 'equals') {
      return userId === rule.value;
    }
    if (rule.operator === 'in') {
      return rule.value.includes(userId);
    }
    if (rule.operator === 'not_in') {
      return !rule.value.includes(userId);
    }
    return false;
  }

  /**
   * Evaluate role-based rule
   */
  evaluateRoleRule(userId, rule) {
    const userRoles = this.getUserRoles(userId);
    const roleIds = userRoles.map(r => r.id);

    if (rule.operator === 'has') {
      return roleIds.includes(rule.value);
    }
    if (rule.operator === 'has_any') {
      return rule.value.some(r => roleIds.includes(r));
    }
    if (rule.operator === 'has_all') {
      return rule.value.every(r => roleIds.includes(r));
    }
    return false;
  }

  /**
   * Evaluate resource-based rule
   */
  evaluateResourceRule(resource, rule) {
    if (!resource) return false;

    if (rule.field === 'type' && rule.operator === 'equals') {
      return resource.type === rule.value;
    }
    if (rule.field === 'owner' && rule.operator === 'equals') {
      return resource.owner === rule.value;
    }
    if (rule.field === 'status' && rule.operator === 'in') {
      return rule.value.includes(resource.status);
    }
    return false;
  }

  /**
   * Evaluate time-based rule
   */
  evaluateTimeRule(rule) {
    const now = new Date();

    if (rule.operator === 'between') {
      const start = new Date(rule.start);
      const end = new Date(rule.end);
      return now >= start && now <= end;
    }
    if (rule.operator === 'business_hours') {
      const hour = now.getHours();
      const day = now.getDay();
      return hour >= 9 && hour < 17 && day >= 1 && day <= 5;
    }
    return false;
  }

  /**
   * Evaluate custom condition rule
   */
  evaluateConditionRule(userId, action, resource, rule) {
    // Custom condition evaluation logic
    // This can be extended based on specific business requirements
    return true;
  }

  /**
   * Get all roles
   */
  getAllRoles(includeSystem = true) {
    const roles = Array.from(this.roles.values());
    if (!includeSystem) {
      return roles.filter(r => !r.isSystem);
    }
    return roles;
  }

  /**
   * Get all permissions
   */
  getAllPermissions() {
    return Array.from(this.permissions.values());
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(category) {
    return Array.from(this.permissions.values())
      .filter(p => p.category === category);
  }

  /**
   * Clone a role
   */
  async cloneRole(roleId, newName) {
    const sourceRole = this.roles.get(roleId);
    if (!sourceRole) {
      throw new Error('Source role not found');
    }

    return this.createRole({
      name: newName,
      description: `Clone of ${sourceRole.name}`,
      permissions: sourceRole.permissions,
      priority: sourceRole.priority
    });
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy() {
    const roles = Array.from(this.roles.values())
      .sort((a, b) => b.priority - a.priority);

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      priority: role.priority,
      parent: roles.find(r => r.priority > role.priority)?.id || null,
      children: roles.filter(r => r.priority < role.priority).map(r => r.id)
    }));
  }

  /**
   * Audit permission check
   */
  auditPermissionCheck({
    userId,
    permission,
    resource,
    result,
    context
  }) {
    const audit = {
      id: crypto.randomUUID(),
      userId,
      permission,
      resource,
      result,
      context,
      timestamp: new Date()
    };

    this.emit('permission:checked', audit);
    return audit;
  }
}

// Singleton instance
const rbacService = new RBACService();

export default rbacService;