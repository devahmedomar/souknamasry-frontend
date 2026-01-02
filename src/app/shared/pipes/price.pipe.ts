import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Price Pipe - Formats price with currency
 *
 * Usage:
 * {{ price | price }}                    // Uses default currency from translations
 * {{ price | price:'USD' }}              // Custom currency
 * {{ price | price:undefined:0 }}        // No decimal places
 * {{ price | price:undefined:2:true }}   // With thousand separators
 *
 * Examples:
 * 814.9300000000001 | price => "814.93 جنيها" (AR) or "814.93 EGP" (EN)
 * 1234.56 | price => "1234.56 جنيها"
 * 1234.56 | price:undefined:2:true => "1,234.56 جنيها"
 */
@Pipe({
    name: 'price',
    standalone: true,
    pure: true
})
export class PricePipe implements PipeTransform {
    private translateService = inject(TranslateService);

    transform(
        value: number | string | null | undefined,
        currency?: string,
        decimalPlaces: number = 2,
        useGrouping: boolean = false
    ): string {
        // Handle null/undefined/empty values
        if (value === null || value === undefined || value === '') {
            return '0';
        }

        // Convert to number
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;

        // Handle NaN
        if (isNaN(numericValue)) {
            return '0';
        }

        // Fix floating point precision issues and round to specified decimal places
        const fixedValue = parseFloat(numericValue.toFixed(decimalPlaces));

        // Format number with optional grouping
        const formattedNumber = this.formatNumber(fixedValue, decimalPlaces, useGrouping);

        // Get currency from translation or use provided
        const currencyText = currency || this.translateService.instant('PRODUCT.CURRENCY');

        // Get current language for RTL/LTR formatting
        const currentLang = this.translateService.currentLang || 'ar';

        // Format based on language direction
        if (currentLang === 'ar') {
            // Arabic: number + space + currency (RTL)
            return `${formattedNumber} ${currencyText}`;
        } else {
            // English: number + space + currency (LTR)
            return `${formattedNumber} ${currencyText}`;
        }
    }

    private formatNumber(value: number, decimalPlaces: number, useGrouping: boolean): string {
        // Always use Intl.NumberFormat to ensure consistent decimal places
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
            useGrouping: useGrouping
        });

        return formatter.format(value);
    }
}
