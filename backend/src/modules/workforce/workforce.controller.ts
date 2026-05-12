import { Request, Response } from 'express';
import { WorkforceStatus, EmployeeStatus } from './workforceStatus.model';
import { Attendance } from '../attendance/attendance.model';
import { Tailor } from '../tailors/tailor.model';
import { Manager } from '../managers/manager.model';
import { getIO } from '../../realtime/socketServer';
import { ERP_EVENTS } from '../../realtime/events/erpEvents';
import { logger } from '../../common/logger';
import { auditLogService } from '../auditLogs/auditLog.service';
import { AuditSeverity } from '../auditLogs/auditLog.model';

export const updateStatus = async (req: Request, res: Response) => {
  const { id: employeeId } = (req as any).user || (req as any).admin;
  const { status, taskId, taskType } = req.body;

  const workforce = await WorkforceStatus.findOneAndUpdate(
    { employeeId },
    { 
      currentStatus: status as EmployeeStatus,
      lastActiveAt: new Date(),
      currentTaskId: taskId,
      currentTaskType: taskType
    },
    { upsert: true, new: true }
  );

  // Broadcast update via Socket.IO
  const io = getIO();
  if (io) {
    io.of('/notifications').emit('WORKFORCE_STATUS_UPDATE', {
      employeeId,
      status,
      lastActiveAt: workforce.lastActiveAt
    });
  }

  // Log to Audit Stream
  await auditLogService.log({
    actor: {
      id: employeeId,
      name: (req as any).user?.name || (req as any).admin?.name || 'Unknown',
      email: (req as any).user?.email || (req as any).admin?.email || 'N/A',
      role: (req as any).user?.role || (req as any).admin?.role || 'staff'
    },
    module: 'WORKFORCE',
    action: 'STATUS_CHANGE',
    entity: { type: 'EMPLOYEE', id: employeeId },
    description: `Employee changed status to ${status}`,
    details: { newValue: { status, taskId, taskType } },
    severity: AuditSeverity.INFO
  });

  res.status(200).json({
    status: 'success',
    data: workforce
  });
};

export const getWorkforceOverview = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [statuses, attendanceToday, tailors, managers] = await Promise.all([
    WorkforceStatus.find().lean(),
    Attendance.find({ date: today }).lean(),
    Tailor.find({ isActive: true }).select('name tailorCode specialization profileImage').lean(),
    Manager.find({ isActive: true }).select('name managerCode branchName').lean()
  ]);

  // Merge data for a complete overview
  const workforce = [...tailors.map(t => ({ ...t, type: 'tailor' as const })), ...managers.map(m => ({ ...m, type: 'manager' as const }))].map(emp => {
    const status = statuses.find(s => s.employeeId.toString() === emp._id.toString());
    const att = attendanceToday.find(a => a.employeeId.toString() === emp._id.toString());
    
    return {
      ...emp,
      liveStatus: status?.currentStatus || 'offline',
      lastActive: status?.lastActiveAt,
      isPresent: !!att,
      checkIn: att?.checkIn,
      checkOut: att?.checkOut,
      attendanceStatus: att?.status || 'absent'
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      workforce,
      stats: {
        total: workforce.length,
        present: workforce.filter(w => w.isPresent).length,
        active: workforce.filter(w => w.liveStatus !== 'offline').length,
        online: workforce.filter(w => w.liveStatus === 'online').length,
        working: workforce.filter(w => w.liveStatus === 'working').length,
        onBreak: workforce.filter(w => w.liveStatus === 'on_break').length
      }
    }
  });
};
