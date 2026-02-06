export interface HeroSlide {
  id: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  subtitleAr?: string;
  ctaText: string;
  ctaTextAr?: string;
  ctaLink: string;
  imageUrl: string;
  mobileImageUrl?: string;
  backgroundColor?: string;
  textColor?: 'light' | 'dark';
  badgeText?: string;
  badgeTextAr?: string;
  countdown?: {
    endDate: string;
    label: string;
    labelAr?: string;
  };
  priority: number;
  isActive: boolean;
}
