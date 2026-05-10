import { boutiqueRepository } from './boutique.repository';
import { IBoutique } from './boutique.model';
import { AppError } from '../../common/errors';

export class BoutiqueService {
  async registerBoutique(data: Partial<IBoutique>): Promise<IBoutique> {
    const existing = await boutiqueRepository.findByBoutiqueId(data.boutiqueId!);
    if (existing) {
      throw new AppError('Boutique with this ID already exists', 400);
    }
    return await boutiqueRepository.create(data);
  }

  async getAllBoutiques(): Promise<IBoutique[]> {
    return await boutiqueRepository.findAll();
  }

  async getBoutiqueDetails(id: string): Promise<IBoutique> {
    const boutique = await boutiqueRepository.findById(id);
    if (!boutique) {
      throw new AppError('Boutique not found', 404);
    }
    return boutique;
  }
}

export const boutiqueService = new BoutiqueService();
