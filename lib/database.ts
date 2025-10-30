// Database utilities
// Por ahora usamos un sistema simple en memoria/archivo
// En producción deberías usar Supabase/PostgreSQL

export interface CondorData {
  id: string
  timestamp: Date
  source: string
  data_type: 'census' | 'news' | 'price' | 'weather' | 'error'
  content: object | null
  error_type?: '404' | '500' | 'timeout' | 'no_data'
  status: 'success' | 'partial' | 'failed'
  metadata: object
}

export interface GeneratedPoem {
  id: string
  created_at: Date
  verses: string[]
  data_sources: string[]
  trigger_reason: string
  display_until: Date
}

// Mock data storage (en producción usar base de datos real)
let mockData: CondorData[] = []
let mockPoems: GeneratedPoem[] = []

export async function getLatestData(): Promise<CondorData[]> {
  // En producción, esto haría una query real a la base de datos
  // Por ahora retornamos datos mock
  return mockData.slice(-50) // Últimos 50 registros
}

export async function saveCondorData(data: Omit<CondorData, 'id' | 'timestamp'>): Promise<string> {
  const id = `data-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const newData: CondorData = {
    id,
    ...data,
    timestamp: new Date()
  }
  mockData.push(newData)
  return id
}

export async function saveGeneratedPoem(poem: Omit<GeneratedPoem, 'id' | 'created_at'>): Promise<string> {
  const id = `poem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const newPoem: GeneratedPoem = {
    id,
    ...poem,
    created_at: new Date()
  }
  mockPoems.push(newPoem)
  return id
}

export async function getLatestPoems(count: number = 16): Promise<GeneratedPoem[]> {
  return mockPoems.slice(-count).reverse()
}

