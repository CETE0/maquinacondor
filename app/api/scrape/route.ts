import { NextResponse } from 'next/server'
import { scrapeSource } from '@/lib/scraper'
import { saveCondorData } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { source } = await request.json()
    
    if (!source) {
      return NextResponse.json({ error: 'Source is required' }, { status: 400 })
    }

    const result = await scrapeSource(source)
    
    // Guardar los datos obtenidos (o errores)
    await saveCondorData({
      source,
      data_type: result.data_type,
      content: result.data,
      error_type: result.error_type,
      status: result.status,
      metadata: {
        timestamp: new Date().toISOString(),
        url: result.url,
        response_time: result.responseTime
      }
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      status: result.status,
      error_type: result.error_type
    })
  } catch (error: any) {
    console.error('Scraping error:', error)
    
    // Guardar el error como dato valioso
    await saveCondorData({
      source: 'unknown',
      data_type: 'error',
      content: null,
      error_type: '500',
      status: 'failed',
      metadata: {
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(
      { 
        error: 'Scraping failed',
        message: error.message,
        status: 'failed'
      },
      { status: 500 }
    )
  }
}

