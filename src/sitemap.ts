
export async function generateSitemap(apiUrl: string, host: string): Promise<string> {
    const baseUrl = `https://${host}`; // or just use the host if it includes protocol, but usually host header is just domain
    const urls: string[] = [`${baseUrl}/`];

    // Helper to fetch data
    const fetchData = async (endpoint: string) => {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint} for sitemap:`, error);
            return null;
        }
    };

    // 1. Fetch Categories
    // Try to get all categories. If 'categories' endpoint returns paginated or tree, we might need to adjust.
    // Assuming a generic 'categories' endpoint exists that returns a list.
    const categoriesData = await fetchData('categories');
    if (categoriesData && categoriesData.data) {
        // If it is a flat list
        const categories = Array.isArray(categoriesData.data) ? categoriesData.data : (categoriesData.data.categories || []);

        // Recursive function if it's a tree (children)
        const traverseCategories = (cats: any[]) => {
            cats.forEach(cat => {
                // Use path if available, otherwise slug
                const path = cat.path || cat.slug;
                if (path) {
                    urls.push(`${baseUrl}/categories/${path}`);
                }
                if (cat.children && Array.isArray(cat.children)) {
                    traverseCategories(cat.children);
                }
            });
        };
        traverseCategories(categories);
    }

    // 2. Fetch Products
    // Fetch a reasonable number of products for the sitemap
    const productsData = await fetchData('products?limit=2000');
    if (productsData && productsData.data) {
        // API might wrap in data.products or just data
        const products = Array.isArray(productsData.data) ? productsData.data : (productsData.data.products || []);
        products.forEach((prod: any) => {
            if (prod._id) {
                // Product Detail Page Route: /products/:id
                urls.push(`${baseUrl}/products/${prod._id}`);
            }
        });
    }

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
}
