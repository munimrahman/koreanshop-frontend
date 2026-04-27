import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the backend API URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000/api/v1';
    const catalogUrl = `${backendUrl}/catalog/facebook.xml`;
    
    // Fetch the catalog from backend
    const response = await fetch(catalogUrl, {
      cache: 'no-store', // Always fetch fresh data for catalog
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    
    // Return XML response with proper headers
    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error('Error generating Facebook catalog:', error);
    
    // Return error as XML
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Error</title>
    <description>Failed to generate catalog feed</description>
  </channel>
</rss>`;
    
    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}