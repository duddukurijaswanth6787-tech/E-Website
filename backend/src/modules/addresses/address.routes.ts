import { Router, Request, Response, NextFunction } from 'express';
import { Address } from './address.model';
import { authenticateUser } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors';

const router = Router();

router.get('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await Address.find({ user: req.user!.userId, deletedAt: null }).sort({ isDefault: -1 });
    sendSuccess(res, addresses);
  } catch (err) { next(err); }
});

router.post('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user!.userId }, { isDefault: false });
    }
    const address = await Address.create({ ...req.body, user: req.user!.userId });
    sendCreated(res, address, 'Address added');
  } catch (err) { next(err); }
});

router.put('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user!.userId });
    if (!address) throw new NotFoundError('Address');
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user!.userId }, { isDefault: false });
    }
    Object.assign(address, req.body);
    await address.save();
    sendSuccess(res, address, 'Address updated');
  } catch (err) { next(err); }
});

router.delete('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user!.userId });
    if (!address) throw new NotFoundError('Address');
    address.deletedAt = new Date();
    await address.save();
    sendNoContent(res);
  } catch (err) { next(err); }
});

router.patch('/:id/default', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Address.updateMany({ user: req.user!.userId }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.userId },
      { isDefault: true },
      { new: true }
    );
    if (!address) throw new NotFoundError('Address');
    sendSuccess(res, address, 'Default address updated');
  } catch (err) { next(err); }
});

export default router;
