'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Cube from './components/Cube'

interface CubeData {
  id: string
  content: string
  verses?: string[]
}

export default function Home() {
  const [isGrid, setIsGrid] = useState(false)
  const [cubesData, setCubesData] = useState<CubeData[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mainRef = useRef<HTMLElement>(null)

  const textLines = [
    '╔════════════════════╗',
    '║                    ║',
    '║ MAQUINA CONDORO    ║',
    '║                    ║',
    '║ DOMINIO RECLAMADO  ║',
    '║ POR                ║',
    '║ CETEO 2025         ║',
    '║                    ║',
    '╚════════════════════╝'
  ]

  // Fetch poemas y datos cuando se activa la grilla
  useEffect(() => {
    if (isGrid) {
      fetchCubesData()
    }
  }, [isGrid])

  // Track mouse position para orientación de cubos
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    if (isGrid) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isGrid])

  const fetchCubesData = async () => {
    try {
      const response = await fetch('/api/cubes-data')
      if (response.ok) {
        const data = await response.json()
        setCubesData(data)
      } else {
        // Si no hay datos, generar cubos con placeholder
        generatePlaceholderCubes()
      }
    } catch (error) {
      console.error('Error fetching cubes data:', error)
      generatePlaceholderCubes()
    }
  }

  const generatePlaceholderCubes = () => {
    const cubesPerShelf = 4
    const numberOfShelves = 4
    const totalCubes = cubesPerShelf * numberOfShelves
    const placeholderData: CubeData[] = Array.from({ length: totalCubes }).map((_, index) => ({
      id: `cube-${index}`,
      content: `Cubo ${index + 1}\nCargando datos...`
    }))
    setCubesData(placeholderData)
  }

  const renderTextContent = (content?: string) => {
    const lines = content ? content.split('\n') : textLines
    return lines.map((line, index) => {
      if (line.includes('CETEO 2025')) {
        const parts = line.split('CETEO 2025')
        return (
          <span key={index}>
            {parts[0]}
            <Link 
              href="https://ceteo.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#D92534', textDecoration: 'none' }}
            >
              CETEO 2025
            </Link>
            {parts[1]}
            {'\n'}
          </span>
        )
      }
      if (line.includes('CONDORO')) {
        const parts = line.split('CONDORO')
        return (
          <span key={index}>
            {parts[0]}
            <span style={{ color: '#D92534' }}>CONDORO</span>
            {parts[1]}
            {'\n'}
          </span>
        )
      }
      return <span key={index}>{line}{'\n'}</span>
    })
  }

  const cubesPerShelf = 4
  const numberOfShelves = 4

  return (
    <main 
      ref={mainRef}
      onClick={() => setIsGrid(!isGrid)} 
      style={{ 
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: isGrid ? 'flex-start' : 'center',
        justifyContent: 'center',
        paddingTop: isGrid ? '2rem' : '0'
      }}
    >
      {!isGrid ? (
        <div className="text-box">
          <pre>{renderTextContent()}</pre>
        </div>
      ) : (
        <div className="rack-container">
          {Array.from({ length: numberOfShelves }).map((_, shelfIndex) => (
            <div key={shelfIndex} className="shelf">
              {Array.from({ length: cubesPerShelf }).map((_, cubeIndex) => {
                const globalIndex = shelfIndex * cubesPerShelf + cubeIndex
                const cubeData = cubesData[globalIndex] || { id: `cube-${globalIndex}`, content: '' }
                return (
                  <Cube
                    key={cubeIndex}
                    cubeData={cubeData}
                    cubeIndex={globalIndex}
                    mousePosition={mousePosition}
                    renderTextContent={renderTextContent}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

