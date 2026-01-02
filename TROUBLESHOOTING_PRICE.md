# Troubleshooting Price Display Issues

If you're still seeing floating point errors like `799.9200000000001 جنيها`, follow these steps:

## Step 1: Clear Browser Cache

The most common cause is browser caching. Clear your cache completely:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page with `Ctrl + F5`

**Or use hard refresh:**
- `Ctrl + F5` (Windows)
- `Cmd + Shift + R` (Mac)

## Step 2: Verify Development Server is Running

Make sure you've restarted the Angular development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
ng serve

# Or with port
ng serve --port 4200
```

## Step 3: Check Console for Errors

Open browser DevTools (F12) and check the Console tab for any errors related to:
- PricePipe
- Missing imports
- Translation errors

## Step 4: Verify Pipe is Imported

Check that components using prices import the PricePipe:

```typescript
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
  imports: [CommonModule, TranslateModule, PricePipe], // ✅ PricePipe included
  // ...
})
```

## Step 5: Manual Verification

Create a test component to verify the pipe works:

```html
<!-- Add this temporarily to any page -->
<div class="test-prices" style="padding: 20px; background: yellow;">
  <h3>Price Pipe Tests:</h3>
  <div>814.9300000000001 → {{ 814.9300000000001 | price }}</div>
  <div>799.9200000000001 → {{ 799.9200000000001 | price }}</div>
  <div>Expected: "814.93 جنيها" and "799.92 جنيها"</div>
</div>
```

## Step 6: Check All Applied Locations

The pipe has been applied to:

### ✅ Cart Item Component
**File:** `src/app/features/cart/components/cart-item/cart-item.component.html`
```html
<div class="fw-bold">{{ itemTotal() | price }}</div>
```

### ✅ Order Summary Component
**File:** `src/app/features/cart/components/order-summary/order-summary.component.html`
```html
<span>{{ cart().subtotal | price }}</span>
<span>{{ cart().tax | price }}</span>
<strong>{{ cart().total | price }}</strong>
```

### ✅ Cart Page
**File:** `src/app/features/cart/pages/cart-page/cart-page.html`
```html
<strong>{{ cart()!.total | price }}</strong>
```

### ✅ Product Card
**File:** `src/app/shared/components/product-card/product-card.html`
```html
<div>{{ product().price | price }}</div>
```

## Step 7: Check Translation File

Verify currency is defined in translations:

**File:** `public/i18n/ar.json`
```json
{
  "PRODUCT": {
    "CURRENCY": "جنيها"
  }
}
```

**File:** `public/i18n/en.json`
```json
{
  "PRODUCT": {
    "CURRENCY": "EGP"
  }
}
```

## Step 8: Rebuild the Application

If nothing works, try a clean rebuild:

```bash
# Stop the server
Ctrl + C

# Clear node_modules cache (if needed)
rm -rf .angular/cache

# Rebuild
ng serve --configuration development
```

## Step 9: Check Specific Page

If you're seeing the error on a specific page, let me know which page and I can check if we missed applying the pipe there:

- Cart page?
- Product details?
- Checkout page?
- Order confirmation?
- Other?

## Common Issues & Solutions

### Issue: Pipe not found error
**Solution:** Ensure PricePipe is imported in the component's imports array

### Issue: Still showing old format
**Solution:** Hard refresh browser (Ctrl + F5)

### Issue: Pipe not working in production
**Solution:** Ensure standalone: true in pipe decorator

### Issue: Translation not loading
**Solution:** Check TranslateService is initialized

## Example of Correctly Applied Pipe

**WRONG ❌:**
```html
<div>{{ cart.total }} جنيها</div>
<div>{{ cart.total }} {{ 'PRODUCT.CURRENCY' | translate }}</div>
<div>{{ cart.total.toFixed(2) }} جنيها</div>
```

**CORRECT ✅:**
```html
<div>{{ cart.total | price }}</div>
```

## Testing the Pipe Directly

In your browser console, after the app loads:

```javascript
// This should be defined
console.log(PricePipe);

// Check if translations are loaded
console.log(translateService.instant('PRODUCT.CURRENCY'));
```

## Still Having Issues?

If you're still seeing `799.9200000000001 جنيها`:

1. **Screenshot the exact location** where you see it
2. **Check the HTML source** of that element
3. **Verify** which component is rendering it
4. **Share** the component name with me

I can then check if there's a specific place we missed applying the pipe.

## Quick Fix Script

Run this to verify all prices are using the pipe:

```bash
# Search for potential missed prices
grep -r "PRODUCT\.CURRENCY.*translate" src/app --include="*.html"

# Should return empty if everything is converted
```

If this returns any results, those files need to be updated to use the pipe.
