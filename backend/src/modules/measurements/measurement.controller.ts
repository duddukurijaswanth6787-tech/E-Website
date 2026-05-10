import { Request, Response } from 'express';
import { MeasurementProfile } from './measurement.model';
import { AppError } from '../../common/errors';

export const measurementController = {
  getMyProfiles: async (req: Request, res: Response) => {
    const profiles = await MeasurementProfile.find({ userId: (req as any).user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: profiles });
  },

  createProfile: async (req: Request, res: Response) => {
    const { name, category, measurements, notes, isDefault } = req.body;

    if (isDefault) {
      // Unset previous default for this user
      await MeasurementProfile.updateMany(
        { userId: (req as any).user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const profile = await MeasurementProfile.create({
      userId: (req as any).user._id,
      name,
      category,
      measurements,
      notes,
      isDefault
    });

    res.status(201).json({ success: true, data: profile });
  },

  updateProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, measurements, notes, isDefault } = req.body;

    let profile = await MeasurementProfile.findOne({ _id: id, userId: (req as any).user._id });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (isDefault) {
      await MeasurementProfile.updateMany(
        { userId: (req as any).user._id, _id: { $ne: id }, isDefault: true },
        { isDefault: false }
      );
    }

    profile = await MeasurementProfile.findByIdAndUpdate(
      id,
      { name, category, measurements, notes, isDefault },
      { new: true }
    );

    res.status(200).json({ success: true, data: profile });
  },

  deleteProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    const profile = await MeasurementProfile.findOneAndDelete({ _id: id, userId: (req as any).user._id });
    
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    res.status(200).json({ success: true, message: 'Profile deleted successfully' });
  },

  setDefault: async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const profile = await MeasurementProfile.findOne({ _id: id, userId: (req as any).user._id });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    await MeasurementProfile.updateMany(
      { userId: (req as any).user._id, isDefault: true },
      { isDefault: false }
    );

    profile.isDefault = true;
    await profile.save();

    res.status(200).json({ success: true, data: profile });
  },

  duplicateProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    const original = await MeasurementProfile.findOne({ _id: id, userId: (req as any).user._id });
    
    if (!original) {
      throw new AppError('Profile not found', 404);
    }

    const duplicate = await MeasurementProfile.create({
      userId: (req as any).user._id,
      name: `${original.name} (Copy)`,
      category: original.category,
      measurements: original.measurements,
      notes: original.notes,
      isDefault: false
    });

    res.status(201).json({ success: true, data: duplicate });
  }
};
