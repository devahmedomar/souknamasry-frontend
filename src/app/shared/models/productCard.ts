export interface IProductCard {
  id: string | number;
  title: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  image?: string;
  rating: number;
  maxRating?: number;
}
