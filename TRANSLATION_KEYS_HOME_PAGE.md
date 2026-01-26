# Home Page Translation Keys

This document lists all the translation keys that need to be added to your translation files for the home page.

## Translation Keys Required

Add these keys to your translation JSON files (e.g., `en.json` and `ar.json`):

### Hero Banner Section
```json
{
  "HOMEPAGE": {
    "HERO_IMAGE_ALT": "Hero banner image",
    "BRAND_NAME": "Souk Namasry",
    "BRAND_SLOGAN": "Your one-stop shop for quality products at great prices",
    "BROWSE_NOW": "Browse Now"
  }
}
```

**Arabic Translation:**
```json
{
  "HOMEPAGE": {
    "HERO_IMAGE_ALT": "صورة البانر الرئيسي",
    "BRAND_NAME": "سوق نمسري",
    "BRAND_SLOGAN": "متجرك الشامل للمنتجات عالية الجودة بأسعار رائعة",
    "BROWSE_NOW": "تصفح الآن"
  }
}
```

### Featured Products Section
```json
{
  "HOMEPAGE": {
    "FEATURED_PRODUCTS": "Featured Products",
    "NO_FEATURED_PRODUCTS": "No featured products available",
    "ERROR_LOADING_FEATURED": "Failed to load featured products"
  }
}
```

**Arabic Translation:**
```json
{
  "HOMEPAGE": {
    "FEATURED_PRODUCTS": "المنتجات المميزة",
    "NO_FEATURED_PRODUCTS": "لا توجد منتجات مميزة متاحة",
    "ERROR_LOADING_FEATURED": "فشل تحميل المنتجات المميزة"
  }
}
```

### Sponsored Products Section
```json
{
  "HOMEPAGE": {
    "SPONSORED_PRODUCTS": "Sponsored Products",
    "NO_SPONSORED_PRODUCTS": "No sponsored products available",
    "ERROR_LOADING_SPONSORED": "Failed to load sponsored products"
  }
}
```

**Arabic Translation:**
```json
{
  "HOMEPAGE": {
    "SPONSORED_PRODUCTS": "المنتجات المدعومة",
    "NO_SPONSORED_PRODUCTS": "لا توجد منتجات مدعومة متاحة",
    "ERROR_LOADING_SPONSORED": "فشل تحميل المنتجات المدعومة"
  }
}
```

### Product Card Section
```json
{
  "PRODUCT": {
    "ADD_TO_CART": "Add to Cart",
    "QUICK_ADD": "Quick Add",
    "ADD_TO_WISHLIST": "Add to wishlist",
    "REMOVE_FROM_WISHLIST": "Remove from wishlist"
  }
}
```

**Arabic Translation:**
```json
{
  "PRODUCT": {
    "ADD_TO_CART": "أضف إلى السلة",
    "QUICK_ADD": "إضافة سريعة",
    "ADD_TO_WISHLIST": "أضف إلى المفضلة",
    "REMOVE_FROM_WISHLIST": "إزالة من المفضلة"
  }
}
```

---

## Complete Combined JSON

### English (en.json)
```json
{
  "HOMEPAGE": {
    "HERO_IMAGE_ALT": "Hero banner image",
    "BRAND_NAME": "Souk Namasry",
    "BRAND_SLOGAN": "Your one-stop shop for quality products at great prices",
    "BROWSE_NOW": "Browse Now",
    "FEATURED_PRODUCTS": "Featured Products",
    "NO_FEATURED_PRODUCTS": "No featured products available",
    "ERROR_LOADING_FEATURED": "Failed to load featured products",
    "SPONSORED_PRODUCTS": "Sponsored Products",
    "NO_SPONSORED_PRODUCTS": "No sponsored products available",
    "ERROR_LOADING_SPONSORED": "Failed to load sponsored products"
  },
  "PRODUCT": {
    "ADD_TO_CART": "Add to Cart",
    "QUICK_ADD": "Quick Add",
    "ADD_TO_WISHLIST": "Add to wishlist",
    "REMOVE_FROM_WISHLIST": "Remove from wishlist"
  }
}
```

### Arabic (ar.json)
```json
{
  "HOMEPAGE": {
    "HERO_IMAGE_ALT": "صورة البانر الرئيسي",
    "BRAND_NAME": "سوق نمسري",
    "BRAND_SLOGAN": "متجرك الشامل للمنتجات عالية الجودة بأسعار رائعة",
    "BROWSE_NOW": "تصفح الآن",
    "FEATURED_PRODUCTS": "المنتجات المميزة",
    "NO_FEATURED_PRODUCTS": "لا توجد منتجات مميزة متاحة",
    "ERROR_LOADING_FEATURED": "فشل تحميل المنتجات المميزة",
    "SPONSORED_PRODUCTS": "المنتجات المدعومة",
    "NO_SPONSORED_PRODUCTS": "لا توجد منتجات مدعومة متاحة",
    "ERROR_LOADING_SPONSORED": "فشل تحميل المنتجات المدعومة"
  },
  "PRODUCT": {
    "ADD_TO_CART": "أضف إلى السلة",
    "QUICK_ADD": "إضافة سريعة",
    "ADD_TO_WISHLIST": "أضف إلى المفضلة",
    "REMOVE_FROM_WISHLIST": "إزالة من المفضلة"
  }
}
```

---

## Files Modified

1. **featured-products.html** - Added translation keys for empty state and error messages
2. **featured-products.ts** - Added TranslateModule import and updated error message
3. **sponsored-products.html** - Added translation keys for empty state and error messages
4. **sponsored-products.ts** - Updated error message to use translation key
5. **product-card.html** - Added translation keys for wishlist aria-labels (accessibility)
6. **hero-banner.html** - Already had translation keys (no changes needed)
7. **home-page.html** - Already had translation keys (no changes needed)

---

## Next Steps

1. Locate your translation files (usually in `src/assets/i18n/`)
2. Add the keys above to both `en.json` and `ar.json`
3. Test the application in both languages to verify all text is translated
4. Adjust translations as needed for your brand voice

---

## Notes

- All hardcoded English text has been replaced with translation keys
- Error messages now support internationalization
- Empty states are now translatable
- The translation keys follow the existing naming convention in your app
