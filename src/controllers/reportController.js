import fs from 'fs';
import path from 'path';
import { 
    getAllReports, 
    getReportById, 
    createReport, 
    updateReport,
    updateReportStatus, 
    deleteReport, 
    isReportOwner 
} from '../models/reportModels.js';

export const getReports = async (req, res) => {
    try {
        const reports = await getAllReports();
        res.json({
            success: true,
            message: 'Berhasil mengambil daftar laporan.',
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const getReportDetail = async (req, res) => {
    try {
        const report = await getReportById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Laporan tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            message: 'Berhasil mengambil detail laporan.',
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const createNewReport = async (req, res) => {
    try {
        const { header, body, category_id } = req.body;
        const user_id = req.user.id;

        if (!header || !body || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Header, body, dan category_id wajib diisi.'
            });
        }

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        await createReport(header, body, user_id, category_id, imagePath);

        res.status(201).json({
            success: true,
            message: 'Laporan berhasil dibuat.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const editReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user.id;
        const { header, body, category_id } = req.body;

        if (!header || !body || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Header, body, dan category_id wajib diisi.'
            });
        }

        const report = await getReportById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Laporan tidak ditemukan.'
            });
        }

        // Hanya pemilik laporan yang bisa mengedit
        if (report.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda hanya bisa mengedit laporan Anda sendiri.'
            });
        }

        // Status harus masih 'pending'
        if (report.status !== 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Laporan hanya dapat diedit selama status masih pending.'
            });
        }

        // Cek batas waktu 5 menit
        const createdAt = new Date(report.created_at);
        const now = new Date();
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 5) {
            return res.status(403).json({
                success: false,
                message: 'Batas waktu edit laporan (5 menit setelah dibuat) telah terlewat.'
            });
        }

        // Cek batas maksimal 2 kali edit
        const editCount = report.edit_count || 0;
        if (editCount >= 2) {
            return res.status(403).json({
                success: false,
                message: 'Laporan sudah mencapai batas maksimal edit (2 kali).'
            });
        }

        // Tangani upload gambar baru (opsional)
        let newImagePath = undefined; // undefined = tidak ubah gambar
        if (req.file) {
            // Hapus gambar lama jika ada
            if (report.image) {
                const oldImagePath = path.join(process.cwd(), report.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            newImagePath = `/uploads/${req.file.filename}`;
        }

        await updateReport(reportId, header, body, category_id, newImagePath);

        res.json({
            success: true,
            message: 'Laporan berhasil diperbarui.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid.'
            });
        }

        const report = await getReportById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Laporan tidak ditemukan.'
            });
        }

        await updateReportStatus(req.params.id, status);

        res.json({
            success: true,
            message: 'Status laporan berhasil diperbarui.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const removeReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const report = await getReportById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Laporan tidak ditemukan.'
            });
        }

        if (userRole === 'user') {
            const isOwner = await isReportOwner(reportId, userId);
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: 'Akses ditolak. Anda hanya bisa menghapus laporan Anda sendiri.'
                });
            }
        }

        if (report.image) {
            const imagePath = path.join(process.cwd(), report.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await deleteReport(reportId);

        res.json({
            success: true,
            message: 'Laporan berhasil dihapus.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};
