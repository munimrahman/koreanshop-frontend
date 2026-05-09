/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.koreanskincareshopbd.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin/*', 
    '/api/*',
    '/checkout', // Private checkout page
    '/_not-found',
    '/404',
    '/500',
  ],
  
  // Generate index sitemap
  generateIndexSitemap: true,
  
  // Explicitly include important static paths
  additionalPaths: async (config) => {
    const result = []
    
    // Add static pages with custom priorities
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/products', priority: 1.0, changefreq: 'daily' },
      { path: '/about', priority: 0.9, changefreq: 'weekly' },
      { path: '/contact', priority: 0.9, changefreq: 'weekly' },
      { path: '/shipping', priority: 0.7, changefreq: 'weekly' },
      { path: '/privacy', priority: 0.6, changefreq: 'monthly' },
      { path: '/terms', priority: 0.6, changefreq: 'monthly' },
      { path: '/support', priority: 0.7, changefreq: 'weekly' },
    ]
    
    staticPages.forEach(page => {
      result.push({
        loc: page.path,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString(),
      })
    })
    
    try {
      console.log('Fetching all products from API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for large dataset
      
      const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.koreanskincareshopbd.com/api/v1'}/products`;
      console.log(`Fetching from: ${apiEndpoint}`);
      
      const response = await fetch(apiEndpoint, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'next-sitemap/1.0',
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        let products = [];
        
        // Handle different API response formats
        if (Array.isArray(data)) {
          products = data;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
        } else if (data.result && Array.isArray(data.result)) {
          products = data.result;
        }
        
        if (products.length > 0) {
          console.log(`✅ Successfully fetched ${products.length} products`);

          products.forEach((product) => {
            const urlParam = product.slug || product.id;
            if (urlParam) {
              result.push({
                loc: `/products/${urlParam}`,
                changefreq: 'weekly',
                priority: 0.9,
                lastmod: product.updatedAt || product.updated_at || product.createdAt || product.created_at || new Date().toISOString(),
              });
            }
          });

          console.log(`📄 Added ${products.length} product pages to sitemap`);

          // Add brand filter pages
          const brandSlugs = [...new Set(
            products
              .map((p) => p.brand?.slug || p.brand?.id)
              .filter(Boolean)
          )];
          brandSlugs.forEach((slug) => {
            result.push({
              loc: `/products?brand=${slug}`,
              changefreq: 'weekly',
              priority: 0.7,
              lastmod: new Date().toISOString(),
            });
          });

          // Add category filter pages
          const categorySlugs = [...new Set(
            products
              .map((p) => p.category?.slug || p.category?.id)
              .filter(Boolean)
          )];
          categorySlugs.forEach((slug) => {
            result.push({
              loc: `/products?category=${slug}`,
              changefreq: 'weekly',
              priority: 0.7,
              lastmod: new Date().toISOString(),
            });
          });
        } else {
          console.warn('⚠️ API returned data but no products array found');
          console.log('Response structure:', Object.keys(data));
        }
      } else {
        console.warn(`⚠️ API responded with status ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.warn('⚠️ Error fetching products for sitemap:', error.message);
    }
    
    return result
  },
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/checkout', '/_next/', '/static/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api', '/checkout'],
      }
    ],
    additionalSitemaps: [
      'https://www.koreanskincareshopbd.com/sitemap.xml',
    ],
  },
}
