import { 
    getCommentsByReportId, 
    getCommentById, 
    createComment, 
    updateComment,
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

export const editComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const { body } = req.body;

        if (!body || !body.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Isi komentar tidak boleh kosong.'
            });
        }

        const comment = await getCommentById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Komentar tidak ditemukan.'
            });
        }

        // Cek kepemilikan
        if (comment.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda hanya bisa mengedit komentar Anda sendiri.'
            });
        }

        // Cek batas waktu 5 menit
        const createdAt = new Date(comment.created_at);
        const now = new Date();
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 5) {
            return res.status(403).json({
                success: false,
                message: 'Batas waktu edit komentar (5 menit) telah terlewat.'
            });
        }

        await updateComment(commentId, body.trim());

        res.json({
            success: true,
            message: 'Komentar berhasil diperbarui.'
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
