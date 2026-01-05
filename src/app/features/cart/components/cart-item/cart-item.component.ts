import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartItem } from '../../../../shared/models/cart.interface';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { inject } from '@angular/core';

/**
 * Cart Item Component - Displays a single cart item
 * Responsibilities:
 * - Display product information
 * - Handle quantity changes
 * - Handle item removal
 */
@Component({
    selector: 'app-cart-item',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, TranslateModule, PricePipe],
    templateUrl: './cart-item.component.html',
    styleUrl: './cart-item.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
    private translateService = inject(TranslateService);

    // Inputs
    item = input.required<CartItem>();
    updating = input<boolean>(false);
    removing = input<boolean>(false);
    compact = input<boolean>(false); // For compact view in address step

    // Outputs
    quantityChange = output<number>();
    remove = output<void>();

    // Computed values
    productImage = computed(() => {
        const item = this.item();
        return item.product?.images?.[0] || item.product?.image || '/images/placeholder.png';
    });

    productName = computed(() => {
        const item = this.item();
        const lang = this.translateService.currentLang;
        return lang === 'ar' ? item.product?.nameAr : item.product?.name;
    });

    itemTotal = computed(() => {
        const item = this.item();
        return item.product.price * item.quantity;
    });

    canDecrease = computed(() => {
        return this.item().quantity > 1 && !this.updating();
    });

    canIncrease = computed(() => {
        return !this.updating();
    });

    // Methods
    increaseQuantity(): void {
        if (this.canIncrease()) {
            this.quantityChange.emit(this.item().quantity + 1);
        }
    }

    decreaseQuantity(): void {
        if (this.canDecrease()) {
            this.quantityChange.emit(this.item().quantity - 1);
        }
    }

    onQuantityInput(event: Event): void {
        const value = parseInt((event.target as HTMLInputElement).value);
        if (value >= 1) {
            this.quantityChange.emit(value);
        }
    }

    onRemove(): void {
        this.remove.emit();
    }
}
