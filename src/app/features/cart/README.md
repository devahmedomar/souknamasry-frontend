# Cart Feature - Refactored Architecture

This document explains the refactored cart feature structure following separation of concerns principles.

## Architecture Overview

The cart feature is now organized into distinct layers with clear responsibilities:

```
cart/
├── components/          # Reusable UI components
│   ├── cart-item/      # Individual cart item display
│   ├── order-summary/  # Order totals and coupon application
│   └── address-selector/ # Shipping address selection
├── pages/              # Page-level components
│   └── cart-page/      # Main cart page with stepper workflow
├── services/           # Business logic and state management
│   ├── cart.service.ts        # HTTP API calls
│   └── cart-state.service.ts  # State management
└── cart.routes.ts      # Routing configuration
```

## Core Principles

### 1. Separation of Concerns

Each layer has a specific responsibility:

- **Components**: Handle UI rendering and user interactions
- **Services**: Manage business logic and API communication
- **State**: Centralize application state management
- **Models**: Define data structures (in shared/models)

### 2. Single Responsibility Principle

Each component/service does one thing well:

- `CartService`: HTTP communication only
- `CartStateService`: State management only
- `CartItemComponent`: Display cart item only
- `OrderSummaryComponent`: Display order summary only
- `AddressSelectorComponent`: Handle address selection only

### 3. Dependency Injection

All dependencies are injected, making the code:
- Testable
- Maintainable
- Decoupled

## Components

### CartItemComponent

**Responsibilities:**
- Display product information
- Handle quantity changes
- Handle item removal
- Support compact and full view modes

**Inputs:**
- `item`: CartItem data
- `updating`: Loading state for quantity updates
- `removing`: Loading state for removal
- `compact`: Toggle compact view

**Outputs:**
- `quantityChange`: Emit new quantity
- `remove`: Emit removal request

**Usage:**
```html
<app-cart-item
  [item]="item"
  [updating]="isUpdating(item._id)"
  [removing]="isRemoving(item._id)"
  (quantityChange)="updateQuantity(item._id, $event)"
  (remove)="removeItem(item._id)">
</app-cart-item>
```

### OrderSummaryComponent

**Responsibilities:**
- Display order totals (subtotal, tax, shipping, discount, total)
- Handle coupon code application
- Provide action buttons (checkout, back)

**Inputs:**
- `cart`: Cart data
- `showCoupon`: Show coupon input
- `showCheckoutButton`: Show checkout button
- `checkoutButtonText`: Customize button text
- `applyingCoupon`: Loading state
- `showBackButton`: Show back button
- `backButtonText`: Customize back button text

**Outputs:**
- `checkout`: Emit checkout action
- `applyCoupon`: Emit coupon code
- `back`: Emit back navigation

**Usage:**
```html
<app-order-summary
  [cart]="cart()"
  [showCoupon]="true"
  [applyingCoupon]="applyingCoupon()"
  (checkout)="continueToShipping()"
  (applyCoupon)="applyCoupon($event)">
</app-order-summary>
```

### AddressSelectorComponent

**Responsibilities:**
- Display list of addresses
- Handle address selection
- Support adding/deleting addresses

**Inputs:**
- `addresses`: Array of addresses
- `selectedAddressId`: ID of selected address
- `loading`: Loading state

**Outputs:**
- `selectAddress`: Emit selected address
- `addNewAddress`: Emit add request
- `deleteAddress`: Emit delete request

**Usage:**
```html
<app-address-selector
  [addresses]="addresses()"
  [selectedAddressId]="selectedAddress()?._id"
  (selectAddress)="selectAddress($event)"
  (addNewAddress)="addNewAddress()"
  (deleteAddress)="deleteAddress($event)">
</app-address-selector>
```

## Services

### CartService

**Responsibilities:**
- Handle all HTTP requests to cart API
- Update cart state through CartStateService
- Handle HTTP errors

**Key Methods:**
```typescript
addToCart(payload: AddToCartPayload): Observable<CartResponse>
getCart(): Observable<CartResponse>
updateCartItem(itemId: string, payload: UpdateCartItemPayload): Observable<CartResponse>
removeCartItem(itemId: string): Observable<CartResponse>
clearCart(): Observable<any>
applyCoupon(payload: ApplyCouponPayload): Observable<CartResponse>
removeCoupon(): Observable<CartResponse>
```

**Usage:**
```typescript
constructor(private cartService: CartService) {}

loadCart() {
  this.cartService.getCart().subscribe({
    next: (response) => console.log(response.data),
    error: (err) => this.handleError(err)
  });
}
```

### CartStateService

**Responsibilities:**
- Centralize cart state management
- Provide reactive state through signals
- Compute derived values

**State Signals:**
```typescript
cart: Signal<Cart | null>           // Current cart data
loading: Signal<boolean>            // Loading state
error: Signal<string | null>        // Error state
itemCount: Signal<number>           // Computed: Total items
isEmpty: Signal<boolean>            // Computed: Cart is empty
hasDiscount: Signal<boolean>        // Computed: Has discount
hasCoupon: Signal<boolean>          // Computed: Has coupon
```

**Key Methods:**
```typescript
setCart(cart: Cart | null): void
setLoading(loading: boolean): void
setError(error: string | null): void
clearCart(): void
reset(): void
```

**Usage:**
```typescript
constructor(private cartState: CartStateService) {}

// Access state
cart = this.cartState.cart;
itemCount = this.cartState.itemCount;
isEmpty = this.cartState.isEmpty;

// Check state
if (this.isEmpty()) {
  // Show empty state
}
```

## Models

Models are defined in `shared/models/` for reusability:

### cart.interface.ts
```typescript
export interface CartItem { ... }
export interface Cart { ... }
export interface CartResponse { ... }
export interface AddToCartPayload { ... }
export interface UpdateCartItemPayload { ... }
export interface ApplyCouponPayload { ... }
```

### product.interface.ts
```typescript
export interface Product { ... }
export interface ProductResponse { ... }
export interface ProductsResponse { ... }
```

### address.interface.ts
```typescript
export interface Address { ... }
export interface AddressResponse { ... }
export interface AddressesResponse { ... }
```

## Utility Functions

### NotificationUtil

Helper functions for displaying notifications:

```typescript
NotificationUtil.showSuccess(messageService, translateService, 'MESSAGE_KEY')
NotificationUtil.showError(messageService, translateService, 'ERROR_KEY')
NotificationUtil.showWarning(messageService, translateService, 'WARNING_KEY')
NotificationUtil.showInfo(messageService, 'Info message')
```

### ProductUtil

Helper functions for product operations:

```typescript
ProductUtil.getProductImage(product)
ProductUtil.getLocalizedName(product, lang)
ProductUtil.getLocalizedDescription(product, lang)
ProductUtil.isOnSale(product)
ProductUtil.getDiscountPercentage(product)
ProductUtil.isInStock(product)
ProductUtil.hasLimitedStock(product, threshold)
ProductUtil.formatPrice(price, currency)
```

## Benefits of Refactoring

### 1. **Maintainability**
- Each file has a single, clear purpose
- Easy to locate and fix bugs
- Changes are isolated to specific layers

### 2. **Reusability**
- Components can be used in different contexts
- Services can be shared across features
- Models ensure consistent data structures

### 3. **Testability**
- Components have clear inputs/outputs
- Services are easily mockable
- State management is centralized

### 4. **Scalability**
- Easy to add new features
- Clear patterns to follow
- Reduces code duplication

### 5. **Developer Experience**
- Clear file organization
- Self-documenting code structure
- Easier onboarding for new developers

## Future Improvements

1. **Add Address Service**: Create a dedicated service for address management
2. **Add Order Service**: Create service for order creation and management
3. **Add Unit Tests**: Write tests for components and services
4. **Add E2E Tests**: Test complete checkout workflow
5. **Add Error Boundary**: Implement error handling component
6. **Add Loading States**: Improve loading indicators
7. **Add Optimistic Updates**: Update UI before API response

## Migration Guide

If you have existing code using the old cart structure:

### Before:
```typescript
cartService.cartItemCount() // Direct signal access
cartService.loadCartCount() // Manual count loading
```

### After:
```typescript
cartState.itemCount() // Access via state service
cartService.getCart().subscribe() // Automatically updates state
```

## Code Style Guidelines

1. Use `readonly` for injected services
2. Use signals for reactive state
3. Use computed for derived values
4. Prefix private methods with underscore or use private keyword
5. Add JSDoc comments for public APIs
6. Keep components under 250 lines
7. Keep methods under 20 lines
8. Use early returns to reduce nesting

## Questions?

For questions or suggestions about this architecture, please contact the development team.
