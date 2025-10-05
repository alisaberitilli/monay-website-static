import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';
import validations from '../validations/index.js';
const router = Router();

const { roleValidator } = validations;
const { roleController } = controllers;
const { authMiddleware, resourceAccessMiddleware, validateMiddleware, roleMiddleware } = middlewares;

router.post('/admin/role/permission',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    validateMiddleware({
        schema: roleValidator.rolePermissionSchema,
    }),
    roleMiddleware.checkRoleExist,
    roleController.rolePermission
);
router.get('/admin/role/permission',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    roleController.getRolePermission
);

router.get('/admin/role/permission/:roleId',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    roleMiddleware.checkRoleExistById,
    roleController.getRoleDetail
);

// Super Admin role permissions endpoint
router.get('/roles/:role/permissions',
    authMiddleware,
    async (req, res) => {
        try {
            const { role } = req.params;

            // Define permissions for each role
            const rolePermissions = {
                'super_admin': [
                    { id: '1', resource: 'users', action: 'create', granted: true },
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '4', resource: 'users', action: 'delete', granted: true },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '6', resource: 'transactions', action: 'update', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                    { id: '8', resource: 'settings', action: 'update', granted: true },
                ],
                'admin': [
                    { id: '1', resource: 'users', action: 'create', granted: true },
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '4', resource: 'users', action: 'delete', granted: false },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '6', resource: 'transactions', action: 'update', granted: false },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                    { id: '8', resource: 'settings', action: 'update', granted: false },
                ],
                'platform_admin': [
                    { id: '1', resource: 'users', action: 'create', granted: true },
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '4', resource: 'users', action: 'delete', granted: false },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '6', resource: 'transactions', action: 'update', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                    { id: '8', resource: 'settings', action: 'update', granted: true },
                ],
                'consumer': [
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                ],
                'enterprise': [
                    { id: '1', resource: 'users', action: 'create', granted: true },
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                    { id: '8', resource: 'settings', action: 'update', granted: true },
                ],
                'enterprise_admin': [
                    { id: '1', resource: 'users', action: 'create', granted: true },
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '3', resource: 'users', action: 'update', granted: true },
                    { id: '4', resource: 'users', action: 'delete', granted: true },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '6', resource: 'transactions', action: 'update', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                    { id: '8', resource: 'settings', action: 'update', granted: true },
                ],
                'merchant': [
                    { id: '2', resource: 'users', action: 'read', granted: true },
                    { id: '5', resource: 'transactions', action: 'read', granted: true },
                    { id: '7', resource: 'settings', action: 'read', granted: true },
                ]
            };

            const permissions = rolePermissions[role] || [];

            res.json({ success: true, data: permissions });
        } catch (error) {
            console.error('Error fetching role permissions:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch role permissions', error: error.message });
        }
    }
);

export default router;
