import bcrypt from 'bcryptjs';
// use require to avoid missing type declarations at runtime in dev
const jwt: any = require('jsonwebtoken');
import { UserRepository } from '../repositories/UserRepository';
import { StudentRepository } from '../repositories/StudentRepository';
import { NotFoundError, UnauthorizedError } from '../errors/AppError';

const userRepo = new UserRepository();
const studentRepo = new StudentRepository();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';

function mapUserRoleToRbacRole(role?: string) {
  switch (role) {
    case 'superadmin':
      return 'master';
    case 'school_admin':
      return 'admin';
    case 'staff':
      return 'teacher';
    case 'student':
    default:
      return 'student';
  }
}

export class AuthService {
  async loginWithEmail(email: string, password: string) {
    // Try users first (admins/staff) — include password when checking users
    let user = await userRepo.findByEmailWithPassword(email);

    // If not found, try students (include password)
    let isStudent = false;
    if (!user) {
      const student = await studentRepo.findByEmailWithPassword(email);
      if (!student) throw new NotFoundError('User');
      user = student as any;
      isStudent = true;
    }

    const stored = (user as any).password;
    if (!stored) throw new UnauthorizedError('No password set for this account');

    const passwordMatches = await bcrypt.compare(password, stored).catch(() => false);
    // Fallback to plain compare in dev if bcrypt doesn't match (seed data)
    const ok = passwordMatches || password === stored;
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    const rbacRole = mapUserRoleToRbacRole((user as any).role);

    const token = jwt.sign(
      { sub: (user as any)._id, role: rbacRole, name: (user as any).name, schoolId: (user as any).schoolId },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return { token, user: { id: (user as any)._id, name: (user as any).name, role: rbacRole } };
  }

  async loginWithExternalId(externalId: string) {
    const user = await userRepo.findByExternalId(externalId);
    if (!user) throw new NotFoundError('User by externalId');

    const rbacRole = mapUserRoleToRbacRole((user as any).role);

    const token = jwt.sign(
      { sub: (user as any)._id, role: rbacRole, name: (user as any).name, schoolId: (user as any).schoolId },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return { token, user: { id: (user as any)._id, name: (user as any).name, role: rbacRole } };
  }
}

export const authService = new AuthService();
