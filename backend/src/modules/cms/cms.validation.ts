import { body } from 'express-validator';

export const updateHeroValidation = [
  body('titleLine1').notEmpty().withMessage('Title Line 1 is required'),
  body('titleLine2').notEmpty().withMessage('Title Line 2 is required'),
  body('subtitle').notEmpty().withMessage('Subtitle is required'),
  body('primaryButtonText').notEmpty().withMessage('Primary button text is required'),
  body('primaryButtonLink').notEmpty().withMessage('Primary button link is required'),
  body('overlayOpacity')
    .optional()
    .isFloat({ min: 0, max: 0.9 })
    .withMessage('Overlay opacity must be between 0 and 0.9'),
  body('isPublished').optional().isBoolean(),
  body('badgeText').optional().isString(),
  body('backgroundImage').optional().isString(),
  body('desktopImageAlt').optional().isString(),
  body('mobileBackgroundImage').optional().isString(),
  body('mobileImageAlt').optional().isString(),
  body('secondaryButtonText').optional().isString(),
  body('secondaryButtonLink').optional().isString(),
];
