import { CmsHero, ICmsHero } from './cms.model';

export const cmsService = {
  getHeroSection: async (): Promise<ICmsHero> => {
    let hero = await CmsHero.findOne();
    if (!hero) {
      const defaultSlide = {
        titleLine1: 'Elegance in Every',
        titleLine2: 'Thread',
        subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
        badgeText: 'Luxury Indian Ethnic Wear',
        primaryButtonText: 'Shop Collection',
        primaryButtonLink: '/shop',
        secondaryButtonText: 'Custom Blouse',
        secondaryButtonLink: '/custom-blouse',
      };
      hero = await CmsHero.create({
        ...defaultSlide,
        overlayOpacity: 0.5,
        isPublished: false,
        autoplayInterval: 5,
        slides: [defaultSlide]
      });
    } else if (!hero.slides || hero.slides.length === 0) {
      // Migrate legacy single record into the first element of slides array seamlessly
      hero.slides = [{
        titleLine1: hero.titleLine1 || 'Elegance in Every',
        titleLine2: hero.titleLine2 || 'Thread',
        subtitle: hero.subtitle || 'Discover our curated collection.',
        badgeText: hero.badgeText,
        backgroundImage: hero.backgroundImage,
        mobileBackgroundImage: hero.mobileBackgroundImage,
        primaryButtonText: hero.primaryButtonText || 'Shop Collection',
        primaryButtonLink: hero.primaryButtonLink || '/shop',
        secondaryButtonText: hero.secondaryButtonText,
        secondaryButtonLink: hero.secondaryButtonLink,
      }];
      await hero.save();
    }
    return hero;
  },

  updateHeroSection: async (data: Partial<ICmsHero>, adminId: string): Promise<ICmsHero> => {
    // Deep clone payload to strip tracking ids and avoid VersionError conflicts
    const cleanData: any = { ...data };
    delete cleanData._id;
    delete cleanData.__v;

    if (cleanData.slides && Array.isArray(cleanData.slides)) {
      cleanData.slides = cleanData.slides.map((slide: any) => {
        const s = { ...slide };
        delete s._id;
        return s;
      });
    }

    let hero = await CmsHero.findOne();
    if (!hero) {
      hero = new CmsHero(cleanData);
    } else {
      hero.set(cleanData);
      // Sync root properties to the first slide or vice versa to preserve fallback query reliability
      if (cleanData.slides && cleanData.slides.length > 0) {
        const first = cleanData.slides[0];
        hero.titleLine1 = first.titleLine1;
        hero.titleLine2 = first.titleLine2;
        hero.subtitle = first.subtitle;
        hero.badgeText = first.badgeText;
        hero.backgroundImage = first.backgroundImage;
        hero.mobileBackgroundImage = first.mobileBackgroundImage;
        hero.primaryButtonText = first.primaryButtonText || 'Shop Collection';
        hero.primaryButtonLink = first.primaryButtonLink || '/shop';
        hero.secondaryButtonText = first.secondaryButtonText;
        hero.secondaryButtonLink = first.secondaryButtonLink;
      }
      if (cleanData.autoplayInterval) hero.autoplayInterval = Number(cleanData.autoplayInterval);
      if (cleanData.overlayOpacity !== undefined) hero.overlayOpacity = Number(cleanData.overlayOpacity);
    }
    hero.updatedBy = adminId as any;
    await hero.save();
    return hero;
  },
};
