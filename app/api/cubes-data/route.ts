import { NextResponse } from 'next/server'
import { generatePoemsForCubes } from '@/lib/poem-generator'
import { getLatestData } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Obtener los últimos datos y poemas generados
    const latestData = await getLatestData()
    const cubesData = await generatePoemsForCubes(latestData)
    
    return NextResponse.json(cubesData)
  } catch (error) {
    console.error('Error fetching cubes data:', error)
    // Retornar datos placeholder si hay error
    return NextResponse.json(
      Array.from({ length: 16 }).map((_, index) => ({
        id: `cube-${index}`,
        content: `Cubo ${index + 1}\nCargando...`
      })),
      { status: 200 }
    )
  }
}

