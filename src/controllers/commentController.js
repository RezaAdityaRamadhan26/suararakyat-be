import { 
    getCommentsByReportId, 
    getCommentById, 
    createComment, 
    deleteComment, 
    isCommentOwner 
} from '../models/commentModels.js';

export const getReportComments = async (req, res) => {
    try {
        const comments = await getCommentsByReportId(req.params.reportId);
        
        res.json({
            success: true,
            message: 'Berhasil mengambil komentar.',
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const addComment = async (req, res) => {
    try {
        const { body, public_report_id } = req.body;
        const user_id = req.user.id;

        if (!body || !public_report_id) {
            return res.status(400).json({
                success: false,
                message: 'Body dan public_report_id wajib diisi.'
            });
        }

        await createComment(body, user_id, public_report_id);
        
        res.status(201).json({
            success: true,
            message: 'Komentar berhasil ditambahkan.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const removeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await getCommentById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Komentar tidak ditemukan.'
            });
        }

        if (userRole === 'user') {
            const isOwner = await isCommentOwner(commentId, userId);
            
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Akses ditolak. Anda hanya bisa menghapus komentar Anda sendiri.'
                });
            }
        }

        await deleteComment(commentId);
        
        res.json({
            success: true,
            message: 'Komentar berhasil dihapus.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};
