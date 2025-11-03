import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Leer el JSON estático desde el sistema de archivos
    const filePath = join(process.cwd(), 'data', 'condor-data.json')
    const fileContents = await readFile(filePath, 'utf8')
    const condorData = JSON.parse(fileContents)
    
    // Devolver el JSON estático
    // La lógica de generación de poemas se ejecuta en el cliente
    return NextResponse.json(condorData)
  } catch (error) {
    console.error('Error fetching cubes data:', error)
    // Retornar array vacío si hay error
    return NextResponse.json([], { status: 200 })
  }
}

