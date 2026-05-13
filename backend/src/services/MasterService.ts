import { SchoolRepository } from '../repositories/SchoolRepository';
import { LicenseRepository } from '../repositories/LicenseRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ValidationError, ConflictError, NotFoundError } from '../errors/AppError';

const schoolRepo = new SchoolRepository();
const licenseRepo = new LicenseRepository();
const userRepo = new UserRepository();

function generateExternalId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export class MasterService {
  async createSchool(payload: { name: string; domain?: string; license?: { maxStaff?: number; maxStudents?: number; expiresAt?: Date } }) {
    const { name, domain, license } = payload;
    if (!name) throw new ValidationError('School name is required');

    const school = await schoolRepo.create({ name, domain });

    let createdLicense = null;
    if (license) {
      createdLicense = await licenseRepo.create({ schoolId: (school as any)._id, maxStaff: license.maxStaff ?? 50, maxStudents: license.maxStudents ?? 500, expiresAt: license.expiresAt });
      await schoolRepo.update((school as any)._id, { license: (createdLicense as any)._id });
    }

    return { school, license: createdLicense };
  }

  async createLicense(schoolId: string, payload: { maxStaff?: number; maxStudents?: number; expiresAt?: Date }) {
    if (!schoolId) throw new ValidationError('schoolId is required');

    const school = await schoolRepo.findById(schoolId);
    if (!school) throw new NotFoundError('School');

    const license = await licenseRepo.create({ schoolId, maxStaff: payload.maxStaff ?? 50, maxStudents: payload.maxStudents ?? 500, expiresAt: payload.expiresAt });
    await schoolRepo.update(schoolId, { license: (license as any)._id });

    return license;
  }

  async createAdmin(schoolId: string, payload: { email: string; name: string }) {
    const { email, name } = payload;
    if (!schoolId || !email || !name) throw new ValidationError('schoolId, email and name are required');

    const school = await schoolRepo.findById(schoolId);
    if (!school) throw new NotFoundError('School');

    // enforce license staff limits if a license exists
    const license = school.license ? await licenseRepo.findById((school.license as any).toString()) : null;
    if (license) {
      const users = await userRepo.findAllBySchool(schoolId);
      const staffCount = users.filter((u) => u.role !== 'student').length;
      if (license.maxStaff <= staffCount) {
        throw new ConflictError(`Staff quota exceeded for this school (max ${license.maxStaff})`);
      }
    }

    const externalId = generateExternalId('ADM');

    const user = await userRepo.create({ email, name, role: 'school_admin', schoolId, externalId });

    // attach admin id to school
    const adminIds = Array.isArray(school.adminIds) ? [...(school.adminIds as any), (user as any)._id] : [(user as any)._id];
    await schoolRepo.update(schoolId, { adminIds });

    return user;
  }
}

export const masterService = new MasterService();
