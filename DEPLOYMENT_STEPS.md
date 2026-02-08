# Deployment Steps for Social Media Sharing Fix

## Files Changed
1. ✅ `src/app/core/services/seo.service.ts` - Enhanced SEO with Open Graph tags
2. ✅ `src/app/features/products/pages/product-detail-page/product-detail-page.ts` - Added product URL and metadata
3. ✅ `src/index.html` - Added default Open Graph meta tags
4. ✅ `vercel.json` - Configured for SSR deployment
5. ✅ `api/index.js` - Created serverless function for SSR (NEW FILE)
6. ✅ `SOCIAL_MEDIA_SHARING_FIX.md` - Documentation (NEW FILE)

## Deploy to Vercel

Run these commands in your terminal:

```bash
# 1. Stage all changes
git add .

# 2. Commit with descriptive message
git commit -m "Fix social media sharing with SSR and Open Graph meta tags"

# 3. Push to GitHub (Vercel will auto-deploy)
git push origin master
```

## After Deployment

### 1. Wait for Vercel Build to Complete
- Go to your Vercel dashboard: https://vercel.com/dashboard
- Wait for the build to show "Ready" status (usually 2-3 minutes)
- Check build logs to ensure no errors

### 2. Test a Product Page
Visit any product page, for example:
```
https://souknamasry.vercel.app/product/[any-product-slug]
```

### 3. Verify Meta Tags (Optional - for debugging)
Open browser DevTools (F12) and check the `<head>` section for:
```html
<meta property="og:title" content="...">
<meta property="og:image" content="https://...">
<meta property="og:url" content="https://...">
<meta property="og:site_name" content="Soukna Masry">
```

### 4. Test Social Media Sharing

#### Facebook Debugger (REQUIRED)
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your product URL: `https://souknamasry.vercel.app/product/your-product-slug`
3. Click **"Debug"**
4. Click **"Scrape Again"** to clear Facebook's cache
5. ✅ Verify you see:
   - Product image as thumbnail
   - Product name as title
   - "Soukna Masry" as site name
   - Product description

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your product URL
3. Click **"Preview card"**
4. ✅ Verify the large image card shows correctly

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your product URL
3. Click **"Inspect"**
4. ✅ Verify the preview looks good

#### WhatsApp Test
1. Send a product link to yourself
2. ✅ Verify WhatsApp shows the preview with image and title

## Troubleshooting

### Build Fails on Vercel
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify the `api/index.js` file exists

### Preview Still Shows "Home"
1. **Clear cache** using Facebook Debugger "Scrape Again" button
2. **Wait 1-2 minutes** after deployment before testing
3. **Check if SSR is working**: 
   ```bash
   curl -I https://souknamasry.vercel.app/product/test
   ```
   Should return `200 OK`

### Images Not Loading in Preview
- Verify product images are publicly accessible
- Check that image URLs are absolute (start with `https://`)
- Ensure images are at least 200x200px

## Expected Result

When sharing a product link on Facebook, Twitter, LinkedIn, or WhatsApp, you should see:

📸 **Image**: Product main image  
📝 **Title**: "Product Name | Soukna Masry"  
📄 **Description**: Product description (first 160 chars)  
🌐 **Site**: "Soukna Masry"

---

**Ready to deploy?** Run the git commands above! 🚀
