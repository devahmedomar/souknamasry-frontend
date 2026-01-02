import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { CartService } from '../../services/cart.service';
import { CartStateService } from '../../services/cart-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { AddressSelectorComponent } from '../../components/address-selector/address-selector.component';
import { Address } from '../../../../shared/models/address.interface';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

/**
 * Cart Page Component - Main cart page with stepper
 * Responsibilities:
 * - Manage cart workflow (cart -> address -> payment)
 * - Coordinate between child components
 * - Handle user interactions and notifications
 */
@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        StepperModule,
        TranslateModule,
        CartItemComponent,
        OrderSummaryComponent,
        AddressSelectorComponent,
        PricePipe
    ],
    templateUrl: './cart-page.html',
    styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {
    private readonly cartService = inject(CartService);
    private readonly cartState = inject(CartStateService);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);
    private readonly translateService = inject(TranslateService);
    private readonly router = inject(Router);

    // State from CartStateService
    cart = this.cartState.cart;
    loading = this.cartState.loading;
    isEmpty = this.cartState.isEmpty;

    // Local state
    activeStep = signal(1);
    updatingItemId = signal<string | null>(null);
    removingItemId = signal<string | null>(null);
    clearingCart = signal(false);
    applyingCoupon = signal(false);

    // Mock addresses (TODO: Replace with actual address service)
    addresses = signal<Address[]>([
        {
            _id: '1',
            fullName: 'Ahmed Mohamed',
            phone: '0154532355',
            addressLine1: '123 Main Street',
            addressLine2: 'Apartment 4B',
            city: 'Cairo',
            state: 'Cairo',
            postalCode: '12345',
            country: 'Egypt',
            addressType: 'home',
            isDefault: true
        },
        {
            _id: '2',
            fullName: 'Ahmed Mohamed',
            phone: '0154532355',
            addressLine1: '456 Work Plaza',
            city: 'Giza',
            state: 'Giza',
            postalCode: '67890',
            country: 'Egypt',
            addressType: 'work'
        }
    ]);
    selectedAddress = signal<Address | null>(null);

    ngOnInit(): void {
        this.loadCart();
    }

    // Cart operations
    loadCart(): void {
        this.cartService.getCart().subscribe({
            error: (err: any) => {
                this.handleError(err);
            }
        });
    }

    updateQuantity(itemId: string, quantity: number): void {
        if (quantity < 1) return;

        this.updatingItemId.set(itemId);
        this.cartService.updateCartItem(itemId, { quantity }).subscribe({
            next: () => {
                this.updatingItemId.set(null);
            },
            error: (err) => {
                this.updatingItemId.set(null);
                this.showError('CART_PAGE.UPDATE_FAILED');
            }
        });
    }

    removeItem(itemId: string): void {
        this.removingItemId.set(itemId);
        this.cartService.removeCartItem(itemId).subscribe({
            next: () => {
                this.removingItemId.set(null);
                this.showSuccess('CART_PAGE.ITEM_REMOVED');
            },
            error: (err) => {
                this.removingItemId.set(null);
                this.showError('CART_PAGE.REMOVE_FAILED');
            }
        });
    }

    clearCart(): void {
        this.clearingCart.set(true);
        this.cartService.clearCart().subscribe({
            next: () => {
                this.clearingCart.set(false);
                this.showSuccess('CART_PAGE.CART_CLEARED');
            },
            error: (err) => {
                this.clearingCart.set(false);
                this.showError('CART_PAGE.CLEAR_FAILED');
            }
        });
    }

    applyCoupon(code: string): void {
        this.applyingCoupon.set(true);
        this.cartService.applyCoupon({ couponCode: code }).subscribe({
            next: () => {
                this.applyingCoupon.set(false);
                this.showSuccess('CART_PAGE.COUPON_APPLIED');
            },
            error: (err) => {
                this.applyingCoupon.set(false);
                this.showError('CART_PAGE.INVALID_COUPON');
            }
        });
    }

    // Navigation
    continueToShipping(): void {
        this.activeStep.set(2);
    }

    backToCart(): void {
        this.activeStep.set(1);
    }

    confirmOrder(): void {
        if (!this.selectedAddress()) {
            this.showError('CART_PAGE.SELECT_ADDRESS_REQUIRED');
            return;
        }
        // TODO: Implement order creation
        this.showSuccess('CART_PAGE.ORDER_CONFIRMED');
    }

    // Address operations
    selectAddress(address: Address): void {
        this.selectedAddress.set(address);
    }

    addNewAddress(): void {
        // TODO: Implement add address dialog
        this.showInfo('Feature coming soon');
    }

    deleteAddress(addressId: string): void {
        // TODO: Implement delete address
        this.showInfo('Feature coming soon');
    }

    // Utility methods
    isItemUpdating(itemId: string): boolean {
        return this.updatingItemId() === itemId;
    }

    isItemRemoving(itemId: string): boolean {
        return this.removingItemId() === itemId;
    }

    // Error handling and notifications
    private handleError(err: any): void {
        console.error('Cart error:', err);

        if (err.status === 401) {
            this.authService.clearAuthData();
            this.router.navigate(['/auth/login']);
            this.showError('AUTH.MESSAGES.SESSION_EXPIRED');
            return;
        }

        this.showError('COMMON.ERROR_OCCURRED');
    }

    private showSuccess(messageKey: string): void {
        this.translateService.get([messageKey, 'AUTH.MESSAGES.SUCCESS']).subscribe(translations => {
            this.messageService.add({
                severity: 'success',
                summary: translations['AUTH.MESSAGES.SUCCESS'],
                detail: translations[messageKey],
                life: 3000
            });
        });
    }

    private showError(messageKey: string): void {
        this.translateService.get([messageKey, 'AUTH.MESSAGES.ERROR']).subscribe(translations => {
            this.messageService.add({
                severity: 'error',
                summary: translations['AUTH.MESSAGES.ERROR'],
                detail: translations[messageKey],
                life: 3000
            });
        });
    }

    private showInfo(message: string): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: message,
            life: 3000
        });
    }
}
