// Versión cliente del generador de poemas - se ejecuta en el navegador
// No depende de la base de datos

export interface CondorData {
  id: string
  timestamp: string
  source: string
  data_type: 'census' | 'news' | 'price' | 'weather' | 'error'
  content: object | null
  error_type?: '404' | '500' | 'timeout' | 'no_data'
  status: 'success' | 'partial' | 'failed'
  metadata: object
}

// Fragmentos de palabras y frases inspiradas en Nicanor Parra (estilo antipoético)
const PARRA_FRAGMENTS = {
  nouns: ['cóndor', 'número', 'silencio', 'sistema', 'servidor', 'dato', 'archivo', 'informe', 'verdad', 'mentira', 'cifra', 'institución', 'ganado', 'cordillera', 'veneno', 'ley', 'papel', 'presupuesto', 'estadística', 'ausencia', 'vacío', 'error', 'tiempo', 'conexión', 'grito', 'eco', 'extinción', 'conservación'],
  verbs: ['cuenta', 'dice', 'desaparece', 'existe', 'duerme', 'falla', 'carga', 'responde', 'derrumba', 'valen', 'protege', 'mata', 'cumple', 'aumenta', 'coincide', 'discrepa', 'callan', 'muere', 'se agota', 'cae', 'desvanece', 'contradice', 'miente'],
  adjectives: ['oficial', 'contradictorio', 'relativo', 'silencioso', 'lento', 'vacío', 'ausente', 'desvanecido', 'perdido', 'agotado', 'muerto', 'envenenado', 'salvaje', 'protegido'],
  phrases: [
    'No hay datos',
    'Hay datos',
    'El sistema',
    'La página',
    'El servidor',
    'Como se cuenta',
    'Cada uno vale',
    'Nadie sabe',
    'Todos mienten',
    'Lo que no se mide',
    'No existe',
    'Depende de quién',
    'Que deberían proteger',
    'Como el cóndor',
    'Sin eco',
    'Y otra mentira',
    'Papeles que no valen',
    'Leyes que no se cumplen'
  ],
  parra_style_verses: [
    ['Cuentan que desaparece', 'Pero dicen otra cosa', 'Lo que conviene', 'Se vuelve estadística'],
    ['Hay archivos oficiales', 'Informes que nadie lee', 'Estadísticas que duermen', 'En servidores que callan'],
    ['El sistema funciona', 'Los servidores responden', 'La información existe', 'Pero no cambia nada'],
    ['404 Not Found', 'Página no encontrada', 'El servidor calla', 'Como el que ya no está'],
    ['Ausencia de datos', 'Silencio institucional', 'Lo que no se mide', 'No existe para el poder'],
    ['Unos dicen que hay cien', 'Otros aseguran que hay mil', 'Nadie sabe la verdad', 'Todos mienten con números'],
    ['Datos contradictorios', 'Fuentes que se contradicen', 'Una mentira oficial', 'Y otra mentira también'],
    ['Cifras que no coinciden', 'Instituciones que discrepan', 'La verdad es relativa', 'Depende de quién la cuenta'],
    ['El sistema falla', 'La página no carga', 'El servidor no responde', 'Todo se derrumba'],
    ['Error 500', 'El servidor falló', 'Como fallan los sistemas', 'Que deberían proteger'],
    ['Time out', 'La conexión se perdió', 'El tiempo se agotó', 'Como se agota el cóndor'],
    ['Otro muerto', 'Envenenado en la cordillera', 'El ganado vale más', 'Que la vida salvaje'],
    ['Nueva muerte reportada', 'Otro envenenamiento', 'El veneno no respeta', 'Lo que la ley protege'],
    ['Extinción lenta', 'Muerte silenciosa', 'Cada uno que cae', 'Es un grito sin eco'],
    ['Cuentan como se cuenta el dinero', 'Cada uno vale un precio', 'Pero nadie paga por ellos', 'Y los números aumentan'],
    ['Protegen mientras lo matan', 'Leyes que no se cumplen', 'Papeles que no valen', 'Conservación oficial'],
    ['Presupuesto asignado', 'Pero sigue cayendo', 'Y los números aumentan', 'En archivos oficiales']
  ]
}

interface TriggerAnalysis {
  trigger: 'data_found' | 'data_missing' | 'contradiction' | 'error' | 'death' | 'irony'
  confidence: number
  reason: string
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
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
 * Aplica transformaciones caóticas a un verso
 */
function chaosTransform(verse: string, index: number, totalVerses: number): string {
  // A veces invertir palabras
  if (Math.random() > 0.7) {
    const words = verse.split(' ')
    if (words.length > 1 && Math.random() > 0.5) {
      words.reverse()
      verse = words.join(' ')
    }
  }
  
  // A veces agregar espacios aleatorios
  if (Math.random() > 0.85) {
    verse = verse.split('').map(char => 
      Math.random() > 0.95 ? char + ' ' : char
    ).join('')
  }
  
  // A veces cambiar mayúsculas/minúsculas aleatoriamente
  if (Math.random() > 0.8) {
    verse = verse.split('').map(char => 
      Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
    ).join('')
  }
  
  // A veces duplicar palabras
  if (Math.random() > 0.75 && verse.split(' ').length > 2) {
    const words = verse.split(' ')
    const randomWord = randomElement(words)
    const insertIndex = Math.floor(Math.random() * words.length)
    words.splice(insertIndex, 0, randomWord)
    verse = words.join(' ')
  }
  
  return verse
}

/**
 * Genera un verso completamente nuevo y absurdo
 */
function generateChaosVerse(triggers: TriggerAnalysis[], data: CondorData[], verseIndex: number): string {
  // Seleccionar un fragmento base aleatorio
  const baseVerse = randomElement(PARRA_FRAGMENTS.parra_style_verses)[verseIndex % 4] || randomElement(PARRA_FRAGMENTS.phrases)
  
  // Combinar con elementos aleatorios
  const randomNoun = randomElement(PARRA_FRAGMENTS.nouns)
  const randomVerb = randomElement(PARRA_FRAGMENTS.verbs)
  const randomAdjective = randomElement(PARRA_FRAGMENTS.adjectives)
  
  // Crear variaciones absurdas
  const variations = [
    `${baseVerse} ${randomVerb}`,
    `${randomNoun} ${randomVerb}`,
    `${randomAdjective} ${randomNoun}`,
    `${baseVerse} Y ${randomNoun}`,
    `${randomNoun} ${baseVerse}`,
    `${baseVerse} PERO ${randomNoun} ${randomVerb}`,
    `${randomVerb} ${randomNoun} ${randomAdjective}`,
    `${randomElement(PARRA_FRAGMENTS.phrases)} ${randomNoun}`,
  ]
  
  let result = randomElement(variations)
  
  // Aplicar transformaciones caóticas
  result = chaosTransform(result, verseIndex, 4)
  
  // A veces agregar información real de los datos de forma absurda
  if (data.length > 0 && Math.random() > 0.6) {
    const randomData = randomElement(data)
    const dataInfo = randomData.source || randomData.data_type || 'dato'
    const connectors = ['CON', 'DE', 'EN', 'SOBRE', 'ACERCA DE', '']
    result = `${result} ${randomElement(connectors)} ${dataInfo.toUpperCase()}`
  }
  
  // Normalizar espacios múltiples
  result = result.replace(/\s+/g, ' ').trim()
  
  return result
}

/**
 * Genera un poema completamente absurdo basado en triggers y datos
 */
function generateAbsurdPoem(triggers: TriggerAnalysis[], data: CondorData[]): string[] {
  // Si no hay triggers, generar pura aleatoriedad
  if (triggers.length === 0) {
    return Array.from({ length: 4 }, (_, i) => 
      generateChaosVerse(triggers, data, i)
    )
  }
  
  // Seleccionar versos base de forma aleatoria, pero con influencia de triggers
  const primaryTrigger = randomElement(triggers)
  const secondaryTrigger = triggers.length > 1 ? randomElement(triggers.filter(t => t !== primaryTrigger)) : null
  
  // Obtener versos base relacionados con triggers
  const getTriggerVerses = (trigger: TriggerAnalysis) => {
    const versesMap: Record<string, string[][]> = {
      'data_found': [PARRA_FRAGMENTS.parra_style_verses[0], PARRA_FRAGMENTS.parra_style_verses[1], PARRA_FRAGMENTS.parra_style_verses[2]],
      'data_missing': [PARRA_FRAGMENTS.parra_style_verses[3], PARRA_FRAGMENTS.parra_style_verses[4]],
      'contradiction': [PARRA_FRAGMENTS.parra_style_verses[5], PARRA_FRAGMENTS.parra_style_verses[6], PARRA_FRAGMENTS.parra_style_verses[7]],
      'error': [PARRA_FRAGMENTS.parra_style_verses[8], PARRA_FRAGMENTS.parra_style_verses[9], PARRA_FRAGMENTS.parra_style_verses[10]],
      'death': [PARRA_FRAGMENTS.parra_style_verses[11], PARRA_FRAGMENTS.parra_style_verses[12], PARRA_FRAGMENTS.parra_style_verses[13]],
      'irony': [PARRA_FRAGMENTS.parra_style_verses[14], PARRA_FRAGMENTS.parra_style_verses[15], PARRA_FRAGMENTS.parra_style_verses[16]]
    }
    return versesMap[trigger.trigger] || [PARRA_FRAGMENTS.parra_style_verses[0]]
  }
  
  const primaryVerses = getTriggerVerses(primaryTrigger)
  const basePrimary = randomElement(primaryVerses)
  
  // Generar 4 versos con aleatoriedad extrema
  const poem: string[] = []
  
  for (let i = 0; i < 4; i++) {
    // 40% usar verso base, 60% generar caos absoluto
    if (Math.random() > 0.6 && basePrimary[i]) {
      let verse = basePrimary[i]
      
      // Aplicar transformaciones
      verse = chaosTransform(verse, i, 4)
      
      // 30% mezclar con verso secundario
      if (secondaryTrigger && Math.random() > 0.7) {
        const secondaryVerses = getTriggerVerses(secondaryTrigger)
        const baseSecondary = randomElement(secondaryVerses)
        if (baseSecondary[i]) {
          const mixMode = Math.floor(Math.random() * 3)
          if (mixMode === 0) {
            verse = `${verse} ${baseSecondary[i]}`
          } else if (mixMode === 1) {
            const words1 = verse.split(' ')
            const words2 = baseSecondary[i].split(' ')
            verse = [...words1.slice(0, words1.length / 2), ...words2.slice(words2.length / 2)].join(' ')
          } else {
            verse = baseSecondary[i]
          }
        }
      }
      
      poem.push(verse)
    } else {
      // Generar verso completamente aleatorio y absurdo
      poem.push(generateChaosVerse(triggers, data, i))
    }
  }
  
  return poem
}

/**
 * Genera datos para los cubos (16 cubos = 16 poemas)
 * Versión cliente que se ejecuta en el navegador
 */
export function generatePoemsForCubes(data: CondorData[]): Array<{id: string, content: string, verses?: string[]}> {
  const triggers = analyzeDataTriggers(data)
  
  // Generar nuevos poemas con algoritmo absurdo
  const cubesData = []
  for (let i = 0; i < 16; i++) {
    // Cada cubo tiene una combinación única de aleatoriedad
    const cubeTriggers = triggers.length > 0 
      ? triggers.filter((_, idx) => Math.random() > 0.3 || idx === i % triggers.length)
      : []
    
    // Generar poema absurdo
    const verses = generateAbsurdPoem(cubeTriggers, data)
    
    cubesData.push({
      id: `cube-${i}`,
      content: verses.join('\n'),
      verses
    })
  }

  return cubesData
}

