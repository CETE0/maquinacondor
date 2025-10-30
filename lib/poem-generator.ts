import { CondorData, getLatestPoems } from './database'

// Versos inspirados en Nicanor Parra (dominio público)
// Basados en antipoemas de Parra adaptados al contexto del cóndor
const PARRA_VERSES = {
  data_found: [
    [
      'Cuentan que el cóndor desaparece',
      'Pero los números dicen otra cosa',
      'Las instituciones cuentan lo que les conviene',
      'Y el silencio se vuelve estadística'
    ],
    [
      'Hay datos sobre el cóndor',
      'Archivos oficiales',
      'Informes que nadie lee',
      'Estadísticas que duermen'
    ],
    [
      'El sistema funciona',
      'Los servidores responden',
      'La información existe',
      'Pero no cambia nada'
    ]
  ],
  data_missing: [
    [
      'No hay datos sobre el cóndor',
      'Solo vacío y ausencia',
      'El sistema no responde',
      'Y la información se desvanece'
    ],
    [
      '404 Not Found',
      'Página no encontrada',
      'El servidor calla',
      'Como el cóndor que ya no está'
    ],
    [
      'Ausencia de datos',
      'Silencio institucional',
      'Lo que no se mide',
      'No existe para el poder'
    ]
  ],
  contradiction: [
    [
      'Unos dicen que hay cien',
      'Otros aseguran que hay mil',
      'Nadie sabe la verdad',
      'Todos mienten con números'
    ],
    [
      'Datos contradictorios',
      'Fuentes que se contradicen',
      'Una mentira oficial',
      'Y otra mentira también'
    ],
    [
      'Cifras que no coinciden',
      'Instituciones que discrepan',
      'La verdad es relativa',
      'Depende de quién la cuenta'
    ]
  ],
  error: [
    [
      'El sistema falla',
      'La página no carga',
      'El servidor no responde',
      'Todo se derrumba'
    ],
    [
      'Error 500',
      'El servidor falló',
      'Como fallan los sistemas',
      'Que deberían proteger'
    ],
    [
      'Time out',
      'La conexión se perdió',
      'El tiempo se agotó',
      'Como se agota el cóndor'
    ]
  ],
  death: [
    [
      'Otro cóndor muerto',
      'Envenenado en la cordillera',
      'El ganado vale más',
      'Que la vida salvaje'
    ],
    [
      'Nueva muerte reportada',
      'Otro envenenamiento',
      'El veneno no respeta',
      'Lo que la ley protege'
    ],
    [
      'Extinción lenta',
      'Muerte silenciosa',
      'Cada cóndor que cae',
      'Es un grito sin eco'
    ]
  ],
  irony: [
    [
      'Cuentan los cóndores',
      'Como se cuenta el dinero',
      'Cada uno vale un precio',
      'Pero nadie paga por ellos'
    ],
    [
      'Protegen al cóndor',
      'Mientras lo matan',
      'Leyes que no se cumplen',
      'Papeles que no valen'
    ],
    [
      'Conservación oficial',
      'Presupuesto asignado',
      'Pero el cóndor sigue cayendo',
      'Y los números aumentan'
    ]
  ]
}

interface TriggerAnalysis {
  trigger: 'data_found' | 'data_missing' | 'contradiction' | 'error' | 'death' | 'irony'
  confidence: number
  reason: string
}

/**
 * Analiza los datos del día y determina qué trigger activar
 */
export function analyzeDataTriggers(data: CondorData[]): TriggerAnalysis[] {
  const triggers: TriggerAnalysis[] = []

  // Contar tipos de datos
  const dataTypeCounts = {
    census: data.filter(d => d.data_type === 'census').length,
    news: data.filter(d => d.data_type === 'news').length,
    error: data.filter(d => d.status === 'failed' || d.data_type === 'error').length,
    success: data.filter(d => d.status === 'success').length
  }

  // Trigger 1: Si hay muchos errores
  if (dataTypeCounts.error > dataTypeCounts.success) {
    triggers.push({
      trigger: 'error',
      confidence: 0.9,
      reason: `${dataTypeCounts.error} errores vs ${dataTypeCounts.success} éxitos`
    })
  }

  // Trigger 2: Si no hay datos
  if (data.length === 0 || dataTypeCounts.success === 0) {
    triggers.push({
      trigger: 'data_missing',
      confidence: 1.0,
      reason: 'No hay datos disponibles'
    })
  }

  // Trigger 3: Si hay datos contradictorios
  const censusData = data.filter(d => d.data_type === 'census' && d.status === 'success')
  if (censusData.length >= 2) {
    // Aquí deberías comparar los valores numéricos para detectar contradicciones
    triggers.push({
      trigger: 'contradiction',
      confidence: 0.7,
      reason: `${censusData.length} fuentes con datos de censo`
    })
  }

  // Trigger 4: Si hay noticias de muerte/envenenamiento
  const deathNews = data.filter(d => 
    d.data_type === 'news' && 
    d.content && 
    typeof d.content === 'object' &&
    JSON.stringify(d.content).toLowerCase().includes('muert')
  )
  if (deathNews.length > 0) {
    triggers.push({
      trigger: 'death',
      confidence: 0.8,
      reason: `${deathNews.length} noticias sobre muertes`
    })
  }

  // Trigger 5: Si hay datos pero son irónicos (precio alto + muerte)
  const priceData = data.filter(d => d.data_type === 'price' && d.status === 'success')
  if (deathNews.length > 0 && priceData.length > 0) {
    triggers.push({
      trigger: 'irony',
      confidence: 0.75,
      reason: 'Muerte y precio alto de ganado simultáneos'
    })
  }

  // Trigger 6: Si hay datos pero son pocos
  if (dataTypeCounts.success > 0 && dataTypeCounts.success < 3) {
    triggers.push({
      trigger: 'data_found',
      confidence: 0.6,
      reason: `${dataTypeCounts.success} fuentes respondieron`
    })
  }

  return triggers.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Genera un poema basado en los triggers
 */
function generatePoemFromTriggers(triggers: TriggerAnalysis[]): string[] {
  if (triggers.length === 0) {
    const missingVerses = PARRA_VERSES.data_missing
    return missingVerses[Math.floor(Math.random() * missingVerses.length)]
  }

  const primaryTrigger = triggers[0]
  const triggerVerses = PARRA_VERSES[primaryTrigger.trigger] || PARRA_VERSES.data_missing
  
  // Seleccionar aleatoriamente uno de los conjuntos de versos para este trigger
  const verses = triggerVerses[Math.floor(Math.random() * triggerVerses.length)]

  // Opcional: mezclar versos de diferentes triggers si hay alta confianza en varios
  if (triggers.length > 1 && triggers[1].confidence > 0.7) {
    const secondaryVerses = PARRA_VERSES[triggers[1].trigger] || []
    if (secondaryVerses.length > 0) {
      const secondaryVerseSet = secondaryVerses[Math.floor(Math.random() * secondaryVerses.length)]
      if (secondaryVerseSet.length === 4) {
        // Mezclar: 2 versos del primer trigger, 2 del segundo
        return [
          verses[0],
          secondaryVerseSet[1],
          verses[2],
          secondaryVerseSet[3]
        ]
      }
    }
  }

  return verses
}

/**
 * Genera datos para los cubos (16 cubos = 16 poemas)
 */
export async function generatePoemsForCubes(data: CondorData[]): Promise<Array<{id: string, content: string, verses?: string[]}>> {
  const triggers = analyzeDataTriggers(data)
  
  // Si ya hay poemas generados recientemente, usarlos
  const existingPoems = await getLatestPoems(16)
  
  if (existingPoems.length >= 16) {
    return existingPoems.slice(0, 16).map(poem => ({
      id: poem.id,
      content: poem.verses.join('\n'),
      verses: poem.verses
    }))
  }

  // Generar nuevos poemas
  const cubesData = []
  for (let i = 0; i < 16; i++) {
    // Variar el trigger según el índice del cubo
    const cubeTriggers = i % triggers.length === 0 && triggers.length > 0 
      ? triggers 
      : [{ trigger: 'data_found' as const, confidence: 0.5, reason: 'Datos disponibles' }]
    
    const verses = generatePoemFromTriggers(cubeTriggers)
    
    cubesData.push({
      id: `cube-${i}`,
      content: verses.join('\n'),
      verses
    })
  }

  return cubesData
}

