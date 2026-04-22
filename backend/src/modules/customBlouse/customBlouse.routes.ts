import { Router, Request, Response, NextFunction } from 'express';
import { CustomBlouseRequest } from './customBlouse.model';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { uploadCustomBlouseFiles, getFileUrl } from '../../common/middlewares/upload.middleware';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/responses';
import { PERMISSIONS, UPLOAD_FOLDER } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError, BadRequestError } from '../../common/errors';

const router = Router();

// USER: Submit custom blouse request
router.post('/',
  authenticateUser,
  uploadCustomBlouseFiles(UPLOAD_FOLDER.CUSTOM_BLOUSE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const references = (req.files as Express.Multer.File[] || []).map((f) => getFileUrl(req, f.path));
      const reqNumber = `CB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const request = await CustomBlouseRequest.create({
        user: req.user!.userId,
        requestNumber: reqNumber,
        ...req.body,
        measurements: typeof req.body.measurements === 'string' ? JSON.parse(req.body.measurements) : req.body.measurements,
        references,
        timeline: [{ status: 'submitted', note: 'Request submitted by customer', updatedAt: new Date() }],
      });

      sendCreated(res, request, 'Custom blouse request submitted successfully');
    } catch (err) { next(err); }
  }
);

// USER: Get my requests
const listMyRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const [requests, total] = await Promise.all([
      CustomBlouseRequest.find({ user: req.user!.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CustomBlouseRequest.countDocuments({ user: req.user!.userId }),
    ]);
    sendPaginated(res, requests, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

router.get('/my', authenticateUser, listMyRequests);
router.get('/my-requests', authenticateUser, listMyRequests);

router.get('/my/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await CustomBlouseRequest.findOne({ _id: req.params.id, user: req.user!.userId });
    if (!request) throw new NotFoundError('Custom blouse request');
    sendSuccess(res, request);
  } catch (err) { next(err); }
});

// ADMIN routes
router.get('/admin', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = {};
      if (req.query.status) filter.status = req.query.status;

      const [requests, total] = await Promise.all([
        CustomBlouseRequest.find(filter).populate('user', 'name email mobile').sort({ createdAt: -1 }).skip(skip).limit(limit),
        CustomBlouseRequest.countDocuments(filter),
      ]);
      sendPaginated(res, requests, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.get('/admin/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await CustomBlouseRequest.findById(req.params.id).populate('user', 'name email mobile');
      if (!request) throw new NotFoundError('Custom blouse request');
      sendSuccess(res, request);
    } catch (err) { next(err); }
  }
);

const patchAdminStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, note, estimatedPrice, finalPrice, adminNotes, priceNote } = req.body;
    const request = await CustomBlouseRequest.findById(req.params.id);
    if (!request) throw new NotFoundError('Custom blouse request');

    const validStatuses = ['submitted', 'under_review', 'price_assigned', 'approved', 'rejected', 'in_progress', 'completed', 'delivered'];
    if (!validStatuses.includes(status)) throw new BadRequestError('Invalid status');

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    if (estimatedPrice) request.estimatedPrice = estimatedPrice;
    if (finalPrice) request.finalPrice = finalPrice;
    if (priceNote) request.priceNote = priceNote;
    request.timeline.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.admin!.adminId, updatedAt: new Date() });

    await request.save();
    sendSuccess(res, request, 'Status updated');
  } catch (err) {
    next(err);
  }
};

router.patch('/admin/:id/status', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), patchAdminStatus);
// Frontend alias: PATCH /custom-requests/:id/status
router.patch('/:id/status', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), patchAdminStatus);

// USER: GET /custom-requests/:id (same as /my/:id)
router.get('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await CustomBlouseRequest.findOne({ _id: req.params.id, user: req.user!.userId });
    if (!request) throw new NotFoundError('Custom blouse request');
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
});

export default router;
