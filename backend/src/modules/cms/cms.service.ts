import { CmsHero, ICmsHero } from './cms.model';

export const cmsService = {
  getHeroSection: async (): Promise<ICmsHero> => {
    let hero = await CmsHero.findOne();
    if (!hero) {
      hero = await CmsHero.create({
        titleLine1: 'Elegance in Every',
        titleLine2: 'Thread',
        subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
        badgeText: 'Luxury Indian Ethnic Wear',
        primaryButtonText: 'Shop Collection',
        primaryButtonLink: '/shop',
        secondaryButtonText: 'Custom Blouse',
        secondaryButtonLink: '/custom-blouse',
        overlayOpacity: 0.5,
        isPublished: false,
      });
    }
    return hero;
  },

  updateHeroSection: async (data: Partial<ICmsHero>, adminId: string): Promise<ICmsHero> => {
    let hero = await CmsHero.findOne();
    if (!hero) {
      hero = new CmsHero(data);
    } else {
      Object.assign(hero, data);
    }
    hero.updatedBy = adminId as any;
    await hero.save();
    return hero;
  },
};
