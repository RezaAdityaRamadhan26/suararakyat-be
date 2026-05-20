import express from 'express';
import { 
    getReports, 
    getReportDetail, 
    createNewReport, 
    editReport,
    updateStatus, 
    removeReport 
} from '../controllers/reportController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getReports);

router.get('/:id', getReportDetail);

router.post('/', authenticate, upload.single('image'), createNewReport);

router.put(
    '/:id',
    authenticate,
    upload.single('image'),
    editReport
);

router.put(
    '/:id/status',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    updateStatus
);

router.delete('/:id', authenticate, removeReport);

export default router;
