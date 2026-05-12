import { Router } from 'express';
import { razorpayWebhookController } from './razorpayWebhook.controller';

const router = Router();

// Route base endpoint mapping directly to thin controllers
router.post('/', razorpayWebhookController.handleIncomingWebhook.bind(razorpayWebhookController));

export default router;
