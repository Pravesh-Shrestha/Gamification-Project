import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  MASTER = 'master',
}

export type AllowedRoles = UserRole | UserRole[];

export interface RBACRequest extends Request {
  user?: {
    sub: string;
    role: UserRole;
    name: string;
    schoolId: string;
  };
}

/**
 * RBAC Middleware: Check if user has required role(s)
 * @param allowedRoles - Single role or array of roles that are allowed
 */
export const rbacMiddleware = (allowedRoles: AllowedRoles) => {
  return (req: RBACRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Required roles [${rolesArray.join(', ')}], but user has role [${req.user.role}]`,
      });
    }

    next();
  };
};

/**
 * Permission checker for specific resource ownership
 * Checks if the user is accessing their own resource or is an admin
 */
export const checkResourceOwnership = (req: RBACRequest, resourceOwnerId: string): boolean => {
  if (!req.user) return false;
  if (req.user.role === UserRole.ADMIN) return true; // Admins can access anything
  return req.user.sub === resourceOwnerId;
};
