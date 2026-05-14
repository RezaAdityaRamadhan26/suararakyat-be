import express from 'express';
import { 
    getCategories, 
    createNewCategory, 
    updateExistingCategory, 
    removeCategory 
} from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCategories);

router.post(
    '/', 
    authenticate, 
    authorizeRoles('admin', 'super_admin'), 
    createNewCategory
);

router.put(
    '/:id', 
    authenticate, 
    authorizeRoles('admin', 'super_admin'), 
    updateExistingCategory
);

router.delete(
    '/:id', 
    authenticate, 
    authorizeRoles('admin', 'super_admin'), 
    removeCategory
);

export default router;
