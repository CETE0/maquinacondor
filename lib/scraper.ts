import * as cheerio from 'cheerio'

interface ScrapeResult {
  data: any
  data_type: 'census' | 'news' | 'price' | 'weather' | 'error'
  status: 'success' | 'partial' | 'failed'
  error_type?: '404' | '500' | 'timeout' | 'no_data'
  url: string
  responseTime: number
}

export const SOURCES = {
  SAG: {
    url: 'https://www.sag.gob.cl',
    searchPaths: ['/noticias', '/comunicados']
  },
  CONAF: {
    url: 'https://www.conaf.cl',
    searchPaths: ['/noticias', '/areas-silvestres-protegidas']
  },
  REWILDING: {
    url: 'https://www.rewilding.cl',
    searchPaths: ['/proyectos', '/noticias']
  },
  MERI: {
    url: 'https://www.fundacionmeri.cl',
    searchPaths: ['/proyectos', '/investigacion']
  }
}

/**
 * Busca contenido relacionado con cóndores en una página
 */
function searchCondorContent(html: string, source: string): { found: boolean, content: any } {
  const $ = cheerio.load(html)
  const text = $.text().toLowerCase()
  
  const condorKeywords = ['condor', 'cóndor', 'vultur gryphus', 'ave rapaz']
  const found = condorKeywords.some(keyword => text.includes(keyword))
  
  if (!found) {
    return { found: false, content: null }
  }

  // Extraer noticias/artículos relevantes
  const articles: any[] = []
  
  $('article, .noticia, .news-item, .post').each((i, elem) => {
    const title = $(elem).find('h1, h2, h3, .title').text().trim()
    const content = $(elem).text().trim()
    
    if (title || content) {
      articles.push({
        title,
        content: content.substring(0, 500), // Limitar tamaño
        source
      })
    }
  })

  // Si no hay artículos estructurados, buscar párrafos con keywords
  if (articles.length === 0) {
    $('p').each((i, elem) => {
      const text = $(elem).text().toLowerCase()
      if (condorKeywords.some(k => text.includes(k))) {
        articles.push({
          content: $(elem).text().trim(),
          source
        })
      }
    })
  }

  return {
    found: articles.length > 0,
    content: articles.length > 0 ? articles : null
  }
}

/**
 * Scrapea una fuente específica
 */
export async function scrapeSource(source: string): Promise<ScrapeResult> {
  const startTime = Date.now()
  const sourceConfig = SOURCES[source as keyof typeof SOURCES]
  
  if (!sourceConfig) {
    return {
      data: null,
      data_type: 'error',
      status: 'failed',
      error_type: '404',
      url: '',
      responseTime: Date.now() - startTime
    }
  }

  try {
    const url = sourceConfig.url
    // Crear AbortController para timeout (compatible con Node.js 18)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CondorBot/1.0; +https://maquinacondor.vercel.app)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        data: null,
        data_type: 'news',
        status: 'failed',
        error_type: response.status === 404 ? '404' : '500',
        url,
        responseTime: Date.now() - startTime
      }
    }

    const html = await response.text()
    const condorSearch = searchCondorContent(html, source)

    if (!condorSearch.found) {
      return {
        data: { message: 'No se encontró contenido sobre cóndores' },
        data_type: source === 'SAG' || source === 'CONAF' ? 'census' : 'news',
        status: 'partial',
        error_type: 'no_data',
        url,
        responseTime: Date.now() - startTime
      }
    }

    return {
      data: condorSearch.content,
      data_type: source === 'SAG' || source === 'CONAF' ? 'census' : 'news',
      status: 'success',
      url,
      responseTime: Date.now() - startTime
    }

  } catch (error: any) {
    console.error(`Error scraping ${source}:`, error)
    
    return {
      data: null,
      data_type: 'error',
      status: 'failed',
      error_type: error.name === 'AbortError' ? 'timeout' : '500',
      url: sourceConfig.url,
      responseTime: Date.now() - startTime
    }
  }
}

/**
 * Scrapea todas las fuentes
 */
export async function scrapeAllSources(): Promise<ScrapeResult[]> {
  const sources = Object.keys(SOURCES)
  const results = await Promise.all(
    sources.map(source => scrapeSource(source))
  )
  return results
}

