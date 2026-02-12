
interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  images?: { loc: string; title?: string }[];
}

export async function generateSitemap(apiUrl: string, host: string): Promise<string> {
  // Always use the production domain for canonical sitemap URLs
  const baseUrl = 'https://souknamasry.vercel.app';
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    { url: `${baseUrl}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
  ];

  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Sitemap fetch error for ${endpoint}:`, error);
      return null;
    }
  };

  // 1. Categories — priority 0.8, weekly
  const categoriesData = await fetchData('categories');
  if (categoriesData?.data) {
    const categories = Array.isArray(categoriesData.data)
      ? categoriesData.data
      : (categoriesData.data.categories || []);

    const traverseCategories = (cats: any[]) => {
      cats.forEach(cat => {
        const path = cat.path || cat.slug;
        if (path) {
          const entry: SitemapEntry = {
            url: `${baseUrl}/categories/${path}`,
            lastmod: cat.updatedAt ? cat.updatedAt.split('T')[0] : today,
            changefreq: 'weekly',
            priority: '0.8',
          };
          if (cat.image) {
            entry.images = [{ loc: cat.image, title: cat.name || cat.nameAr }];
          }
          entries.push(entry);
        }
        if (cat.children?.length) traverseCategories(cat.children);
      });
    };
    traverseCategories(categories);
  }

  // 2. Products — priority 0.7, daily; include product images
  const productsData = await fetchData('products?limit=2000');
  if (productsData?.data) {
    const products = Array.isArray(productsData.data)
      ? productsData.data
      : (productsData.data.products || []);

    products.forEach((prod: any) => {
      if (!prod.slug) return;
      const entry: SitemapEntry = {
        url: `${baseUrl}/product/${prod.slug}`,
        lastmod: prod.updatedAt ? prod.updatedAt.split('T')[0] : today,
        changefreq: 'daily',
        priority: prod.isFeatured ? '0.9' : '0.7',
      };
      if (prod.images?.length) {
        entry.images = prod.images.slice(0, 5).map((img: string) => ({
          loc: img,
          title: prod.name || prod.nameAr,
        }));
      }
      entries.push(entry);
    });
  }

  // Build main sitemap XML with image extension
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset\n';
  xml += '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
    if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    if (entry.images?.length) {
      entry.images.forEach(img => {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
        if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        xml += '    </image:image>\n';
      });
    }
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
