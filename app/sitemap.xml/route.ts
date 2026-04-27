import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.koreanskincareshopbd.com'
    
    // Static pages with priorities
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '1.0', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'daily'},
      { url: '/brands', priority: '0.9', changefreq: 'daily'},
      { url: '/about', priority: '0.9', changefreq: 'weekly' },
      { url: '/contact', priority: '0.9', changefreq: 'weekly' },
      { url: '/cart', priority: '0.8', changefreq: 'daily' },
      { url: '/shipping', priority: '0.7', changefreq: 'weekly' },
      { url: '/privacy', priority: '0.6', changefreq: 'monthly' },
      { url: '/terms', priority: '0.6', changefreq: 'monthly' },
      { url: '/support', priority: '0.7', changefreq: 'weekly' },
    ]
    
    let productUrls: any[] = []
    
    try {
      // Fetch current products from API with automatic revalidation
      const response = await fetch('https://api.koreanskincareshopbd.com/api/v1/products/all', {
        headers: {
          'User-Agent': 'sitemap-generator',
          'Accept': 'application/json',
        },
        // Revalidate every 5 minutes - sitemap will auto-update when products change
        next: { revalidate: 300 }
      })
      
      if (response.ok) {
        const data = await response.json()
        let products = []
        
        // Handle different API response formats
        if (Array.isArray(data)) {
          products = data
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data
        } else if (data.result && Array.isArray(data.result)) {
          products = data.result
        }
        
        // Create product URLs
        productUrls = products
          .filter((product: any) => product.id)
          .map((product: any) => ({
            url: `/products/${product.id}`,
            priority: '0.9',
            changefreq: 'weekly',
            lastmod: product.updatedAt || product.updated_at || product.createdAt || product.created_at || new Date().toISOString()
          }))
        
        console.log(`Dynamic sitemap: Added ${productUrls.length} products`)
      }
    } catch (error) {
      console.error('Error fetching products for dynamic sitemap:', error)
    }
    
    // Combine all URLs
    const allUrls = [...staticPages, ...productUrls]
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
