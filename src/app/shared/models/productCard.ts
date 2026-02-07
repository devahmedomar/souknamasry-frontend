export interface IProductCard {
  id: string | number;
  title: string;
  titleAr?: string;
  slug?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  imageUrl: string;
  image?: string;
  rating: number;
  maxRating?: number;
  // Badge-related fields
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  createdAt?: string;
}
