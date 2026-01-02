import { Pipe, PipeTransform, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

/**
 * Currency Format Pipe - Advanced currency formatting
 *
 * Usage:
 * {{ price | currencyFormat }}                           // Default: 2 decimals, with grouping
 * {{ price | currencyFormat:'USD' }}                     // Custom currency
 * {{ price | currencyFormat:'EGP':'ar-EG' }}            // With locale
 * {{ price | currencyFormat:undefined:undefined:0 }}     // No decimals
 *
 * Examples:
 * 814.9300000000001 | currencyFormat => "814.93 جنيها"
 * 1234567.89 | currencyFormat => "1,234,567.89 جنيها"
 */
@Pipe({
    name: 'currencyFormat',
    standalone: true,
    pure: true
})
export class CurrencyFormatPipe implements PipeTransform {
    private translateService = inject(TranslateService);

    transform(
        value: number | string | null | undefined,
        currency?: string,
        locale?: string,
        decimalPlaces: number = 2
    ): string {
        // Handle null/undefined/empty values
        if (value === null || value === undefined || value === '') {
            return this.formatZero(currency, decimalPlaces);
        }

        // Convert to number
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;

        // Handle NaN
        if (isNaN(numericValue)) {
            return this.formatZero(currency, decimalPlaces);
        }

        // Fix floating point precision
        const fixedValue = this.roundToPrecision(numericValue, decimalPlaces);

        // Get currency and locale
        const currencyCode = currency || this.translateService.instant('PRODUCT.CURRENCY');
        const currentLang = this.translateService.currentLang || 'ar';
        const localeCode = locale || (currentLang === 'ar' ? 'ar-EG' : 'en-US');

        // Format using Intl.NumberFormat
        try {
            const formatter = new Intl.NumberFormat(localeCode, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
                useGrouping: true
            });

            const formattedNumber = formatter.format(fixedValue);
            return `${formattedNumber} ${currencyCode}`;
        } catch (error) {
            // Fallback to simple formatting
            return `${fixedValue.toFixed(decimalPlaces)} ${currencyCode}`;
        }
    }

    private roundToPrecision(value: number, decimals: number): number {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    }

    private formatZero(currency?: string, decimalPlaces: number = 2): string {
        const currencyCode = currency || this.translateService.instant('PRODUCT.CURRENCY');
        return `${(0).toFixed(decimalPlaces)} ${currencyCode}`;
    }
}
