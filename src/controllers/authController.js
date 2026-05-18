import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, createUser, findUserById, updateUser } from '../models/userModels.js';

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi.'
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
        
        await createUser(username, hashedPassword, 'user');

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

        const isMatch = await bcrypt.compare(password, user.password);
        
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
            { 
                expiresIn: '1d' 
            }
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
        const { username, password } = req.body;

        const currentUser = await findUserById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        if (username && username !== currentUser.username) {
            const existing = await findUserByUsername(username);
            if (existing) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh pengguna lain' });
            }
        }

        const targetUsername = username || currentUser.username;
        let targetPassword = null;

        if (password) {
            targetPassword = await bcrypt.hash(password, 10);
        }

        await updateUser(userId, targetUsername, targetPassword, currentUser.role);

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: {
                id: userId,
                username: targetUsername,
                role: currentUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
    }
};
