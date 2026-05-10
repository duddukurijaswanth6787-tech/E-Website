import { Request, Response, NextFunction } from 'express';
import { boutiqueService } from './boutique.service';
import { sendSuccess, sendCreated } from '../../common/responses';

export class BoutiqueController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await boutiqueService.registerBoutique(req.body);
      sendCreated(res, result, 'Boutique created successfully');
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const boutiques = await boutiqueService.getAllBoutiques();
      sendSuccess(res, boutiques, 'Boutiques retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const boutique = await boutiqueService.getBoutiqueDetails(req.params.id as string);
      sendSuccess(res, boutique, 'Boutique details retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const boutiqueController = new BoutiqueController();
