import { CustomBlouseOption, ICustomBlouseOption } from './customBlouseOption.model';

export const customBlouseOptionService = {
  /**
   * Get all active options grouped by category
   */
  getActiveOptions: async () => {
    const options = await CustomBlouseOption.find({ isActive: true }).sort({ category: 1, order: 1 });
    // Grouping manually for convenience if needed, but returning flat list is standard for API
    return options;
  },

  /**
   * Admin: Get all options (including inactive ones)
   */
  getAllOptions: async () => {
    return await CustomBlouseOption.find().sort({ category: 1, order: 1 });
  },

  /**
   * Admin: Create a new option
   */
  createOption: async (data: Partial<ICustomBlouseOption>) => {
    return await CustomBlouseOption.create(data);
  },

  /**
   * Admin: Update an option
   */
  updateOption: async (id: string, data: Partial<ICustomBlouseOption>) => {
    return await CustomBlouseOption.findByIdAndUpdate(id, data, { new: true });
  },

  /**
   * Admin: Delete an option
   */
  deleteOption: async (id: string) => {
    return await CustomBlouseOption.findByIdAndDelete(id);
  },

  /**
   * Bulk insert for seeding
   */
  bulkInsert: async (options: Partial<ICustomBlouseOption>[]) => {
    return await CustomBlouseOption.insertMany(options);
  }
};
