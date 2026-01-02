# Price Formatting Guide

This document explains how price formatting works in the e-commerce application.

## Problem

JavaScript floating-point arithmetic can cause precision issues:

```javascript
814.93 * 1 = 814.9300000000001  // ❌ Incorrect display
1234.567 = 1234.567            // ❌ Too many decimals
```

## Solution

We've implemented a **PricePipe** that:
- ✅ Fixes floating-point precision errors
- ✅ Formats to 2 decimal places by default
- ✅ Adds currency automatically
- ✅ Supports RTL/LTR formatting
- ✅ Optional thousand separators
- ✅ Handles null/undefined values

## Usage

### Basic Usage

```html
<!-- Simple price formatting -->
{{ 814.9300000000001 | price }}
<!-- Output (AR): "814.93 جنيها" -->
<!-- Output (EN): "814.93 EGP" -->
```

### Custom Currency

```html
{{ 100 | price:'USD' }}
<!-- Output: "100.00 USD" -->
```

### No Decimals

```html
{{ 99.99 | price:undefined:0 }}
<!-- Output: "100 جنيها" -->
```

### With Thousand Separators

```html
{{ 1234567.89 | price:undefined:2:true }}
<!-- Output: "1,234,567.89 جنيها" -->
```

## Examples

### Product Card

**Before:**
```html
<div>{{ product().price }} {{ 'PRODUCT.CURRENCY' | translate }}</div>
<!-- Output: "814.9300000000001 جنيها" ❌ -->
```

**After:**
```html
<div>{{ product().price | price }}</div>
<!-- Output: "814.93 جنيها" ✅ -->
```

### Cart Item

**Before:**
```html
<span>{{ item.product.price * item.quantity }} {{ 'PRODUCT.CURRENCY' | translate }}</span>
<!-- Output: "2444.7900000000004 جنيها" ❌ -->
```

**After:**
```html
<span>{{ item.product.price * item.quantity | price }}</span>
<!-- Output: "2444.79 جنيها" ✅ -->
```

### Order Summary

**Before:**
```html
<div>
  <span>Total:</span>
  <span>{{ cart.total }} {{ 'PRODUCT.CURRENCY' | translate }}</span>
</div>
<!-- Output: "814.9300000000001 جنيها" ❌ -->
```

**After:**
```html
<div>
  <span>Total:</span>
  <span>{{ cart.total | price }}</span>
</div>
<!-- Output: "814.93 جنيها" ✅ -->
```

## Advanced: CurrencyFormatPipe

For more advanced formatting with locale support:

```html
<!-- With locale -->
{{ 1234567.89 | currencyFormat:'EGP':'ar-EG' }}
<!-- Output: "١٬٢٣٤٬٥٦٧٫٨٩ جنيها" (Arabic numerals) -->

{{ 1234567.89 | currencyFormat:'EGP':'en-US' }}
<!-- Output: "1,234,567.89 EGP" (Western numerals) -->

<!-- No decimals -->
{{ 99.99 | currencyFormat:undefined:undefined:0 }}
<!-- Output: "100 جنيها" -->
```

## ProductUtil Utility Functions

For programmatic price formatting in TypeScript:

```typescript
import { ProductUtil } from '@shared/utils/product.util';

// Format price
const formatted = ProductUtil.formatPrice(814.93, 'EGP', 2);
// Returns: "814.93 EGP"

// Format with thousand separators
const withSeparators = ProductUtil.formatPriceWithSeparators(1234567.89, 'EGP', 2);
// Returns: "1,234,567.89 EGP"

// Round to precision (fix floating point errors)
const rounded = ProductUtil.roundToPrecision(814.9300000000001, 2);
// Returns: 814.93

// Parse price from string
const parsed = ProductUtil.parsePrice("814.93");
// Returns: 814.93
```

## How It Works

### 1. Precision Fixing

The pipe uses `toFixed()` and proper rounding to eliminate floating-point errors:

```typescript
const fixedValue = parseFloat(numericValue.toFixed(decimalPlaces));
```

### 2. Number Formatting

Uses `Intl.NumberFormat` for proper thousand separators:

```typescript
const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
});
```

### 3. Currency Placement

Automatically handles RTL/LTR based on current language:

```typescript
if (currentLang === 'ar') {
    return `${formattedNumber} ${currencyText}`; // RTL
} else {
    return `${formattedNumber} ${currencyText}`; // LTR
}
```

## Configuration

### Default Settings

- **Decimal Places**: 2
- **Thousand Separators**: Disabled (can be enabled)
- **Currency**: From `PRODUCT.CURRENCY` translation key

### Customizing Currency

Update in translation files:

**ar.json:**
```json
{
  "PRODUCT": {
    "CURRENCY": "جنيها"
  }
}
```

**en.json:**
```json
{
  "PRODUCT": {
    "CURRENCY": "EGP"
  }
}
```

## Applied Throughout

The PricePipe is now used in:

✅ **Product Card** - Product prices
✅ **Cart Item Component** - Item totals
✅ **Order Summary Component** - All price fields
✅ **Cart Page** - Shipping and totals

## Testing

### Test Cases

```typescript
// Test floating point fix
814.9300000000001 | price → "814.93 جنيها" ✅

// Test rounding
99.996 | price → "100.00 جنيها" ✅

// Test null handling
null | price → "0.00 جنيها" ✅

// Test large numbers
1234567.89 | price:undefined:2:true → "1,234,567.89 جنيها" ✅

// Test zero decimals
99.99 | price:undefined:0 → "100 جنيها" ✅
```

## Migration Guide

### Before (Old Code)

```html
<!-- Manual formatting -->
<div>{{ product.price.toFixed(2) }} {{ 'PRODUCT.CURRENCY' | translate }}</div>

<!-- Or even worse -->
<div>{{ product.price }} جنيها</div>
```

### After (New Code)

```html
<!-- Using pipe -->
<div>{{ product.price | price }}</div>
```

## Best Practices

1. **Always use the pipe in templates** for price display
2. **Use ProductUtil functions** for TypeScript calculations
3. **Don't use toFixed() directly** - use the pipe or utility
4. **Enable thousand separators** for large amounts (> 1000)
5. **Be consistent** - use the same format throughout

## Benefits

✅ **Consistent formatting** across the entire application
✅ **No floating-point errors** in price display
✅ **Easy to maintain** - change once, updates everywhere
✅ **Internationalization ready** - supports RTL/LTR
✅ **Reusable** - works with any number value
✅ **Type-safe** - handles null/undefined gracefully

## Questions?

For questions or issues with price formatting, check:
1. `src/app/shared/pipes/price.pipe.ts`
2. `src/app/shared/pipes/currency-format.pipe.ts`
3. `src/app/shared/utils/product.util.ts`
