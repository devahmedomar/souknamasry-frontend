export interface IProductCard {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  rating: number;
  maxRating?: number;
}
