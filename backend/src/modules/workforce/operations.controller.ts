import { Request, Response } from 'express';
import { WorkflowTask, WorkflowStatus } from '../workflows/workflow.model';
import { Attendance } from '../attendance/attendance.model';
import { WorkforceStatus } from '../workforce/workforceStatus.model';
import { logger } from '../../common/logger';

export const getOperationsOverview = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter: any = {};
  if (req.manager?.branchId) {
    filter.branchId = req.manager.branchId;
  }

  const [
    pipelineStats,
    delayedTasks,
    escalations,
    completedToday,
    activeWorkforce
  ] = await Promise.all([
    // Pipeline Distribution
    WorkflowTask.aggregate([
      { 
        $match: { 
          status: { $ne: WorkflowStatus.DELIVERED },
          ...filter
        } 
      },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Delayed Tasks (SLA Violated or Overdue)
    WorkflowTask.countDocuments({
      status: { $nin: [WorkflowStatus.COMPLETED, WorkflowStatus.DELIVERED] },
      ...(req.manager?.branchId ? { branchId: req.manager.branchId } : {}),
      $or: [
        { isSlaViolated: true },
        { deadline: { $lt: new Date() } }
      ]
    }),

    // Escalations
    WorkflowTask.countDocuments({
      escalationSeverity: { $in: ['High Risk', 'Blocked'] },
      ...(req.manager?.branchId ? { branchId: req.manager.branchId } : {})
    }),

    // Completed Today
    WorkflowTask.countDocuments({
      status: WorkflowStatus.COMPLETED,
      updatedAt: { $gte: today, $lt: tomorrow },
      ...(req.manager?.branchId ? { branchId: req.manager.branchId } : {})
    }),

    // Active Workforce Summary
    WorkforceStatus.countDocuments({
      currentStatus: { $ne: 'offline' },
      ...(req.manager?.branchId ? { branchId: req.manager.branchId } : {})
    })
  ]);

  // Format pipeline stats into a clean object
  const pipeline = Object.values(WorkflowStatus).reduce((acc: any, status) => {
    const stat = pipelineStats.find(ps => ps._id === status);
    acc[status] = stat ? stat.count : 0;
    return acc;
  }, {});

  res.status(200).json({
    status: 'success',
    data: {
      pipeline,
      metrics: {
        delayedCount: delayedTasks,
        escalationCount: escalations,
        completedTodayCount: completedToday,
        activeWorkforceCount: activeWorkforce,
        efficiencyScore: 88 // Mock calculation for now
      },
      alerts: await getLiveAlerts(filter.branchId)
    }
  });
};

async function getLiveAlerts(branchId?: string) {
  // Fetch top critical alerts
  const query: any = { escalationSeverity: 'Blocked' };
  if (branchId) query.branchId = branchId;

  const criticalTasks = await WorkflowTask.find(query)
    .limit(5)
    .select('taskNumber taskDescription status deadline');

  return criticalTasks.map(t => ({
    type: 'production_blocked',
    message: `Task ${t.taskNumber} is BLOCKED at ${t.status} stage.`,
    severity: 'critical',
    timestamp: new Date()
  }));
}
