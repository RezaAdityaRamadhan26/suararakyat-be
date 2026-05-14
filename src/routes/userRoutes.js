import express from 'express';
import { 
    getUsers, 
    getUserById, 
    createNewUser, 
    updateExistingUser, 
    removeUser 
} from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('super_admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createNewUser);
router.put('/:id', updateExistingUser);
router.delete('/:id', removeUser);

export default router;
