import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
    findUserByUsername, 
    findUserByEmail,
    createUser, 
    findUserById, 
    updateUser 
} from '../models/userModels.js';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, dan password wajib diisi.'
            });
        }

        // Validasi format email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Format email tidak valid.'
            });
        }

        // Cek duplikasi username
        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan.'
            });
        }

        // Cek duplikasi email
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah digunakan.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, email, hashedPassword, 'user');

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil. Silakan login.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi.'
            });
        }

        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah.'
            });
        }

        let isMatch = false;

        // Fallback backward compatibility untuk dummy data yang password-nya plain-text
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (password === user.password);
            
            // Opsional: Langsung ubah ke format bcrypt di DB (auto-upgrade) jika berhasil login dengan plain-text
            if (isMatch) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await updateUser(user.id, user.username, user.email, hashedPassword, user.role);
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah.'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login berhasil.',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server.',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, password } = req.body;

        const currentUser = await findUserById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        // Cek duplikasi username (jika diubah)
        if (username && username !== currentUser.username) {
            const existing = await findUserByUsername(username);
            if (existing) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh pengguna lain' });
            }
        }

        // Cek duplikasi email (jika diubah)
        if (email && email !== currentUser.email) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
            }
            const existingEmail = await findUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh pengguna lain' });
            }
        }

        const targetUsername = username || currentUser.username;
        const targetEmail = email || currentUser.email;
        let targetPassword = null;

        if (password) {
            targetPassword = await bcrypt.hash(password, 10);
        }

        await updateUser(userId, targetUsername, targetEmail, targetPassword, currentUser.role);

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: {
                id: userId,
                username: targetUsername,
                email: targetEmail,
                role: currentUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};
