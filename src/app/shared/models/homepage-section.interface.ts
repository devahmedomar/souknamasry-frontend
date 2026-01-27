/**
 * Interface for homepage section category information
 */
export interface HomepageSectionCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

/**
 * Interface for product in homepage section
 */
export interface HomepageSectionProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
}

/**
 * Interface for a single homepage section
 */
export interface HomepageSection {
  category: HomepageSectionCategory;
  products: HomepageSectionProduct[];
}

/**
 * Interface for the complete API response
 */
export interface HomepageSectionsResponse {
  status: string;
  data: {
    sections: HomepageSection[];
  };
}

/**
 * Query parameters for fetching homepage sections
 */
export interface HomepageSectionsParams {
  sortBy?: 'newest' | 'popular';
  limit?: number;
}