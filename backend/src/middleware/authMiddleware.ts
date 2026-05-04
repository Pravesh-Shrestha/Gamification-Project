import { Request, Response, NextFunction } from 'express';
const jwt: any = require('jsonwebtoken');
import { UnauthorizedError } from '../errors/AppError';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    schoolId: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ success: false, message: error.message });
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
