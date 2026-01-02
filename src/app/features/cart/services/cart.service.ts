import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    CartResponse,
    AddToCartPayload,
    UpdateCartItemPayload,
    ApplyCouponPayload
} from '../../../shared/models/cart.interface';
import { CartStateService } from './cart-state.service';

/**
 * Cart Service - Handles all cart-related HTTP requests
 * Responsibilities:
 * - API communication for cart operations
 * - Update cart state through CartStateService
 */
@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly http = inject(HttpClient);
    private readonly cartState = inject(CartStateService);
    private readonly baseUrl = `${environment.apiUrl}/cart`;

    /**
     * Add item to cart
     */
    addToCart(payload: AddToCartPayload): Observable<CartResponse> {
        return this.http.post<CartResponse>(`${this.baseUrl}/items`, payload).pipe(
            tap(response => this.cartState.setCart(response.data)),
            catchError(this.handleError)
        );
    }

    /**
     * Get current cart
     */
    getCart(): Observable<CartResponse> {
        this.cartState.setLoading(true);
        return this.http.get<CartResponse>(this.baseUrl).pipe(
            tap(response => {
                this.cartState.setCart(response.data);
                this.cartState.setLoading(false);
            }),
            catchError(error => {
                this.cartState.setLoading(false);
                return this.handleError(error);
            })
        );
    }

    /**
     * Update cart item quantity
     */
    updateCartItem(itemId: string, payload: UpdateCartItemPayload): Observable<CartResponse> {
        return this.http.put<CartResponse>(`${this.baseUrl}/items/${itemId}`, payload).pipe(
            tap(response => this.cartState.setCart(response.data)),
            catchError(this.handleError)
        );
    }

    /**
     * Remove item from cart
     */
    removeCartItem(itemId: string): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.baseUrl}/items/${itemId}`).pipe(
            tap(response => this.cartState.setCart(response.data)),
            catchError(this.handleError)
        );
    }

    /**
     * Clear entire cart
     */
    clearCart(): Observable<any> {
        return this.http.delete(`${this.baseUrl}`).pipe(
            tap(() => this.cartState.clearCart()),
            catchError(this.handleError)
        );
    }

    /**
     * Apply coupon to cart
     */
    applyCoupon(payload: ApplyCouponPayload): Observable<CartResponse> {
        return this.http.post<CartResponse>(`${this.baseUrl}/coupon`, payload).pipe(
            tap(response => this.cartState.setCart(response.data)),
            catchError(this.handleError)
        );
    }

    /**
     * Remove coupon from cart
     */
    removeCoupon(): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.baseUrl}/coupon`).pipe(
            tap(response => this.cartState.setCart(response.data)),
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never> {
        const errorMessage = error.error?.message || error.message || 'An error occurred';
        return throwError(() => error);
    }
}
