import { Component, input, output, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Cart } from '../../../../shared/models/cart.interface';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

/**
 * Order Summary Component - Displays order totals and coupon application
 * Responsibilities:
 * - Display subtotal, shipping, tax, discount, and total
 * - Handle coupon code input and application
 * - Display action buttons (checkout, continue, back)
 */
@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, PricePipe],
    templateUrl: './order-summary.component.html',
    styleUrl: './order-summary.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent {
    // Inputs
    cart = input.required<Cart>();
    showCoupon = input<boolean>(true);
    showCheckoutButton = input<boolean>(true);
    checkoutButtonText = input<string>('CART_PAGE.CONTINUE_SHIPPING');
    applyingCoupon = input<boolean>(false);
    showBackButton = input<boolean>(false);
    backButtonText = input<string>('CART_PAGE.BACK_TO_CART');

    // Outputs
    checkout = output<void>();
    applyCoupon = output<string>();
    back = output<void>();

    // Local state
    couponCode = signal('');

    // Computed values
    hasCoupon = computed(() => !!this.cart().coupon);
    hasDiscount = computed(() => this.cart().discount > 0);
    isFreeShipping = computed(() => this.cart().shipping === 0);
    canApplyCoupon = computed(() => {
        return this.couponCode().trim().length > 0 && !this.applyingCoupon();
    });

    // Methods
    onApplyCoupon(): void {
        if (this.canApplyCoupon()) {
            this.applyCoupon.emit(this.couponCode().trim());
        }
    }

    onCheckout(): void {
        this.checkout.emit();
    }

    onBack(): void {
        this.back.emit();
    }
}
