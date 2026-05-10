import { domainEventBus } from '../../realtime/bus/domainEventBus';
import { ERP_EVENTS, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../../realtime/events/erpEvents';
import { NotificationService } from './notification.service';
import { logger } from '../../common/logger';
import type { RealtimeEvent, WorkflowDiffPayload, SlaViolatedPayload } from '../../realtime/events/types';

/**
 * Bridges Domain Events to the Persistent Notification System.
 * This decouples the Notification infrastructure from the core business logic.
 */
export const registerNotificationBridge = () => {
  logger.info('[NotificationBridge] Registering event listeners...');

  // 1. Workflow QC Rejected (Rework) -> Notify Tailor
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_QC_REJECTED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload } = event;
    if (!payload.tailorId) return;

    await NotificationService.createNotification({
      recipientId: payload.tailorId,
      recipientRole: 'tailor',
      branchId: payload.branchId,
      type: NOTIFICATION_TYPES.QC_REJECTED,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'QC: Rework Required',
      message: `Task ${payload.taskNumber} failed quality check and has been returned for rework.`,
      metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber },
      link: `/tailor/tasks/${payload.workflowId}`,
    });
  });

  // 2. Workflow Assigned/Reassigned -> Notify Tailor
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_UPDATED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload, actor } = event;
    
    // Detect assignment: previousStatus was null/Assigned or tailorId changed
    const wasAssigned = (payload.previousStatus === 'Assigned' || !payload.previousStatus) && payload.status === 'Assigned';
    const wasReassigned = !!(payload.tailorId && payload.previousTailorId && payload.tailorId !== payload.previousTailorId);

    if ((wasAssigned || wasReassigned) && payload.tailorId && actor.actorType !== 'tailor') {
      await NotificationService.createNotification({
        recipientId: payload.tailorId,
        recipientRole: 'tailor',
        branchId: payload.branchId,
        type: wasReassigned ? NOTIFICATION_TYPES.WORKFLOW_REASSIGNED : NOTIFICATION_TYPES.WORKFLOW_ASSIGNED,
        priority: NOTIFICATION_PRIORITIES.NORMAL,
        title: wasReassigned ? 'Task Reassigned to You' : 'New Task Assigned',
        message: `You have been assigned ${payload.taskNumber}. Please review the technical specifications.`,
        metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber },
        link: `/tailor/tasks/${payload.workflowId}`,
      });
    }
  });

  // 3. Status Updates (Production Progress) -> Notify Managers
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_UPDATED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload, branchId } = event;
    
    // Only notify for significant production milestones
    const milestones = ['Stitching', 'Embroidery', 'Trial Ready', 'QC', 'Completed'];
    if (payload.status && milestones.includes(payload.status) && payload.status !== payload.previousStatus) {
      await NotificationService.notifyManagersInBranch({
        branchId: branchId || '',
        type: NOTIFICATION_TYPES.SYSTEM_ALERT,
        priority: NOTIFICATION_PRIORITIES.LOW,
        title: `Production Update: ${payload.status}`,
        message: `Task ${payload.taskNumber} has moved to ${payload.status} stage.`,
        metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber, status: payload.status },
        link: `/manager/workflows`,
      });
    }
  });

  // 4. SLA Violation -> Notify Managers
  domainEventBus.onType(ERP_EVENTS.SLA_VIOLATED, async (event: RealtimeEvent<SlaViolatedPayload>) => {
    const { payload, branchId } = event;
    
    await NotificationService.notifyManagersInBranch({
      branchId: branchId || '',
      type: NOTIFICATION_TYPES.SLA_VIOLATED,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Production Delay Detected',
      message: `Task ${payload.taskNumber} has violated its SLA. Production bottleneck possible.`,
      metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber, delayReason: 'SLA_VIOLATION' },
      link: `/manager/escalations`,
    });
  });

  // 5. Workflow Escalated / High Priority -> Notify Managers
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_ESCALATED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload, branchId } = event;
    
    await NotificationService.notifyManagersInBranch({
      branchId: branchId || '',
      type: NOTIFICATION_TYPES.ESCALATION_WARNING,
      priority: NOTIFICATION_PRIORITIES.URGENT,
      title: 'Critical Production Escalation',
      message: `Task ${payload.taskNumber} has been escalated. Priority set to URGENT.`,
      metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber },
      link: `/manager/escalations`,
    });
  });

  // 6. Workflow Completed (Delivery Readiness) -> Notify Managers
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_COMPLETED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload, branchId } = event;
    
    await NotificationService.notifyManagersInBranch({
      branchId: branchId || '',
      type: NOTIFICATION_TYPES.WORKFLOW_COMPLETED,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      title: 'Production Completed',
      message: `Task ${payload.taskNumber} is ready for delivery. All quality checks passed.`,
      metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber },
      link: `/manager/workflows`,
    });
  });

  // 7. Deadline Updated -> Notify Tailor
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED, async (event: RealtimeEvent<WorkflowDiffPayload>) => {
    const { payload } = event;
    if (!payload.tailorId) return;

    await NotificationService.createNotification({
      recipientId: payload.tailorId,
      recipientRole: 'tailor',
      branchId: payload.branchId,
      type: NOTIFICATION_TYPES.DEADLINE_UPDATED,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Deadline Adjusted',
      message: `The deadline for task ${payload.taskNumber} has been updated. Please check the new schedule.`,
      metadata: { workflowId: payload.workflowId, taskNumber: payload.taskNumber, newDeadline: payload.deadline },
      link: `/tailor/tasks/${payload.workflowId}`,
    });
  });

  // 8. Workflow Note Added -> Notify Managers (if tailor added it)
  domainEventBus.onType(ERP_EVENTS.WORKFLOW_NOTE_ADDED, async (event: RealtimeEvent<any>) => {
    const { payload, actor, branchId } = event;
    
    if (actor.actorType === 'tailor') {
      await NotificationService.notifyManagersInBranch({
        branchId: branchId || '',
        type: NOTIFICATION_TYPES.SYSTEM_ALERT,
        priority: NOTIFICATION_PRIORITIES.LOW,
        title: 'New Tailor Note',
        message: `A tailor added a note to task ${payload.workflowId.substring(0, 8)}...: "${payload.note.substring(0, 30)}..."`,
        metadata: { workflowId: payload.workflowId, note: payload.note },
        link: `/manager/workflows`,
      });
    }
  });
};
