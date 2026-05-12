import { Request, Response } from 'express';
import { Attendance } from './attendance.model';
import { WorkforceStatus } from '../workforce/workforceStatus.model';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

export const checkIn = async (req: Request, res: Response) => {
  const { id: employeeId, role: employeeType, branchId } = (req as any).user || (req as any).admin;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in
  const existing = await Attendance.findOne({ employeeId, date: today });
  if (existing) {
    throw new BadRequestError('Already checked in for today');
  }

  const attendance = await Attendance.create({
    employeeId,
    employeeType,
    date: today,
    checkIn: new Date(),
    branchId,
    status: 'present' // Logic for 'late' can be added here
  });

  // Update workforce status
  await WorkforceStatus.findOneAndUpdate(
    { employeeId },
    { 
      currentStatus: 'online', 
      lastActiveAt: new Date(),
      sessionStartTime: new Date()
    },
    { upsert: true }
  );

  res.status(201).json({
    status: 'success',
    data: attendance
  });
};

export const checkOut = async (req: Request, res: Response) => {
  const { id: employeeId } = (req as any).user || (req as any).admin;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ employeeId, date: today });
  if (!attendance) {
    throw new NotFoundError('No active check-in found for today');
  }

  if (attendance.checkOut) {
    throw new BadRequestError('Already checked out for today');
  }

  attendance.checkOut = new Date();
  
  // Calculate total hours
  const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
  attendance.totalHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
  
  await attendance.save();

  // Update workforce status
  await WorkforceStatus.findOneAndUpdate(
    { employeeId },
    { currentStatus: 'offline', lastActiveAt: new Date() }
  );

  res.status(200).json({
    status: 'success',
    data: attendance
  });
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  const { id: employeeId } = (req as any).user || (req as any).admin;
  const { startDate, endDate } = req.query;

  const filter: any = { employeeId };
  if (startDate && endDate) {
    filter.date = { 
      $gte: new Date(startDate as string), 
      $lte: new Date(endDate as string) 
    };
  }

  const history = await Attendance.find(filter).sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    data: history
  });
};
