# Souknamasry E-Commerce Platform

**Business:** Egyptian e-commerce platform sourcing products from multiple suppliers and selling under one brand. Customers get convenience and competitive prices, we keep the profit margin.  
**Tech:** Angular 21 standalone with PrimeNG UI components, Bootstrap 5, and full Arabic/English RTL support.  
**Cost:** Zero - built and deployed entirely on free services.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
ng serve --open


## 💻 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.x | Framework (standalone components) |
| **TypeScript** | 5.x | Type safety |
| **PrimeNG** | 17.x | UI components (tables, dialogs, etc.) |
| **PrimeIcons** | 7.x | Icon library |
| **Bootstrap** | 5.3.x | Layout & utilities |
| **Transloco** | 7.x | i18n with compile-time errors |
| **Pure CSS** | - | Custom styling (CSS Variables) |
| **Signals** | Built-in | State management |

### Installation

```bash
# Install PrimeNG
npm install primeng primeicons

# Install Bootstrap
npm install bootstrap

# Install Transloco
npm install @jsverse/transloco
```


## 📁 Architecture will follow that and can be edited later

```
src/app/
├── core/                          # Core services & guards
│   ├── services/
│   │   ├── auth.service.ts       # JWT authentication
│   │   ├── cart.service.ts       # Signal-based cart state
│   │   └── language.service.ts   # i18n with Transloco
│   ├── guards/
│   │   ├── auth.guard.ts         # Route protection
│   │   └── role.guard.ts         # Role-based access
│
├── features/                      # Feature  (lazy-loaded)
│   ├── home/                    
│   │   ├── pages/home-page/
│   │   ├── components/
│   │   │   ├── hero-banner/
│   │   │   ├── category-showcase/
│   │   │   ├── sponsored-products/
│   │   │   └── newsletter/
│   │
│   ├── products/                 
│   │   ├── pages/
│   │   │   ├── product-list-page/
│   │   │   └── product-detail-page/
│   │   ├── components/
│   │   │   ├── product-card/
│   │   │   ├── product-filters/
│   │   │   ├── color-selector/
│   │   │   ├── size-selector/
│   │   │   └── quantity-selector/
│   │
│   ├── cart/                    
│   │   ├── pages/cart-page/
│   │   └── components/
│   │       ├── cart-items-list/
│   │       ├── cart-summary/
│   │       └── order-summary/
│   │
│   ├── checkout/                
│   │   ├── pages/checkout-page/
│   │   └── components/
│   │       ├── shipping-form/
│   │       ├── payment-selector/
│   │       └── checkout-stepper/
│   │
│   ├── user/                    
│   │   ├── pages/profile-page/
│   │   └── components/
│   │       ├── order-history/
│   │       ├── addresses-tab/
│   │       └── personal-info-tab/
│   │
│   └── auth/                     
│       ├── pages/
│       │   ├── login-page/
│       │   └── register-page/
│       └── components/
│           ├── login-form/
│           └── register-form/
│
├── shared/                        # 19 reusable components
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── search-bar/
│   │   └── notification-toast/
│   ├── directives/
│   │   ├── click-outside.directive.ts
│   │   └── rtl.directive.ts
│   └── pipes/
│       ├── currency-format.pipe.ts

│
└── layout/                        # 3 layouts
    ├── main-layout/
    ├── auth-layout/
    └── admin-layout/
```




## 📚 Useful PrimeNG Components

| Component | Use Case | Import |
|-----------|----------|--------|
| **Button** | All buttons | ButtonModule |
| **Card** | Product cards | CardModule |
| **Table** | Order history, cart | TableModule |
| **DataView** | Product listings | DataViewModule |
| **Dialog** | Modals | DialogModule |
| **Toast** | Notifications | ToastModule |
| **InputText** | Text inputs | InputTextModule |
| **InputNumber** | Quantity | InputNumberModule |
| **Dropdown** | Select menus | DropdownModule |
| **Rating** | Star ratings | RatingModule |
| **Tag** | Status badges | TagModule |
| **Skeleton** | Loading states | SkeletonModule |
| **ProgressSpinner** | Loading | ProgressSpinnerModule |
| **Paginator** | Pagination | PaginatorModule |
| **Message** | Inline messages | MessageModule |
| **Stepper** | Checkout flow | StepperModule |

---


## 📚 Documentation

- **[PrimeNG Docs](https://primeng.org/)** - PrimeNG documentation
- **[Bootstrap Docs](https://getbootstrap.com/)** - Bootstrap documentation

---

## 📄 License

MIT License - Free for commercial use

---

<div align="center">

**Angular 21 • PrimeNG • Bootstrap • Transloco • Zero Budget**

Built by Ahmed Omar developer 

</div>
