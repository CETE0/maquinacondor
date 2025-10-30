import { NextResponse } from 'next/server'
import { scrapeAllSources, SOURCES } from '@/lib/scraper'
import { saveCondorData, saveGeneratedPoem } from '@/lib/database'
import { generatePoemsForCubes } from '@/lib/poem-generator'
import { getLatestData } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Verificar que viene de Vercel Cron
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting daily scraping...')
    
    // Scrapear todas las fuentes
    const results = await scrapeAllSources()
    
    // Guardar todos los resultados (incluyendo errores como datos valiosos)
    const savedIds = []
    for (const result of results) {
      const source = Object.keys(SOURCES).find(
        key => SOURCES[key as keyof typeof SOURCES].url === result.url
      ) || 'unknown'
      
      const id = await saveCondorData({
        source,
        data_type: result.data_type,
        content: result.data,
        error_type: result.error_type,
        status: result.status,
        metadata: {
          url: result.url,
          response_time: result.responseTime,
          timestamp: new Date().toISOString()
        }
      })
      savedIds.push(id)
    }

    // Obtener datos actualizados y generar nuevos poemas
    const latestData = await getLatestData()
    const newPoems = await generatePoemsForCubes(latestData)
    
    // Guardar los poemas generados
    const poemIds = []
    for (const poem of newPoems) {
      const id = await saveGeneratedPoem({
        verses: poem.verses || poem.content.split('\n'),
        data_sources: latestData.map(d => d.source),
        trigger_reason: 'Daily generation',
        display_until: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      })
      poemIds.push(id)
    }

    console.log(`Scraping completed: ${savedIds.length} data records, ${poemIds.length} poems generated`)

    return NextResponse.json({
      success: true,
      data_records: savedIds.length,
      poems_generated: poemIds.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    
    // Guardar el error como dato
    await saveCondorData({
      source: 'cron',
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
        error: 'Cron job failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

