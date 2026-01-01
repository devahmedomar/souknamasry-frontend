import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AddToCartPayload {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemPayload {
    quantity: number;
}

export interface ApplyCouponPayload {
    couponCode: string;
}

export interface CartItem {
    _id: string;
    product: any;
    quantity: number;
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
    coupon: any;
    itemCount: number;
}

export interface CartResponse {
    status: string;
    data: Cart;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);
    private baseUrl = 'https://souknamasry-be.vercel.app/api/cart';

    // Signal to track cart item count
    cartItemCount = signal<number>(0);

    addToCart(productId: string, quantity: number = 1): Observable<CartResponse> {
        const payload: AddToCartPayload = {
            productId,
            quantity
        };
        return this.http.post<CartResponse>(`${this.baseUrl}/items`, payload).pipe(
            tap(() => this.loadCartCount())
        );
    }

    getCart(): Observable<CartResponse> {
        return this.http.get<CartResponse>(this.baseUrl);
    }

    updateCartItem(itemId: string, quantity: number): Observable<CartResponse> {
        const payload: UpdateCartItemPayload = { quantity };
        return this.http.put<CartResponse>(`${this.baseUrl}/items/${itemId}`, payload).pipe(
            tap(() => this.loadCartCount())
        );
    }

    removeCartItem(itemId: string): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.baseUrl}/items/${itemId}`).pipe(
            tap(() => this.loadCartCount())
        );
    }

    clearCart(): Observable<any> {
        return this.http.delete(`${this.baseUrl}`).pipe(
            tap(() => this.cartItemCount.set(0))
        );
    }

    applyCoupon(couponCode: string): Observable<CartResponse> {
        const payload: ApplyCouponPayload = { couponCode };
        return this.http.post<CartResponse>(`${this.baseUrl}/coupon`, payload);
    }

    loadCartCount(): void {
        this.getCart().subscribe({
            next: (response) => {
                const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
                this.cartItemCount.set(totalItems);
            },
            error: () => {
                this.cartItemCount.set(0);
            }
        });
    }
}
