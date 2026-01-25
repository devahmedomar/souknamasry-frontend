# Manual Testing Guide: Featured & Sponsored Products

## Overview
This document outlines the manual testing procedures for the Featured and Sponsored products feature in the Souq Namasry e-commerce application.

---

## Test Environment Setup

### Prerequisites
- [ ] Backend API is running and accessible
- [ ] Frontend application is running
- [ ] Admin account credentials available
- [ ] At least 10 products exist in the database
- [ ] Products are active and in stock

### Test Accounts Required
- **Admin Account**: For testing admin panel functionality
- **User Account** (Optional): For testing from user perspective

---

## Part 1: Admin Panel Testing

### Test Case 1.1: Navigate to Products Page
**Objective**: Verify admin can access the products management page

**Steps**:
1. Open the application in a browser
2. Log in with admin credentials
3. Navigate to Admin Panel → Products page

**Expected Results**:
- [ ] Products page loads successfully
- [ ] Products table displays with all columns including:
  - Image
  - Name
  - Category
  - Price
  - Stock
  - Status
  - **Featured** (new column with star icon)
  - **Sponsored** (new column with megaphone icon)
  - Actions
- [ ] All existing products are displayed

---

### Test Case 1.2: Mark Product as Featured
**Objective**: Verify admin can mark a product as featured

**Steps**:
1. On the Products page, locate a product that is NOT featured (gray star icon)
2. Hover over the star icon in the "Featured" column
3. Click the star icon

**Expected Results**:
- [ ] Tooltip displays "Mark as Featured" on hover
- [ ] Star icon changes from gray outline (pi-star) to yellow filled (pi-star-fill)
- [ ] Success toast notification appears: "Product mark as featured successfully"
- [ ] Products table refreshes automatically
- [ ] The change persists after page refresh

---

### Test Case 1.3: Remove Product from Featured
**Objective**: Verify admin can unmark a featured product

**Steps**:
1. On the Products page, locate a product that IS featured (yellow filled star)
2. Hover over the star icon in the "Featured" column
3. Click the star icon

**Expected Results**:
- [ ] Tooltip displays "Remove from Featured" on hover
- [ ] Star icon changes from yellow filled to gray outline
- [ ] Success toast notification appears: "Product remove from featured successfully"
- [ ] Products table refreshes automatically
- [ ] The change persists after page refresh

---

### Test Case 1.4: Mark Product as Sponsored
**Objective**: Verify admin can mark a product as sponsored

**Steps**:
1. On the Products page, locate a product that is NOT sponsored (gray megaphone icon)
2. Hover over the megaphone icon in the "Sponsored" column
3. Click the megaphone icon

**Expected Results**:
- [ ] Tooltip displays "Mark as Sponsored" on hover
- [ ] Megaphone icon changes from gray to green
- [ ] Success toast notification appears: "Product mark as sponsored successfully"
- [ ] Products table refreshes automatically
- [ ] The change persists after page refresh

---

### Test Case 1.5: Remove Product from Sponsored
**Objective**: Verify admin can unmark a sponsored product

**Steps**:
1. On the Products page, locate a product that IS sponsored (green megaphone)
2. Hover over the megaphone icon in the "Sponsored" column
3. Click the megaphone icon

**Expected Results**:
- [ ] Tooltip displays "Remove from Sponsored" on hover
- [ ] Megaphone icon changes from green to gray
- [ ] Success toast notification appears: "Product remove from sponsored successfully"
- [ ] Products table refreshes automatically
- [ ] The change persists after page refresh

---

### Test Case 1.6: Mark Product as Both Featured and Sponsored
**Objective**: Verify a product can be both featured and sponsored simultaneously

**Steps**:
1. Select a product that is neither featured nor sponsored
2. Click the star icon to mark as featured
3. Wait for success notification
4. Click the megaphone icon to mark as sponsored

**Expected Results**:
- [ ] Product shows yellow filled star AND green megaphone
- [ ] Both actions complete successfully
- [ ] Product appears in both featured and sponsored sections on home page

---

### Test Case 1.7: Multiple Products Toggle
**Objective**: Verify multiple products can be marked/unmarked

**Steps**:
1. Mark 5 different products as featured (click each star icon)
2. Mark 5 different products as sponsored (click each megaphone icon)
3. Unmark 2 of the featured products
4. Unmark 2 of the sponsored products

**Expected Results**:
- [ ] All toggle operations work correctly
- [ ] Each operation shows appropriate success notification
- [ ] Final state shows 3 featured and 3 sponsored products
- [ ] Icons reflect correct states for all products

---

### Test Case 1.8: Error Handling - Network Error
**Objective**: Verify error handling when API fails

**Steps**:
1. Disconnect from network OR stop the backend API
2. Try to toggle featured/sponsored status for any product

**Expected Results**:
- [ ] Error toast notification appears
- [ ] Product status does NOT change in the UI
- [ ] Application remains functional

---

### Test Case 1.9: Filter and Search Functionality
**Objective**: Verify featured/sponsored columns work with existing filters

**Steps**:
1. Use search filter to find specific products
2. Toggle featured/sponsored for filtered products
3. Apply category filter
4. Toggle featured/sponsored for filtered products

**Expected Results**:
- [ ] Featured/Sponsored toggles work with all filter combinations
- [ ] Filters don't affect the toggle functionality

---

### Test Case 1.10: Pagination
**Objective**: Verify featured/sponsored status across paginated results

**Steps**:
1. If you have more than 20 products, navigate through pages
2. Mark products as featured/sponsored on different pages
3. Navigate back and forth between pages

**Expected Results**:
- [ ] Featured/Sponsored status is maintained across page navigation
- [ ] Icons display correctly on all pages

---

## Part 2: Home Page (User Side) Testing

### Test Case 2.1: View Featured Products Slider
**Objective**: Verify featured products display correctly on home page

**Preconditions**:
- Mark at least 5 products as featured in admin panel

**Steps**:
1. Log out from admin (or open in incognito mode)
2. Navigate to the home page
3. Scroll to the "Featured Products" section

**Expected Results**:
- [ ] Featured Products section is visible
- [ ] Section title displays (translated based on language)
- [ ] Product carousel/slider loads successfully
- [ ] Only featured products are displayed
- [ ] Products display with:
  - Product image
  - Product name
  - Category
  - Price
  - Rating (if available)
- [ ] Maximum 10 products shown in slider

---

### Test Case 2.2: Featured Products Carousel Functionality
**Objective**: Verify carousel navigation and auto-scroll

**Steps**:
1. On home page, locate Featured Products carousel
2. Wait for 3 seconds (auto-scroll interval)
3. Click next/previous navigation arrows (if visible)
4. Verify responsive behavior:
   - Resize browser to desktop size (>1199px) → should show 3 items
   - Resize to tablet size (991px-1199px) → should show 2 items
   - Resize to mobile size (<767px) → should show 1 item

**Expected Results**:
- [ ] Carousel auto-scrolls every 3 seconds
- [ ] Navigation arrows work correctly
- [ ] Responsive breakpoints adjust number of visible items correctly
- [ ] Smooth transitions between slides
- [ ] Circular navigation (returns to first slide after last)

---

### Test Case 2.3: View Sponsored Products Slider
**Objective**: Verify sponsored products display correctly on home page

**Preconditions**:
- Mark at least 5 products as sponsored in admin panel

**Steps**:
1. On home page, scroll to the "Sponsored Products" section
2. Observe the sponsored products carousel

**Expected Results**:
- [ ] Sponsored Products section is visible
- [ ] Section title displays (translated based on language)
- [ ] Section has different background (gradient-warmy class)
- [ ] Product carousel loads successfully
- [ ] Only sponsored products are displayed
- [ ] Products display with correct information
- [ ] Maximum 10 products shown in slider

---

### Test Case 2.4: Sponsored Products Carousel Functionality
**Objective**: Verify sponsored carousel navigation

**Steps**:
1. On home page, locate Sponsored Products carousel
2. Wait for auto-scroll
3. Test navigation arrows
4. Verify responsive behavior at different screen sizes

**Expected Results**:
- [ ] Carousel auto-scrolls every 3 seconds
- [ ] Navigation works correctly
- [ ] Responsive breakpoints work (3/2/1 items)
- [ ] Smooth transitions

---

### Test Case 2.5: Loading State - Skeleton Loaders
**Objective**: Verify skeleton loaders display during data fetch

**Steps**:
1. Open browser DevTools → Network tab
2. Set network throttling to "Slow 3G"
3. Refresh the home page
4. Observe Featured and Sponsored sections while loading

**Expected Results**:
- [ ] 4 product card skeletons display in Featured section while loading
- [ ] 4 product card skeletons display in Sponsored section while loading
- [ ] NO spinner or "Loading..." text appears
- [ ] Skeleton cards have proper responsive layout (same grid as actual products)
- [ ] Skeletons are replaced with actual products once loaded

---

### Test Case 2.6: Empty State - No Featured Products
**Objective**: Verify behavior when no featured products exist

**Steps**:
1. In admin panel, remove featured status from ALL products
2. Navigate to home page (or refresh)
3. Observe Featured Products section

**Expected Results**:
- [ ] Empty state message displays
- [ ] Inbox icon appears (gray, 3rem size)
- [ ] Text reads: "No featured products available"
- [ ] No carousel displays
- [ ] Section title still shows

---

### Test Case 2.7: Empty State - No Sponsored Products
**Objective**: Verify behavior when no sponsored products exist

**Steps**:
1. In admin panel, remove sponsored status from ALL products
2. Navigate to home page (or refresh)
3. Observe Sponsored Products section

**Expected Results**:
- [ ] Empty state message displays
- [ ] Inbox icon appears
- [ ] Text reads: "No sponsored products available"
- [ ] No carousel displays
- [ ] Section title still shows

---

### Test Case 2.8: Error State Handling
**Objective**: Verify error handling on home page

**Steps**:
1. Stop the backend API server
2. Refresh the home page
3. Observe Featured and Sponsored sections

**Expected Results**:
- [ ] Error message displays in Featured section
- [ ] Error message displays in Sponsored section
- [ ] Warning alert with exclamation icon shows
- [ ] Text reads: "Failed to load featured products" / "Failed to load sponsored products"
- [ ] Rest of the page remains functional

---

### Test Case 2.9: Product Navigation from Sliders
**Objective**: Verify users can navigate to product details from sliders

**Steps**:
1. On home page, click on a product card in Featured Products slider
2. Go back to home page
3. Click on a product card in Sponsored Products slider

**Expected Results**:
- [ ] Clicking featured product navigates to product detail page
- [ ] Clicking sponsored product navigates to product detail page
- [ ] Correct product details are displayed
- [ ] Navigation works from carousel

---

### Test Case 2.10: Real-time Updates
**Objective**: Verify home page reflects admin changes

**Steps**:
1. Open home page in one browser tab
2. Open admin panel in another tab
3. In admin, mark a new product as featured
4. Refresh home page tab
5. In admin, mark a new product as sponsored
6. Refresh home page tab

**Expected Results**:
- [ ] After refresh, new featured product appears in Featured slider
- [ ] After refresh, new sponsored product appears in Sponsored slider
- [ ] Sliders update to show latest data

---

### Test Case 2.11: Limit Validation (Max 10 Products)
**Objective**: Verify only 10 products show even if more are marked

**Steps**:
1. In admin panel, mark MORE than 10 products as featured
2. Mark MORE than 10 products as sponsored
3. Navigate to home page
4. Count products in each slider

**Expected Results**:
- [ ] Featured slider shows maximum 10 products (not all marked products)
- [ ] Sponsored slider shows maximum 10 products
- [ ] Products shown are the newest first (or as per backend sorting)

---

### Test Case 2.12: Lazy Loading (Defer on Viewport)
**Objective**: Verify sections load only when scrolled into view

**Steps**:
1. Open home page with browser DevTools → Network tab
2. Don't scroll, stay at top of page
3. Observe network requests
4. Scroll down to Featured Products section
5. Observe network requests
6. Scroll down to Sponsored Products section
7. Observe network requests

**Expected Results**:
- [ ] Featured products API call triggers only when scrolling near that section
- [ ] Sponsored products API call triggers only when scrolling near that section
- [ ] Lazy loading improves initial page load performance

---

### Test Case 2.13: Multi-language Support
**Objective**: Verify translations work correctly

**Steps**:
1. On home page, change language to Arabic
2. Observe Featured and Sponsored section titles
3. Change language to English
4. Observe sections again

**Expected Results**:
- [ ] Section titles translate correctly
- [ ] "Featured Products" → Arabic equivalent
- [ ] "Sponsored Products" → Arabic equivalent
- [ ] Product information displays in selected language (if available)

---

## Part 3: Cross-browser Testing

### Test Case 3.1: Browser Compatibility
**Objective**: Verify functionality across different browsers

**Browsers to Test**:
- [ ] Google Chrome (latest)
- [ ] Mozilla Firefox (latest)
- [ ] Microsoft Edge (latest)
- [ ] Safari (if available)

**Tests to Perform in Each Browser**:
1. Admin: Toggle featured/sponsored status
2. Home page: View sliders, test carousel navigation
3. Verify loading states and error handling

**Expected Results**:
- [ ] All functionality works consistently across browsers
- [ ] Icons display correctly
- [ ] Tooltips work
- [ ] Carousels animate smoothly

---

## Part 4: Responsive Design Testing

### Test Case 4.1: Mobile Devices (< 767px)
**Objective**: Verify responsive design on mobile

**Steps**:
1. Open home page on mobile device or use browser DevTools device emulation
2. Set viewport to 375px width (iPhone size)
3. Test Featured and Sponsored sliders

**Expected Results**:
- [ ] Carousel shows 1 product at a time
- [ ] Product cards are fully visible
- [ ] Navigation arrows work
- [ ] Touch swipe gestures work
- [ ] Skeleton loaders display correctly

---

### Test Case 4.2: Tablet Devices (768px - 991px)
**Objective**: Verify responsive design on tablets

**Steps**:
1. Set viewport to 768px width
2. Test sliders

**Expected Results**:
- [ ] Carousel shows 2 products at a time
- [ ] Layout is well-spaced
- [ ] All functionality works

---

### Test Case 4.3: Desktop (> 1199px)
**Objective**: Verify responsive design on desktop

**Steps**:
1. Set viewport to 1920px width
2. Test sliders

**Expected Results**:
- [ ] Carousel shows 3 products at a time
- [ ] Optimal spacing and layout

---

## Part 5: Performance Testing

### Test Case 5.1: API Response Time
**Objective**: Verify API calls are performant

**Steps**:
1. Open browser DevTools → Network tab
2. Refresh home page
3. Check API call timing for:
   - GET /api/products/featured?limit=10
   - GET /api/products/sponsored?limit=10

**Expected Results**:
- [ ] API responses return within 1-2 seconds
- [ ] No unnecessary API calls are made
- [ ] API calls include correct query parameters

---

### Test Case 5.2: Image Loading Performance
**Objective**: Verify product images load efficiently

**Steps**:
1. Clear browser cache
2. Refresh home page
3. Observe image loading in sliders

**Expected Results**:
- [ ] Images load progressively
- [ ] No broken image icons
- [ ] Placeholder images display if actual images fail

---

## Part 6: Edge Cases and Negative Testing

### Test Case 6.1: Inactive Products
**Objective**: Verify inactive products don't appear in sliders

**Steps**:
1. Mark a product as featured
2. Set the same product to inactive (isActive = false)
3. Check home page

**Expected Results**:
- [ ] Inactive featured product does NOT appear in Featured slider
- [ ] Only active products are shown

---

### Test Case 6.2: Out of Stock Products
**Objective**: Verify out-of-stock products don't appear

**Steps**:
1. Mark a product as featured
2. Set stockQuantity to 0 and inStock to false
3. Check home page

**Expected Results**:
- [ ] Out-of-stock featured product does NOT appear in slider
- [ ] Only in-stock products are shown

---

### Test Case 6.3: Products Without Images
**Objective**: Verify products without images display gracefully

**Steps**:
1. Mark a product as featured that has no images
2. Check home page

**Expected Results**:
- [ ] Product card displays with placeholder image
- [ ] No broken image icon
- [ ] Card layout remains intact

---

### Test Case 6.4: Concurrent Admin Actions
**Objective**: Verify data consistency with multiple admins

**Steps**:
1. Open admin panel in two different browsers/tabs
2. In both tabs, toggle the same product's featured status simultaneously

**Expected Results**:
- [ ] Both requests are processed
- [ ] Final state is consistent across both tabs after refresh
- [ ] No data corruption occurs

---

### Test Case 6.5: Special Characters in Product Names
**Objective**: Verify special characters render correctly

**Steps**:
1. Mark products with special characters in names as featured/sponsored (e.g., "Product™", "Café ☕", "50% Off!")
2. Check home page sliders

**Expected Results**:
- [ ] Special characters display correctly
- [ ] No encoding issues
- [ ] Layout is not broken

---

## Part 7: API Endpoint Testing

### Test Case 7.1: GET /api/products/featured
**Objective**: Verify featured products API endpoint

**Steps**:
1. Use Postman or browser to call: `GET https://souknamasry-be.vercel.app/api/products/featured?limit=10`
2. Verify response

**Expected Results**:
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "...",
        "price": 100,
        "images": ["..."],
        "category": { "name": "..." },
        "isFeatured": true,
        "isActive": true,
        "inStock": true
      }
    ]
  }
}
```
- [ ] Returns only featured products
- [ ] Maximum 10 products returned
- [ ] Products are active and in stock
- [ ] Sorted by newest first

---

### Test Case 7.2: GET /api/products/sponsored
**Objective**: Verify sponsored products API endpoint

**Steps**:
1. Call: `GET https://souknamasry-be.vercel.app/api/products/sponsored?limit=10`
2. Verify response

**Expected Results**:
- [ ] Returns only sponsored products
- [ ] Maximum 10 products returned
- [ ] Products are active and in stock
- [ ] Correct response format

---

### Test Case 7.3: PATCH /api/admin/products/:id/featured
**Objective**: Verify admin featured toggle API

**Steps**:
1. Login as admin and get auth token
2. Call: `PATCH https://souknamasry-be.vercel.app/api/admin/products/{product-id}/featured`
3. Body: `{ "isFeatured": true }`
4. Include auth token in header

**Expected Results**:
- [ ] Returns 200 status code
- [ ] Product isFeatured field updated
- [ ] Requires authentication (401 without token)
- [ ] Requires admin role (403 if not admin)

---

### Test Case 7.4: PATCH /api/admin/products/:id/sponsored
**Objective**: Verify admin sponsored toggle API

**Steps**:
1. Call: `PATCH https://souknamasry-be.vercel.app/api/admin/products/{product-id}/sponsored`
2. Body: `{ "isSponsored": true }`
3. Include auth token

**Expected Results**:
- [ ] Returns 200 status code
- [ ] Product isSponsored field updated
- [ ] Requires authentication
- [ ] Requires admin role

---

## Test Summary Checklist

### Admin Panel (9 Test Cases)
- [ ] Navigate to Products page
- [ ] Mark as Featured
- [ ] Remove from Featured
- [ ] Mark as Sponsored
- [ ] Remove from Sponsored
- [ ] Both Featured and Sponsored
- [ ] Multiple toggles
- [ ] Error handling
- [ ] Filters and pagination

### Home Page (13 Test Cases)
- [ ] Featured products display
- [ ] Featured carousel functionality
- [ ] Sponsored products display
- [ ] Sponsored carousel functionality
- [ ] Skeleton loading state
- [ ] Empty state - No featured
- [ ] Empty state - No sponsored
- [ ] Error state
- [ ] Product navigation
- [ ] Real-time updates
- [ ] Limit validation (max 10)
- [ ] Lazy loading
- [ ] Multi-language support

### Cross-browser (1 Test Case)
- [ ] Browser compatibility (Chrome, Firefox, Edge, Safari)

### Responsive Design (3 Test Cases)
- [ ] Mobile (< 767px)
- [ ] Tablet (768-991px)
- [ ] Desktop (> 1199px)

### Performance (2 Test Cases)
- [ ] API response time
- [ ] Image loading

### Edge Cases (5 Test Cases)
- [ ] Inactive products
- [ ] Out of stock products
- [ ] Products without images
- [ ] Concurrent admin actions
- [ ] Special characters

### API Testing (4 Test Cases)
- [ ] GET featured endpoint
- [ ] GET sponsored endpoint
- [ ] PATCH featured endpoint
- [ ] PATCH sponsored endpoint

---

## Bug Reporting Template

When reporting bugs, use this template:

**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Browser:
- OS:
- Screen Size:

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots/Video**: [Attach if applicable]

**Console Errors**: [Copy any errors from browser console]

---

## Testing Sign-off

**Tester Name**: _________________

**Date**: _________________

**Overall Result**: ☐ Pass  ☐ Fail  ☐ Pass with Minor Issues

**Total Test Cases**: 37
**Passed**: _____
**Failed**: _____
**Blocked**: _____

**Comments**:
_______________________________________________
_______________________________________________
_______________________________________________

**Approved for Release**: ☐ Yes  ☐ No

**Approver**: _________________

**Date**: _________________
