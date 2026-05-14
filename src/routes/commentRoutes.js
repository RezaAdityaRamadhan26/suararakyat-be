import express from 'express';
import { 
    getReportComments, 
    addComment, 
    removeComment 
} from '../controllers/commentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/report/:reportId', getReportComments);

router.post(
    '/', 
    authenticate, 
    addComment
);

router.delete(
    '/:id', 
    authenticate, 
    removeComment
);

export default router;
