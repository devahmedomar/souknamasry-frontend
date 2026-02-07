import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { CartStateService } from '../../services/cart-state.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AddressService } from '../../../user/services/address.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { AddressSelectorComponent } from '../../components/address-selector/address-selector.component';
import { Address } from '../../../../shared/models/address.interface';
import { CreateOrderRequest, Order } from '../../../../shared/models/order.interface';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { CartItemSkeleton, AddressCardSkeleton } from '../../../../shared/components/skeletons';

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
        FormsModule,
        StepperModule,
        TranslateModule,
        CartItemComponent,
        OrderSummaryComponent,
        AddressSelectorComponent,
        PricePipe,
        CartItemSkeleton,
        AddressCardSkeleton
    ],
    templateUrl: './cart-page.html',
    styleUrl: './cart-page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage implements OnInit {
    private readonly cartService = inject(CartService);
    private readonly cartState = inject(CartStateService);
    private readonly orderService = inject(OrderService);
    private readonly addressService = inject(AddressService);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly translateService = inject(TranslateService);
    readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

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

    // Address state
    addresses = signal<Address[]>([]);
    loadingAddresses = signal(false);
    selectedAddress = signal<Address | null>(null);

    // Order state
    orderNotes = signal('');
    creatingOrder = signal(false);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        this.loadCart();
        this.loadAddresses();
    }

    // Cart operations
    loadCart(): void {
        this.cartService.getCart().subscribe({
            error: (err: any) => {
                this.handleError(err);
            }
        });
    }

    /**
     * Load user's addresses from the address service
     */
    loadAddresses(): void {
        this.loadingAddresses.set(true);
        this.addressService.getAddresses().subscribe({
            next: (response) => {
                this.addresses.set(response.data);
                this.loadingAddresses.set(false);

                // Auto-select default address if available
                const defaultAddress = response.data.find(addr => addr.isDefault);
                if (defaultAddress) {
                    this.selectedAddress.set(defaultAddress);
                }
            },
            error: (err) => {
                this.loadingAddresses.set(false);
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
        // Check if user has addresses
        if (this.addresses().length === 0) {
            this.showNoAddressesMessage();
            return;
        }
        this.activeStep.set(2);
    }

    backToCart(): void {
        this.activeStep.set(1);
    }

    /**
     * Confirm and create the order
     */
    confirmOrder(): void {
        // Validate selected address
        if (!this.selectedAddress()) {
            this.showError('CART_PAGE.SELECT_ADDRESS_REQUIRED');
            return;
        }

        // Validate notes length (max 500 chars)
        if (this.orderNotes().length > 500) {
            this.showError('CART_PAGE.NOTES_TOO_LONG');
            return;
        }

        // Create order request payload
        const orderRequest: CreateOrderRequest = {
            shippingAddressId: this.selectedAddress()!._id!,
            paymentMethod: 'cod',
            notes: this.orderNotes().trim() || undefined
        };

        // Set loading state
        this.creatingOrder.set(true);

        // Submit order
        this.orderService.createOrder(orderRequest).subscribe({
            next: (response) => {
                this.creatingOrder.set(false);

                // Show success message
                this.showOrderSuccess(response.data);

                // Clear cart (optimistic UI update)
                this.cartService.clearCart().subscribe({
                    next: () => {
                        // Redirect to profile orders page after 2 seconds
                        setTimeout(() => {
                            this.router.navigate(['/user/profile'], {
                                queryParams: { tab: 'orders' }
                            });
                        }, 2000);
                    },
                    error: (err) => {
                        // Even if cart clear fails, order was created successfully
                        console.warn('Cart clear failed but order created:', err);
                        // Still redirect to profile orders page
                        setTimeout(() => {
                            this.router.navigate(['/user/profile'], {
                                queryParams: { tab: 'orders' }
                            });
                        }, 2000);
                    }
                });
            },
            error: (err) => {
                this.creatingOrder.set(false);
                this.handleOrderError(err);
            }
        });
    }

    /**
     * Update order notes
     */
    updateOrderNotes(notes: string): void {
        this.orderNotes.set(notes);
    }

    // Address operations
    selectAddress(address: Address): void {
        this.selectedAddress.set(address);
    }

    addNewAddress(): void {
        // Redirect to profile page with addresses tab, auto-open modal, and return URL
        this.router.navigate(['/user/profile'], {
            queryParams: { tab: 'addresses', action: 'add', returnUrl: '/cart' }
        });
    }

    deleteAddress(addressId: string): void {
        // TODO: Implement delete address
        this.toast.infoT('COMMON.FEATURE_COMING_SOON');
    }

    // Utility methods
    isItemUpdating(itemId: string): boolean {
        return this.updatingItemId() === itemId;
    }

    isItemRemoving(itemId: string): boolean {
        return this.removingItemId() === itemId;
    }

    // Order helper methods
    /**
     * Show message when user has no addresses and redirect to addresses tab
     */
    private showNoAddressesMessage(): void {
        this.toast.warnT('CART_PAGE.NO_ADDRESSES_MESSAGE', 'CART_PAGE.NO_ADDRESSES_TITLE');

        // Redirect to profile page with addresses tab, auto-open modal, and return URL
        this.router.navigate(['/user/profile'], {
            queryParams: { tab: 'addresses', action: 'add', returnUrl: '/cart' }
        });
    }

    /**
     * Show success message with order details
     */
    private showOrderSuccess(order: Order): void {
        this.translateService.get([
            'CART_PAGE.ORDER_CREATED_SUCCESS',
            'CART_PAGE.ORDER_ID'
        ]).subscribe(translations => {
            this.toast.success(
                `${translations['CART_PAGE.ORDER_CREATED_SUCCESS']} ${translations['CART_PAGE.ORDER_ID']}: ${order.orderNumber}`,
                { life: 5000 }
            );
        });
    }

    /**
     * Handle order creation errors
     */
    private handleOrderError(err: any): void {
        console.error('Order creation error:', err);

        // Handle specific error cases
        if (err.status === 400) {
            if (err.error?.message?.includes('address')) {
                this.showError('CART_PAGE.INVALID_ADDRESS');
            } else if (err.error?.message?.includes('stock')) {
                this.showError('CART_PAGE.INSUFFICIENT_STOCK');
            } else {
                this.showError('CART_PAGE.ORDER_VALIDATION_ERROR');
            }
        } else if (err.status === 404) {
            this.showError('CART_PAGE.ADDRESS_NOT_FOUND');
        } else {
            this.showError('CART_PAGE.ORDER_CREATION_FAILED');
        }
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
        this.toast.successT(messageKey);
    }

    private showError(messageKey: string): void {
        this.toast.errorT(messageKey);
    }
}
