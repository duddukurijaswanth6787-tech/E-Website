import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Manager } from './manager.model';
import { NotFoundError, BadRequestError } from '../../common/errors';

// Generate Manager Code
const generateManagerCode = async () => {
  const lastManager = await Manager.findOne().sort({ createdAt: -1 });
  if (!lastManager || !lastManager.managerCode) {
    return 'MGR-1001';
  }
  const lastCodeNumber = parseInt(lastManager.managerCode.split('-')[1]);
  return `MGR-${lastCodeNumber + 1}`;
};

export const createManager = async (req: Request, res: Response) => {
  const { name, email, phone, password, managerType, department, permissions, assignedTailors, branchId, branchName, isActive } = req.body;
  const adminId = req.admin!.adminId;

  const existingManager = await Manager.findOne({ $or: [{ email }, { phone }] });
  if (existingManager) {
    throw new BadRequestError('Manager with this email or phone already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const managerCode = await generateManagerCode();

  const manager = await Manager.create({
    managerCode,
    name,
    email,
    phone,
    passwordHash,
    managerType,
    department,
    permissions,
    assignedTailors,
    branchId,
    branchName,
    isActive,
    createdBy: adminId,
  });

  const managerObj = manager.toObject();
  delete (managerObj as any).passwordHash;
  delete (managerObj as any).refreshTokens;

  res.status(201).json({
    status: 'success',
    data: managerObj,
  });
};

export const getManagers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { department, managerType, isActive, search } = req.query;

  const filter: any = {};
  
  if (department) filter.department = department;
  if (managerType) filter.managerType = managerType;
  if (isActive !== undefined) filter.isActive = isActive;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { managerCode: { $regex: search, $options: 'i' } },
    ];
  }

  const managers = await Manager.find(filter)
    .select('-passwordHash -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email');

  const total = await Manager.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      managers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getManagerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const manager = await Manager.findById(id)
    .select('-passwordHash -refreshTokens')
    .populate('createdBy updatedBy disabledBy', 'name email')
    .populate('assignedTailors', 'name tailorCode');
  
  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  res.status(200).json({
    status: 'success',
    data: manager,
  });
};

export const updateManager = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin!.adminId;

  const updateData = { ...req.body, updatedBy: adminId };
  delete updateData.password; // Handled separately if needed
  delete updateData.email; // Cannot change email easily

  const manager = await Manager.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .select('-passwordHash -refreshTokens');
  
  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  res.status(200).json({
    status: 'success',
    data: manager,
  });
};

export const updateManagerStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, isVerified, unlockAccount } = req.body;
  const adminId = req.admin!.adminId;

  const updateData: any = { updatedBy: adminId };
  
  if (isActive !== undefined) {
    updateData.isActive = isActive;
    if (!isActive) {
      updateData.disabledBy = adminId;
      updateData.disabledAt = new Date();
      updateData.refreshTokens = []; // Force logout
    } else {
      updateData.$unset = { disabledBy: 1, disabledAt: 1 };
    }
  }
  
  if (isVerified !== undefined) updateData.isVerified = isVerified;
  
  if (unlockAccount) {
    updateData.$unset = { ...updateData.$unset, accountLockedUntil: 1 };
    updateData.loginAttempts = 0;
  }

  const manager = await Manager.findByIdAndUpdate(id, updateData, { new: true })
    .select('-passwordHash -refreshTokens');
  
  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  res.status(200).json({
    status: 'success',
    data: manager,
  });
};

export const deleteManager = async (req: Request, res: Response) => {
  const { id } = req.params;

  const manager = await Manager.findByIdAndDelete(id);
  
  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  res.status(200).json({
    status: 'success',
    message: 'Manager permanently deleted successfully',
  });
};

export const resetManagerPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const adminId = req.admin!.adminId;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const manager = await Manager.findByIdAndUpdate(id, {
    passwordHash,
    mustChangePassword: true,
    refreshTokens: [], // Revoke active sessions
    updatedBy: adminId
  }, { new: true }).select('-passwordHash -refreshTokens');

  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
    data: manager
  });
};
