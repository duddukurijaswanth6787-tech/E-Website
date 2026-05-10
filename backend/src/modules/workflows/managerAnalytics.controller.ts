import { Request, Response } from 'express';
import { WorkflowTask, WorkflowStatus } from './workflow.model';
import { Tailor } from '../tailors/tailor.model';
import mongoose from 'mongoose';

export const getManagerDashboardAnalytics = async (req: Request, res: Response) => {
  // Aggregate workflow stats
  const pipeline = [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];

  const statusCounts = await WorkflowTask.aggregate(pipeline);
  
  const formattedCounts = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const delayedTasksCount = await WorkflowTask.countDocuments({
    isSlaViolated: true,
    status: { $nin: [WorkflowStatus.COMPLETED, WorkflowStatus.DELIVERED] }
  });

  const reworkCount = await WorkflowTask.countDocuments({
    status: WorkflowStatus.REWORK
  });

  res.status(200).json({
    status: 'success',
    data: {
      statusCounts: formattedCounts,
      delayedTasksCount,
      reworkCount
    }
  });
};

export const getTailorProductivity = async (req: Request, res: Response) => {
  const tailors = await Tailor.find({ isActive: true })
    .select('name tailorCode currentAssignedCount completedOrdersCount dailyCapacity specialization');

  // Compute workload score
  const tailorStats = tailors.map(t => {
    const capacity = t.dailyCapacity || 5;
    const loadPercentage = Math.round((t.currentAssignedCount / capacity) * 100);
    return {
      id: t._id,
      name: t.name,
      tailorCode: t.tailorCode,
      specialization: t.specialization,
      currentAssignedCount: t.currentAssignedCount,
      completedOrdersCount: t.completedOrdersCount,
      dailyCapacity: capacity,
      loadPercentage,
      status: loadPercentage >= 100 ? 'OVERLOADED' : (loadPercentage >= 80 ? 'HIGH' : 'AVAILABLE')
    };
  });

  res.status(200).json({
    status: 'success',
    data: tailorStats
  });
};
