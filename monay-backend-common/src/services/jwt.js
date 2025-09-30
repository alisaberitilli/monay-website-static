import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export default {
  createToken(payload) {
    console.log('JWT Service - JWT secret:', config.jwtSecret);
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpireIn,
    });
  },
  verifyToken(token) {
    return jwt.verify(token, config.jwtSecret, {
      expiresIn: config.jwtExpireIn,
    });
  },
  decodeToken(token) {
    return jwt.decode(token, {
      complete: true,
    });
  },
};
