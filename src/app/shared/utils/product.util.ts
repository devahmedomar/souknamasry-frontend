import { Product } from '../models/product.interface';

/**
 * Product Utility - Helper functions for product operations
 */
export class ProductUtil {
    /**
     * Get product image URL
     */
    static getProductImage(product: Product): string {
        return product?.images?.[0] || product?.image || '/images/placeholder.png';
    }

    /**
     * Get localized product name
     */
    static getLocalizedName(product: Product, lang: string): string {
        return lang === 'ar' ? (product?.nameAr || product?.name) : product?.name;
    }

    /**
     * Get localized product description
     */
    static getLocalizedDescription(product: Product, lang: string): string {
        return lang === 'ar' ? (product?.descriptionAr || product?.description || '') : (product?.description || '');
    }

    /**
     * Check if product is on sale
     */
    static isOnSale(product: Product): boolean {
        return product?.isOnSale || (product?.originalPrice ? product.originalPrice > product.price : false);
    }

    /**
     * Calculate discount percentage
     */
    static getDiscountPercentage(product: Product): number {
        if (!product?.originalPrice || product.originalPrice <= product.price) {
            return 0;
        }
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }

    /**
     * Check if product is in stock
     */
    static isInStock(product: Product): boolean {
        return product?.stock ? product.stock > 0 : true;
    }

    /**
     * Check if product has limited stock
     */
    static hasLimitedStock(product: Product, threshold: number = 5): boolean {
        return product?.stock ? product.stock <= threshold && product.stock > 0 : false;
    }

    /**
     * Format price with currency
     * Fixes floating point precision issues
     */
    static formatPrice(price: number, currency: string = 'EGP', decimalPlaces: number = 2): string {
        const fixedPrice = this.roundToPrecision(price, decimalPlaces);
        return `${fixedPrice.toFixed(decimalPlaces)} ${currency}`;
    }

    /**
     * Format price with thousand separators
     */
    static formatPriceWithSeparators(price: number, currency: string = 'EGP', decimalPlaces: number = 2): string {
        const fixedPrice = this.roundToPrecision(price, decimalPlaces);
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
            useGrouping: true
        });
        return `${formatter.format(fixedPrice)} ${currency}`;
    }

    /**
     * Round number to specified decimal places
     * Fixes JavaScript floating point precision issues
     */
    static roundToPrecision(value: number, decimals: number = 2): number {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    }

    /**
     * Parse price from string, handling floating point errors
     */
    static parsePrice(value: string | number): number {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numericValue)) return 0;
        return this.roundToPrecision(numericValue, 2);
    }
}
