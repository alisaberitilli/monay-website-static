import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import db from '../models/index.js';
const { User } = db;

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token is missing'
        });
    }

    try {
        const decoded = jwt.verify(token, config.app.jwtAccessSecret);
        req.user = decoded;

        // Verify user exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

export default authenticateToken;
export { authenticateToken };
