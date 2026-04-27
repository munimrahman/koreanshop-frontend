import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from your backend (add authentication)
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.WEBHOOK_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { action, productId } = body // action: 'created', 'updated', 'deleted'
    
    console.log(`Product ${action}: ${productId}`)
    
    // Revalidate the sitemap and related pages
    revalidatePath('/sitemap.xml')
    revalidatePath('/products')
    
    // If you're using ISR for product pages, revalidate specific product
    if (productId && action !== 'deleted') {
      revalidatePath(`/products/${productId}`)
    }
    
    return NextResponse.json({
      success: true, 
      message: `Product ${action} processed, sitemap updated` 
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    )
  }
}

// For testing the webhook
export async function GET() {
  return NextResponse.json({ 
    message: 'Product webhook endpoint ready',
    usage: 'POST with { action: "created|updated|deleted", productId: "cuid" }'
  })
}
