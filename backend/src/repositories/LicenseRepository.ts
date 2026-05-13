import License from '../models/License';
import { ILicense } from '../types';
import { NotFoundError } from '../errors/AppError';

export class LicenseRepository {
  async create(data: Partial<ILicense>): Promise<ILicense> {
    const doc = await License.create(data);
    return doc.toObject();
  }

  async findById(id: string): Promise<ILicense | null> {
    return License.findById(id).lean();
  }

  async findBySchool(schoolId: string): Promise<ILicense | null> {
    return License.findOne({ schoolId }).lean();
  }

  async update(id: string, updateData: Partial<ILicense>): Promise<ILicense> {
    const lic = await License.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!lic) throw new NotFoundError('License');
    return lic;
  }
}
