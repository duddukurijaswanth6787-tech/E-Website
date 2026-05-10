import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Tailor } from './tailor.model';
import { NotFoundError, BadRequestError } from '../../common/errors';

// Generate Tailor Code
const generateTailorCode = async () => {
  const lastTailor = await Tailor.findOne().sort({ createdAt: -1 });
  if (!lastTailor || !lastTailor.tailorCode) {
    return 'TLR-1001';
  }
  const lastCodeNumber = parseInt(lastTailor.tailorCode.split('-')[1]);
  return `TLR-${lastCodeNumber + 1}`;
};

export const createTailor = async (req: Request, res: Response) => {
  const { name, email, phone, password, specialization, experienceYears, isAvailable, isActive } = req.body;
  const adminId = req.admin!.adminId;

  const existingTailor = await Tailor.findOne({ $or: [{ email }, { phone }] });
  if (existingTailor) {
    throw new BadRequestError('Tailor with this email or phone already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const tailorCode = await generateTailorCode();

  const tailor = await Tailor.create({
    tailorCode,
    name,
    email,
    phone,
    passwordHash,
    specialization,
    experienceYears,
    isAvailable,
    isActive,
    createdBy: adminId,
  });

  const tailorObj = tailor.toObject();

  res.status(201).json({
    status: 'success',
    data: tailorObj,
  });
};

export const getTailors = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { specialization, isActive, isAvailable, search } = req.query;

  const filter: any = {};
  
  if (specialization) filter.specialization = specialization;
  if (isActive !== undefined) filter.isActive = isActive;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { tailorCode: { $regex: search, $options: 'i' } },
    ];
  }

  const tailors = await Tailor.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email');

  const total = await Tailor.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      tailors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getTailorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tailor = await Tailor.findById(id).populate('createdBy updatedBy disabledBy', 'name email');
  
  if (!tailor) {
    throw new NotFoundError('Tailor not found');
  }

  res.status(200).json({
    status: 'success',
    data: tailor,
  });
};

export const updateTailor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin!.adminId;

  const updateData = { ...req.body, updatedBy: adminId };

  // Don't allow password or email/phone updates through this route generally unless specifically handled
  delete updateData.password;

  const tailor = await Tailor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  
  if (!tailor) {
    throw new NotFoundError('Tailor not found');
  }

  res.status(200).json({
    status: 'success',
    data: tailor,
  });
};

export const updateTailorStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, isAvailable } = req.body;
  const adminId = req.admin!.adminId;

  const updateData: any = { updatedBy: adminId };
  if (isActive !== undefined) {
    updateData.isActive = isActive;
    if (!isActive) {
      updateData.disabledBy = adminId;
      updateData.disabledAt = new Date();
    } else {
      updateData.$unset = { disabledBy: 1, disabledAt: 1 };
    }
  }
  
  if (isAvailable !== undefined) {
    updateData.isAvailable = isAvailable;
  }

  const tailor = await Tailor.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!tailor) {
    throw new NotFoundError('Tailor not found');
  }

  res.status(200).json({
    status: 'success',
    data: tailor,
  });
};

export const deleteTailor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin!.adminId;

  // Soft delete
  const tailor = await Tailor.findByIdAndUpdate(id, { 
    isActive: false, 
    disabledBy: adminId, 
    disabledAt: new Date() 
  }, { new: true });
  
  if (!tailor) {
    throw new NotFoundError('Tailor not found');
  }

  res.status(200).json({
    status: 'success',
    message: 'Tailor deactivated successfully',
  });
};
