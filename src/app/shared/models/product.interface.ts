export interface Product {
    _id: string;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    image?: string;
    category?: string;
    brand?: string;
    stock?: number;
    rating?: number;
    reviewCount?: number;
    sizes?: string[];
    colors?: string[];
    tags?: string[];
    isFeatured?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductResponse {
    status: string;
    data: Product;
}

export interface ProductsResponse {
    status: string;
    data: Product[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
