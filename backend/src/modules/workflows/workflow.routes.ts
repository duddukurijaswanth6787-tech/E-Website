import { Router } from 'express';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { authenticateAdmin, requirePermission, authenticateTailor } from '../../common/middlewares/auth.middleware';
import { PERMISSIONS } from '../../common/constants/roles';
import 'express-async-errors';

// Validation Schemas
import {
  createWorkflowTaskSchema,
  updateWorkflowStatusSchema,
  addNoteSchema,
  reassignTailorSchema,
  updateDeadlineSchema,
  updateEscalationSchema,
  getWorkflowsQuerySchema
} from './workflow.validation';

// Controllers
import * as adminCtrl from './adminWorkflow.controller';
import * as tailorCtrl from './tailorWorkflow.controller';

const adminRouter = Router();
const tailorRouter = Router();

// ==========================================
// ADMIN & MANAGER WORKFLOW ROUTES (/api/v1/admin/workflows)
// ==========================================
import { authenticateAdminOrManager } from '../../common/middlewares/auth.middleware';

adminRouter.use(authenticateAdminOrManager);

adminRouter.route('/')
  .post(validateZod(createWorkflowTaskSchema), adminCtrl.createWorkflowTask)
  .get(validateZod(getWorkflowsQuerySchema), adminCtrl.getWorkflows);

adminRouter.route('/:id')
  .get(adminCtrl.getWorkflowById);

adminRouter.put('/:id/reassign', validateZod(reassignTailorSchema), adminCtrl.reassignTailor);
adminRouter.patch('/:id/status', validateZod(updateWorkflowStatusSchema), adminCtrl.updateWorkflowStatusAsAdmin);
adminRouter.patch('/:id/deadline', validateZod(updateDeadlineSchema), adminCtrl.updateDeadline);
adminRouter.patch('/:id/escalate', validateZod(updateEscalationSchema), adminCtrl.escalateWorkflow);
adminRouter.post('/:id/notes', validateZod(addNoteSchema), adminCtrl.addAdminNote);
adminRouter.post('/:id/qc-notes', validateZod(addNoteSchema), adminCtrl.addQcNote);

import * as analyticsCtrl from './managerAnalytics.controller';

// Manager Productivity & Analytics
adminRouter.get('/analytics/dashboard', analyticsCtrl.getManagerDashboardAnalytics);
adminRouter.get('/analytics/tailors', analyticsCtrl.getTailorProductivity);
adminRouter.get('/analytics/escalations', analyticsCtrl.getEscalations);



// ==========================================
// TAILOR DASHBOARD ROUTES (/api/v1/tailor-dashboard/tasks)
// ==========================================
tailorRouter.use(authenticateTailor);

tailorRouter.route('/')
  .get(tailorCtrl.getAssignedTasks);

tailorRouter.route('/:id')
  .get(tailorCtrl.getTaskDetails);

tailorRouter.patch('/:id/status', validateZod(updateWorkflowStatusSchema), tailorCtrl.updateStatus);
tailorRouter.post('/:id/notes', validateZod(addNoteSchema), tailorCtrl.addTailorNote);
tailorRouter.post('/:id/attachments', tailorCtrl.uploadAttachment); // Requires a multer upload middleware before this in production


export { adminRouter as adminWorkflowRoutes, tailorRouter as tailorDashboardRoutes };
