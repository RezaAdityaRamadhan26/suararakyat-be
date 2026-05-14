import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../models/categoryModels.js';

export const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        
        res.json({
            success: true,
            message: 'Berhasil mengambil daftar kategori.',
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const createNewCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        
        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: 'Nama kategori wajib diisi.'
            });
        }
        
        await createCategory(category_name);
        
        res.status(201).json({
            success: true,
            message: 'Kategori berhasil dibuat.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const updateExistingCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        
        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: 'Nama kategori wajib diisi.'
            });
        }

        const category = await getCategoryById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori tidak ditemukan.'
            });
        }

        await updateCategory(req.params.id, category_name);
        
        res.json({
            success: true,
            message: 'Kategori berhasil diperbarui.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const removeCategory = async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori tidak ditemukan.'
            });
        }

        await deleteCategory(req.params.id);
        
        res.json({
            success: true,
            message: 'Kategori berhasil dihapus.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};
