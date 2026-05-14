import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan atau format salah.'
            });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token tidak valid atau sudah kadaluarsa.'
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda tidak memiliki izin untuk resource ini.'
            });
        }
        
        next();
    };
};
