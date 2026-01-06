import { Product } from './product.interface';

/**
 * Product in favourites list (simplified product data from API)
 */
export interface FavouriteProduct {
    _id: string;
    id: string;
    name: string;
    price: number;
    images: string[];
    inStock: boolean;
    stockQuantity: number;
    isFeatured: boolean;
    slug: string;
    profitMargin?: number;
    discountPercentage?: number;
}

/**
 * Response structure for favourites list
 * API returns: { status: "success", data: { products: [...], count: n } }
 */
export interface FavouritesResponse {
    status: string;
    data: {
        products: FavouriteProduct[];
        count: number;
    };
}

/**
 * Response structure for single favourite operations
 */
export interface FavouriteResponse {
    success: boolean;
    data?: FavouriteProduct;
}

/**
 * Response structure for checking if product is in favourites
 */
export interface FavouriteCheckResponse {
    success: boolean;
    isFavourite: boolean;
}
