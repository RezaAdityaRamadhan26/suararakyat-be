import bcrypt from 'bcryptjs';
import { 
    getAllUsers, 
    findUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    findUserByUsername 
} from '../models/userModels.js';

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        
        res.json({
            success: true,
            message: 'Berhasil mengambil data pengguna.',
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan.'
            });
        }
        
        delete user.password;
        
        res.json({
            success: true,
            message: 'Berhasil mengambil data pengguna.',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const createNewUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, dan role wajib diisi.'
            });
        }

        const existingUser = await findUserByUsername(username);
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await createUser(username, email, hashedPassword, role);

        res.status(201).json({
            success: true,
            message: 'Pengguna berhasil dibuat.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const updateExistingUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const id = req.params.id;

        const user = await findUserById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan.'
            });
        }

        let hashedPassword = null;
        
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await updateUser(
            id,
            username || user.username,
            email || user.email,
            hashedPassword,
            role || user.role
        );

        res.json({
            success: true,
            message: 'Data pengguna berhasil diperbarui.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const removeUser = async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan.'
            });
        }

        // Cegah pengguna menghapus akun mereka sendiri yang sedang aktif
        if (req.user && req.user.id.toString() === req.params.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Anda tidak dapat menghapus akun Anda sendiri.'
            });
        }

        await deleteUser(req.params.id);
        
        res.json({
            success: true,
            message: 'Pengguna berhasil dihapus.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};
