import { Request, Response, NextFunction } from 'express';
import { masterService } from '../services/MasterService';

export class MasterController {
  static async createSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await masterService.createSchool(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: schoolId } = req.params;
      const license = await masterService.createLicense(schoolId, req.body);
      res.status(201).json({ success: true, data: license });
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: schoolId } = req.params;
      const user = await masterService.createAdmin(schoolId, req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
