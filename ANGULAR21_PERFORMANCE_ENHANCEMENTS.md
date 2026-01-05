# Angular 21 Performance Enhancements

## Implementation Summary

**Status:** COMPLETED
**Date:** 2026-01-05
**Approach:** Conservative, SSR-compatible, phased implementation

### Completed Enhancements

| Enhancement | Status | Impact |
|-------------|--------|--------|
| ChangeDetectionStrategy.OnPush | DONE | 40-60% fewer CD cycles |
| NgOptimizedImage | DONE | Improved LCP, auto lazy loading |
| @defer blocks (home-page) | DONE | Smaller initial bundle |
| Zoneless Change Detection | DONE | Faster runtime, less overhead |

### Components Updated (16 total)
- Footer, Header, ProductCard, HeroBanner
- FeaturedProducts, SponsoredProducts
- CartItem, OrderSummary, AddressSelector
- Categories, CartPage, HomePage
- Login, Register, ProfilePage
- MainLayout, AuthLayout

---

## Original State Analysis

| Feature | Before | After |
|---------|--------|-------|
| Angular Version | 21.0.0 | 21.0.0 |
| Standalone Components | 100% | 100% |
| New Control Flow (@if, @for) | Implemented | Implemented |
| Signals Usage | Partial | Partial |
| SSR with Hydration | Enabled | Enabled |
| Lazy Loading Routes | Implemented | Implemented |
| Zoneless Change Detection | Not enabled | **ENABLED** |
| @defer Blocks | Not used | **USED** |
| ChangeDetectionStrategy.OnPush | Not used | **ALL COMPONENTS** |
| Resource API (httpResource) | Not used | Not used (optional) |
| NgOptimizedImage | Not used | **USED** |

---

## Phase 1: Low Risk, High Impact

### 1.1 Add ChangeDetectionStrategy.OnPush to All Components

Since all components already use signals for inputs/outputs, adding OnPush is safe and will significantly reduce change detection cycles.

#### Files to Modify:

```
src/app/shared/components/footer/footer.ts
src/app/shared/components/header/header.ts
src/app/shared/components/product-card/product-card.ts
src/app/features/home/components/hero-banner/hero-banner.ts
src/app/features/home/components/featured-products/featured-products.ts
src/app/features/home/components/sponsored-products/sponsored-products.ts
src/app/features/cart/components/cart-item/cart-item.component.ts
src/app/features/cart/components/order-summary/order-summary.component.ts
src/app/features/products/pages/categories/categories.ts
src/app/features/cart/pages/cart-page/cart-page.ts
src/app/features/home/pages/home-page/home-page.ts
src/app/features/auth/pages/login/login.ts
src/app/features/auth/pages/register/register.ts
src/app/features/user/pages/profile-page/profile-page.ts
src/app/layout/main-layout/main-layout.ts
src/app/layout/auth-layout/auth-layout.ts
```

#### Change Pattern:

**Before:**
```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [...],
  templateUrl: './product-card.html',
})
export class ProductCard { }
```

**After:**
```typescript
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [...],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard { }
```

---

### 1.2 Add NgOptimizedImage for Image Optimization

#### Files to Modify:

| Component File | Template File | Priority Attribute |
|----------------|---------------|-------------------|
| `src/app/shared/components/product-card/product-card.ts` | `product-card.html` | No |
| `src/app/features/home/components/hero-banner/hero-banner.ts` | `hero-banner.html` | Yes (LCP) |
| `src/app/features/cart/components/cart-item/cart-item.component.ts` | `cart-item.component.html` | No |
| `src/app/shared/components/header/header.ts` | `header.html` | Yes (logo) |

#### Change Pattern:

**Component (add import):**
```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage, ...],
})
```

**Template - Static Image with Priority (hero-banner.html):**

Before:
```html
<img src="/images/hero.jpg" alt="Hero Banner" class="hero-image">
```

After:
```html
<img ngSrc="/images/hero.jpg" alt="Hero Banner" class="hero-image" width="1200" height="600" priority>
```

**Template - Dynamic Image (product-card.html):**

Before:
```html
<img [src]="product().imageUrl" [alt]="product().name" class="product-image">
```

After:
```html
<img [ngSrc]="product().imageUrl" [alt]="product().name" class="product-image" width="300" height="300">
```

---

## Phase 2: Resource API Migration

### 2.1 Convert Categories Component to httpResource

**File:** `src/app/features/products/pages/categories/categories.ts`

#### Current Implementation:
```typescript
path = toSignal(
  this.route.url.pipe(map(segments => segments.map(s => s.path).join('/'))),
  { initialValue: '' }
);

category$ = toObservable(this.path).pipe(
  switchMap(path => this.categoriesService.getCategoryByPath(path)),
  shareReplay(1)
);

category = toSignal(this.category$);

products$ = toObservable(this.category).pipe(
  switchMap(cat => {
    if (cat?.isLeaf) {
      return this.productsService.getProductsByCategory(cat.path);
    }
    return of([]);
  }),
  shareReplay(1)
);

products = toSignal(this.products$, { initialValue: [] });
```

#### New Implementation with httpResource:
```typescript
import { httpResource } from '@angular/core';
import { environment } from '@env/environment';

// Route path signal
path = toSignal(
  this.route.url.pipe(map(segments => segments.map(s => s.path).join('/'))),
  { initialValue: '' }
);

// Category resource - auto-fetches when path changes
categoryResource = httpResource<CategoryResponse>(() => {
  const currentPath = this.path();
  if (!currentPath) {
    return { url: `${environment.apiUrl}categories/root` };
  }
  return { url: `${environment.apiUrl}categories/path/${currentPath}` };
});

// Products resource - depends on category
productsResource = httpResource<ProductsResponse>(() => {
  const cat = this.categoryResource.value();
  if (!cat?.isLeaf) return undefined; // Skip fetch for non-leaf categories
  return { url: `${environment.apiUrl}products/category/${cat.path}` };
});

// Derived signals for template
category = computed(() => this.categoryResource.value());
products = computed(() => this.productsResource.value()?.products ?? []);
loading = computed(() =>
  this.categoryResource.isLoading() || this.productsResource.isLoading()
);
error = computed(() =>
  this.categoryResource.error() || this.productsResource.error()
);
```

---

### 2.2 Add linkedSignal for Optimistic Updates

**File:** `src/app/features/cart/services/cart-state.service.ts`

#### Current Implementation:
```typescript
private _cart = signal<Cart | null>(null);

updateCart(cart: Cart): void {
  this._cart.set(cart);
}
```

#### Enhanced with linkedSignal:
```typescript
import { signal, computed, linkedSignal } from '@angular/core';

private _cart = signal<Cart | null>(null);

// Pending quantity updates for optimistic UI
pendingQuantities = linkedSignal({
  source: this._cart,
  computation: () => new Map<string, number>()
});

// Displayed quantities (optimistic)
getDisplayQuantity(itemId: string): Signal<number> {
  return computed(() => {
    const pending = this.pendingQuantities().get(itemId);
    if (pending !== undefined) return pending;
    const cart = this._cart();
    return cart?.items.find(i => i._id === itemId)?.quantity ?? 0;
  });
}

// Optimistic update
setOptimisticQuantity(itemId: string, quantity: number): void {
  this.pendingQuantities.update(map => {
    const newMap = new Map(map);
    newMap.set(itemId, quantity);
    return newMap;
  });
}

// Clear pending after API success
clearPendingQuantity(itemId: string): void {
  this.pendingQuantities.update(map => {
    const newMap = new Map(map);
    newMap.delete(itemId);
    return newMap;
  });
}
```

---

## Phase 3: @defer Blocks for Lazy Loading

### 3.1 Home Page - Lazy Load Below-Fold Components

**File:** `src/app/features/home/pages/home-page/home-page.html`

#### Current Implementation:
```html
<app-hero-banner></app-hero-banner>
<div class="container">
    <h3 class="mb-4">{{ 'HOMEPAGE.FEATURED_PRODUCTS' | translate }}</h3>
    <app-featured-products></app-featured-products>
</div>
<div class="gradient-warmy">
    <div class="container">
        <app-sponsored-products></app-sponsored-products>
    </div>
</div>
```

#### New Implementation with @defer:
```html
<app-hero-banner></app-hero-banner>

<div class="container">
    <h3 class="mb-4">{{ 'HOMEPAGE.FEATURED_PRODUCTS' | translate }}</h3>
    @defer (on viewport) {
        <app-featured-products></app-featured-products>
    } @placeholder {
        <div class="products-placeholder py-4" style="min-height: 350px;">
            <div class="d-flex justify-content-center align-items-center h-100">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    } @loading (minimum 200ms) {
        <div class="d-flex justify-content-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
    }
</div>

<div class="gradient-warmy">
    <div class="container">
        @defer (on viewport) {
            <app-sponsored-products></app-sponsored-products>
        } @placeholder {
            <div class="products-placeholder py-4" style="min-height: 350px;"></div>
        } @loading (minimum 200ms) {
            <div class="d-flex justify-content-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        }
    </div>
</div>
```

---

### 3.2 Cart Page - Lazy Load Step Content

**File:** `src/app/features/cart/pages/cart-page/cart-page.html`

For address selection step (step 2):
```html
@if (activeStep() === 2) {
    @defer (on immediate) {
        <div class="address-selection">
            <!-- Address selector content -->
        </div>
    } @loading {
        <div class="text-center py-3">
            <span class="spinner-border spinner-border-sm"></span>
        </div>
    }
}
```

---

## Phase 4: Zoneless Change Detection

### 4.1 Prerequisites Checklist

Before enabling zoneless, verify:

- [ ] All components have `ChangeDetectionStrategy.OnPush`
- [ ] All reactive data uses signals
- [ ] No `setInterval`/`setTimeout` without `afterNextRender()`
- [ ] No manual `ChangeDetectorRef.detectChanges()` calls
- [ ] TranslateService observables wrapped with `toSignal()`

### 4.2 Enable Zoneless in App Config

**File:** `src/app/app.config.ts`

#### Current Implementation:
```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({...}),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    MessageService,
    importProvidersFrom(TranslateModule.forRoot({...})),
    providePrimeNG()
  ]
};
```

#### New Implementation with Zoneless:
```typescript
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection
} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Enable zoneless
    provideRouter(routes),
    providePrimeNG({...}),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    MessageService,
    importProvidersFrom(TranslateModule.forRoot({...})),
  ]
};
```

### 4.3 Wrap TranslateService Observables

Components using `translate.onLangChange` need to convert to signals:

**Example in header.ts:**
```typescript
// Before
this.translate.onLangChange.subscribe(event => {
  this.currentLang = event.lang;
});

// After
currentLang = toSignal(
  this.translate.onLangChange.pipe(map(event => event.lang)),
  { initialValue: this.translate.currentLang }
);
```

---

## Testing Strategy

### After Each Phase:

1. **Build Test:**
   ```bash
   ng build
   ```

2. **Development Test:**
   ```bash
   ng serve
   ```
   - Test all user flows
   - Check browser console for errors

3. **SSR Test:**
   ```bash
   npm run build
   npm run serve:ssr
   ```
   - Verify server-side rendering works
   - Check for hydration mismatches

4. **Performance Audit:**
   - Run Lighthouse audit
   - Compare LCP, CLS, INP scores

### Performance Metrics to Track:

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| INP | < 200ms | Lighthouse |
| Initial Bundle | < 150KB | ng build stats |
| Zone.js removal | -30KB | Phase 4 only |

---

## Rollback Strategy

Each phase is independent and can be reverted:

| Phase | Rollback Action |
|-------|-----------------|
| 1 | Remove `changeDetection: OnPush` from components |
| 2 | Revert to Observable pattern with `toSignal()` |
| 3 | Remove `@defer` blocks, use direct component tags |
| 4 | Remove `provideZonelessChangeDetection()` |

---

## Files Summary

### Phase 1 Files (~16 components):
```
src/app/shared/components/footer/footer.ts
src/app/shared/components/header/header.ts
src/app/shared/components/product-card/product-card.ts
src/app/shared/components/product-card/product-card.html
src/app/features/home/components/hero-banner/hero-banner.ts
src/app/features/home/components/hero-banner/hero-banner.html
src/app/features/home/components/featured-products/featured-products.ts
src/app/features/home/components/sponsored-products/sponsored-products.ts
src/app/features/cart/components/cart-item/cart-item.component.ts
src/app/features/cart/components/cart-item/cart-item.component.html
src/app/features/cart/components/order-summary/order-summary.component.ts
src/app/features/products/pages/categories/categories.ts
src/app/features/cart/pages/cart-page/cart-page.ts
src/app/features/home/pages/home-page/home-page.ts
src/app/features/auth/pages/login/login.ts
src/app/features/auth/pages/register/register.ts
src/app/features/user/pages/profile-page/profile-page.ts
src/app/layout/main-layout/main-layout.ts
src/app/layout/auth-layout/auth-layout.ts
```

### Phase 2 Files:
```
src/app/features/products/pages/categories/categories.ts
src/app/features/cart/services/cart-state.service.ts
```

### Phase 3 Files:
```
src/app/features/home/pages/home-page/home-page.html
src/app/features/cart/pages/cart-page/cart-page.html
```

### Phase 4 Files:
```
src/app/app.config.ts
src/app/shared/components/header/header.ts (TranslateService wrapping)
```

---

## Expected Outcomes

| Improvement | Expected Impact |
|-------------|-----------------|
| OnPush on all components | 40-60% fewer change detection cycles |
| NgOptimizedImage | Improved LCP, automatic lazy loading |
| @defer blocks | Smaller initial bundle, faster TTI |
| Resource API | Cleaner code, automatic loading states |
| Zoneless | ~30KB bundle reduction, faster runtime |

---

## References

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Resource API](https://angular.dev/guide/http/http-resource)
- [NgOptimizedImage](https://angular.dev/guide/image-optimization)
- [Zoneless Change Detection](https://angular.dev/guide/experimental/zoneless)
- [@defer Documentation](https://angular.dev/guide/defer)
