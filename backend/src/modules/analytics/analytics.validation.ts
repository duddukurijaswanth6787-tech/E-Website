import { z } from 'zod';

export const trackEventSchema = z.object({
  body: z.object({
    type: z.enum(['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'checkout_complete', 'purchase', 'inquiry', 'search', 'click', 'scroll', 'hover']),
    path: z.string().min(1),
    guestId: z.string().optional(),
    metadata: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      scrollDepth: z.number().optional(),
      elementId: z.string().optional(),
      productId: z.string().optional(),
      orderId: z.string().optional(),
      intensity: z.number().optional(),
    }).passthrough().optional(),
    utm: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    }).optional(),
    device: z.object({
      browser: z.string().optional(),
      os: z.string().optional(),
      isMobile: z.boolean().optional(),
    }).optional(),
  })
});

export const getHeatmapSchema = z.object({
  query: z.object({
    path: z.string().min(1),
    type: z.enum(['click', 'scroll', 'hover', 'rage', 'dead']).default('click'),
  })
});
