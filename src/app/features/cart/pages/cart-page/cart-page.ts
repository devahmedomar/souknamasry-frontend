import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService, Cart } from '../../services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        StepperModule,
        ButtonModule,
        InputNumberModule,
        FormsModule,
        TranslateModule
    ],
    templateUrl: './cart-page.html',
    styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {
    private cartService = inject(CartService);
    private authService = inject(AuthService); // Injected AuthService
    private messageService = inject(MessageService);
    private translateService = inject(TranslateService);
    private router = inject(Router);

    cart = signal<Cart | null>(null);
    loading = signal(true);
    activeStep = signal(1);

    // Loading states for individual operations
    updatingItemId = signal<string | null>(null);
    removingItemId = signal<string | null>(null);
    clearingCart = signal(false);
    applyingCoupon = signal(false);

    // Coupon state
    couponCode = signal('');

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        this.loading.set(true);
        this.cartService.getCart().subscribe({
            next: (response) => {
                this.cart.set(response.data);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading cart:', err);
                this.loading.set(false);

                if (err.status === 401) {
                    this.authService.clearAuthData();
                    this.router.navigate(['/auth/login']);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                        detail: 'Session expired. Please login again.',
                        life: 3000
                    });
                    return;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: 'Failed to load cart',
                    life: 3000
                });
            }
        });
    }

    updateQuantity(itemId: string, quantity: number): void {
        if (quantity < 1) return;

        this.updatingItemId.set(itemId);
        this.cartService.updateCartItem(itemId, quantity).subscribe({
            next: (response) => {
                this.cart.set(response.data);
                this.updatingItemId.set(null);
            },
            error: (err) => {
                console.error('Error updating quantity:', err);
                this.updatingItemId.set(null);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: 'Failed to update quantity',
                    life: 3000
                });
            }
        });
    }

    removeItem(itemId: string): void {
        this.removingItemId.set(itemId);
        this.cartService.removeCartItem(itemId).subscribe({
            next: (response) => {
                this.cart.set(response.data);
                this.removingItemId.set(null);
                this.translateService.get('CART_PAGE.ITEM_REMOVED').subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error removing item:', err);
                this.removingItemId.set(null);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: 'Failed to remove item',
                    life: 3000
                });
            }
        });
    }

    clearCart(): void {
        this.clearingCart.set(true);
        this.cartService.clearCart().subscribe({
            next: () => {
                this.loadCart();
                this.clearingCart.set(false);
                this.translateService.get('CART_PAGE.CART_CLEARED').subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error clearing cart:', err);
                this.clearingCart.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                    detail: 'Failed to clear cart',
                    life: 3000
                });
            }
        });
    }

    applyCoupon(): void {
        const code = this.couponCode().trim();
        if (!code) return;

        this.applyingCoupon.set(true);
        this.cartService.applyCoupon(code).subscribe({
            next: (response) => {
                this.cart.set(response.data);
                this.applyingCoupon.set(false);
                this.couponCode.set('');
                this.translateService.get('CART_PAGE.COUPON_APPLIED').subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translateService.instant('AUTH.MESSAGES.SUCCESS'),
                        detail: message,
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Error applying coupon:', err);
                this.applyingCoupon.set(false);
                this.translateService.get('CART_PAGE.INVALID_COUPON').subscribe((message: string) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translateService.instant('AUTH.MESSAGES.ERROR'),
                        detail: message,
                        life: 3000
                    });
                });
            }
        });
    }

    continueToShipping(): void {
        this.activeStep.set(2);
    }

    backToCart(): void {
        this.activeStep.set(1);
    }

    getProductImage(item: any): string {
        return item.product?.images?.[0] || item.product?.image || '/images/placeholder.png';
    }

    getProductName(item: any): string {
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? item.product?.nameAr : item.product?.name;
    }
}
