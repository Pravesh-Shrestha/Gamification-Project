import { Request, Response, NextFunction } from 'express';
const jwt: any = require('jsonwebtoken');
import { UnauthorizedError } from '../errors/AppError';
import { UserRole } from './rbac';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: UserRole;
    name: string;
    schoolId: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
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

/**
 * Optional authentication middleware
 * Attempts to verify token but doesn't fail if missing
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Silently continue if token verification fails
    next();
  }
};
