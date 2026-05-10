import { Boutique, IBoutique } from './boutique.model';

export class BoutiqueRepository {
  async create(data: Partial<IBoutique>): Promise<IBoutique> {
    return await Boutique.create(data);
  }

  async findById(id: string): Promise<IBoutique | null> {
    return await Boutique.findById(id);
  }

  async findByBoutiqueId(boutiqueId: string): Promise<IBoutique | null> {
    return await Boutique.findOne({ boutiqueId });
  }

  async findAll(filter: any = {}): Promise<IBoutique[]> {
    return await Boutique.find(filter).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IBoutique>): Promise<IBoutique | null> {
    return await Boutique.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IBoutique | null> {
    return await Boutique.findByIdAndDelete(id);
  }
}

export const boutiqueRepository = new BoutiqueRepository();
