import { Request, Response } from 'express';
import { AuditLog } from './auditLog.model';
import { NotFoundError } from '../../common/errors';

export const getAuditLogs = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const { 
    module, 
    action, 
    actorRole, 
    severity, 
    status, 
    startDate, 
    endDate,
    search 
  } = req.query;

  const filter: any = {};

  if (module) filter.module = module;
  if (action) filter.action = action;
  if (actorRole) filter.actorRole = actorRole;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate as string);
    if (endDate) filter.timestamp.$lte = new Date(endDate as string);
  }

  if (search) {
    filter.$or = [
      { actorName: { $regex: search, $options: 'i' } },
      { actorEmail: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { entityId: { $regex: search, $options: 'i' } }
    ];
  }

  // Branch scoping for managers
  if (req.manager?.branchId) {
    filter.branchId = req.manager.branchId;
  }

  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  });
};

export const getAuditStats = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter: any = {};
  if ((req as any).manager?.branchId) {
    filter.branchId = (req as any).manager.branchId;
  }

  const [severityCounts, moduleActivity, riskTrend] = await Promise.all([
    AuditLog.aggregate([
      { $match: { ...filter, timestamp: { $gte: today } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]),
    AuditLog.aggregate([
      { $match: { ...filter, timestamp: { $gte: today } } },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    AuditLog.aggregate([
      { 
        $match: { 
          ...filter,
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          avgRisk: { $avg: '$riskScore' },
          criticalCount: { 
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      severityCounts,
      moduleActivity,
      riskTrend
    }
  });
};

export const getAuditLogById = async (req: Request, res: Response) => {
  const log = await AuditLog.findById(req.params.id).lean();
  if (!log) throw new NotFoundError('Audit log not found');
  
  res.status(200).json({
    status: 'success',
    data: log
  });
};
