import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';
import validations from '../validations';
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

export default router;
