export interface Category {
    _id: string;
    name: string;
    nameAr: string;
    description?: string;
    slug: string;
    path: string; // e.g. "electronics/mobile-phones"
    image?: string;
    isLeaf: boolean;
    children?: Category[];
    breadcrumb?: { _id: string, name: string, slug: string }[];
}
