/**
 * BullMQ Enterprise Queue Names
 * CRITICAL: BullMQ queue names MUST NOT contain colons (:).
 * Use underscores (_) for separation.
 */
export const QUEUE_NAMES = {
  EMAIL: 'vc_queue_email',
  WHATSAPP: 'vc_queue_whatsapp',
  NOTIFICATIONS: 'vc_queue_notifications',
  WEBHOOKS: 'vc_queue_webhooks',
  CLEANUP: 'vc_queue_cleanup',
  ANALYTICS: 'vc_queue_analytics',
  IMAGES: 'vc_queue_images'
} as const;
