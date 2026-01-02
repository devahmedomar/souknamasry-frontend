import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem } from '../../../shared/models/cart.interface';

@Injectable({
    providedIn: 'root'
})
export class CartStateService {
    // Signals for cart state
    private _cart = signal<Cart | null>(null);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    // Public readonly signals
    readonly cart = this._cart.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    // Computed values
    readonly itemCount = computed(() => {
        const cart = this._cart();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    readonly isEmpty = computed(() => {
        const cart = this._cart();
        return !cart || cart.items.length === 0;
    });

    readonly hasDiscount = computed(() => {
        const cart = this._cart();
        return cart?.discount ? cart.discount > 0 : false;
    });

    readonly hasCoupon = computed(() => {
        const cart = this._cart();
        return !!cart?.coupon;
    });

    // State mutations
    setCart(cart: Cart | null): void {
        this._cart.set(cart);
        this._error.set(null);
    }

    setLoading(loading: boolean): void {
        this._loading.set(loading);
    }

    setError(error: string | null): void {
        this._error.set(error);
    }

    updateItemQuantity(itemId: string, quantity: number): void {
        const currentCart = this._cart();
        if (!currentCart) return;

        const updatedItems = currentCart.items.map(item =>
            item._id === itemId ? { ...item, quantity } : item
        );

        this._cart.update(cart => cart ? { ...cart, items: updatedItems } : null);
    }

    removeItem(itemId: string): void {
        const currentCart = this._cart();
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(item => item._id !== itemId);
        this._cart.update(cart => cart ? { ...cart, items: updatedItems } : null);
    }

    clearCart(): void {
        this._cart.set(null);
    }

    reset(): void {
        this._cart.set(null);
        this._loading.set(false);
        this._error.set(null);
    }
}
