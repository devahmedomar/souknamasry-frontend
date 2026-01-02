import { Product } from './product.interface';

export interface CartItem {
    _id: string;
    product: Product;
    quantity: number;
    size?: string;
    color?: string;
}

export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    expiryDate?: Date;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    coupon?: Coupon;
    itemCount: number;
}

export interface CartResponse {
    status: string;
    data: Cart;
}

export interface AddToCartPayload {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
}

export interface UpdateCartItemPayload {
    quantity: number;
    size?: string;
    color?: string;
}

export interface ApplyCouponPayload {
    couponCode: string;
}
