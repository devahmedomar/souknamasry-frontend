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

// Product Details API Response interfaces
export interface ProductCategory {
    _id: string;
    name: string;
    nameAr?: string;
    slug: string;
    image: string;
    description: string;
    path?: string;
    breadcrumb?: { _id: string; name: string; nameAr?: string; slug: string; path?: string }[];
}

export interface ProductDetails {
    _id: string;
    name: string;
    nameAr?: string;
    description: string;
    descriptionAr?: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    category: ProductCategory;
    images: string[];
    inStock: boolean;
    stockQuantity: number;
    sku?: string;
    isActive: boolean;
    isFeatured: boolean;
    views: number;
    sizes?: string[];
    colors?: ProductColor[];
    rating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt: Date;
    relatedProducts: RelatedProduct[];
}

export interface ProductColor {
    name: string;
    nameAr?: string;
    hex: string;
}

export interface RelatedProduct {
    _id: string;
    name: string;
    nameAr?: string;
    description: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    images: string[];
    inStock: boolean;
    stockQuantity: number;
    sku?: string;
    isActive: boolean;
    isFeatured: boolean;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductDetailsResponse {
    status: 'success';
    data: ProductDetails;
}

// Breadcrumb item for product details page
export interface BreadcrumbItem {
    _id: string;
    name: string;
    nameAr?: string;
    slug: string;
    path?: string;
}

// Search-related interfaces
export interface ProductSearchParams {
    search?: string;
    category?: string | string[];
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-low' | 'price-high' | 'featured' | 'relevance';
    inStock?: boolean;
}

export interface AutocompleteSuggestion {
    _id: string;
    name: string;
    nameAr?: string;
    slug: string;
    price: number;
    image?: string;
    category?: {
        _id: string;
        name: string;
        slug: string;
    };
}

export interface AutocompleteResponse {
    status: 'success';
    data: {
        suggestions: AutocompleteSuggestion[];
    };
}

export interface ProductListResponse {
    status: 'success';
    data: {
        products: ProductDetails[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            limit: number;
        };
    };
}
