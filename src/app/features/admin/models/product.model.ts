export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  category: string;
  images: string[];
  stockQuantity: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price?: number;
  category?: string;
  images?: string[];
  stockQuantity?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface UpdateProductStockDto {
  stockQuantity: number;
}

export interface ToggleProductActiveDto {
  isActive: boolean;
}

export interface ToggleFeaturedDto {
  isFeatured: boolean;
}

export interface ToggleSponsoredDto {
  isSponsored: boolean;
}

export interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProductResponse {
  status: string;
  data: Product;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  inStock?: boolean;
  category?: string;
  search?: string;
}
