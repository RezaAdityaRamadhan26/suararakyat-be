import express from 'express';
import { 
    getReportComments, 
    addComment, 
    editComment,
    removeComment 
} from '../controllers/commentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/report/:reportId', getReportComments);

router.post('/', authenticate, addComment);

router.put('/:id', authenticate, editComment);

router.delete('/:id', authenticate, removeComment);

export default router;
