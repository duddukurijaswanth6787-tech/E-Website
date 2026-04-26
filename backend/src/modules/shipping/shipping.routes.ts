import { Router, Request, Response, NextFunction } from 'express';
import { ShippingRule } from './shipping.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC: Get active shipping rules
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await ShippingRule.find({ isActive: true }).lean();
    sendSuccess(res, rules);
  } catch (err) { next(err); }
});

// ADMIN CRUD
router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SHIPPING),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await ShippingRule.create({ ...req.body, createdBy: req.admin!.adminId });
      sendCreated(res, rule, 'Shipping rule created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SHIPPING),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await ShippingRule.findByIdAndUpdate(
        req.params.id, 
        { ...req.body, updatedBy: req.admin!.adminId }, 
        { new: true }
      );
      if (!rule) throw new NotFoundError('Shipping rule');
      sendSuccess(res, rule, 'Shipping rule updated');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SHIPPING),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await ShippingRule.findByIdAndDelete(req.params.id);
      if (!r) throw new NotFoundError('Shipping rule');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
